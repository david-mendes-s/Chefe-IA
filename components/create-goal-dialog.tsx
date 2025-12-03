'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createUserContext } from '@/actions/contexts';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import { goalSchema, TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from '@/lib/validations/goal';

export function CreateGoalDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    // Validar com Zod no frontend
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      deadline: formData.get('deadline') as string,
    };

    const validation = goalSchema.safeParse(rawData);

    if (!validation.success) {
      setIsLoading(false);
      const firstError = validation.error.issues[0];
      toast.error('Validação falhou', { description: firstError.message });
      return;
    }

    const result = await createUserContext(formData);

    setIsLoading(false);

    if (result.success) {
      toast.success("Objetivo Definido!");
      setOpen(false); // Fecha o modal
    } else {
      toast.error("Erro", { description: result.message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Objetivo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Definir Novo Objetivo</DialogTitle>
            <DialogDescription>
              O que você quer conquistar? Defina um prazo para o Chefe IA criar urgência.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">

            {/* TÍTULO */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: Lançar MVP"
                  maxLength={TITLE_MAX_LENGTH}
                  onChange={(e) => setTitleLength(e.target.value.length)}
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {titleLength}/{TITLE_MAX_LENGTH}
                </p>
              </div>
            </div>

            {/* DESCRIÇÃO */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Detalhes
              </Label>
              <div className="col-span-3 space-y-1">
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Ex: Preciso focar no front-end e marketing..."
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  onChange={(e) => setDescriptionLength(e.target.value.length)}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {descriptionLength}/{DESCRIPTION_MAX_LENGTH}
                </p>
              </div>
            </div>

            {/* 🆕 DEADLINE */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">
                Prazo Final
              </Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                className="col-span-3"
              />
            </div>

          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Objetivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}