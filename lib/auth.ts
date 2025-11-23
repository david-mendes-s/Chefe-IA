import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/db/drizzle"; // your drizzle instance
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  adapter: {
    database: {
      generateId: false,
    }
  },
  plugins: [
    nextCookies()
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  }
});