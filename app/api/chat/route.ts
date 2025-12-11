
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from '@/db/drizzle';
import { contexts, tasks, messages, userMemory } from '@/db/drizzle/schemas';
import { eq, desc, and } from "drizzle-orm";
import aiClient from '@/lib/ai-client';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: "Message is required and must be text" }, { status: 400 });
    }

    // 1. Save User Message
    await db.insert(messages).values({
      userId: userId,
      content: message,
      role: 'user',
    });

    // 2. Fetch User Context (Contexts, Tasks, Memory, Recent Chat)
    const [activeContexts, activeTasks, userMem, chatHistory] = await Promise.all([
      db.query.contexts.findMany({
        where: and(eq(contexts.userId, userId), eq(contexts.isActive, true)),
      }),
      db.query.tasks.findMany({ // Fetch recent tasks (Todo/Doing)
        where: eq(tasks.status, "Todo"), // Simplify for now
        limit: 10,
        orderBy: desc(tasks.createdAt)
      }),
      db.query.userMemory.findFirst({
        where: eq(userMemory.userId, userId),
      }),
      db.query.messages.findMany({
        where: eq(messages.userId, userId),
        orderBy: desc(messages.createdAt),
        limit: 10, // Last 10 messages for context
      })
    ]);

    const formattedHistory = chatHistory.reverse().map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 3. System Prompt Construction
    const contextsInfo = activeContexts.map(c => `- ${c.title}: ${c.description || ''}`).join('\n');
    const tasksInfo = activeTasks.map(t => `- [${t.status}] ${t.title}`).join('\n');
    const memoryInfo = userMem ? `Short Term Memory: ${userMem.shortTermSummary || 'None'}` : '';

    const systemInstruction = `
    Você é o Chefe IA. Um mentor estratégico, focado e profissional.
    
    Contexto do Usuário:
    Objetivos Ativos:
    ${contextsInfo || "Nenhum objetivo definido."}

    Tarefas Pendentes:
    ${tasksInfo || "Nenhuma tarefa pendente."}

    ${memoryInfo}

    Sua missão é ajudar o usuário a priorizar, desbloquear problemas e manter o foco nos objetivos.
    Responda de forma concisa e direta.
    `;

    // 4. Call Gemini
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...formattedHistory as any,
        // Note: The history already includes the user's latest message if we just saved it? 
        // Wait, I saved it to DB but did I fetch it in 'chatHistory'? 
        // If I fetched with limit, it likely includes the just-inserted message.
        // Let's verify logic. I fetched AFTER insert. So yes.
      ],
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const aiText = response.text;

    // 5. Save AI Response
    await db.insert(messages).values({
      userId: userId,
      content: aiText,
      role: 'assistant',
    });

    return NextResponse.json({ response: aiText });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
