'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from '@/db/drizzle';
import { contexts } from '@/db/drizzle/schemas';
import { revalidatePath } from "next/cache";
import { goalSchema } from '@/lib/validations/goal';

export async function createUserContext(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, message: 'Não autorizado.' };
  }

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    deadline: formData.get('deadline') as string,
  };

  // Validar com Zod no backend
  const validation = goalSchema.safeParse(rawData);

  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { success: false, message: firstError.message };
  }

  const { title, description, deadline: deadlineRaw } = validation.data;
  const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

  try {
    await db.insert(contexts).values({
      userId: session.user.id,
      title: title,
      description: description || null,
      deadline: deadline, // 🆕 Salvando no banco
      isActive: true,
    });

    revalidatePath('/dashboard/goals');
    revalidatePath('/dashboard');

    return { success: true, message: 'Objetivo definido com prazo!' };
  } catch (error) {
    console.error('Erro ao criar contexto:', error);
    return { success: false, message: 'Erro ao salvar no banco de dados.' };
  }
}