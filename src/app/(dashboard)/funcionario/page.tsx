import { getEstatisticas } from "@/actions/usuario.actions";
import { listarServicos } from "@/actions/servico.actions";
import { getSession } from "@/lib/auth";
import { getStatusColor, getStatusLabel, formatDateTime, getTipoServicoLabel } from "@/lib/utils";
import { ServiceActionButtons } from "@/components/dashboard/ServiceActionButtons";

export default async function FuncionarioPage() {
  const session = await getSession();
  if (!session) return null;

  const [stats, servicos] = await Promise.all([
    getEstatisticas(),
    listarServicos(),
  ]);

  const pendentes = servicos.filter((s) =>
    ["INICIADO", "PENDENTE_MB"].includes(s.status)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Minhas Ordens
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Bem-vindo, {session.nome}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "var(--color-primary-400)" },
          { label: "Em Andamento", value: stats.iniciados + stats.pendentes, color: "oklch(0.75 0.15 85)" },
          { label: "Conferidos", value: stats.conferidos, color: "oklch(0.65 0.17 150)" },
          { label: "Rejeitados", value: stats.rejeitados, color: "oklch(0.65 0.2 25)" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active services */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Ordens Ativas ({pendentes.length})
        </h2>
        <div className="grid gap-4">
          {pendentes.map((s) => (
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
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDateTime(s.criadoEm)}
                  </span>
                </div>

                <div className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                  <p>🔧 {getTipoServicoLabel(s.tipoServico)}</p>
                  {s.fotoInicioUrl && (
                    <div className="flex gap-3 mt-3">
                      <div>
                        <p className="text-xs mb-1 font-medium">Foto Inicial</p>
                        <img src={s.fotoInicioUrl} alt="Foto inicial" className="w-28 h-20 object-cover rounded-lg border" style={{ borderColor: "var(--border)" }} />
                      </div>
                      {s.fotoFinalUrl && (
                        <div>
                          <p className="text-xs mb-1 font-medium">Foto Final</p>
                          <img src={s.fotoFinalUrl} alt="Foto final" className="w-28 h-20 object-cover rounded-lg border" style={{ borderColor: "var(--border)" }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <ServiceActionButtons servico={s} />
              </div>
            </div>
          ))}
          {pendentes.length === 0 && (
            <div className="card text-center py-12" style={{ color: "var(--text-muted)" }}>
              <p className="text-4xl mb-3">📋</p>
              <p>Nenhuma ordem ativa no momento</p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {servicos.filter((s) => !["INICIADO", "PENDENTE_MB"].includes(s.status)).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Histórico
          </h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {servicos
                  .filter((s) => !["INICIADO", "PENDENTE_MB"].includes(s.status))
                  .map((s) => (
                    <tr key={s.id}>
                      <td className="font-mono text-sm">{s.codigoInterno}</td>
                      <td>{getTipoServicoLabel(s.tipoServico)}</td>
                      <td>
                        <span className={`badge ${getStatusColor(s.status)}`}>
                          {getStatusLabel(s.status)}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{formatDateTime(s.criadoEm)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
