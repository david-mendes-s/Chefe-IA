import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideTarget } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  aiReasoning: string | null;
  context?: { title: string } | null;
  createdAt: Date;
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-primary/10 border-2 border-primary rounded-lg h-[150px]"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
    >
      <CardHeader className="px-4 py-1 space-y-1">
        <div className="flex justify-between items-start">
          {task.context && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 mb-2 border-0">
              <LucideTarget className="w-6 h-6 mr-2" />
              {task.context.title}
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm font-medium leading-none">
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground line-clamp-3">
          {task.aiReasoning || "Sem descrição."}
        </p>
      </CardContent>
    </Card>
  );
}
