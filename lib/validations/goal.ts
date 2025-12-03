import { z } from 'zod';

// Limites de caracteres para otimizar custo de LLM
export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

export const goalSchema = z.object({
  title: z
    .string()
    .min(3, 'O título precisa ter pelo menos 3 caracteres.')
    .max(TITLE_MAX_LENGTH, `O título não pode ter mais de ${TITLE_MAX_LENGTH} caracteres.`),
  description: z
    .string()
    .max(DESCRIPTION_MAX_LENGTH, `A descrição não pode ter mais de ${DESCRIPTION_MAX_LENGTH} caracteres.`)
    .optional()
    .or(z.literal('')),
  deadline: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type GoalFormData = z.infer<typeof goalSchema>;
