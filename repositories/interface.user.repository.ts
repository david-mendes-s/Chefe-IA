import { ContextModel } from "@/models/user/context-modal";
import { DailyCicleModel } from "@/models/user/daily-cicle-model";
import { TaskModel } from "@/models/user/task-modal";
import { UserModel } from "@/models/user/user-model";

export interface UserRepository {
  findAll(): Promise<UserModel[]>;
  findDailyCiclesUser(userId: string): Promise<DailyCicleModel | undefined>;
  findTasksToday(dailyCycleId: string): Promise<TaskModel[]>;
  findContextsUser(userId: string): Promise<ContextModel[]>;
}
