'use server';

import db from "@/db/drizzle";
import { dailyCycles, tasks, contexts } from "@/db/drizzle/schemas";
import { auth } from "@/lib/auth";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { subDays, startOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getWeeklyStats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 6);

  // 1. Fetch Cycles for the last 7 days
  const cycles = await db.query.dailyCycles.findMany({
    where: and(
      eq(dailyCycles.userId, session.user.id),
      gte(dailyCycles.date, sevenDaysAgo)
    ),
    with: {
      tasks: true,
    },
    orderBy: desc(dailyCycles.date),
  });

  // Prepare Chart Data
  // Map last 7 days to ensure we have entries even for empty days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(today, i);
    const cycle = cycles.find(c => startOfDay(c.date).getTime() === d.getTime());

    const completed = cycle?.tasks.filter(t => t.status === 'Done').length || 0;
    const total = cycle?.tasks.length || 0;
    const pending = total - completed;

    return {
      date: format(d, 'dd/MM', { locale: ptBR }), // "10/12"
      fullDate: d,
      completed,
      pending,
      total
    };
  }).reverse();

  // 2. Context Distribution (All time active)
  const allTasks = await db.query.tasks.findMany({
    where: eq(tasks.status, 'Done'), // Only count work done? Or everything? Let's count everything for "Focus Distribution"
    with: {
      context: true
    }
  });

  // Filter for current user via the cycle -> user relation? 
  // Wait, task doesn't have userId directly. It's via dailyCycle.
  // Better to query tasks -> dailyCycle -> user.
  // But standard drizzle query builder complexity.
  // Let's stick to: we fetched cycles above, but that's only 7 days.
  // For context distribution, maybe we want "Last 30 days" or "All time".
  // Let's do "Last 30 Days" for relevance.

  const thirtyDaysAgo = subDays(today, 29);

  const tasksLast30Days = await db.query.tasks.findMany({
    with: {
      dailyCycle: true,
      context: true,
    },
    where: (table, { exists, and, eq }) => exists(
      db.select()
        .from(dailyCycles)
        .where(and(
          eq(dailyCycles.id, table.dailyCycleId),
          eq(dailyCycles.userId, session.user.id),
          gte(dailyCycles.date, thirtyDaysAgo)
        ))
    )
  });

  const contextMap = new Map<string, number>();

  tasksLast30Days.forEach(t => {
    if (t.context && t.context.title) {
      const current = contextMap.get(t.context.title) || 0;
      contextMap.set(t.context.title, current + 1);
    } else {
      const current = contextMap.get('Outros') || 0;
      contextMap.set('Outros', current + 1);
    }
  });

  const contextData = Array.from(contextMap.entries()).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // KPIs
  const totalTasksCompleted = tasksLast30Days.filter(t => t.status === 'Done').length;
  // Streak calculation is complex, let's keep it simple: "Cycles Completed in last 7 days"
  const completedCyclesThisWeek = cycles.filter(c => c.checkoutStatus === 'Completed').length;

  return {
    weeklyChart: chartData,
    contextChart: contextData,
    kpis: {
      totalTasks30d: totalTasksCompleted,
      cyclesCompleted7d: completedCyclesThisWeek
    }
  };
}
