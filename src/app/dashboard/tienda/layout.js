'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import StoreNavBadges from '@/components/layout/StoreNavBadges';
import { Store, ExternalLink, AlertCircle, Loader, CreditCard } from 'lucide-react';

export default function TiendaLayout({ children }) {
  const { isAuthenticated, userData, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !userData) return null;

  const primaryColor = userData?.storeConfig?.primaryColor || '#f97316';
  const secondaryColor = userData?.storeConfig?.secondaryColor || '#ec4899';
  const isPending = userData?.accountStatus === 'pending';
  const storeSlug = userData?.storeSlug;
  const baseUrl = process.env.NEXT_PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />

      {/* Banner de suscripción para usuarios pendientes */}
      {isPending && <SubscriptionBanner user={user} />}

      {/* Header de la tienda con colores dinámicos */}
      <div
        className="transition-all duration-500"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
      >
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
                  isPending
                    ? 'bg-yellow-400/30 text-yellow-100'
                    : 'bg-green-400/30 text-green-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-yellow-300' : 'bg-green-300'}`} />
                  {isPending ? 'Sin publicar' : 'Publicada'}
                </span>
                {storeSlug && (
                  <span className="text-white/60 text-xs truncate">laferia.com/tienda/{storeSlug}</span>
                )}
              </div>
            </div>
            {storeSlug && !isPending && (
              <a
                href={`${baseUrl}/tienda/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver pública</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navegación de secciones */}
      <StoreNavBadges />

      {/* Contenido de la página */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}

function SubscriptionBanner({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mercadopago/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, userEmail: user.email }),
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
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 min-w-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">
            Tu tienda no está publicada — Configurala y luego suscribite para aparecer en La Feria.
          </span>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? (
              <><Loader className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
            ) : (
              <><CreditCard className="w-3.5 h-3.5" /> Publicar — $2.000/mes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
