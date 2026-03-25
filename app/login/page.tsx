"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth.actions";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full opacity-20 bg-primary-400 blur-3xl" />
        <div className="absolute -bottom-1/3 -left-1/4 w-[500px] h-[500px] rounded-full opacity-15 bg-accent-400 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Sistema de Ordens</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Gerenciamento de Roçagem e Capinação</p>
        </div>

        <div className="card p-8">
          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="login" className="label">Login</label>
              <input id="login" name="login" type="text" required autoComplete="username" className="input" placeholder="Digite seu login ou email" />
            </div>

            <div>
              <label htmlFor="senha" className="label">Senha</label>
              <input id="senha" name="senha" type="password" required autoComplete="current-password" className="input" placeholder="Digite sua senha" />
            </div>

            {state?.error && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{
                  background: "oklch(0.5 0.18 25 / 0.1)",
                  color: "oklch(0.65 0.2 25)",
                  border: "1px solid oklch(0.5 0.18 25 / 0.2)",
                }}
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {state.error}
              </div>
            )}

            <button type="submit" disabled={isPending} className="btn btn-primary w-full h-11">
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.6s linear infinite" }} />
                  Entrando...
                </>
              ) : ("Entrar")}
            </button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              Novo funcionário? <Link href="/cadastro" className="font-medium hover:underline text-primary-400">Cadastre-se aqui</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
