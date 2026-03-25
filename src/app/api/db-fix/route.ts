import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminLogin = "admin@selim.com";
  const diagnostics: any = {
    step: "Starting",
    env: {
      has_db_url: !!process.env.DATABASE_URL,
      has_jwt_secret: !!process.env.JWT_SECRET,
      node_env: process.env.NODE_ENV,
    }
  };

  try {
    diagnostics.step = "Testing DB Connection";
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.db_connection = "OK";

    diagnostics.step = "Checking Admin User";
    const admin = await prisma.usuario.findUnique({
      where: { login: adminLogin },
    });

    const hash = await bcrypt.hash("selimparnamirim", 12);

    if (!admin) {
      diagnostics.step = "Creating Admin User";
      await prisma.usuario.create({
        data: {
          nome: "Administrador",
          login: adminLogin,
          email: adminLogin,
          senhaHash: hash,
          tipo: "ADMIN",
          status: "ATIVO",
        },
      });
      return NextResponse.json({ 
        success: true, 
        message: "Admin criado do zero com sucesso!",
        diagnostics 
      });
    }

    diagnostics.step = "Updating Existing Admin User";
    await prisma.usuario.update({
      where: { login: adminLogin },
      data: {
        senhaHash: hash,
        status: "ATIVO",
        tipo: "ADMIN"
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin verificado e login/senha 'selimparnamirim' restaurados.",
      diagnostics
    });

  } catch (error: any) {
    console.error("Critical DB Fix failure:", error);
    return NextResponse.json({
      success: false,
      error: "Falha Crítica no Servidor",
      failed_at_step: diagnostics.step,
      error_message: error.message,
      diagnostics
    }, { status: 500 });
  }
}
