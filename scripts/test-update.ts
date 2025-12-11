
import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function testUpdate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Get a task
    const res = await client.query("SELECT id, title, status FROM tasks LIMIT 1");
    if (res.rows.length === 0) {
      console.log("No tasks found");
      return;
    }

    const task = res.rows[0];
    console.log("Original Task:", task);

    // Update to In_Progress
    const updateRes = await client.query("UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *", ['In_Progress', task.id]);
    console.log("Updated Task:", updateRes.rows[0]);

    // Revert
    await client.query("UPDATE tasks SET status = $1 WHERE id = $2", [task.status, task.id]);
    console.log("Reverted.");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

testUpdate();
