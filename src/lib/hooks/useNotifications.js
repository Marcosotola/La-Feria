// src/lib/hooks/useNotifications.js
'use client';

import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

export function useNotifications() {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeMessages = null;

    const initializeNotifications = async () => {
      setIsLoading(true);

      // isSupported() es async — hay que esperarla
      const supported = await notificationService.isSupported();
      setIsSupported(supported);

      if (!supported) {
        setIsLoading(false);
        return;
      }

      if ('Notification' in window) {
        setPermission(Notification.permission);
      }

      if (Notification.permission === 'granted') {
        const initialized = await notificationService.initialize();

        if (!initialized) {
          setIsLoading(false);
          return;
        }

        try {
          const currentToken = await notificationService.getToken();
          setToken(currentToken);
        } catch (error) {
          console.warn('Error obteniendo token existente:', error);
        }

        // onMessageListener devuelve unsubscribe (no es una Promise)
        unsubscribeMessages = notificationService.onMessageListener((payload) => {
          notificationService.showLocalNotification(
            payload.notification?.title || 'Nueva notificación',
            payload.notification?.body || '',
            { data: payload.data }
          );
        });
      }

      setIsLoading(false);
    };

    initializeNotifications();

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, []);

  // Solicitar permisos
  const requestPermission = async () => {
    if (!isSupported) {
      alert('Tu navegador no soporta notificaciones push');
      return false;
    }

    setIsLoading(true);
    const newToken = await notificationService.requestPermission();
    
    if (newToken) {
      setToken(newToken);
      setPermission('granted');
      setIsLoading(false);
      return true;
    } else {
      setPermission('denied');
      setIsLoading(false);
      return false;
    }
  };

  // Mostrar notificación local
  const showNotification = async (title, body, options = {}) => {
    if (permission !== 'granted') {
      console.warn('Permisos de notificación no concedidos');
      return null;
    }

    return await notificationService.showLocalNotification(title, body, options);
  };

  return {
    token,
    permission,
    isSupported,
    isLoading,
    requestPermission,
    showNotification
  };
}