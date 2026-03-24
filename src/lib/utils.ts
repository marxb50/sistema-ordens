export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function generateServiceCode(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `SVC${date}_${random}`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    INICIADO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PENDENTE_MB: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    FINALIZADO: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    CONFERIDO: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    REJEITADO: "bg-red-500/20 text-red-400 border-red-500/30",
    EM_ANALISE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    ATIVO: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    PENDENTE: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    INATIVO: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };
  return colors[status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    INICIADO: "Iniciado",
    PENDENTE_MB: "Pendente MB",
    FINALIZADO: "Finalizado",
    CONFERIDO: "Conferido",
    REJEITADO: "Rejeitado",
    EM_ANALISE: "Em Análise",
    ATIVO: "Ativo",
    PENDENTE: "Pendente",
    INATIVO: "Inativo",
  };
  return labels[status] || status;
}

export function getTipoServicoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    ROCADEIRA: "Roçadeira",
    CAPINACAO: "Capinação",
    OP_ROCADEIRA: "Op. Roçadeira",
  };
  return labels[tipo] || tipo;
}

export function getTipoUsuarioLabel(tipo: string): string {
  const labels: Record<string, string> = {
    ADMIN: "Administrador",
    FUNCIONARIO: "Funcionário",
    SELIM: "SELIM",
    MB: "MB",
  };
  return labels[tipo] || tipo;
}

export function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
