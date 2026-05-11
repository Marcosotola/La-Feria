// public/firebase-messaging-sw.js - VERSIÓN CORREGIDA
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const CACHE_NAME = 'la-feria-v1';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

const firebaseConfig = {
  apiKey: "AIzaSyCi8RTNdmzldnW_zlT4iZB8b4iEZak-VpU",
  authDomain: "la-feria-14a63.firebaseapp.com",
  projectId: "la-feria-14a63",
  storageBucket: "la-feria-14a63.firebasestorage.app",
  messagingSenderId: "110375857205",
  appId: "1:110375857205:web:4b94219bb4dcc8a8f1d57c"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log('Firebase Service Worker cargado correctamente');

// Funcionalidad PWA (install, activate, fetch)
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.log('Failed to cache:', url, err);
            });
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Installed');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;
  if (event.request.url.startsWith('moz-extension://')) return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('Mensaje recibido en segundo plano:', payload);
  
  const notificationTitle = payload.notification?.title || 'La Feria';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'la-feria-notification',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      }
    ]
  };

  console.log('Mostrando notificación:', notificationTitle);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('Clic en notificación:', event.notification);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  let urlToOpen = '/dashboard';
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: urlToOpen
          });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});