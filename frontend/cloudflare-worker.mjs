// Public edge proxy only. The existing Render backend authenticates every API request.
const BACKEND = 'https://trilha-concursos-pedro.onrender.com';
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    // Preserve CSRF checks: never replace a caller's Origin with a trusted one.
    if (MUTATING.has(request.method) && request.headers.get('origin') !== url.origin) {
      return Response.json({ error: 'Origem inválida.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }
    const destination = new URL(BACKEND);
    destination.pathname = url.pathname;
    destination.search = url.search;
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.set('x-forwarded-host', url.host);
    headers.set('x-forwarded-proto', 'https');
    headers.delete('content-length');
    const init = { method: request.method, headers, redirect: 'manual' };
    if (!['GET', 'HEAD'].includes(request.method)) init.body = request.body;
    try {
      const upstream = await fetch(destination, init);
      const response = new Response(upstream.body, upstream);
      response.headers.set('Cache-Control', 'private, no-store');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      const location = response.headers.get('Location');
      if (location) {
        const redirect = new URL(location, BACKEND);
        if (redirect.origin === BACKEND) response.headers.set('Location', url.origin + redirect.pathname + redirect.search + redirect.hash);
      }
      return response;
    } catch {
      return Response.json({ error: 'Não foi possível conectar. Tente novamente em instantes.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
  }
};
