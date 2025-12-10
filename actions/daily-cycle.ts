'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from '@/db/drizzle';
import { contexts, dailyCycles, tasks, userMemory } from '@/db/drizzle/schemas';
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import aiClient from '@/lib/ai-client'; // 👈 NOVO CLIENTE LLM
import { startOfDay } from "date-fns";

// Estrutura de resposta esperada da IA (JSON Schema)
// Note que o Gemini usa um formato ligeiramente diferente para o Schema.
const LLM_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    morningBriefing: {
      type: "string",
      description: "Um resumo motivacional, direto e no tom de um 'Chefe IA', baseado nos objetivos do usuário e urgências de hoje.",
    },
    dailyTasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "O título da tarefa (Ex: 'Configurar CORS no backend')" },
          contextId: { type: "string", description: "O ID do Contexto relacionado a esta tarefa. DEVE ser um ID válido da lista fornecida." },
          aiReasoning: { type: "string", description: "Breve explicação de como esta tarefa ataca o Objetivo relacionado." },
        },
        required: ["title", "contextId", "aiReasoning"],
      },
      description: "Uma lista de 3 a 5 tarefas de alta prioridade para o dia, geradas estritamente a partir dos Contextos fornecidos.",
    },
  },
  required: ["morningBriefing", "dailyTasks"],
};


export async function generateDailyCycle() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, message: "Não autorizado." };

  // 1. Verificar se o ciclo já foi gerado hoje (lógica omitida para foco)

  // 1.1 NOVO PASSO: Buscar a Memória de Curto Prazo (Lição de ontem)
  const userMemoryData = await db.query.userMemory.findFirst({
    where: eq(userMemory.userId, session.user.id),
  });

  const shortTermLesson = userMemoryData?.shortTermSummary
    ? `Baseie-se também nesta Lição de Curto Prazo de ontem: "${userMemoryData.shortTermSummary}"`
    : '';

  try {
    // 2. Buscar Objetivos (Contextos) Reais
    const activeContexts = await db.query.contexts.findMany({
      where: eq(contexts.userId, session.user.id),
      // Manter apenas ativos (is_active: true) seria bom aqui no futuro.
    });

    if (activeContexts.length === 0) {
      return {
        success: false,
        message: "Nenhum objetivo ativo encontrado. Defina seus objetivos antes de gerar o briefing."
      };
    }

    // Converte os objetivos para uma string para passar ao LLM
    const contextsString = activeContexts.map(c =>
      `ID: ${c.id}, Título: ${c.title}, Descrição: ${c.description || 'N/A'}, Prazo: ${c.deadline ? c.deadline.toISOString().split('T')[0] : 'N/A'}`
    ).join('\n---\n');

    // 3. Criar o Prompt
    // ALTERAÇÃO NA systemInstruction: Adicionar a memória para guiar o tom e foco
    const systemInstruction = `Você é o Chefe IA. Sua missão é ser um assistente de produtividade rigoroso e focado em resultados. O tom deve ser profissional, direto e motivador. ${shortTermLesson} Você DEVE gerar um Briefing Matinal e uma lista de 3 a 5 Missões Diárias (tasks) estritamente focadas em atacar os Objetivos Ativos fornecidos. Seja implacável com os prazos (deadlines). Sua resposta DEVE ser um objeto JSON que se encaixe no schema fornecido.`;

    const userPrompt = `
    Hoje é: ${new Date().toLocaleDateString('pt-BR')}.
    Objetivos Ativos do Usuário:
    ---
    ${contextsString}
    ---
    Gere o Briefing Matinal e as Missões do Dia. Use o 'contextId' exato que foi listado acima para cada tarefa.
    `;

    // 4. Chamada REAL para o Gemini Pro com JSON Mode

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash", // Um modelo rápido e excelente para tarefas de formatação JSON.
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json", // 👈 Habilita o JSON Mode
        responseSchema: LLM_RESPONSE_SCHEMA as any, // 👈 Passa o schema
      },
    });

    // 5. Processamento da Resposta

    // O Gemini retorna o JSON como uma string dentro do 'text'
    const jsonString = response.text.trim();
    const aiData = JSON.parse(jsonString);

    // Mapeamento de segurança e filtragem (excluindo qualquer tarefa sem um ContextId válido)
    const validTasks = aiData.dailyTasks.filter((t: any) =>
      activeContexts.some(c => c.id === t.contextId)
    );

    if (validTasks.length === 0) {
      return {
        success: false,
        message: "A IA não conseguiu gerar tarefas válidas a partir dos seus objetivos. Tente novamente ou revise seus objetivos."
      };
    }

    // 6. Inserção no Banco

    const today = startOfDay(new Date());

    // Insere o Daily Cycle
    const [newCycle] = await db.insert(dailyCycles).values({
      userId: session.user.id,
      date: today,
      morningBriefing: aiData.morningBriefing,
      checkoutStatus: 'Pending',
    }).returning();

    // Mapeia e insere as Tasks
    const tasksToInsert = validTasks.map((t: any) => ({
      dailyCycleId: newCycle.id,
      contextId: t.contextId,
      title: t.title,
      aiReasoning: t.aiReasoning,
      origin: 'AI_Generated' as const,
      status: 'Todo' as const,
    }));

    await db.insert(tasks).values(tasksToInsert);

    // 7. Revalidação e Sucesso
    revalidatePath('/dashboard');
    return { success: true, message: "Briefing Gerado com sucesso pelo Chefe IA." };

  } catch (error) {
    console.error("Erro no ciclo diário com Gemini:", error);
    return { success: false, message: "Falha ao comunicar com a IA. Verifique sua chave de API." };
  }
}