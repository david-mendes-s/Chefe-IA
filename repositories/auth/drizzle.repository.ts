import { UserModel } from "@/models/user/user-model";
import { UserRepository } from "./interface.user.repository";
import db from "@/db/drizzle";

export default class DrizzleRepository implements UserRepository {
  async findAll(): Promise<UserModel[]> {
    const users = await db.query.user.findMany();
    return users;
  }
}