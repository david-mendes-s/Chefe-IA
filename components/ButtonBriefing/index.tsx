'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateDailyCycle } from '@/actions/daily-cycle'; // Sua server action
import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner'; // Supondo que use sonner ou use o seu toast preferido

export function ButtonBriefing() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateDailyCycle();

      if (result.success) {
        toast.success("Briefing Gerado!", {
          description: "O Chefe IA preparou suas ordens para hoje."
        });
        // Não precisa de router.refresh() aqui porque usamos revalidatePath na server action
      } else {
        toast.error("Erro", { description: result.message });
      }
    } catch (error) {
      toast.error("Erro Crítico", { description: "Falha na comunicação com o servidor." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
      <h3 className="mb-2 text-lg font-semibold">O dia ainda não começou</h3>
      <p className="mb-6 text-sm text-muted-foreground text-center max-w-md">
        Seus objetivos estão aguardando. Peça ao Chefe IA para analisar suas prioridades e definir o plano de ataque para hoje.
      </p>

      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        size="lg"
        className="font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            O Chefe está pensando...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4 fill-current" />
            Gerar Briefing Agora
          </>
        )}
      </Button>
    </div>
  );
}