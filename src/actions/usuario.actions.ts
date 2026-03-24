"use server";

import { prisma } from "@/lib/db";
import { requireAuth, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function listarUsuarios() {
  await requireAuth(["ADMIN"]);
  return prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      login: true,
      email: true,
      tipo: true,
      status: true,
      criadoEm: true,
      ultimoLogin: true,
    },
    orderBy: { criadoEm: "desc" },
  });
}

export async function listarFuncionariosAtivos() {
  await requireAuth(["SELIM", "ADMIN"]);
  return prisma.usuario.findMany({
    where: { tipo: "FUNCIONARIO", status: "ATIVO" },
    select: { id: true, nome: true, login: true },
    orderBy: { nome: "asc" },
  });
}

export async function aprovarUsuario(userId: string) {
  try {
    const session = await requireAuth(["ADMIN"]);

    await prisma.usuario.update({
      where: { id: userId },
      data: { status: "ATIVO" },
    });

    await prisma.log.create({
      data: {
        usuarioId: session.userId,
        acao: "CONFIG_ALTERADA",
        observacao: `Usuário ${userId} aprovado`,
      },
    });

    revalidatePath("/admin");
    return { success: "Usuário aprovado!" };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function rejeitarUsuario(userId: string) {
  try {
    const session = await requireAuth(["ADMIN"]);

    await prisma.usuario.update({
      where: { id: userId },
      data: { status: "INATIVO" },
    });

    await prisma.log.create({
      data: {
        usuarioId: session.userId,
        acao: "CONFIG_ALTERADA",
        observacao: `Usuário ${userId} rejeitado`,
      },
    });

    revalidatePath("/admin");
    return { success: "Usuário rejeitado." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function resetarSenha(userId: string, novaSenha: string) {
  try {
    const session = await requireAuth(["ADMIN"]);

    if (novaSenha.length < 6) {
      return { error: "Senha deve ter pelo menos 6 caracteres" };
    }

    const senhaHash = await hashPassword(novaSenha);

    await prisma.usuario.update({
      where: { id: userId },
      data: { senhaHash },
    });

    await prisma.log.create({
      data: {
        usuarioId: session.userId,
        acao: "CONFIG_ALTERADA",
        observacao: `Senha do usuário ${userId} redefinida`,
      },
    });

    revalidatePath("/admin");
    return { success: "Senha redefinida!" };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function inativarUsuario(userId: string) {
  try {
    const session = await requireAuth(["ADMIN"]);

    await prisma.usuario.update({
      where: { id: userId },
      data: { status: "INATIVO" },
    });

    await prisma.log.create({
      data: {
        usuarioId: session.userId,
        acao: "CONFIG_ALTERADA",
        observacao: `Usuário ${userId} inativado`,
      },
    });

    revalidatePath("/admin");
    return { success: "Usuário inativado." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function listarLogs(limit = 50) {
  await requireAuth(["ADMIN"]);
  return prisma.log.findMany({
    include: {
      usuario: { select: { nome: true, login: true } },
      servico: { select: { codigoInterno: true } },
    },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

export async function getEstatisticas() {
  const session = await requireAuth();

  const where =
    session.tipo === "FUNCIONARIO"
      ? { funcionarioId: session.userId }
      : {};

  const [total, iniciados, pendentes, finalizados, conferidos, rejeitados] =
    await Promise.all([
      prisma.servico.count({ where }),
      prisma.servico.count({ where: { ...where, status: "INICIADO" } }),
      prisma.servico.count({ where: { ...where, status: "PENDENTE_MB" } }),
      prisma.servico.count({ where: { ...where, status: "FINALIZADO" } }),
      prisma.servico.count({ where: { ...where, status: "CONFERIDO" } }),
      prisma.servico.count({ where: { ...where, status: "REJEITADO" } }),
    ]);

  return { total, iniciados, pendentes, finalizados, conferidos, rejeitados };
}
