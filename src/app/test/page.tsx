export const dynamic = "force-dynamic";

export default function TestPage() {
  const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  
  return (
    <html>
      <body style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', background: '#111', color: '#eee' }}>
        <h1>✅ Sistema de Ordens - ONLINE</h1>
        <p>Servidor funcionando. Hora: {now}</p>
        <br />
        <a href="/login" style={{ color: '#1a7a70', fontWeight: 'bold', fontSize: '18px' }}>Ir para Login</a>
      </body>
    </html>
  );
}
