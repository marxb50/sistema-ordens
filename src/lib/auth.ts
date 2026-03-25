import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import type { TipoUsuario } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret"
);

export interface SessionPayload {
  userId: string;
  login: string;
  tipo: TipoUsuario;
  nome: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("6h")
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL_URL;
  
  cookieStore.set("session-token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 6 * 60 * 60, // 6 hours
    path: "/",
    // Não definir domain fixo permite que o cookie funcione em www e no root
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session-token");
}

export async function requireAuth(
  allowedTypes?: TipoUsuario[]
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Não autenticado");
  }
  if (allowedTypes && !allowedTypes.includes(session.tipo)) {
    throw new Error("Acesso não autorizado");
  }
  return session;
}
