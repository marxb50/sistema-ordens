"use client";

import { useActionState } from "react";
import { cadastroAction } from "@/actions/auth.actions";
import Link from "next/link";

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState(
    cadastroAction,
    undefined
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary-400), transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Cadastro de Funcionário
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Preencha os dados para solicitar acesso
          </p>
        </div>

        <div className="card p-8">
          {state?.success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 mx-auto">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-400 font-medium">{state.success}</p>
              <Link href="/login" className="btn btn-primary">
                Voltar ao Login
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div>
                <label htmlFor="nome" className="label">Nome Completo</label>
                <input id="nome" name="nome" type="text" required className="input" placeholder="Seu nome completo" />
              </div>

              <div>
                <label htmlFor="login" className="label">Login</label>
                <input id="login" name="login" type="text" required className="input" placeholder="Escolha um login" minLength={3} />
              </div>

              <div>
                <label htmlFor="email" className="label">Email (opcional)</label>
                <input id="email" name="email" type="email" className="input" placeholder="seu@email.com" />
              </div>

              <div>
                <label htmlFor="senha" className="label">Senha</label>
                <input id="senha" name="senha" type="password" required className="input" placeholder="Mínimo 6 caracteres" minLength={6} />
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
                    Cadastrando...
                  </>
                ) : (
                  "Solicitar Cadastro"
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              Já tem conta?{" "}
              <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--color-primary-400)" }}>
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
