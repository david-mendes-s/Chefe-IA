'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import createTask from "@/actions/createTask";
import { useToast } from "@/hooks/use-toast";

interface CreateTaskInputProps {
  dailyCycleId: string;
  onTaskCreated?: (task: any) => void;
}

export function CreateTaskInput({ dailyCycleId, onTaskCreated }: CreateTaskInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    const res = await createTask(dailyCycleId, title);
    setIsLoading(false);

    if (res.success && res.task) {
      setTitle("");
      setIsAdding(false);
      onTaskCreated?.(res.task);
      toast({ title: "Tarefa criada!", description: "Sua tarefa foi adicionada com sucesso." });
    } else {
      toast({ title: "Erro", description: "Não foi possível criar a tarefa.", variant: "destructive" });
    }
  }

  if (!isAdding) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:bg-background/50 border border-dashed border-transparent hover:border-border h-9 px-2"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Adicionar tarefa
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2 bg-background/50 rounded-md border animate-in fade-in zoom-in-95 duration-200">
      <Input
        autoFocus
        placeholder="O que você precisa fazer?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
        className="h-8 text-sm"
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => setIsAdding(false)}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          type="submit"
          size="sm"
          className="h-7 px-2"
          disabled={isLoading || !title.trim()}
        >
          Adicionar
        </Button>
      </div>
    </form>
  );
}
