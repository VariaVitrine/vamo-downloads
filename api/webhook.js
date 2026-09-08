// Relay webhook WhatsApp Cloud API — captura TODOS os eventos (status de entrega, erros).
// GET  /            → desafio de verificação da Meta (hub.challenge)
// GET  /?debug=1    → mostra o último evento bruto (código de erro real)
// POST /            → recebe eventos da Meta
export default function handler(req, res) {
  if (req.method === 'GET') {
    const u = new URL(req.url, 'http://x');
    if (u.searchParams.get('debug') === '1') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(200).send(globalThis.__VAMO_LAST_EVENT__ || 'nenhum evento recebido ainda');
      return;
    }
    const mode = u.searchParams.get('hub.mode');
    const token = u.searchParams.get('hub.verify_token');
    const challenge = u.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && token === 'vamo2026') {
      res.status(200).send(challenge);
      return;
    }
    res.status(403).send('forbidden');
    return;
  }
  // POST — body já vem parseado no runtime da Vercel
  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    globalThis.__VAMO_LAST_EVENT__ = new Date().toISOString() + '\n' + body;
    res.status(200).send('EVENT_RECEIVED');
  } catch (e) {
    res.status(200).send('EVENT_RECEIVED');
  }
}
