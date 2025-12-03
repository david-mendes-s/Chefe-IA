import { requireSession } from "@/lib/queries/session";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";

import { listDailyCiclesUser, listTasksToday } from "@/lib/queries/admin";
import { ButtonBriefing } from "@/components/ButtonBriefing";

export default async function DashboardPage() {
  // 1. Obter sessão do usuário autenticado
  const { user } = await requireSession();

  const activeCycle = await listDailyCiclesUser(user.id);

  if (!activeCycle) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">Sem briefing para hoje</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Você ainda não gerou seu plano diário.
          </p>
          {/* Botão placeholder - vamos ativar amanhã */}
          <ButtonBriefing />
        </div>
      </div>
    )
  }

  const tasksActivesToday = await listTasksToday(activeCycle.id);

  return (

    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Olá, {user.name?.split(" ")[0]} 👋
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Briefing do Chefe (Ocupa 4 colunas) */}
        <Card className="col-span-4 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>Briefing Matinal</CardTitle>
            <CardDescription>A orientação do seu Chefe IA para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg italic text-muted-foreground leading-relaxed">
              &ldquo;{activeCycle.morningBriefing}&rdquo;
            </p>
          </CardContent>
        </Card>

        {/* Lista de Tarefas (Ocupa 3 colunas) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Missões do Dia</CardTitle>
            <CardDescription>Foco total nestes itens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasksActivesToday.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa gerada ainda.</p>
              )}

              {tasksActivesToday.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50 transition">
                  {/* Checkbox Simulado por enquanto */}
                  <div className={`mt-1 h-4 w-4 rounded border ${task.status === 'Done' ? 'bg-primary border-primary' : 'border-primary'}`} />

                  <div className="space-y-1">
                    <p className={`text-sm font-medium leading-none ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {task.aiReasoning && (
                      <p className="text-xs text-muted-foreground">
                        💡 {task.aiReasoning}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

  );
}