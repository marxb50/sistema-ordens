import { getEstatisticas } from "@/actions/usuario.actions";
import { listarServicos } from "@/actions/servico.actions";
import { getSession } from "@/lib/auth";
import { getStatusColor, getStatusLabel, formatDateTime, getTipoServicoLabel } from "@/lib/utils";

export default async function MBPage() {
  const session = await getSession();
  if (!session) return null;

  const [stats, servicos] = await Promise.all([
    getEstatisticas(),
    listarServicos({ status: "FINALIZADO" }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Painel MB — Conferência
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Verifique e confirme serviços finalizados
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "var(--color-primary-400)" },
          { label: "Finalizados", value: stats.finalizados, color: "oklch(0.65 0.15 195)" },
          { label: "Conferidos", value: stats.conferidos, color: "oklch(0.65 0.17 150)" },
          { label: "Rejeitados", value: stats.rejeitados, color: "oklch(0.65 0.2 25)" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Services to review */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Serviços para Conferir ({servicos.length})
        </h2>
        <div className="grid gap-4">
          {servicos.map((s) => (
            <div key={s.id} className="card p-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold" style={{ color: "var(--color-primary-400)" }}>
                      {s.codigoInterno}
                    </span>
                    <span className={`badge ${getStatusColor(s.status)}`}>
                      {getStatusLabel(s.status)}
                    </span>
                  </div>
                </div>

                <div className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                  <p>👤 {s.funcionario.nome}</p>
                  <p>🔧 {getTipoServicoLabel(s.tipoServico)}</p>
                  <p>📅 Início: {formatDateTime(s.dataInicio)}</p>
                  <p>📅 Final: {formatDateTime(s.dataFinal)}</p>
                  {s.latInicio && <p>📍 Início: {s.latInicio.toFixed(4)}, {s.lngInicio?.toFixed(4)}</p>}
                  {s.latFinal && <p>📍 Final: {s.latFinal.toFixed(4)}, {s.lngFinal?.toFixed(4)}</p>}
                </div>

                {/* Photos side by side */}
                <div className="flex gap-4">
                  {s.fotoInicioUrl && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Antes</p>
                      <a href={s.fotoInicioUrl} target="_blank" rel="noopener">
                        <img src={s.fotoInicioUrl} alt="Antes" className="w-40 h-28 object-cover rounded-lg border" style={{ borderColor: "var(--border)" }} />
                      </a>
                    </div>
                  )}
                  {s.fotoFinalUrl && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Depois</p>
                      <a href={s.fotoFinalUrl} target="_blank" rel="noopener">
                        <img src={s.fotoFinalUrl} alt="Depois" className="w-40 h-28 object-cover rounded-lg border" style={{ borderColor: "var(--border)" }} />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <form action={async () => {
                    "use server";
                    const { statusMB } = await import("@/actions/servico.actions");
                    await statusMB(s.id, "CONFERIDO");
                  }}>
                    <button type="submit" className="btn btn-success">✅ Conferido</button>
                  </form>
                  <form action={async () => {
                    "use server";
                    const { statusMB } = await import("@/actions/servico.actions");
                    await statusMB(s.id, "EM_ANALISE", "Em análise pelo MB");
                  }}>
                    <button type="submit" className="btn btn-warning">🔍 Em Análise</button>
                  </form>
                  <form action={async () => {
                    "use server";
                    const { statusMB } = await import("@/actions/servico.actions");
                    await statusMB(s.id, "REJEITADO", "Rejeitado pelo MB");
                  }}>
                    <button type="submit" className="btn btn-danger">❌ Rejeitar</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
          {servicos.length === 0 && (
            <div className="card text-center py-12" style={{ color: "var(--text-muted)" }}>
              <p className="text-4xl mb-3">✅</p>
              <p>Nenhum serviço pendente de conferência</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
