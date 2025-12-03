import { cache } from "react";
import { userRepository } from "@/repositories";
import { cacheLife } from "next/cache";

export async function listUsersFindAll() {
  "use cache";
  cacheLife('minutes');

  const users = await userRepository.findAll();
  return users;
}

// Para dados de usuário específico - use React.cache()
export const listDailyCiclesUser = cache(async (userId: string) => {
  const dailyCicles = await userRepository.findDailyCiclesUser(userId);
  return dailyCicles;
});

export const listTasksToday = cache(async (dailyCycleId: string) => {
  const tasks = await userRepository.findTasksToday(dailyCycleId);
  return tasks;
});

export const listContextsUser = cache(async (userId: string) => {
  const contexts = await userRepository.findContextsUser(userId);
  return contexts;
});

