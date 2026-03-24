import { listarServicos } from "@/actions/servico.actions";
import { getSession } from "@/lib/auth";
import { getStatusColor, getStatusLabel, formatDateTime, getTipoServicoLabel } from "@/lib/utils";

export default async function RelatoriosPage() {
  const session = await getSession();
  if (!session) return null;

  const servicos = await listarServicos();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Relatórios
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Visualize e exporte dados dos serviços
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(
          servicos.reduce<Record<string, number>>((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
          }, {})
        ).map(([status, count]: [string, number]) => (
          <div key={status} className="stat-card">
            <div className="stat-value">{count}</div>
            <div className="stat-label">{getStatusLabel(status)}</div>
          </div>
        ))}
      </div>

      {/* Export button */}
      <div className="flex gap-3">
        <a
          href={`/api/pdf?type=all`}
          target="_blank"
          rel="noopener"
          className="btn btn-primary"
        >
          📄 Gerar PDF Completo
        </a>
      </div>

      {/* Full table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Funcionário</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Início</th>
              <th>Final</th>
              <th>Aprovado Por</th>
              <th>Conferido Por</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map((s) => (
              <tr key={s.id}>
                <td className="font-mono text-sm font-medium">{s.codigoInterno}</td>
                <td>{s.funcionario.nome}</td>
                <td>{getTipoServicoLabel(s.tipoServico)}</td>
                <td>
                  <span className={`badge ${getStatusColor(s.status)}`}>
                    {getStatusLabel(s.status)}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)" }}>{formatDateTime(s.dataInicio)}</td>
                <td style={{ color: "var(--text-muted)" }}>{formatDateTime(s.dataFinal)}</td>
                <td style={{ color: "var(--text-secondary)" }}>
                  {s.selimAprovador?.nome || "—"}
                </td>
                <td style={{ color: "var(--text-secondary)" }}>
                  {s.mbConfirmador?.nome || "—"}
                </td>
              </tr>
            ))}
            {servicos.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8" style={{ color: "var(--text-muted)" }}>
                  Nenhum serviço encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
