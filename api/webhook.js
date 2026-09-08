// Relay webhook WhatsApp Cloud API — captura TODOS os eventos (status de entrega, erros).
// GET  /  → responde o desafio de verificação da Meta (hub.challenge)
// POST /  → recebe eventos; guarda o último na memória do lambda
// GET /?debug=1 → mostra o último evento bruto (pra eu ler o código de erro real)
module.exports = (req, res) => {
  if (req.method === 'GET') {
    const u = new URL(req.url, 'http://x');
    if (u.searchParams.get('debug') === '1') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(200).send(global.__VAMO_LAST_EVENT__ || 'nenhum evento recebido ainda');
      return;
    }
    const mode = u.searchParams.get('hub.mode');
    const token = u.searchParams.get('hub.verify_token');
    const challenge = u.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && token === 'vamo2026') {
      res.status(200).send(challenge);
      return;
    }
    res.sendStatus(403);
    return;
  }
  // POST: evento
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    global.__VAMO_LAST_EVENT__ = new Date().toISOString() + '\n' + body;
    res.sendStatus(200);
  });
};
