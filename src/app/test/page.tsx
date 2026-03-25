export default function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>✅ O Sistema de Ordens está ONLINE!</h1>
      <p>Se você está vendo esta página, o seu servidor na Vercel está funcionando perfeitamente.</p>
      <p>Data e hora no servidor: {new Date().toLocaleString('pt-BR')}</p>
      <hr style={{ margin: '20px 0' }} />
      <a href="/login" style={{ color: '#1a7a70', fontWeight: 'bold' }}>Clique aqui para tentar ir para o Login</a>
    </div>
  );
}
