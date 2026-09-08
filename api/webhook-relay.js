// Relay webhook Evolution API → backend VAMO local (túnel público).
// Vercel não alcança localhost do dono; o backend escuta na porta 3002.
// Este relay grava o último payload pra debug e reenvia pro backend local.
export default function handler(req, res) {
  if (req.method === 'GET') {
    const u = new URL(req.url, 'http://x');
    if (u.searchParams.get('debug') === '1') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(200).send(globalThis.__VAMO_LAST_WA__ || 'nenhum evento WA ainda');
      return;
    }
    res.status(200).send('relay WA no ar');
    return;
  }
  // POST: repassa pra máquina do dono via serviço de túnel público
  const backend = process.env.VAMO_TUNNEL_URL || 'https://riders-yards-standard-floating.trycloudflare.com';  let body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  globalThis.__VAMO_LAST_WA__ = new Date().toISOString() + '\n' + body.slice(0, 2000);
  fetch(backend + '/webhook/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(8000),
  })
    .then((r) => {
      console.log('relay -> backend:', r.status);
      res.status(200).send('OK');
    })
    .catch((e) => {
      console.error('relay erro:', String(e).slice(0, 100));
      res.status(200).send('OK (backend offline, evento guardado)');
    });
}
