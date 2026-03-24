"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { generateServiceCode } from "@/lib/utils";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const criarServicoSchema = z.object({
  funcionarioId: z.string().min(1),
  tipoServico: z.enum(["ROCADEIRA", "CAPINACAO", "OP_ROCADEIRA"]),
});

export async function criarServico(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  try {
    const session = await requireAuth(["SELIM", "ADMIN"]);

    const raw = {
      funcionarioId: formData.get("funcionarioId") as string,
      tipoServico: formData.get("tipoServico") as string,
    };

    const parsed = criarServicoSchema.safeParse(raw);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { funcionarioId, tipoServico } = parsed.data;

    const servico = await prisma.servico.create({
      data: {
        codigoInterno: generateServiceCode(),
        funcionarioId,
        tipoServico,
        status: "INICIADO",
      },
    });

    await prisma.log.create({
      data: {
        servicoId: servico.id,
        usuarioId: session.userId,
        acao: "CRIOU",
        observacao: `Ordem ${servico.codigoInterno} criada para funcionário ${funcionarioId}`,
      },
    });

    revalidatePath("/selim");
    revalidatePath("/funcionario");
    return { success: `Ordem ${servico.codigoInterno} criada com sucesso!` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function iniciarServico(data: {
  servicoId: string;
  lat: number | null;
  lng: number | null;
  fotoBase64: string;
}) {
  try {
    const session = await requireAuth(["FUNCIONARIO"]);

    const servico = await prisma.servico.findUnique({
      where: { id: data.servicoId },
    });

    if (!servico) return { error: "Serviço não encontrado" };
    if (servico.funcionarioId !== session.userId)
      return { error: "Serviço não atribuído a você" };

    const foto = await uploadImage(
      data.fotoBase64,
      "inicial",
      `${servico.codigoInterno}_inicial`
    );

    await prisma.servico.update({
      where: { id: data.servicoId },
      data: {
        status: "INICIADO",
        dataInicio: new Date(),
        latInicio: data.lat,
        lngInicio: data.lng,
        fotoInicioUrl: foto.url,
        fotoInicioId: foto.publicId,
      },
    });

    await prisma.log.create({
      data: {
        servicoId: data.servicoId,
        usuarioId: session.userId,
        acao: "INICIOU",
        observacao: `Serviço iniciado com foto e geolocalização`,
      },
    });

    revalidatePath("/funcionario");
    revalidatePath("/selim");
    return { success: "Serviço iniciado com sucesso!" };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function finalizarServico(data: {
  servicoId: string;
  lat: number | null;
  lng: number | null;
  fotoBase64: string;
}) {
  try {
    const session = await requireAuth(["FUNCIONARIO"]);

    const servico = await prisma.servico.findUnique({
      where: { id: data.servicoId },
    });

    if (!servico) return { error: "Serviço não encontrado" };
    if (servico.funcionarioId !== session.userId)
      return { error: "Serviço não atribuído a você" };
    if (servico.status !== "PENDENTE_MB")
      return { error: "Serviço precisa ser aprovado pelo SELIM primeiro" };

    const foto = await uploadImage(
      data.fotoBase64,
      "final",
      `${servico.codigoInterno}_final`
    );

    await prisma.servico.update({
      where: { id: data.servicoId },
      data: {
        status: "FINALIZADO",
        dataFinal: new Date(),
        latFinal: data.lat,
        lngFinal: data.lng,
        fotoFinalUrl: foto.url,
        fotoFinalId: foto.publicId,
      },
    });

    await prisma.log.create({
      data: {
        servicoId: data.servicoId,
        usuarioId: session.userId,
        acao: "FINALIZOU",
        observacao: `Serviço finalizado com foto e geolocalização`,
      },
    });

    revalidatePath("/funcionario");
    revalidatePath("/mb");
    return { success: "Serviço finalizado com sucesso!" };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function aprovarSelim(servicoId: string, observacao?: string) {
  try {
    const session = await requireAuth(["SELIM", "ADMIN"]);

    await prisma.servico.update({
      where: { id: servicoId },
      data: {
        status: "PENDENTE_MB",
        selimAprovadoPorId: session.userId,
        selimAprovadoEm: new Date(),
        observacao,
      },
    });

    await prisma.log.create({
      data: {
        servicoId,
        usuarioId: session.userId,
        acao: "APROVOU_SELIM",
        observacao: observacao || "Aprovado pelo SELIM",
      },
    });

    revalidatePath("/selim");
    revalidatePath("/funcionario");
    return { success: "Serviço aprovado para MB!" };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function reprovarSelim(servicoId: string, observacao: string) {
  try {
    const session = await requireAuth(["SELIM", "ADMIN"]);

    await prisma.servico.update({
      where: { id: servicoId },
      data: {
        status: "REJEITADO",
        observacao,
      },
    });

    await prisma.log.create({
      data: {
        servicoId,
        usuarioId: session.userId,
        acao: "REPROVOU_SELIM",
        observacao,
      },
    });

    revalidatePath("/selim");
    revalidatePath("/funcionario");
    return { success: "Serviço rejeitado." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function statusMB(
  servicoId: string,
  status: "CONFERIDO" | "EM_ANALISE" | "REJEITADO",
  observacao?: string
) {
  try {
    const session = await requireAuth(["MB", "ADMIN"]);

    const acaoMap = {
      CONFERIDO: "APROVOU_MB" as const,
      EM_ANALISE: "APROVOU_MB" as const,
      REJEITADO: "REPROVOU_MB" as const,
    };

    await prisma.servico.update({
      where: { id: servicoId },
      data: {
        status,
        mbConfirmadoPorId: session.userId,
        mbConfirmadoEm: new Date(),
        observacao,
      },
    });

    await prisma.log.create({
      data: {
        servicoId,
        usuarioId: session.userId,
        acao: acaoMap[status],
        observacao: observacao || `Status alterado para ${status}`,
      },
    });

    revalidatePath("/mb");
    return { success: `Status atualizado para ${status}` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function listarServicos(filtros?: {
  status?: string;
  funcionarioId?: string;
  tipoServico?: string;
  dataInicio?: string;
  dataFim?: string;
}) {
  const session = await requireAuth();

  const where: Record<string, unknown> = {};

  if (session.tipo === "FUNCIONARIO") {
    where.funcionarioId = session.userId;
  }

  if (filtros?.status) where.status = filtros.status;
  if (filtros?.funcionarioId) where.funcionarioId = filtros.funcionarioId;
  if (filtros?.tipoServico) where.tipoServico = filtros.tipoServico;

  if (filtros?.dataInicio || filtros?.dataFim) {
    where.criadoEm = {};
    if (filtros.dataInicio)
      (where.criadoEm as Record<string, unknown>).gte = new Date(filtros.dataInicio);
    if (filtros.dataFim)
      (where.criadoEm as Record<string, unknown>).lte = new Date(filtros.dataFim + "T23:59:59");
  }

  return prisma.servico.findMany({
    where,
    include: {
      funcionario: { select: { id: true, nome: true, login: true } },
      selimAprovador: { select: { id: true, nome: true } },
      mbConfirmador: { select: { id: true, nome: true } },
    },
    orderBy: { criadoEm: "desc" },
  });
}
