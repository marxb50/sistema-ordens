import { getEstatisticas } from "@/actions/usuario.actions";
import { listarServicos } from "@/actions/servico.actions";
import { getSession } from "@/lib/auth";
import { getStatusColor, getStatusLabel, formatDateTime, getTipoServicoLabel } from "@/lib/utils";
import Link from "next/link";

export default async function SelimPage() {
  const session = await getSession();
  if (!session) return null;

  const [stats, servicos] = await Promise.all([
    getEstatisticas(),
    listarServicos({ status: "INICIADO" }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Painel SELIM
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Aprovar serviços e criar ordens
          </p>
        </div>
        <Link href="/selim/criar" className="btn btn-primary">
          ➕ Criar Ordem
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "var(--color-primary-400)" },
          { label: "Iniciados", value: stats.iniciados, color: "oklch(0.65 0.18 240)" },
          { label: "Pendentes MB", value: stats.pendentes, color: "oklch(0.75 0.15 85)" },
          { label: "Conferidos", value: stats.conferidos, color: "oklch(0.65 0.17 150)" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending approval */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Serviços Aguardando Aprovação ({servicos.length})
        </h2>
        <div className="grid gap-4">
          {servicos.map((s) => (
            <div key={s.id} className="card card-interactive p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold" style={{ color: "var(--color-primary-400)" }}>
                      {s.codigoInterno}
                    </span>
                    <span className={`badge ${getStatusColor(s.status)}`}>
                      {getStatusLabel(s.status)}
                    </span>
                  </div>
                  <div className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                    <p>👤 {s.funcionario.nome}</p>
                    <p>🔧 {getTipoServicoLabel(s.tipoServico)}</p>
                    <p>📅 {formatDateTime(s.dataInicio || s.criadoEm)}</p>
                    {s.latInicio && s.lngInicio && (
                      <p>📍 {s.latInicio.toFixed(4)}, {s.lngInicio.toFixed(4)}</p>
                    )}
                  </div>
                  {s.fotoInicioUrl && (
                    <a href={s.fotoInicioUrl} target="_blank" rel="noopener" className="inline-block">
                      <img src={s.fotoInicioUrl} alt="Foto inicial" className="w-32 h-24 object-cover rounded-lg border" style={{ borderColor: "var(--border)" }} />
                    </a>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2">
                  <form action={async () => {
                    "use server";
                    const { aprovarSelim } = await import("@/actions/servico.actions");
                    await aprovarSelim(s.id);
                  }}>
                    <button type="submit" className="btn btn-success w-full">✅ Aprovar</button>
                  </form>
                  <form action={async () => {
                    "use server";
                    const { reprovarSelim } = await import("@/actions/servico.actions");
                    await reprovarSelim(s.id, "Rejeitado pelo SELIM");
                  }}>
                    <button type="submit" className="btn btn-danger w-full">❌ Rejeitar</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
          {servicos.length === 0 && (
            <div className="card text-center py-12" style={{ color: "var(--text-muted)" }}>
              <p className="text-4xl mb-3">✨</p>
              <p>Nenhum serviço pendente de aprovação</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
