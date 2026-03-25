import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Check if admin exists
    const admin = await prisma.usuario.findUnique({
      where: { login: "admin@selim.com" },
      select: {
        id: true,
        nome: true,
        login: true,
        email: true,
        tipo: true,
        status: true,
        senhaHash: true,
      },
    });

    if (!admin) {
      // Create admin if not exists
      const hash = await bcrypt.hash("selimparnamirim", 12);
      const created = await prisma.usuario.create({
        data: {
          nome: "Administrador",
          login: "admin@selim.com",
          email: "admin@selim.com",
          senhaHash: hash,
          tipo: "ADMIN",
          status: "ATIVO",
        },
      });
      return NextResponse.json({
        message: "Admin criado com sucesso",
        admin: {
          id: created.id,
          login: created.login,
          tipo: created.tipo,
          status: created.status,
        },
      });
    }

    // Test password
    const passwordOk = await bcrypt.compare("selimparnamirim", admin.senhaHash);

    if (!passwordOk || admin.status !== "ATIVO") {
      // Fix admin password and status
      const newHash = await bcrypt.hash("selimparnamirim", 12);
      await prisma.usuario.update({
        where: { login: "admin@selim.com" },
        data: {
          senhaHash: newHash,
          status: "ATIVO",
        },
      });
      return NextResponse.json({
        message: "Admin corrigido (senha/status atualizado)",
        passwordWasCorrect: passwordOk,
        statusWas: admin.status,
      });
    }

    // List all users (without password)
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        login: true,
        email: true,
        tipo: true,
        status: true,
      },
    });

    return NextResponse.json({
      message: "Admin OK - login e senha corretos",
      admin: {
        login: admin.login,
        tipo: admin.tipo,
        status: admin.status,
        passwordOk,
      },
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Check admin error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
