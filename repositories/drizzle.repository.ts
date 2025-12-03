import { UserModel } from "@/models/user/user-model";
import { ContextModel } from "@/models/user/context-modal";
import { UserRepository } from "./interface.user.repository";
import db from "@/db/drizzle";
import { DailyCicleModel } from "@/models/user/daily-cicle-model";

import { eq, and, gte, lte } from "drizzle-orm";
import { dailyCycles, tasks, contexts } from "@/db/drizzle/schemas";
import { TaskModel } from "@/models/user/task-modal";

export default class DrizzleRepository implements UserRepository {
  async findAll(): Promise<UserModel[]> {
    const users = await db.query.user.findMany();
    return users;
  }

  async findDailyCiclesUser(userId: string): Promise<DailyCicleModel | undefined> {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));

    const dailyCycle = await db.query.dailyCycles.findFirst({
      where: and(
        eq(dailyCycles.userId, userId),
        gte(dailyCycles.date, todayStart),
        lte(dailyCycles.date, todayEnd)
      ),
    });


    return dailyCycle;
  }

  async findTasksToday(dailyCycleId: string): Promise<TaskModel[]> {
    const listTasks = await db.query.tasks.findMany({
      where: (eq(tasks.dailyCycleId, dailyCycleId)),
    });

    return listTasks;
  }

  async findContextsUser(userId: string): Promise<ContextModel[]> {
    const contextsList = await db.query.contexts.findMany({
      where: eq(contexts.userId, userId),
    });

    return contextsList;
  }
}