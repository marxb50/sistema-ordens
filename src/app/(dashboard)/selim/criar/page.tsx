"use client";

import { useActionState, useEffect, useState } from "react";
import { criarServico } from "@/actions/servico.actions";
import { listarFuncionariosAtivos } from "@/actions/usuario.actions";

export default function CriarOrdemPage() {
  const [state, formAction, isPending] = useActionState(criarServico, undefined);
  const [funcionarios, setFuncionarios] = useState<{ id: string; nome: string; login: string }[]>([]);

  useEffect(() => {
    listarFuncionariosAtivos().then(setFuncionarios);
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Criar Nova Ordem
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Atribua uma ordem de serviço a um funcionário
        </p>
      </div>

      <div className="card p-6">
        {state?.success ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 mx-auto">
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-emerald-400 font-medium">{state.success}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Criar Outra
            </button>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="funcionarioId" className="label">Funcionário</label>
              <select id="funcionarioId" name="funcionarioId" required className="input">
                <option value="">Selecione um funcionário</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome} ({f.login})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tipoServico" className="label">Tipo de Serviço</label>
              <select id="tipoServico" name="tipoServico" required className="input">
                <option value="">Selecione o tipo</option>
                <option value="ROCADEIRA">Roçadeira</option>
                <option value="CAPINACAO">Capinação</option>
                <option value="OP_ROCADEIRA">Op. Roçadeira</option>
              </select>
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{
                background: "oklch(0.5 0.18 25 / 0.1)",
                color: "oklch(0.65 0.2 25)",
                border: "1px solid oklch(0.5 0.18 25 / 0.2)",
              }}>
                {state.error}
              </div>
            )}

            <button type="submit" disabled={isPending} className="btn btn-primary w-full h-11">
              {isPending ? "Criando..." : "Criar Ordem"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
