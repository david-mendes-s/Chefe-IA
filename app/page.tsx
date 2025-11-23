import { listUsersFindAll } from "@/lib/queries/public";
import { Suspense } from "react";

export default async function Home() {

  const users = await listUsersFindAll();

  return (
    <main>
      <h1>Users</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </Suspense>
    </main>
  );
}
