import SpinLoader from "@/components/SpinLoader";
import { auth } from "@/lib/auth";
import clsx from "clsx";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={
      <SpinLoader className={clsx("flex items-center justify-center h-screen")}
      />
    }>
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}