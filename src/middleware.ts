import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret"
);

const publicPaths = ["/login", "/cadastro", "/api/auth", "/test"];

const roleRoutes: Record<string, string[]> = {
  ADMIN: ["/admin", "/selim", "/mb", "/funcionario", "/relatorios"],
  SELIM: ["/selim", "/relatorios"],
  MB: ["/mb", "/relatorios"],
  FUNCIONARIO: ["/funcionario"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const tipo = payload.tipo as string;

    const allowed = roleRoutes[tipo] || [];
    const hasAccess = allowed.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      const defaultRoute =
        tipo === "ADMIN"
          ? "/admin"
          : tipo === "SELIM"
          ? "/selim"
          : tipo === "MB"
          ? "/mb"
          : "/funcionario";
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
