// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
// Using this allows your app to exist well offline
// You also put other service-worker-related tasks in here

const cacheName = 'default';
const cacheFiles = [
	"pwa.html",
	"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/6d/6db2ac365ae4ee52c350ac4e9a34fdbf013c64ce.jpg",
	"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/6d/6db2ac365ae4ee52c350ac4e9a34fdbf013c64ce_medium.jpg",
	"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/6d/6db2ac365ae4ee52c350ac4e9a34fdbf013c64ce_full.jpg",
	"https://wiki.teamfortress.com/w/images/a/a5/Buffed_blu_engineer.jpg",
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
