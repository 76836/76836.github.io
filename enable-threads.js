// COOP/COEP service worker for GitHub Pages (site-wide scope /).
// Based on coi-serviceworker (Guido Zuidhof, MIT). Used by WebDesk isolation toggle.
// Register from any page: navigator.serviceWorker.register('/enable-threads.js', { scope: '/' })

if (typeof window === 'undefined') {
  self.addEventListener('install', (event) => {
    // Activate immediately — do not wait for old clients to close
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      (async () => {
        await self.clients.claim();
      })()
    );
  });

  self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING' || event.data?.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  async function handleFetch(request) {
    if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
      return;
    }

    if (request.mode === 'no-cors') {
      request = new Request(request.url, {
        cache: request.cache,
        credentials: 'omit',
        headers: request.headers,
        integrity: request.integrity,
        destination: request.destination,
        keepalive: request.keepalive,
        method: request.method,
        mode: request.mode,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        signal: request.signal,
      });
    }

    let r = await fetch(request).catch((e) => {
      console.error('[enable-threads] fetch', e);
      throw e;
    });

    if (r.status === 0) {
      return r;
    }

    const headers = new Headers(r.headers);
    headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');

    return new Response(r.body, {
      status: r.status,
      statusText: r.statusText,
      headers,
    });
  }

  self.addEventListener('fetch', function (e) {
    e.respondWith(handleFetch(e.request));
  });
} else {
  // Optional: if this file is included as a <script>, auto-register (legacy).
  (async function () {
    if (window.crossOriginIsolated !== false) return;
    try {
      const registration = await navigator.serviceWorker.register(window.document.currentScript.src, {
        scope: '/',
        updateViaCache: 'none',
      });
      console.log('[enable-threads] registered', registration.scope);
      await navigator.serviceWorker.ready;
      if (!window.crossOriginIsolated && !sessionStorage.getItem('coiReloaded')) {
        sessionStorage.setItem('coiReloaded', '1');
        location.replace(location.pathname + location.search + location.hash);
      }
    } catch (e) {
      console.error('[enable-threads] register failed', e);
    }
  })();
}
