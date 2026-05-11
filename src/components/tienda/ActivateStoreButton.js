// src/components/tienda/ActivateStoreButton.js
'use client';

import { useState, useEffect } from 'react';
import { Store, Loader, Check, AlertCircle, Sparkles, X, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function ActivateStoreButton({ className = '' }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  // Verificar si el usuario debe ver el botón
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setShouldShow(false);
        setCheckingUser(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Solo mostrar si el usuario está en estado "pending"
          const isPending = userData.accountStatus === 'pending';
          setShouldShow(isPending);
        } else {
          setShouldShow(false);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setShouldShow(false);
      } finally {
        setCheckingUser(false);
      }
    };

    checkUserStatus();
  }, [user]);

  const handleOpenModal = () => {
    if (!user) {
      setError('Debes iniciar sesión para activar tu tienda');
      return;
    }
    setShowModal(true);
  };

  const handleActivateStore = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mercadopago/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', data);
        
        if (data.needsActivation) {
          throw new Error(
            `${data.error}\n\n${data.hint || 'Contacta al administrador para activar las suscripciones.'}`
          );
        }
        
        throw new Error(data.error || 'Error al crear suscripción');
      }

      // Redirigir a MercadoPago
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(err.message || 'Error al procesar la suscripción');
      setLoading(false);
    }
  };

  // No mostrar nada si está checkeando o no debe mostrarse
  if (checkingUser || !shouldShow) {
    return null;
  }

  return (
    <>
      {/* Botón compacto - CENTRADO */}
      <div className="flex justify-center">
        <button
          onClick={handleOpenModal}
          className={`bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 ${className}`}
        >
          <Store className="w-5 h-5" />
          <span>Activa tu Tienda Pública</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Error simple */}
      {error && !showModal && (
        <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Modal con información completa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3 mb-2">
                <Store className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Tienda Pública</h2>
              </div>
              <p className="text-orange-100 text-sm">
                Activa tu tienda profesional en La Feria
              </p>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              {/* Frase graciosa antes del precio */}
              <div className="text-center mb-4">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                  🥤 La Coca hace mal y cuesta más...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ¡Mejor invertí en tu negocio y sé más saludable! 💪
                </p>
              </div>

              {/* Precio destacado */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-6 mb-6 text-center">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$2.500</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">ARS/mes</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Menos que una salida al cine 🎬
                </p>
              </div>

              {/* Beneficios */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                  Lo que incluye
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Tienda personalizada</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Con tu dominio y diseño único</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Publicaciones ilimitadas</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Productos, servicios y empleos sin límite</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Galería y testimonios</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Muestra tu trabajo y reseñas</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Sistema de mensajería</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Comunícate con tus clientes</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Personalización total</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Colores, temas y configuración</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>💡 Nota:</strong> La suscripción se renueva automáticamente cada mes. 
                  Puedes cancelarla cuando quieras desde tu panel de MercadoPago.
                </p>
              </div>

              {/* Error en modal */}
              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Error</p>
                      <p className="text-xs text-red-600 dark:text-red-400 whitespace-pre-line">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={handleActivateStore}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Proceder al pago</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}