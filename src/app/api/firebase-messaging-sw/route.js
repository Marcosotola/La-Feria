// src/app/api/firebase-messaging-sw/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  const swCode = `
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
  authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje recibido en segundo plano:', payload);
  
  const notificationTitle = payload.notification?.title || 'La Feria';
  const notificationOptions = {
    body: payload.notification?.body || 'Nueva notificación disponible',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'la-feria-notification',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Ver'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Abrir o enfocar la aplicación
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
`;

  return new NextResponse(swCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}