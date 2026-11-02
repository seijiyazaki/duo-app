// オフラインでも開けるようにアプリ本体をキャッシュする
const CACHE = 'duo-v3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png',
  'bg-home.svg', 'bg-daily.svg', 'bg-schedule.svg', 'bg-free.svg', 'bg-settings.svg',
  'sfx/clap1.mp3', 'sfx/clap2.mp3', 'sfx/cheer1.mp3', 'sfx/cheer2.mp3', 'sfx/cheer3.mp3'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// ネットにつながるときは最新を取り、つながらないときはキャッシュを返す
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
