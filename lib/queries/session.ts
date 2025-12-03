import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

export type UserSession = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
};

export type Session = {
  user: UserSession;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};

/**
 * Obtém a sessão do usuário atual
 * Usa React.cache() para evitar múltiplas chamadas no mesmo request
 */
export const getCurrentSession = cache(async (): Promise<Session | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
});

/**
 * Obtém a sessão ou lança erro se não autenticado
 * Use em páginas protegidas onde a sessão é obrigatória
 */
export async function requireSession(): Promise<Session> {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("Unauthorized: Session required");
  }

  return session;
}
