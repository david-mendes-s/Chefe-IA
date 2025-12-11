
import { requireSession } from "@/lib/queries/session";
import db from '@/db/drizzle';
import { dailyCycles, tasks } from '@/db/drizzle/schemas';
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, Circle, XCircle, AlertCircle } from "lucide-react";

export default async function HistoryPage() {
  const { user } = await requireSession();

  const history = await db.query.dailyCycles.findMany({
    where: eq(dailyCycles.userId, user.id),
    orderBy: desc(dailyCycles.date),
    with: {
      tasks: true,
    },
    limit: 30, // Show last 30 cycles
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Completed': return 'bg-green-500 hover:bg-green-600';
      case 'Pending': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Skipped': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-slate-500';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'Pending': return <AlertCircle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Ciclos</h1>
        <p className="text-muted-foreground">Sua jornada de produtividade nos últimos 30 dias.</p>
      </div>

      <div className="grid gap-4">
        {history.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhum histórico encontrado. Comece seu primeiro ciclo hoje!
            </CardContent>
          </Card>
        ) : (
          history.map((cycle) => (
            <Card key={cycle.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {format(cycle.date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </CardTitle>
                    <CardDescription>
                      {cycle.tasks.length} missões traçadas
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(cycle.checkoutStatus)} gap-1`}>
                    {getStatusIcon(cycle.checkoutStatus)}
                    {cycle.checkoutStatus === 'Pending' ? 'Pendente' :
                      cycle.checkoutStatus === 'Completed' ? 'Concluído' : 'Pulado'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="briefing" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:text-foreground">
                      Ver Briefing & Detalhes
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {cycle.morningBriefing && (
                        <div className="rounded-md bg-muted p-4 italic text-sm border-l-4 border-primary">
                          "{cycle.morningBriefing}"
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Tarefas do Dia:</h4>
                        <ul className="space-y-2">
                          {cycle.tasks.map(task => (
                            <li key={task.id} className="flex items-start gap-2 text-sm">
                              {task.status === 'Done'
                                ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                : <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              }
                              <span className={task.status === 'Done' ? 'line-through text-muted-foreground' : ''}>
                                {task.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
