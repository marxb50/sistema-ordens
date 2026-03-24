"use server";

import { prisma } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createToken,
  setSessionCookie,
  clearSession,
  getSession,
  type SessionPayload,
} from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  login: z.string().min(1, "Login obrigatório"),
  senha: z.string().min(1, "Senha obrigatória"),
});

const cadastroSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  login: z.string().min(3, "Login deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const raw = {
    login: formData.get("login") as string,
    senha: formData.get("senha") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { login, senha } = parsed.data;

  const usuario = await prisma.usuario.findUnique({
    where: { login },
  });

  if (!usuario) {
    return { error: "Login ou senha inválidos" };
  }

  if (usuario.status !== "ATIVO") {
    return { error: "Conta pendente de aprovação ou inativa" };
  }

  const senhaValida = await verifyPassword(senha, usuario.senhaHash);
  if (!senhaValida) {
    return { error: "Login ou senha inválidos" };
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoLogin: new Date() },
  });

  await prisma.log.create({
    data: {
      usuarioId: usuario.id,
      acao: "LOGIN",
      observacao: `Login realizado`,
    },
  });

  const payload: SessionPayload = {
    userId: usuario.id,
    login: usuario.login,
    tipo: usuario.tipo,
    nome: usuario.nome,
  };

  const token = await createToken(payload);
  await setSessionCookie(token);

  const routes: Record<string, string> = {
    ADMIN: "/admin",
    SELIM: "/selim",
    MB: "/mb",
    FUNCIONARIO: "/funcionario",
  };

  redirect(routes[usuario.tipo] || "/funcionario");
}

export async function cadastroAction(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const raw = {
    nome: formData.get("nome") as string,
    login: formData.get("login") as string,
    email: (formData.get("email") as string) || "",
    senha: formData.get("senha") as string,
  };

  const parsed = cadastroSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { nome, login, email, senha } = parsed.data;

  const existing = await prisma.usuario.findFirst({
    where: {
      OR: [
        { login },
        ...(email ? [{ email }] : []),
      ],
    },
  });

  if (existing) {
    return { error: "Login ou email já cadastrado" };
  }

  const senhaHash = await hashPassword(senha);

  await prisma.usuario.create({
    data: {
      nome,
      login,
      email: email || null,
      senhaHash,
      tipo: "FUNCIONARIO",
      status: "PENDENTE",
    },
  });

  return { success: "Cadastro realizado! Aguarde aprovação do administrador." };
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function getSessionData() {
  return getSession();
}
