// src/lib/services/notificationService.js - Versión mejorada
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    this.isInitialized = false;
  }

  // Verificar si las notificaciones son compatibles
  async isSupported() {
    try {
      return typeof window !== 'undefined' && await isSupported();
    } catch (error) {
      console.warn('Error verificando soporte de notificaciones:', error);
      return false;
    }
  }

  // Inicializar Firebase Messaging
  async initialize() {
    try {
      if (typeof window === 'undefined') {
        console.log('Messaging solo funciona en el cliente');
        return false;
      }

      // Verificar si messaging es compatible
      const supported = await this.isSupported();
      if (!supported) {
        console.log('Firebase Messaging no es compatible en este navegador');
        return false;
      }

      this.messaging = getMessaging(app);
      this.isInitialized = true;
      console.log('✅ Firebase Messaging inicializado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al inicializar Firebase Messaging:', error);
      return false;
    }
  }

  // Solicitar permisos de notificación
  async requestPermission() {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      // Verificar si ya tenemos permisos
      if (Notification.permission === 'granted') {
        return await this.getToken();
      }

      // Solicitar permisos
      const permission = await Notification.requestPermission();
      console.log('🔔 Permisos de notificación:', permission);
      
      if (permission === 'granted') {
        console.log('✅ Permisos de notificación concedidos');
        return await this.getToken();
      } else {
        console.log('❌ Permisos de notificación denegados');
        return null;
      }
    } catch (error) {
      console.error('❌ Error al solicitar permisos:', error);
      return null;
    }
  }

  // Obtener token FCM
  async getToken() {
    try {
      if (!this.messaging) {
        console.warn('⚠️ Messaging no inicializado');
        return null;
      }

      if (!this.vapidKey) {
        console.error('❌ VAPID Key no configurada');
        return null;
      }

      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Workers no soportados en este navegador');
        return null;
      }

      // Registrar el SW y esperar a que esté ACTIVO antes de pasárselo a Firebase.
      // pushManager.subscribe() falla si el SW no está en estado 'activated'.
      let swRegistration;
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
        // navigator.serviceWorker.ready resuelve cuando hay un SW activo para esta página
        swRegistration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SW activation timeout')), 12000)
          )
        ]);
      } catch (swError) {
        console.warn('⚠️ No se pudo activar el Service Worker:', swError.message);
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
        serviceWorkerRegistration: swRegistration
      });

      if (token) {
        console.log('🔑 Token FCM obtenido exitosamente');
        return token;
      }

      console.warn('⚠️ No se pudo obtener el token FCM');
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo token FCM:', error);
      return null;
    }
  }

  // Actualizar token en Firestore
  async updateUserToken(userId, token) {
    try {
      if (!userId || !token) {
        console.warn('⚠️ userId o token faltante para actualizar');
        return false;
      }

      await updateDoc(doc(db, 'users', userId), {
        notificationToken: token,
        lastTokenUpdate: new Date(),
        notificationPermissionGrantedAt: new Date()
      });

      console.log('✅ Token actualizado en Firestore');
      return true;
    } catch (error) {
      console.error('❌ Error actualizando token en Firestore:', error);
      return false;
    }
  }

  // Escuchar mensajes en primer plano (retorna unsubscribe function)
  onMessageListener(callback) {
    if (!this.messaging) {
      console.warn('⚠️ Messaging no inicializado para listener');
      return null;
    }

    return onMessage(this.messaging, (payload) => {
      console.log('📨 Mensaje recibido en primer plano:', payload);
      if (callback) {
        callback(payload);
      }
    });
  }

  // Mostrar notificación local
  async showLocalNotification(title, body, options = {}) {
    try {
      if (Notification.permission !== 'granted') {
        console.warn('⚠️ Permisos de notificación no concedidos');
        return null;
      }

      const notificationOptions = {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'family-market-notification',
        requireInteraction: false,
        vibrate: [200, 100, 200],
        ...options
      };

      const notification = new Notification(title, notificationOptions);

      // Configurar eventos
      notification.onclick = () => {
        console.log('👆 Clic en notificación local');
        if (options.data?.url) {
          window.focus();
          window.location.href = options.data.url;
        }
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('❌ Error mostrando notificación local:', error);
      return null;
    }
  }

  // Configurar listener para mensajes (para usar en componentes)
  setupMessageListener(callback) {
    if (!this.messaging) {
      console.warn('⚠️ Messaging no inicializado para listener');
      return null;
    }

    const unsubscribe = onMessage(this.messaging, (payload) => {
      console.log('📨 Mensaje recibido:', payload);
      
      // Mostrar notificación local si la app está en primer plano
      this.showLocalNotification(
        payload.notification?.title || 'Nueva notificación',
        payload.notification?.body || 'Tienes una nueva notificación',
        {
          data: payload.data,
          icon: payload.notification?.icon,
          tag: 'foreground-message'
        }
      );

      // Ejecutar callback personalizado
      if (callback) {
        callback(payload);
      }
    });

    return unsubscribe;
  }

  // Revocar token (para cerrar sesión)
  async revokeToken(userId) {
    try {
      if (userId) {
        await updateDoc(doc(db, 'users', userId), {
          notificationToken: null,
          lastTokenUpdate: new Date()
        });
        console.log('🗑️ Token revocado del usuario');
      }
      return true;
    } catch (error) {
      console.error('❌ Error revocando token:', error);
      return false;
    }
  }

  // Obtener estado de permisos
  getPermissionState() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Verificar si el usuario puede recibir notificaciones
  canReceiveNotifications() {
    return this.getPermissionState() === 'granted' && this.isInitialized;
  }
}

// Exportar instancia singleton
const notificationService = new NotificationService();
export default notificationService;