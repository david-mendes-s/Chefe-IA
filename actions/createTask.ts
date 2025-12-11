'use server';

import db from "@/db/drizzle";
import { tasks } from "@/db/drizzle/schemas";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export default async function createTask(dailyCycleId: string, title: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, message: "Não autorizado." };

  try {
    const [newTask] = await db.insert(tasks).values({
      dailyCycleId,
      title,
      status: "Todo",
      origin: "User_Added",
    }).returning();

    revalidatePath('/dashboard');
    return { success: true, task: newTask };
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return { success: false, message: "Erro ao criar tarefa." };
  }
}
