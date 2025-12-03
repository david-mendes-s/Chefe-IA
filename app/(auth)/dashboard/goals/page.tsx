import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from '@/db/drizzle';
import { contexts } from '@/db/drizzle/schemas';
import { eq, desc } from "drizzle-orm";
import { CreateGoalDialog } from "@/components/create-goal-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

export default async function GoalsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) return <div>Não autorizado</div>;

  // Busca objetivos do usuário
  const userGoals = await db.query.contexts.findMany({
    where: eq(contexts.userId, session.user.id),
    orderBy: [desc(contexts.createdAt)],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Objetivos</h1>
          <p className="text-muted-foreground">
            Contextos que o Chefe IA deve priorizar.
          </p>
        </div>
        <CreateGoalDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userGoals.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-lg text-muted-foreground">
            <Target className="h-10 w-10 mb-4 opacity-50" />
            <p>Nenhum objetivo traçado ainda.</p>
          </div>
        ) : (
          userGoals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {goal.description || "Sem descrição adicional"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className={`px-2 py-1 rounded-full text-xs ${goal.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {goal.isActive ? 'Ativo' : 'Pausado'}
                  </span>

                  {goal.deadline && (
                    <span className="text-xs flex items-center gap-1">
                      🕒 {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}