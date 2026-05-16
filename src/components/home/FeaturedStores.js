'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { getPricing } from '@/lib/services/pricingService';
import { Store, Star, Loader2, X, CreditCard, Check, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const DIAS_OPCIONES = [
  { dias: 3, key: 'dias3' },
  { dias: 5, key: 'dias5' },
  { dias: 7, key: 'dias7' },
];

export default function FeaturedStores() {
  const { user, userData } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [diasSeleccionados, setDiasSeleccionados] = useState(7);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    cargarTiendasDestacadas();
    getPricing().then(p => setPricing(p));
  }, []);

  const cargarTiendasDestacadas = async () => {
    try {
      const now = new Date();
      const snapshot = await getDocs(
        query(
          collection(db, 'users'),
          where('featured', '==', true),
          where('accountStatus', 'in', ['approved', 'true'])
        )
      );
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u =>
          u.storeSlug &&
          u.featuredUntil &&
          (u.featuredUntil.toDate ? u.featuredUntil.toDate() : new Date(u.featuredUntil)) > now
        );
      setStores(data);
    } catch (error) {
      console.error('Error cargando tiendas destacadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async () => {
    if (!user || !userData) return;
    setPaying(true);
    try {
      const priceKey = `dias${diasSeleccionados}`;
      const amount = pricing?.tiendaDestacada?.[priceKey] ?? 1200;

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'store',
          storeId: user.uid,
          storeName: userData.businessName || 'Mi Tienda',
          userId: user.uid,
          userName: userData.businessName || user.displayName || '',
          payerEmail: user.email,
          amount,
          featuredDays: diasSeleccionados,
        }),
      });
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (error) {
      console.error('Error iniciando pago:', error);
    } finally {
      setPaying(false);
    }
  };

  const canFeature = user && userData?.accountStatus === 'approved';

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-2">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tiendas Destacadas</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Las mejores tiendas de la feria</p>
          </div>
        </div>
        {canFeature && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
          >
            <Star className="w-3.5 h-3.5" /> Destacar mi tienda
          </button>
        )}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-40 bg-white dark:bg-gray-800 rounded-xl animate-pulse border border-gray-200 dark:border-gray-700">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-2xl p-6 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tu tienda puede aparecer aquí</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Destacá tu tienda por 3, 5 o 7 días y llegá a más clientes.</p>
          {canFeature && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all shadow-md"
            >
              Destacar ahora
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {stores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
          {/* CTA al final del carrusel */}
          {canFeature && (
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 w-36 snap-start flex flex-col items-center justify-center gap-2 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-xl p-4 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
            >
              <Star className="w-6 h-6" />
              <span className="text-xs font-medium text-center leading-tight">Destacar mi tienda</span>
            </button>
          )}
        </div>
      )}

      {/* Modal de featuring */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-5 rounded-t-2xl text-white">
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-6 h-6 fill-white" />
                <h2 className="text-lg font-bold">Destacar mi tienda</h2>
              </div>
              <p className="text-yellow-100 text-xs">Aparecé en la sección principal del home</p>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Elegí cuántos días querés que tu tienda aparezca destacada en el home de La Feria:
              </p>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {DIAS_OPCIONES.map(({ dias, key }) => {
                  const precio = pricing?.tiendaDestacada?.[key] ?? '--';
                  const seleccionado = diasSeleccionados === dias;
                  return (
                    <button
                      key={dias}
                      onClick={() => setDiasSeleccionados(dias)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                        seleccionado
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                      }`}
                    >
                      <span className={`text-lg font-black ${seleccionado ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {dias}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">días</span>
                      <span className={`text-xs font-bold mt-1 ${seleccionado ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'}`}>
                        ${typeof precio === 'number' ? precio.toLocaleString('es-AR') : precio}
                      </span>
                    </button>
                  );
                })}
              </div>

              <ul className="space-y-1.5 mb-5 text-xs text-gray-500 dark:text-gray-400">
                {[
                  'Tu tienda aparece en la sección "Tiendas Destacadas" del home',
                  'Badge especial de DESTACADA en el listado',
                  'Mayor visibilidad frente a potenciales clientes',
                ].map(b => (
                  <li key={b} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>

              <button
                onClick={handlePagar}
                disabled={paying || !pricing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50"
              >
                {paying ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Pagar con MercadoPago</>
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StoreCard({ store }) {
  const nombre = store.businessName || 'Tienda';
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/tienda/${store.storeSlug}`}
      className="flex-shrink-0 w-36 snap-start bg-white dark:bg-gray-800 rounded-xl border-2 border-yellow-300 dark:border-yellow-600 overflow-hidden hover:shadow-lg hover:border-orange-400 transition-all group"
    >
      {/* Badge */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 flex items-center gap-1">
        <Star className="w-2.5 h-2.5 text-white fill-white" />
        <span className="text-white text-[9px] font-bold uppercase tracking-wide">Destacada</span>
      </div>

      {/* Logo */}
      <div className="aspect-square bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 flex items-center justify-center p-3">
        {store.storeLogo && !imageError ? (
          <img
            src={store.storeLogo}
            alt={nombre}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <Store className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform" />
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {nombre}
        </p>
        {store.slogan && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">{store.slogan}</p>
        )}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-orange-600 dark:text-orange-400 font-medium">
          Ver tienda <ExternalLink className="w-2.5 h-2.5" />
        </div>
      </div>
    </Link>
  );
}
