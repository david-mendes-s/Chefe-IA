import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  bossPersona: text("boss_persona"), // Novo campo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Novas Tabelas

export const contexts = pgTable("contexts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const dailyCycles = pgTable("daily_cycles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  morningBriefing: text("morning_briefing"),
  checkoutStatus: text("checkout_status", {
    enum: ["Pending", "Completed", "Skipped"],
  }).default("Pending"),
  dailyMood: integer("daily_mood"),
  endDaySummary: text("end_day_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  dailyCycleId: uuid("daily_cycle_id")
    .notNull()
    .references(() => dailyCycles.id, { onDelete: "cascade" }),
  contextId: uuid("context_id").references(() => contexts.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  aiReasoning: text("ai_reasoning"),
  status: text("status", { enum: ["Todo", "Done", "Failed"] })
    .default("Todo")
    .notNull(),
  userFeedback: text("user_feedback"),
  origin: text("origin", { enum: ["AI_Generated", "User_Added"] })
    .default("AI_Generated")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const checkoutLogs = pgTable("checkout_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  dailyCycleId: uuid("daily_cycle_id")
    .notNull()
    .references(() => dailyCycles.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userMemory = pgTable("user_memory", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  shortTermSummary: text("short_term_summary"),
  longTermFacts: text("long_term_facts"),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relacionamentos

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  contexts: many(contexts),
  dailyCycles: many(dailyCycles),
  messages: many(messages),
  memory: one(userMemory, {
    fields: [user.id],
    references: [userMemory.userId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const contextsRelations = relations(contexts, ({ one, many }) => ({
  user: one(user, {
    fields: [contexts.userId],
    references: [user.id],
  }),
  tasks: many(tasks),
}));

export const dailyCyclesRelations = relations(dailyCycles, ({ one, many }) => ({
  user: one(user, {
    fields: [dailyCycles.userId],
    references: [user.id],
  }),
  tasks: many(tasks),
  checkoutLogs: many(checkoutLogs),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  dailyCycle: one(dailyCycles, {
    fields: [tasks.dailyCycleId],
    references: [dailyCycles.id],
  }),
  context: one(contexts, {
    fields: [tasks.contextId],
    references: [contexts.id],
  }),
}));

export const checkoutLogsRelations = relations(checkoutLogs, ({ one }) => ({
  dailyCycle: one(dailyCycles, {
    fields: [checkoutLogs.dailyCycleId],
    references: [dailyCycles.id],
  }),
}));

export const userMemoryRelations = relations(userMemory, ({ one }) => ({
  user: one(user, {
    fields: [userMemory.userId],
    references: [user.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(user, {
    fields: [messages.userId],
    references: [user.id],
  }),
}));
