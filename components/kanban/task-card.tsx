import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideTarget, Bot, User, ArrowRight, ArrowLeft } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  status: string;
  aiReasoning: string | null;
  context?: { title: string } | null;
  origin?: "AI_Generated" | "User_Added";
  createdAt: Date;
}

interface TaskCardProps {
  task: Task;
  onMoveTask: (taskId: string, newStatus: string) => void;
}

export const TaskCard = memo(function TaskCard({ task, onMoveTask }: TaskCardProps) {

  const getNextStatus = (current: string) => {
    if (current === 'Todo') return 'In_Progress';
    if (current === 'In_Progress') return 'Done';
    return null;
  };

  const getPrevStatus = (current: string) => {
    if (current === 'Done') return 'In_Progress';
    if (current === 'In_Progress') return 'Todo';
    return null;
  };

  const nextStatus = getNextStatus(task.status);
  const prevStatus = getPrevStatus(task.status);

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="px-4 py-1 space-y-1">
        <div className="flex justify-between items-start">
          {task.context && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 mb-2 border-0">
              <LucideTarget className="w-6 h-6 mr-2" />
              {task.context.title}
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm font-medium leading-tight">
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <p className="text-xs text-muted-foreground line-clamp-3">
          {task.aiReasoning}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
            {task.origin === 'AI_Generated' ? (
              <>
                <Bot className="w-3 h-3" />
                <span>IA</span>
              </>
            ) : (
              <>
                <User className="w-3 h-3" />
                <span>Você</span>
              </>
            )}
          </div>

          <div className="flex gap-1">
            {prevStatus && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onMoveTask(task.id, prevStatus)}
                title="Voltar etapa"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {nextStatus && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/30"
                onClick={() => onMoveTask(task.id, nextStatus)}
                title="Avançar etapa"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.aiReasoning === nextProps.task.aiReasoning &&
    prevProps.task.origin === nextProps.task.origin &&
    prevProps.task.context?.title === nextProps.task.context?.title
  );
});
