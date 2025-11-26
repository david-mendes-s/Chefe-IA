import { auth } from "@/lib/auth"; // Ajuste o caminho conforme sua estrutura auth
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/db/drizzle"; // Ajuste o caminho do seu banco
import { dailyCycles } from "@/db/schema"; // Ajuste o caminho do schema
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card"; // Certifique-se de ter o componente Card do Shadcn


// Estou pensando em obter o usuario assim ou recebendo com props do meu layout

/* type userSession = {
  id: string;
  name: string | null;
  email: string | null;
};

async function getSession(): Promise<{ user: userSession } | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
} */

export default async function DashboardPage() {

  // 2. Definir o range de "Hoje"
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  // 3. Buscar o Ciclo do Dia + Tarefas
  // Estamos buscando onde userId é igual E a data está entre o começo e fim de hoje
  const activeCycle = await db.query.dailyCycles.findFirst({
    where: and(
      eq(dailyCycles.userId, session.user.id),
      gte(dailyCycles.date, todayStart),
      lte(dailyCycles.date, todayEnd)
    ),
    with: {
      tasks: true, // Join automático com as tarefas
    },
    orderBy: [desc(dailyCycles.createdAt)] // Pega o mais recente caso haja duplicidade
  });

  // 4. Interface (JSX)
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Olá, {session.user.name?.split(" ")[0]} 👋
        </h2>
      </div>

      {/* CASO 1: Existe um ciclo para hoje */}
      {activeCycle ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

          {/* Briefing do Chefe (Ocupa 4 colunas) */}
          <Card className="col-span-4 border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Briefing Matinal</CardTitle>
              <CardDescription>A orientação do seu Chefe IA para hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg italic text-muted-foreground leading-relaxed">
                "{activeCycle.morningBriefing}"
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
                {activeCycle.tasks.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa gerada ainda.</p>
                )}

                {activeCycle.tasks.map((task) => (
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
      ) : (
        /* CASO 2: Não existe ciclo hoje (Empty State) */
        <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">Sem briefing para hoje</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Você ainda não gerou seu plano diário.
            </p>
            {/* Botão placeholder - vamos ativar amanhã */}
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Gerar Briefing Agora
            </button>
          </div>
        </div>
      )}
    </div>
  );
}