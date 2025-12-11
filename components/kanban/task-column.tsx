'use client';

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  createdAt: Date;
}

interface TaskColumnProps {
  column: Column;
  tasks: Task[];
}

export function TaskColumn({ column, tasks }: TaskColumnProps) {
  const tasksIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const bgColors: Record<string, string> = {
    "Todo": "bg-gray-100/80 dark:bg-gray-800/50",
    "In_Progress": "bg-yellow-100/80 dark:bg-yellow-900/20",
    "Done": "bg-green-100/80 dark:bg-green-900/20",
  };

  return (
    <div
      ref={setNodeRef}
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
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
