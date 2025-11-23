import { userRepository } from "@/repositories/auth";
import { cacheLife } from "next/cache";

export async function listUsersFindAll() {
  "use cache";
  cacheLife('minutes');

  const users = await userRepository.findAll();
  return users;
}