const CACHE = 'singa-v1';
const OFFLINE_URL = '/404.html';
const STATIC = [
  '/', '/index.html', '/styles.css', '/script.js',
  '/calculator.html', '/aksii.html', '/kontakty.html',
  '/remont-telefonov.html', '/remont-noutbukov.html',
  '/remont-televizorov.html', '/remont-kofemashin.html',
  '/404.html'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match(OFFLINE_URL)))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {title:'Синга Сервис', body:'Ваша техника готова!'};
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png', tag: 'repair-status',
    actions: [{action:'open', title:'Посмотреть'}]
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/index.html#tracker'));
});
