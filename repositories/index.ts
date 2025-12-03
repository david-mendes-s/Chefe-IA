import DrizzleRepository from "./drizzle.repository";

import { UserRepository } from "./interface.user.repository";

export const userRepository: UserRepository = new DrizzleRepository();
