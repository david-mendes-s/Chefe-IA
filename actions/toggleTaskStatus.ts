'use server';

import db from "@/db/drizzle";
import { tasks, dailyCycles } from "@/db/drizzle/schemas";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export default async function toggleTaskStatus(taskId: string, currentStatus: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, message: "Não autorizado." };

  const newStatus = currentStatus === 'Done' ? 'Todo' : 'Done';

  // 1. Update Task
  const [updatedTask] = await db.update(tasks)
    .set({
      status: newStatus
    })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updatedTask) return;

  const cycleId = updatedTask.dailyCycleId;

  // 2. Check remaining incomplete tasks for this cycle
  // We search for ANY task in this cycle that is NOT 'Done'
  // If we find none, it means all are Done.
  const hasIncompleteTasks = await db.query.tasks.findFirst({
    where: (table, { eq, ne, and }) => and(
      eq(table.dailyCycleId, cycleId),
      ne(table.status, 'Done')
    )
  });

  // 3. Update Daily Cycle Status
  if (!hasIncompleteTasks) {
    // All done!
    await db.update(dailyCycles)
      .set({ checkoutStatus: 'Completed' })
      .where(eq(dailyCycles.id, cycleId));
  } else {
    // Not all done (or reverted). Set back to Pending if it was Completed?
    // User only asked for "When all completed -> Completed".
    // But logical consistency implies if I uncheck, it's not completed.
    // Let's safe guard it.
    await db.update(dailyCycles)
      .set({ checkoutStatus: 'Pending' })
      .where(eq(dailyCycles.id, cycleId));
  }

  revalidatePath('/dashboard');
}