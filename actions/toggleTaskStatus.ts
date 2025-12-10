'use server';

import db from "@/db/drizzle";
import { tasks } from "@/db/drizzle/schemas";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export default async function toggleTaskStatus(taskId: string, currentStatus: string) {
  // Lógica para alternar o status da tarefa no banco de dados

  console.log(`Tarefa ${taskId} teve seu status de ${currentStatus} alternado.`);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, message: "Não autorizado." };

  await db.update(tasks)
    .set({
      status: currentStatus === 'Done' ? 'Todo' : 'Done'
    })
    .where(eq(tasks.id, taskId));

  revalidatePath('/dashboard');

}