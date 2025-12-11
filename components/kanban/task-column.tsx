import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CreateTaskInput } from "./create-task-input";
import { TaskCard } from "./task-card";

interface Column {
  id: string;
  title: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  aiReasoning: string | null;
  context?: { title: string } | null;
  origin?: "AI_Generated" | "User_Added";
  createdAt: Date;
}

interface TaskColumnProps {
  column: Column;
  tasks: Task[];
  dailyCycleId?: string;
  onTaskCreated?: (task: any) => void;
  onMoveTask: (taskId: string, newStatus: string) => void;
}

export function TaskColumn({ column, tasks, dailyCycleId, onTaskCreated, onMoveTask }: TaskColumnProps) {

  const bgColors: Record<string, string> = {
    "Todo": "bg-gray-100/80 dark:bg-gray-800/50",
    "In_Progress": "bg-yellow-100/80 dark:bg-yellow-900/20",
    "Done": "bg-green-100/80 dark:bg-green-900/20",
  };

  return (
    <div
      className={cn(
        "w-full shrink-0 rounded-lg p-4 flex flex-col gap-4 max-h-full",
        bgColors[column.id] || "bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{column.title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {column.id === 'Todo' && dailyCycleId && (
          <CreateTaskInput dailyCycleId={dailyCycleId} onTaskCreated={onTaskCreated} />
        )}

        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onMoveTask={onMoveTask} />
        ))}
      </div>
    </div>
  );
}
