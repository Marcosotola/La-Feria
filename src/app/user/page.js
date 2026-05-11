// src/app/user/page.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Mail, Home, Building2, Bell, BellOff, Calendar, Shield, Globe, Smartphone } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

export default function UserProfilePage() {
  const { isAuthenticated, userData, user, loading, signOut } = useAuth();
  const [notificationToken, setNotificationToken] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [updatingNotifications, setUpdatingNotifications] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Verificar el estado actual de los permisos de notificaciones
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Intentar obtener el token si ya tiene permisos
    if (Notification.permission === 'granted') {
      getNotificationToken();
    }
  }, []);

  const getNotificationToken = async () => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        // Importar Firebase Messaging
        const { getMessaging, getToken } = await import('firebase/messaging');
        const messaging = getMessaging();

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (token) {
          setNotificationToken(token);
          // Actualizar el token en la base de datos
          if (user?.uid) {
            await updateDoc(doc(db, 'users', user.uid), {
              notificationToken: token,
              notificationTokenUpdatedAt: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Error obteniendo token de notificaciones:', error);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Este navegador no soporta notificaciones');
      return;
    }

    setUpdatingNotifications(true);

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        await getNotificationToken();

        // Actualizar preferencia en base de datos
        if (user?.uid) {
          await updateDoc(doc(db, 'users', user.uid), {
            acceptNotifications: true,
            notificationPermissionGrantedAt: new Date()
          });
        }

        alert('¡Notificaciones habilitadas! Ahora recibirás notificaciones push.');
      } else {
        alert('Permisos de notificación denegados');
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      alert('Error al solicitar permisos de notificación');
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const disableNotifications = async () => {
    setUpdatingNotifications(true);

    try {
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          acceptNotifications: false,
          notificationToken: null,
          notificationDisabledAt: new Date()
        });

        setNotificationToken(null);
        alert('Notificaciones deshabilitadas correctamente');
      }
    } catch (error) {
      console.error('Error deshabilitando notificaciones:', error);
      alert('Error al deshabilitar notificaciones');
    } finally {
      setUpdatingNotifications(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 flex items-center">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="ml-6 space-y-3 flex-1">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return 'No disponible';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return status || 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {userData?.firstName} {userData?.lastName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{userData?.email}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userData?.accountStatus)}`}>
                  {getStatusText(userData?.accountStatus)}
                </span>
              </div>
            </div>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Información Personal
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{userData?.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nombre Completo</p>
                  <p className="text-gray-900 dark:text-white">{userData?.firstName} {userData?.lastName}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Home className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Familia</p>
                  <p className="text-gray-900 dark:text-white">{userData?.familyName || 'No especificado'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Shield className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rol</p>
                  <p className="text-gray-900 dark:text-white">{userData?.role || 'Usuario'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Negocio */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Mi Tienda
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nombre del Negocio</p>
                  <p className="text-gray-900 dark:text-white">{userData?.businessName || 'No especificado'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Globe className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">URL de la Tienda</p>
                  {userData?.storeUrl ? (
                    <a
                      href={`https://laferia.com${userData.storeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      laferia.com{userData.storeUrl}
                    </a>
                  ) : (
                    <p className="text-gray-500">No configurada</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <Globe className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Slug de la Tienda</p>
                  <p className="text-gray-900 dark:text-white font-mono">{userData?.storeSlug || 'No configurado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notificaciones Push
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estado de Permisos</p>
                  <p className="text-gray-900 dark:text-white capitalize">{notificationPermission}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${notificationPermission === 'granted'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                  {notificationPermission === 'granted' ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Acepta Notificaciones</p>
                <p className="text-gray-900 dark:text-white">{userData?.acceptNotifications ? 'Sí' : 'No'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Token de Notificación</p>
                <p className="text-gray-900 dark:text-white font-mono text-xs break-all">
                  {notificationToken || userData?.notificationToken || 'No disponible'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {notificationPermission !== 'granted' ? (
                  <button
                    onClick={requestNotificationPermission}
                    disabled={updatingNotifications}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {updatingNotifications ? 'Procesando...' : 'Habilitar Notificaciones'}
                  </button>
                ) : (
                  <button
                    onClick={disableNotifications}
                    disabled={updatingNotifications}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <BellOff className="w-4 h-4 mr-2" />
                    {updatingNotifications ? 'Procesando...' : 'Deshabilitar Notificaciones'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Información Técnica */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Información Técnica
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Usuario de Google</p>
                <p className="text-gray-900 dark:text-white">{userData?.isGoogleUser ? 'Sí' : 'No'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email Verificado</p>
                <p className="text-gray-900 dark:text-white">{user?.emailVerified ? 'Sí' : 'No'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Perfil Completado</p>
                <p className="text-gray-900 dark:text-white">{userData?.profileCompleted ? 'Sí' : 'No'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Registro</p>
                <p className="text-gray-900 dark:text-white">{formatDate(userData?.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                <p className="text-gray-900 dark:text-white">{formatDate(userData?.updatedAt)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">UID de Firebase</p>
                <p className="text-gray-900 dark:text-white font-mono text-xs break-all">{user?.uid}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Datos Raw (para debugging) */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Datos Completos (Debug)
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-auto">
            <pre className="text-xs text-gray-800 dark:text-gray-200">
              {JSON.stringify({
                userData, firebaseUser: {
                  uid: user?.uid,
                  email: user?.email,
                  displayName: user?.displayName,
                  emailVerified: user?.emailVerified,
                  photoURL: user?.photoURL
                }
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}