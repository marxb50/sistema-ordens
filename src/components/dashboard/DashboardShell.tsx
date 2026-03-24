"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth.actions";
import type { SessionPayload } from "@/lib/auth";

const menuItems: Record<string, { label: string; href: string; icon: string }[]> = {
  ADMIN: [
    { label: "Painel", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/usuarios", icon: "👥" },
    { label: "Serviços", href: "/admin/servicos", icon: "📋" },
    { label: "Logs", href: "/admin/logs", icon: "📜" },
    { label: "Relatórios", href: "/relatorios", icon: "📄" },
  ],
  SELIM: [
    { label: "Painel", href: "/selim", icon: "📊" },
    { label: "Criar Ordem", href: "/selim/criar", icon: "➕" },
    { label: "Pendentes", href: "/selim/pendentes", icon: "⏳" },
    { label: "Relatórios", href: "/relatorios", icon: "📄" },
  ],
  MB: [
    { label: "Painel", href: "/mb", icon: "📊" },
    { label: "Para Conferir", href: "/mb/conferir", icon: "✅" },
    { label: "Relatórios", href: "/relatorios", icon: "📄" },
  ],
  FUNCIONARIO: [
    { label: "Painel", href: "/funcionario", icon: "📊" },
    { label: "Minhas Ordens", href: "/funcionario/ordens", icon: "📋" },
    { label: "Histórico", href: "/funcionario/historico", icon: "📜" },
  ],
};

export function DashboardShell({
  session,
  children,
}: {
  session: SessionPayload;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : true;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  const items = menuItems[session.tipo] || [];

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
            SO
          </div>
          <div className="overflow-hidden">
            <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
              Sistema de Ordens
            </div>
            <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {session.tipo}
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={toggleTheme} className="sidebar-link w-full">
            <span className="text-lg">{darkMode ? "☀️" : "🌙"}</span>
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </button>
          <form action={logoutAction}>
            <button type="submit" className="sidebar-link w-full text-red-400 hover:text-red-300">
              <span className="text-lg">🚪</span>
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center gap-4 px-6 h-16"
          style={{
            background: "var(--bg)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {session.nome}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {session.login}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
              {session.nome.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
