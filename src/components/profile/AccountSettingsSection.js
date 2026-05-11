// src/components/profile/AccountSettingsSection.js

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { 
  Mail, 
  Lock, 
  Shield, 
  Calendar, 
  User, 
  Store, 
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Send
} from 'lucide-react';

export default function AccountSettingsSection({ showMessage }) {
  const { userData, user } = useAuth();
  const [loadingPasswordReset, setLoadingPasswordReset] = useState(false);
  const [loadingEmailVerification, setLoadingEmailVerification] = useState(false);

  // Función para enviar reset de contraseña
  const handlePasswordReset = async () => {
    if (!user?.email) {
      showMessage('error', 'No se pudo obtener el email del usuario');
      return;
    }

    setLoadingPasswordReset(true);
    
    try {
      await sendPasswordResetEmail(auth, user.email);
      showMessage('success', `Se ha enviado un enlace para restablecer tu contraseña a ${user.email}`);
    } catch (error) {
      console.error('Error al enviar reset de contraseña:', error);
      let errorMessage = 'Error al enviar el enlace de restablecimiento';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No se encontró una cuenta con este email';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Inténtalo más tarde';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet';
          break;
      }
      
      showMessage('error', errorMessage);
    } finally {
      setLoadingPasswordReset(false);
    }
  };

  // Función para reenviar verificación de email
  const handleResendVerification = async () => {
    if (!user) {
      showMessage('error', 'Usuario no autenticado');
      return;
    }

    setLoadingEmailVerification(true);

    try {
      await sendEmailVerification(user);
      showMessage('success', `Se ha enviado un nuevo enlace de verificación a ${user.email}`);
    } catch (error) {
      console.error('Error al enviar verificación:', error);
      showMessage('error', 'Error al enviar el enlace de verificación');
    } finally {
      setLoadingEmailVerification(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Información de Email (Solo lectura) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Información de Email
          </h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email de la cuenta
                  </p>
                  <p className="text-gray-900 dark:text-white break-all">
                    {userData.email || user?.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-start sm:justify-end">
                {user?.emailVerified ? (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Verificado</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">No verificado</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botón para reenviar verificación si no está verificado */}
          {!user?.emailVerified && (
            <div className="flex justify-end">
              <button
                onClick={handleResendVerification}
                disabled={loadingEmailVerification}
                className="flex items-center px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingEmailVerification ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {loadingEmailVerification ? 'Enviando...' : 'Reenviar verificación'}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Gestión de Contraseña */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestión de Contraseña
          </h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contraseña
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Última actualización: Información no disponible
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Para cambiar tu contraseña, te enviaremos un enlace seguro a tu email donde 
              podrás establecer una nueva contraseña.
            </p>

            <button
              onClick={handlePasswordReset}
              disabled={loadingPasswordReset}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingPasswordReset ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {loadingPasswordReset ? 'Enviando...' : 'Cambiar contraseña'}
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <strong>Seguridad:</strong> El enlace de restablecimiento expira en 1 hora y solo puede usarse una vez.
            Revisa también tu carpeta de spam si no recibes el email.
          </div>
        </div>
      </div>

      {/* Información de la cuenta */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Información de la Cuenta
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Miembro desde
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado de la cuenta
                </p>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    userData.accountStatus === 'approved' ? 'bg-green-500' :
                    userData.accountStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {userData.accountStatus === 'approved' ? 'Aprobada' :
                     userData.accountStatus === 'pending' ? 'Pendiente' : 'Rechazada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de usuario
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userData.role || 'Usuario estándar'}
                </p>
              </div>
            </div>

            {userData.storeSlug && (
              <div className="flex items-center space-x-3">
                <Store className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tienda online
                  </p>
                  <a
                    href={`https://laferia.com/tienda/${userData.storeSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                  >
                    Ver tienda
                    <Globe className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}