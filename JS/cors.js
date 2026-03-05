/* ── WASM CORS Service Worker ── */
const CONFIG_KEY = 'wasm-headers-config';

// Defaults
let headersEnabled = false;
let excludedPaths   = [];

/* ── Load config from storage ── */
async function loadConfig() {
  const raw = await self.caches.open('sw-config').then(c => c.match('/__sw_config__'));
  if (raw) {
    const cfg = await raw.json();
    headersEnabled = cfg.headers   ?? false;
    excludedPaths  = cfg.exclude   ?? [];
  }
}

/* ── Save config to storage (cache API as KV) ── */
async function saveConfig(cfg) {
  const cache = await self.caches.open('sw-config');
  await cache.put('/__sw_config__', new Response(JSON.stringify(cfg), {
    headers: { 'Content-Type': 'application/json' }
  }));
  headersEnabled = cfg.headers ?? headersEnabled;
  excludedPaths  = cfg.exclude ?? excludedPaths;
}

/* ── Lifecycle ── */
self.addEventListener('install', e => {
  e.waitUntil(loadConfig().then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(loadConfig().then(() => self.clients.claim()));
});

/* ── Message handler (config updates from page) ── */
self.addEventListener('message', async e => {
  if (e.data?.type === 'CONFIGURE') {
    await saveConfig(e.data.payload);
    e.ports[0]?.postMessage({ ok: true });
    // Tell all clients to reload so new headers take effect
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.postMessage({ type: 'SW_CONFIGURED' }));
  }

  if (e.data?.type === 'GET_CONFIG') {
    e.ports[0]?.postMessage({ headers: headersEnabled, exclude: excludedPaths });
  }
});

/* ── Fetch handler ── */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only touch same-origin requests
  if (url.origin !== self.location.origin) return;

  // Check exclusion list
  const excluded = excludedPaths.some(p => url.pathname.startsWith(p));

  if (!headersEnabled || excluded) return; // pass through untouched

  e.respondWith(
    fetch(e.request).then(response => {
      // Don't touch opaque/redirect responses
      if (!response || response.type === 'opaque') return response;

      const headers = new Headers(response.headers);
      headers.set('Cross-Origin-Opener-Policy',   'same-origin');
      headers.set('Cross-Origin-Embedder-Policy',  'require-corp');

      return new Response(response.body, {
        status:     response.status,
        statusText: response.statusText,
        headers
      });
    })
  );
});
