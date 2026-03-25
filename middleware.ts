import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret"
);

// Rotas públicas que não exigem autenticação
const publicPaths = ["/login", "/cadastro", "/api/", "/test"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Verificar se é um caminho público ou estático
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
  const isStaticFile = pathname.startsWith("/_next") || pathname === "/favicon.ico";
  const isRoot = pathname === "/";

  if (isPublicPath || isStaticFile || isRoot) {
    return NextResponse.next();
  }

  // 2. Tentar obter o token
  const token = request.cookies.get("session-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 3. Verificar o token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const tipo = payload.tipo as string;

    // Redirecionamento básico de papéis se necessário (pode ser refinado depois)
    // No momento, apenas deixa passar se o token for válido
    return NextResponse.next();
  } catch (err) {
    console.error("Middleware Auth Error:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
