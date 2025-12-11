
import { ChatInterface } from "@/components/chat-interface";
import { getCurrentSession } from "@/lib/queries/session";
import { redirect } from "next/navigation";
import db from '@/db/drizzle';
import { messages } from '@/db/drizzle/schemas';
import { eq, desc } from "drizzle-orm";

export default async function ChatPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const history = await db.query.messages.findMany({
    where: eq(messages.userId, session.user.id),
    orderBy: desc(messages.createdAt),
    limit: 50,
  });

  // Reverse to show oldest first in chat (ChatInterface handles scrolling to bottom)
  // Casting to match the interface (DB 'role' vs Component 'role')
  const formattedHistory = history.reverse().map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chat com Chefe IA</h1>
        <p className="text-muted-foreground">Converse sobre seus objetivos e tarefas.</p>
      </div>
      <ChatInterface initialMessages={formattedHistory} />
    </div>
  );
}
