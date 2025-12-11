'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { TaskCard } from "./task-card";
import { TaskColumn } from "./task-column";
import updateTaskStatus from "@/actions/updateTaskStatus";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  status: string;
  aiReasoning: string | null;
  dailyCycleId: string; // Needed for update
  context?: { title: string } | null;
  origin?: "AI_Generated" | "User_Added";
  createdAt: Date;
}

interface KanbanBoardProps {
  tasks: Task[];
  dailyCycleId: string;
}

const COLUMNS = [
  { id: "Todo", title: "A Fazer" },
  { id: "In_Progress", title: "Em Foco" },
  { id: "Done", title: "Concluído" },
];

export function KanbanBoard({ tasks: initialTasks, dailyCycleId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const router = useRouter();
  const { toast } = useToast();

  // Sync with server data when initialTasks changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Memoize filtered tasks to prevent unnecessary re-renders
  const tasksByColumn = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const handleTaskCreated = useCallback((newTask: any) => {
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const handleMoveTask = useCallback(async (taskId: string, newStatus: string) => {
    // Optimistic Update
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      const res = await updateTaskStatus(taskId, newStatus);

      if (res && 'success' in res && !res.success) {
        toast({
          title: "Erro ao atualizar",
          description: res.message,
          variant: "destructive"
        });
        router.refresh(); // Revert on error by fetching fresh data
      } else {
        router.refresh(); // Confirm success
      }
    } catch (e) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível salvar a alteração.",
        variant: "destructive"
      });
      router.refresh(); // Revert on component
    }
  }, [router, toast]);

  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 h-[500px] overflow-x-auto px-4 pb-4">
      {COLUMNS.map((col) => (
        <TaskColumn
          key={col.id}
          column={col}
          tasks={tasksByColumn[col.id] || []}
          dailyCycleId={dailyCycleId}
          onTaskCreated={handleTaskCreated}
          onMoveTask={handleMoveTask}
        />
      ))}
    </div>
  );
}
