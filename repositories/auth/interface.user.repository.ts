import { UserModel } from "@/models/user/user-model";

export interface UserRepository {
  findAll(): Promise<UserModel[]>;
  /* findById(id: string): Promise<UserModal | null>;
  findByEmail(email: string): Promise<UserModal | null>;
  create(user: UserModal): Promise<UserModal>;
  update(user: UserModal): Promise<UserModal>;
  delete(id: string): Promise<void>; */
}
