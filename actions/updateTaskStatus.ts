'use server';

import db from "@/db/drizzle";
import { tasks, dailyCycles } from "@/db/drizzle/schemas";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export default async function updateTaskStatus(taskId: string, newStatus: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, message: "Não autorizado." };

  // 1. Update Task
  console.log('Update Task:', taskId, newStatus);
  const [updatedTask] = await db.update(tasks)
    .set({
      status: newStatus as "Todo" | "In_Progress" | "Done" | "Failed"
    })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updatedTask) {
    console.error('Failed to update task:', taskId);
    return;
  }
  console.log('Task updated:', updatedTask);

  const cycleId = updatedTask.dailyCycleId;

  // 2. Check remaining incomplete tasks for this cycle
  const hasIncompleteTasks = await db.query.tasks.findFirst({
    where: (table, { eq, ne, and }) => and(
      eq(table.dailyCycleId, cycleId),
      ne(table.status, 'Done') // Any status other than Done is "incomplete"
    )
  });

  // 3. Update Daily Cycle Status
  if (!hasIncompleteTasks) {
    await db.update(dailyCycles)
      .set({ checkoutStatus: 'Completed' })
      .where(eq(dailyCycles.id, cycleId));
  } else {
    // If we moved FROM Done TO Todo/InProgress, re-open cycle
    await db.update(dailyCycles)
      .set({ checkoutStatus: 'Pending' })
      .where(eq(dailyCycles.id, cycleId));
  }

  revalidatePath('/dashboard');
}
