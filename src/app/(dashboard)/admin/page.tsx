import { getEstatisticas } from "@/actions/usuario.actions";
import { listarServicos } from "@/actions/servico.actions";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getStatusColor, getStatusLabel, formatDateTime, getTipoServicoLabel } from "@/lib/utils";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.tipo !== "ADMIN") return null;

  const [stats, servicos, usuariosPendentes] = await Promise.all([
    getEstatisticas(),
    listarServicos(),
    prisma.usuario.findMany({
      where: { status: "PENDENTE" },
      select: { id: true, nome: true, login: true, email: true, criadoEm: true },
      orderBy: { criadoEm: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Painel Administrativo
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Visão geral do sistema
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total", value: stats.total, color: "var(--color-primary-400)" },
          { label: "Iniciados", value: stats.iniciados, color: "oklch(0.65 0.18 240)" },
          { label: "Pendentes MB", value: stats.pendentes, color: "oklch(0.75 0.15 85)" },
          { label: "Finalizados", value: stats.finalizados, color: "oklch(0.65 0.15 195)" },
          { label: "Conferidos", value: stats.conferidos, color: "oklch(0.65 0.17 150)" },
          { label: "Rejeitados", value: stats.rejeitados, color: "oklch(0.65 0.2 25)" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending users */}
      {usuariosPendentes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            ⚠️ Usuários Pendentes de Aprovação ({usuariosPendentes.length})
          </h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Login</th>
                  <th>Email</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPendentes.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.nome}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{u.login}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{u.email || "—"}</td>
                    <td style={{ color: "var(--text-muted)" }}>{formatDateTime(u.criadoEm)}</td>
                    <td>
                      <div className="flex gap-2">
                        <form action={async () => {
                          "use server";
                          const { aprovarUsuario } = await import("@/actions/usuario.actions");
                          await aprovarUsuario(u.id);
                        }}>
                          <button type="submit" className="btn btn-success text-xs px-3 py-1.5">
                            Aprovar
                          </button>
                        </form>
                        <form action={async () => {
                          "use server";
                          const { rejeitarUsuario } = await import("@/actions/usuario.actions");
                          await rejeitarUsuario(u.id);
                        }}>
                          <button type="submit" className="btn btn-danger text-xs px-3 py-1.5">
                            Rejeitar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent services */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Serviços Recentes
        </h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Funcionário</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {servicos.slice(0, 10).map((s) => (
                <tr key={s.id}>
                  <td className="font-mono text-sm font-medium">{s.codigoInterno}</td>
                  <td>{s.funcionario.nome}</td>
                  <td>{getTipoServicoLabel(s.tipoServico)}</td>
                  <td>
                    <span className={`badge ${getStatusColor(s.status)}`}>
                      {getStatusLabel(s.status)}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{formatDateTime(s.criadoEm)}</td>
                </tr>
              ))}
              {servicos.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8" style={{ color: "var(--text-muted)" }}>
                    Nenhum serviço registrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
