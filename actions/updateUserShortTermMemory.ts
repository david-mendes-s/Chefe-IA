'use server';

import db from '@/db/drizzle';
import { dailyCycles, userMemory } from '@/db/drizzle/schemas';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import aiClient from '@/lib/ai-client'; // Assumindo que este é o cliente do Gemini SDK

// Função principal de aprendizado da IA.
// Ela analisa o dia, gera uma lição aprendida e salva na memória do usuário.
export async function updateUserShortTermMemory(userId: string, cycleId: string) {
  if (!userId || !cycleId) {
    return { success: false, message: "IDs de usuário ou ciclo ausentes." };
  }

  try {
    // 1. Busca de Dados de Alta Qualidade (Daily Cycle e Tasks)
    // Usamos o 'with' do Drizzle para carregar todas as tarefas relacionadas
    const cycleData = await db.query.dailyCycles.findFirst({
      where: eq(dailyCycles.id, cycleId),
      with: {
        tasks: {
          columns: {
            title: true,
            status: true,
            aiReasoning: true,
            contextId: true,
          }
        }
      }
    });

    if (!cycleData) {
      return { success: false, message: "Ciclo diário não encontrado." };
    }

    const doneTasks = cycleData.tasks.filter(t => t.status === 'Done');
    const failedTasks = cycleData.tasks.filter(t => t.status !== 'Done');

    // 2. Preparação dos Dados para o Prompt
    const doneTasksString = doneTasks.map(t =>
      `[DONE] Título: ${t.title}. Razão original da IA: ${t.aiReasoning}. Contexto ID: ${t.contextId}`
    ).join('\n');

    const failedTasksString = failedTasks.map(t =>
      `[FAILED] Título: ${t.title}. Razão original da IA: ${t.aiReasoning}. Contexto ID: ${t.contextId}`
    ).join('\n');


    // 3. Engenharia de Prompt (Análise e Lição)
    const systemInstruction = `Você é um Analista de Performance Sênior, focado em alta produtividade. Sua única meta é analisar o desempenho de hoje e gerar uma ÚNICA lição prática para o Briefing de amanhã. Responda SOMENTE com a lição.`;

    const userPrompt = `
        Dia de Análise: ${cycleData.date.toLocaleDateString('pt-BR')}

        1. BRIEFING MATINAL (O que era esperado):
        "${cycleData.morningBriefing}"

        2. TAREFAS CONCLUÍDAS (Done):
        ${doneTasksString || 'Nenhuma tarefa concluída.'}

        3. TAREFAS FALHADAS (Todo/Failed):
        ${failedTasksString || 'Nenhuma tarefa falhada.'}

        Análise do Dia:
        - O que deu certo? (Quais tarefas foram concluídas e por quê?)
        - Onde houve desvio? (Quais tarefas falharam e o que a IA havia previsto para elas?)
        - Lição Prática: Gere uma ÚNICA, direta e acionável "Lição de Curto Prazo" para o usuário. Ela deve ser um conselho que o Briefing Matinal de amanhã pode usar para evitar o mesmo erro. A lição deve ter no máximo 50 palavras.

        Responda SOMENTE com a Lição de Curto Prazo.
        `;

    // 4. Chamada da IA e Geração da Memória
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash", // Rápido e eficaz para síntese de texto
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const lessonLearned = response.text.trim();

    // 5. Persistência da Memória
    // Usa `onConflictDoUpdate` para criar se não existir ou atualizar se já existir
    await db.insert(userMemory)
      .values({
        userId: userId,
        shortTermSummary: lessonLearned,
      })
      .onConflictDoUpdate({
        target: userMemory.userId,
        set: {
          shortTermSummary: lessonLearned,
          // Garante que o updatedAt seja atualizado (já definido no schema)
        },
      });


    revalidatePath('/dashboard');
    return { success: true, message: "Memória de Curto Prazo atualizada pelo Chefe IA." };

  } catch (error) {
    console.error("Erro ao atualizar memória:", error);
    return { success: false, message: "Falha na análise de performance com a IA." };
  }
}