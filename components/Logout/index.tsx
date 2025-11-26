"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();
  return (
    <Button onClick={() => authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/login"); // redirect to login page
        },
      },
    })}>Logout</Button>
  )
}