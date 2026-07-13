'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import {
  CreditCard, Calendar, Star, AlertCircle, Loader2, CheckCircle2,
  XCircle, Package, Wrench, Briefcase, Store, X
} from 'lucide-react';

const TIPO_META = {
  store: { label: 'Tienda', icon: Store },
  producto: { label: 'Producto', icon: Package },
  servicio: { label: 'Servicio', icon: Wrench },
  empleo: { label: 'Empleo', icon: Briefcase },
  store_featured: { label: 'Tienda destacada', icon: Store },
  product_featured: { label: 'Producto destacado', icon: Package },
  service_featured: { label: 'Servicio destacado', icon: Wrench },
  employment_featured: { label: 'Empleo destacado', icon: Briefcase },
};

function toDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  return new Date(value);
}

function formatDate(value) {
  const date = toDate(value);
  if (!date || isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SuscripcionPage() {
  const { user, userData, loading: authLoading, refreshUserData } = useAuth();
  const router = useRouter();

  const [loadingData, setLoadingData] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [featuredHistory, setFeaturedHistory] = useState([]);
  const [activeFeatured, setActiveFeatured] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelDone, setCancelDone] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.uid) loadData();
  }, [user?.uid]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [subPaymentsSnap, featuredPaymentsSnap, productosSnap, serviciosSnap, empleosSnap] = await Promise.all([
        getDocs(query(collection(db, 'subscription_payments'), where('userId', '==', user.uid), orderBy('paymentDate', 'desc'), limit(12))),
        getDocs(query(collection(db, 'featured_payments'), where('userId', '==', user.uid), orderBy('fechaCreacion', 'desc'), limit(12))),
        getDocs(query(collection(db, 'productos'), where('usuarioId', '==', user.uid), where('featured', '==', true))),
        getDocs(query(collection(db, 'servicios'), where('usuarioId', '==', user.uid), where('featured', '==', true))),
        getDocs(query(collection(db, 'empleos'), where('usuarioId', '==', user.uid), where('featured', '==', true))),
      ]);

      setPaymentHistory(subPaymentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setFeaturedHistory(featuredPaymentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const now = new Date();
      const active = [];

      const storeUntil = toDate(userData?.featuredUntil);
      if (userData?.featured && storeUntil && storeUntil > now) {
        active.push({ tipo: 'store', label: userData.businessName || 'Tu tienda', until: storeUntil });
      }

      const collectItems = (snap, tipo, field = 'titulo') => {
        snap.docs.forEach(d => {
          const data = d.data();
          const until = toDate(data.featuredUntil);
          if (until && until > now) {
            active.push({ tipo, label: data[field] || data.nombre || 'Sin nombre', until });
          }
        });
      };
      collectItems(productosSnap, 'producto');
      collectItems(serviciosSnap, 'servicio');
      collectItems(empleosSnap, 'empleo');

      active.sort((a, b) => a.until - b.until);
      setActiveFeatured(active);
    } catch (error) {
      console.error('Error cargando datos de suscripción:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCancel = async () => {
    if (!user?.uid) return;
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch('/api/mercadopago/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cancelar la suscripción');
      await refreshUserData();
      setCancelDone(true);
    } catch (error) {
      setCancelError(error.message);
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-brand-teal-500" />
      </div>
    );
  }

  if (!user || !userData) return null;

  const isApproved = userData.accountStatus === 'approved' || userData.accountStatus === 'true';
  const subscription = userData.subscription || {};
  const isActiveSub = isApproved && subscription.isActive;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Suscripción</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Acá ves el estado de tu suscripción de tienda y de tus destacados, con sus fechas.
          </p>
        </div>

        {/* Estado de la suscripción */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-brand-teal-600" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tu suscripción de tienda</h2>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide px-3 py-1 rounded-full ${
              isActiveSub
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {isActiveSub ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {isActiveSub ? 'Activa' : 'Sin suscripción activa'}
            </span>
          </div>

          {isActiveSub ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Monto</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${(subscription.amount || 0).toLocaleString('es-AR')} {subscription.currency || 'ARS'} /mes
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Renovación automática</p>
                  <p className="font-bold text-gray-900 dark:text-white">{subscription.autoRenewal ? 'Sí' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Inicio</p>
                  <p className="font-bold text-gray-900 dark:text-white">{formatDate(subscription.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Próxima facturación</p>
                  <p className="font-bold text-gray-900 dark:text-white">{formatDate(subscription.expiresAt)}</p>
                </div>
              </div>

              <button
                onClick={() => { setShowCancelModal(true); setCancelDone(false); setCancelError(''); }}
                className="text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
              >
                Cancelar suscripción
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tenés una suscripción activa en este momento. Podés suscribirte desde el panel de tu tienda.
            </p>
          )}
        </div>

        {/* Destacados activos */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Destacados activos</h2>
          </div>
          {activeFeatured.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No tenés nada destacado activo en este momento.</p>
          ) : (
            <ul className="space-y-2.5">
              {activeFeatured.map((item, i) => {
                const Icon = TIPO_META[item.tipo]?.icon || Star;
                return (
                  <li key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{TIPO_META[item.tipo]?.label}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">hasta {formatDate(item.until)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Historial de pagos de suscripción */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Historial de pagos — Suscripción</h2>
          </div>
          {paymentHistory.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no hay pagos registrados.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {paymentHistory.map(p => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{formatDate(p.paymentDate)}</span>
                  <span className="font-bold text-gray-900 dark:text-white">${(p.amount || 0).toLocaleString('es-AR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Historial de destacados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Star className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Historial de pagos — Destacados</h2>
          </div>
          {featuredHistory.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no destacaste nada.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {featuredHistory.map(p => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm gap-3">
                  <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 truncate">{formatDate(p.fechaCreacion)} · {p.itemType || 'item'}</p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white flex-shrink-0">${(p.amount || 0).toLocaleString('es-AR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !cancelling && setShowCancelModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <button
              onClick={() => setShowCancelModal(false)}
              disabled={cancelling}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              {cancelDone ? (
                <>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Suscripción cancelada</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Tu tienda dejó de estar visible al público. Podés volver a suscribirte cuando quieras desde el panel de tu tienda.
                  </p>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¿Cancelar tu suscripción?</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Tu tienda dejará de estar visible al público apenas se procese la cancelación. Podés volver a suscribirte cuando quieras.
                  </p>
                  {cancelError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{cancelError}</p>
                  )}
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                    >
                      {cancelling ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Cancelando...</>
                      ) : (
                        'Sí, cancelar suscripción'
                      )}
                    </button>
                    <button
                      onClick={() => setShowCancelModal(false)}
                      disabled={cancelling}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      No, mantener mi suscripción
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
