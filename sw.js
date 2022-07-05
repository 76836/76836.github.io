// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
// Using this allows your app to exist well offline
// You also put other service-worker-related tasks in here

const cacheName = 'default';
const cacheFiles = [
	"/index.html",
	"/new/",
	"https://aaronos.dev/AaronOS/COOKIE/",
];

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(cachedResponse =>
			cachedResponse || fetch(event.request).then(response =>
				caches.open(cacheName).then(cache =>
					cache.put(event.request, response.clone)
				)
			)
		)
	);
});

//optional, aggressively caches everything on install:
self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(cacheName).then(cache =>
			cache.addAll(cacheFiles)
		)
	);
});
