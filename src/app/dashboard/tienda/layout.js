'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import StoreNavBadges from '@/components/layout/StoreNavBadges';
import { getPricing } from '@/lib/services/pricingService';
import { Store, ExternalLink, AlertCircle, Loader, CreditCard, X, Radio, EyeOff } from 'lucide-react';

export default function TiendaLayout({ children }) {
  const { isAuthenticated, userData, user, loading, refreshUserData } = useAuth();
  const router = useRouter();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [mensualPrice, setMensualPrice] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    getPricing().then(p => setMensualPrice(p.tienda.mensual));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !userData) return null;

  const handleSubscribeFromModal = async () => {
    const userEmail = user?.email || userData?.email || null;
    if (!userEmail) {
      setModalError('Tu cuenta no tiene email registrado. Agregá uno en tu perfil para continuar.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      const res = await fetch('/api/mercadopago/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, userEmail }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || 'Error al crear suscripción');
      }
    } catch (e) {
      setModalError(e.message);
      setModalLoading(false);
    }
  };

  const handlePublish = async () => {
    setModalLoading(true);
    setModalError('');
    try {
      await updateDoc(doc(db, 'users', user.uid), { storePublished: true });
      await refreshUserData();
      setShowPublishModal(false);
    } catch (e) {
      setModalError('Error al publicar la tienda. Intentá de nuevo.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { storePublished: false });
      await refreshUserData();
    } catch (e) {
      // silencioso: no es una acción crítica, el usuario puede reintentar
    }
  };

  const isPending = userData?.accountStatus !== 'approved' && userData?.accountStatus !== 'true';
  const isPublished = userData?.storePublished === true;
  const storeSlug = userData?.storeSlug;
  const baseUrl = process.env.NEXT_PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const userEmail = user?.email || userData?.email || null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />

      {/* Banner de suscripción para usuarios sin suscripción activa */}
      {isPending && <SubscriptionBanner userId={user?.uid} userEmail={userEmail} mensualPrice={mensualPrice} />}

      {/* Header de la tienda */}
      <div className="bg-brand-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white/30">
              {userData?.storeLogo ? (
                <img src={userData.storeLogo} alt="" className="w-full h-full object-contain p-1.5" />
              ) : (
                <Store className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                {userData?.businessName || 'Mi Tienda'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  isPublished
                    ? 'bg-green-400/30 text-green-100'
                    : 'bg-yellow-400/30 text-yellow-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-green-300' : 'bg-yellow-300'}`} />
                  {isPublished ? 'Publicada' : isPending ? 'Sin suscripción' : 'Borrador'}
                </span>
                {storeSlug && (
                  <span className="text-white/60 text-xs truncate">laferia.com/tienda/{storeSlug}</span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              {storeSlug && (
                <button
                  onClick={() => window.open(`${baseUrl}/tienda/${storeSlug}`, '_blank')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors"
                  title="Ver tu tienda tal como la estás armando"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver tienda</span>
                </button>
              )}
              {isPublished ? (
                <button
                  onClick={handleUnpublish}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg text-xs font-medium transition-colors"
                  title="Ocultar tu tienda del público (podés volver a publicarla cuando quieras)"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Despublicar</span>
                </button>
              ) : (
                <button
                  onClick={() => (isPending ? setShowSubscribeModal(true) : setShowPublishModal(true))}
                  className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Publicar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de secciones */}
      <StoreNavBadges />

      {/* Contenido de la página */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>

      {showSubscribeModal && (
        <PendingStoreModal
          onClose={() => { setShowSubscribeModal(false); setModalError(''); }}
          onSubscribe={handleSubscribeFromModal}
          loading={modalLoading}
          error={modalError}
          mensualPrice={mensualPrice}
        />
      )}

      {showPublishModal && (
        <ConfirmPublishModal
          onClose={() => { setShowPublishModal(false); setModalError(''); }}
          onConfirm={handlePublish}
          loading={modalLoading}
          error={modalError}
        />
      )}
    </div>
  );
}

function ConfirmPublishModal({ onClose, onConfirm, loading, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Radio className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            ¿Publicar tu tienda?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Tu tienda se va a hacer visible al público en La Feria tal como está configurada ahora. Podés despublicarla cuando quieras.
          </p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
            >
              {loading ? (
                <><Loader className="w-4 h-4 animate-spin" /> Publicando...</>
              ) : (
                <><Radio className="w-4 h-4" /> Sí, publicar ahora</>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Todavía no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingStoreModal({ onClose, onSubscribe, loading, error, mensualPrice }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Necesitás suscribirte para publicar
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Para que tu tienda pueda hacerse visible al público en La Feria primero necesitás una suscripción activa. Podés seguir configurando todos los detalles y ver tu tienda como vista previa mientras tanto.
          </p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onSubscribe}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
            >
              {loading ? (
                <><Loader className="w-4 h-4 animate-spin" /> Procesando...</>
              ) : (
                <><CreditCard className="w-4 h-4" /> Suscribirme{mensualPrice ? ` — $${mensualPrice.toLocaleString('es-AR')}/mes` : ''}</>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Seguir editando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionBanner({ userId, userEmail, mensualPrice }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!userEmail) {
      setError('Tu cuenta no tiene email registrado. Agregá uno en tu perfil.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mercadopago/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userEmail }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || 'Error al crear suscripción');
      }
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b-2 border-amber-300 dark:border-amber-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-200 min-w-0">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">No tenés una suscripción activa</p>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 truncate">Suscribite para poder publicar tu tienda al público en La Feria.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400" />
            </span>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-white text-orange-600 hover:bg-orange-50 rounded-xl transition-all shadow-md disabled:opacity-60"
            >
              {loading ? (
                <><Loader className="w-4 h-4 animate-spin" /> Procesando...</>
              ) : (
                <><CreditCard className="w-4 h-4" /> Suscribirme{mensualPrice ? ` — $${mensualPrice.toLocaleString('es-AR')}/mes` : ''}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
