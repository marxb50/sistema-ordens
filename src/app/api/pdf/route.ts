import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const servicos = await prisma.servico.findMany({
      include: {
        funcionario: { select: { nome: true } },
        selimAprovador: { select: { nome: true } },
        mbConfirmador: { select: { nome: true } },
      },
      orderBy: { criadoEm: "desc" },
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Serviços</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; color: #333; }
          h1 { font-size: 18px; margin-bottom: 5px; color: #1a7a70; }
          .subtitle { font-size: 11px; color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #1a7a70; color: white; padding: 8px 6px; text-align: left; font-size: 10px; text-transform: uppercase; }
          td { padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 11px; }
          tr:nth-child(even) { background: #f8f8f8; }
          .status { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; }
          .status-conferido { background: #d1fae5; color: #065f46; }
          .status-finalizado { background: #cffafe; color: #155e75; }
          .status-pendente_mb { background: #fef3c7; color: #92400e; }
          .status-iniciado { background: #dbeafe; color: #1e40af; }
          .status-rejeitado { background: #fee2e2; color: #991b1b; }
          .status-em_analise { background: #ffedd5; color: #9a3412; }
          .footer { margin-top: 20px; font-size: 10px; color: #999; text-align: center; }
          .total { margin-top: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>📋 Relatório de Serviços</h1>
        <p class="subtitle">Gerado em: ${new Date().toLocaleString("pt-BR")} | Total: ${servicos.length} serviços</p>
        
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Funcionário</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Data Início</th>
              <th>Data Final</th>
              <th>Aprovado Por</th>
              <th>Conferido Por</th>
            </tr>
          </thead>
          <tbody>
            ${servicos
              .map(
                (s: any) => `
              <tr>
                <td><strong>${s.codigoInterno}</strong></td>
                <td>${s.funcionario.nome}</td>
                <td>${s.tipoServico.replace(/_/g, " ")}</td>
                <td><span class="status status-${s.status.toLowerCase()}">${s.status.replace(/_/g, " ")}</span></td>
                <td>${s.dataInicio ? new Date(s.dataInicio).toLocaleDateString("pt-BR") : "—"}</td>
                <td>${s.dataFinal ? new Date(s.dataFinal).toLocaleDateString("pt-BR") : "—"}</td>
                <td>${s.selimAprovador?.nome || "—"}</td>
                <td>${s.mbConfirmador?.nome || "—"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <p class="total">Total de serviços: ${servicos.length}</p>
        <p class="footer">Sistema de Ordens — cadastramento.tech</p>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}
