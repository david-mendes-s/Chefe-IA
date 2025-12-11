'use client';

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { TaskColumn } from "./task-column";
import { createPortal } from "react-dom";
import updateTaskStatus from "@/actions/updateTaskStatus";

interface Task {
  id: string;
  title: string;
  status: string;
  aiReasoning: string | null;
  dailyCycleId: string; // Needed for update
  context?: { title: string } | null;
  createdAt: Date;
}

interface KanbanBoardProps {
  tasks: Task[];
}

const COLUMNS = [
  { id: "Todo", title: "A Fazer" },
  { id: "In_Progress", title: "Em Foco" },
  { id: "Done", title: "Concluído" },
];

export function KanbanBoard({ tasks: initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Prevent accidental drags
      },
    })
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);



  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverColumn = COLUMNS.some(col => col.id === overId);

    // Dropping a Task over a Column (Empty area)
    if (isActiveTask && isOverColumn) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return prevTasks;

        const newTasks = [...prevTasks];
        const activeTask = { ...newTasks[activeIndex] };

        if (activeTask.status !== overId) {
          activeTask.status = overId;
          newTasks[activeIndex] = activeTask;
          return newTasks;
        }
        return prevTasks;
      });

      // Call action directly if status changed (using values from event, not state)
      // We need to trust the dnd event indicating a move happened.
      // But we should check if it genuinely changed status.
      // Current state might be stale in closure? No, `tasks` from props/state?

      // Safer way:
      const currentTask = tasks.find(t => t.id === activeId);
      if (currentTask && currentTask.status !== overId) {
        updateTaskStatus(activeId, overId);
      }
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Dropping Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
        const overIndex = prevTasks.findIndex((t) => t.id === overId);

        if (activeIndex === -1 || overIndex === -1) return prevTasks;

        const activeTask = prevTasks[activeIndex];
        const overTask = prevTasks[overIndex];

        if (activeTask.status !== overTask.status) {
          // We are changing columns via DragOver
          // This is tricky because we shouldn't trigger Server Action on every DragOver event
          // typically DragOver is for visual reordering. The actual status change commit should happen on DragEnd.
          // However, dnd-kit examples often mutate state on DragOver for "Sortable" feels across containers.

          // If we trigger server action here, we spam the server and crash the router with revalidations.
          // FIX: Update LOCAL state only for visual feedback. Commit to server only on DragEnd.

          const newTasks = [...prevTasks];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: overTask.status };

          return arrayMove(newTasks, activeIndex, overIndex - 1);
        }

        return arrayMove(prevTasks, activeIndex, overIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 h-[500px] overflow-x-auto px-4 pb-4">
        {COLUMNS.map((col) => (
          <TaskColumn
            key={col.id}
            column={col}
            tasks={tasks.filter((t) => t.status === col.id)}
          />
        ))}
      </div>

      {mounted && createPortal(
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
