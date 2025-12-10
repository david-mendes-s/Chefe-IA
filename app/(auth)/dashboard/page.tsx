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
import { TaskTable } from "@/components/task-table";

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

      <div className="grid gap-4">

        {/* Briefing do Chefe */}
        <Card className="border-l-4 border-l-primary">
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

        {/* Lista de Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle>Missões do Dia</CardTitle>
            <CardDescription>Foco total nestes itens</CardDescription>
          </CardHeader>
          <CardContent className="p-0"> {/* Remova o padding aqui, a tabela cuidará disso */}

            {/* 🆕 Substituímos a lista de divs pela Tabela */}
            <div className="overflow-x-auto px-6">
              <TaskTable tasks={tasksActivesToday} />
            </div>

          </CardContent>
        </Card>
      </div>
    </div>

  );
}