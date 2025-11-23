import db from "@/db/drizzle/index";
import {
  user,
  session,
  account,
  verification,
  contexts,
  dailyCycles,
  tasks,
  checkoutLogs,
  userMemory,
} from "@/db/drizzle/schemas";
import seedData from "@/db/seeds/seed.json";

(async () => {
  console.log("🌱 Starting database seeding...");

  try {
    // Limpar dados existentes (em ordem reversa devido às foreign keys)
    console.log("🗑️  Clearing existing data...");
    await db.delete(checkoutLogs);
    await db.delete(tasks);
    await db.delete(dailyCycles);
    await db.delete(contexts);
    await db.delete(userMemory);
    await db.delete(session);
    await db.delete(account);
    await db.delete(verification);
    await db.delete(user);

    // Inserir usuários
    console.log("👥 Inserting users...");
    await db.insert(user).values(
      seedData.users.map((u) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      }))
    );
    console.log(`✅ Inserted ${seedData.users.length} users`);

    // Inserir contas
    console.log("🔐 Inserting accounts...");
    if (seedData.accounts.length > 0) {
      await db.insert(account).values(
        seedData.accounts.map((a) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
          accessTokenExpiresAt: a.accessTokenExpiresAt
            ? new Date(a.accessTokenExpiresAt)
            : null,
          refreshTokenExpiresAt: a.refreshTokenExpiresAt
            ? new Date(a.refreshTokenExpiresAt)
            : null,
        }))
      );
    }
    console.log(`✅ Inserted ${seedData.accounts.length} accounts`);

    // Inserir sessões
    console.log("🔑 Inserting sessions...");
    if (seedData.sessions.length > 0) {
      await db.insert(session).values(
        seedData.sessions.map((s) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          expiresAt: new Date(s.expiresAt),
        }))
      );
    }
    console.log(`✅ Inserted ${seedData.sessions.length} sessions`);

    // Inserir verificações
    console.log("✉️  Inserting verifications...");
    if (seedData.verifications.length > 0) {
      await db.insert(verification).values(
        seedData.verifications.map((v) => ({
          ...v,
          createdAt: new Date(v.createdAt),
          updatedAt: new Date(v.updatedAt),
          expiresAt: new Date(v.expiresAt),
        }))
      );
    }
    console.log(`✅ Inserted ${seedData.verifications.length} verifications`);

    // Inserir contextos
    console.log("🎯 Inserting contexts...");
    if (seedData.contexts.length > 0) {
      await db.insert(contexts).values(
        seedData.contexts.map((c) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          deadline: c.deadline ? new Date(c.deadline) : null,
        }))
      );
    }
    console.log(`✅ Inserted ${seedData.contexts.length} contexts`);

    // Inserir ciclos diários
    console.log("🔄 Inserting daily cycles...");
    if (seedData.dailyCycles.length > 0) {
      await db.insert(dailyCycles).values(
        seedData.dailyCycles.map((d) => ({
          ...d,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
          date: new Date(d.date),
          checkoutStatus: d.checkoutStatus as "Pending" | "Completed" | "Skipped",
        }))
      );
    }
    console.log(`✅ Inserted ${seedData.dailyCycles.length} daily cycles`);

    // Inserir tarefas
    console.log("✅ Inserting tasks...");
    if (seedData.tasks.length > 0) {
      await db.insert(tasks).values(
        seedData.tasks.map((t) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
          status: t.status as "Todo" | "Done" | "Failed",
          origin: t.origin as "AI_Generated" | "User_Added",
        }))
      );
    }
    console.log(`✅ Inserted ${seedData.tasks.length} tasks`);

    // Inserir logs de checkout
    console.log("📝 Inserting checkout logs...");
    if (seedData.checkoutLogs.length > 0) {
      await db.insert(checkoutLogs).values(
        seedData.checkoutLogs.map((l) => ({
          ...l,
          createdAt: new Date(l.createdAt),
        }))
      );
    }
    console.log(`✅ Inserted ${seedData.checkoutLogs.length} checkout logs`);

    // Inserir memória do usuário
    console.log("🧠 Inserting user memory...");
    if (seedData.userMemory.length > 0) {
      await db.insert(userMemory).values(
        seedData.userMemory.map((m) => ({
          ...m,
          updatedAt: new Date(m.updatedAt),
        }))
      );
    }
    console.log(`✅ Inserted ${seedData.userMemory.length} user memory records`);

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
})();
