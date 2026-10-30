// Verificação somente leitura. Não cria inscrições nem imprime dados pessoais.
const base = process.env.VITE_API_URL;
const code = process.env.VITE_CANDIDATO;
if (!base || !code) throw new Error('Configure VITE_API_URL e VITE_CANDIDATO em .env.local.');
async function get(path) {
  const response = await fetch(base.replace(/\/$/, '') + path, {
    headers: { 'X-Candidato': code }, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} em ${path === '/inscricoes' ? 'listagem' : 'detalhes'}.`);
  return response.json();
}
const rows = await get('/inscricoes');
if (!Array.isArray(rows)) throw new Error('GET /inscricoes não retornou um array. Confira o contrato.');
console.log(`Consulta OK: ${rows.length} inscrições. Nenhum dado pessoal foi impresso.`);
if (rows.length) {
  const detail = await get('/inscricoes/' + encodeURIComponent(rows[0].id));
  if (detail.id !== rows[0].id) throw new Error('O detalhe não corresponde à inscrição consultada.');
  console.log('Consulta de detalhes OK.');
}
