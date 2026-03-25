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
  let targetRoute = "";
  
  try {
    const raw = {
      login: (formData.get("login") as string)?.trim(),
      senha: formData.get("senha") as string,
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { login, senha } = parsed.data;

    // Busca usuário e confere senha de modo seguro
    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [{ login: login }, { email: login }],
      },
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

    // Atualiza metadados do login
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

    // Cria token e define cookie
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

    targetRoute = routes[usuario.tipo] || "/funcionario";
  } catch (error: any) {
    // IMPORTANTE: Nunca capturar o erro de redirecionamento do Next.js
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    
    console.error("Critical login error:", error);
    return { error: "Erro interno no servidor. Verifique a conexão com o banco." };
  }

  // Chamar redirect() fora do try-catch para evitar erros internos fatais
  if (targetRoute) {
    redirect(targetRoute);
  }
}

export async function cadastroAction(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  try {
    const raw = {
      nome: (formData.get("nome") as string)?.trim(),
      login: (formData.get("login") as string)?.trim(),
      email: ((formData.get("email") as string) || "").trim(),
      senha: formData.get("senha") as string,
    };

    const parsed = cadastroSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { nome, login, email, senha } = parsed.data;

    const existing = await prisma.usuario.findFirst({
      where: {
        OR: [{ login }, ...(email ? [{ email }] : [])],
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
  } catch (error: any) {
    console.error("Cadastro error:", error);
    return { error: "Falha ao realizar cadastro." };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function getSessionData() {
  return getSession();
}
