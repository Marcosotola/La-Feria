'use client';

import { useState, useEffect } from 'react';
import { Store, Loader, Check, AlertCircle, Sparkles, X, CreditCard, MapPin, ShoppingBag, Star } from 'lucide-react';
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

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setShouldShow(false);
        setCheckingUser(false);
        return;
      }
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          setShouldShow(userSnap.data().accountStatus === 'pending');
        } else {
          setShouldShow(false);
        }
      } catch {
        setShouldShow(false);
      } finally {
        setCheckingUser(false);
      }
    };
    checkUserStatus();
  }, [user]);

  const handleActivateStore = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/mercadopago/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.displayName || '',
          userEmail: user.email,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear suscripción');
      }
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la suscripción');
      setLoading(false);
    }
  };

  if (checkingUser || !shouldShow) return null;

  return (
    <>
      <div className="flex justify-center px-4">
        <div className="w-full max-w-2xl bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-px">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold text-gray-900 dark:text-white text-base">
                Tu tienda está lista para publicar
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Activá tu suscripción mensual y aparecé en todas las ferias y buscadores de La Feria.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className={`flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg ${className}`}
            >
              <Store className="w-4 h-4" />
              Publicar mi tienda
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {error && !showModal && (
        <div className="mt-3 mx-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white rounded-t-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3 mb-2">
                <Store className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Publicá tu Tienda</h2>
              </div>
              <p className="text-orange-100 text-sm">
                Formá parte de La Feria y llega a más clientes
              </p>
            </div>

            <div className="p-6">
              {/* Precio */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-5 mb-6 text-center">
                <div className="flex items-baseline justify-center mb-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$2.000</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">ARS / mes</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Renovación automática · Cancelá cuando quieras</p>
              </div>

              {/* Beneficios */}
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" /> Lo que incluye
              </h3>
              <ul className="space-y-3 mb-6">
                {[
                  { icon: MapPin, title: 'Presencia en ferias y mapa', desc: 'Aparecés en todas las ferias que tengas asociadas' },
                  { icon: ShoppingBag, title: 'Publicaciones ilimitadas', desc: 'Productos, servicios y empleos sin límite' },
                  { icon: Star, title: 'Podés destacar tu tienda', desc: 'Mayor visibilidad durante 3, 5 o 7 días' },
                  { icon: Store, title: 'Tienda pública personalizada', desc: 'Con tu URL, logo, colores y diseño único' },
                  { icon: Check, title: 'Acceso a todos los buscadores', desc: 'Te encontramos en búsquedas de productos, servicios y tiendas' },
                ].map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>💡</strong> Cancelás cuando querés desde tu panel de MercadoPago. Sin permanencia.
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleActivateStore}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader className="w-5 h-5 animate-spin" /><span>Procesando...</span></>
                  ) : (
                    <><CreditCard className="w-5 h-5" /><span>Suscribirme por $2.000/mes</span></>
                  )}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Ahora no
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
