// src/components/tienda/servicios/FeaturedServiceButton.js
'use client';

import { useState, useEffect } from 'react';
import { Star, CreditCard, Loader, X, ChevronLeft, Mail } from 'lucide-react';
import { getPricing } from '@/lib/services/pricingService';

const TIERS = [
  { days: 3, key: 'dias3', label: '3 días', badge: '' },
  { days: 5, key: 'dias5', label: '5 días', badge: 'Popular' },
  { days: 7, key: 'dias7', label: '7 días', badge: 'Mejor valor' },
];

export default function FeaturedServiceButton({
  service,
  user,
  onSuccess,
  onClose
}) {
  const [step, setStep] = useState('tiers'); // 'tiers' | 'confirm'
  const [selectedTier, setSelectedTier] = useState(null);
  const [payerEmail, setPayerEmail] = useState('');
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPricing().then(p => setPrices(p.servicios));
    if (user?.email) setPayerEmail(user.email);
  }, [user]);

  const isAlreadyFeatured = () => {
    if (!service.featured) return false;
    if (!service.featuredUntil) return false;

    const now = new Date();
    const featuredUntil = service.featuredUntil.toDate ?
      service.featuredUntil.toDate() :
      new Date(service.featuredUntil);

    return now < featuredUntil;
  };

  const getRemainingDays = () => {
    if (!isAlreadyFeatured()) return 0;

    const now = new Date();
    const featuredUntil = service.featuredUntil.toDate ?
      service.featuredUntil.toDate() :
      new Date(service.featuredUntil);

    const diffTime = featuredUntil - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const handleConfirmTier = () => {
    if (!selectedTier) return;
    setStep('confirm');
    setError('');
  };

  const handlePayment = async () => {
    if (!user) {
      setError('Debes iniciar sesión para destacar servicios');
      return;
    }
    if (!payerEmail.trim() || !payerEmail.includes('@')) {
      setError('Ingresá un email válido de MercadoPago');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const price = prices?.[selectedTier.key] ?? 0;

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          userId: user.uid,
          userName: user.displayName || user.email,
          serviceName: service.titulo,
          amount: price,
          featuredDays: selectedTier.days,
          payerEmail: payerEmail.trim(),
          type: 'service'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.init_point) {
        window.open(data.init_point, '_blank');
        if (onSuccess) onSuccess();
      } else {
        throw new Error('No se recibió la URL de pago');
      }

    } catch (error) {
      setError(`Error al procesar el pago: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (isAlreadyFeatured()) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-medium text-lg">Servicio Destacado</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Este servicio está destacado por {getRemainingDays()} días más
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Aparecerá en la sección principal del home hasta que expire
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Star className="w-5 h-5 text-blue-500 mr-2" />
          Destacar Servicio
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {step === 'tiers' && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Elegí cuántos días querés que tu servicio aparezca en la sección "Servicios Destacados" del home.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {TIERS.map(tier => {
              const price = prices?.[tier.key];
              const isSelected = selectedTier?.days === tier.days;
              return (
                <button
                  key={tier.days}
                  onClick={() => setSelectedTier(tier)}
                  className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                  }`}
                >
                  {tier.badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                      {tier.badge}
                    </span>
                  )}
                  <Star className={`w-5 h-5 mb-2 ${isSelected ? 'text-blue-500 fill-blue-500' : 'text-gray-400'}`} />
                  <span className="font-black text-gray-900 dark:text-white text-sm">{tier.label}</span>
                  {prices ? (
                    <span className="text-xs font-bold text-blue-500 mt-1">
                      ${price?.toLocaleString('es-AR')}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 mt-1">Cargando...</span>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={handleConfirmTier}
            disabled={!selectedTier || !prices}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <span>Continuar</span>
          </button>
        </>
      )}

      {step === 'confirm' && (
        <>
          <button
            onClick={() => { setStep('tiers'); setError(''); }}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Cambiar plan
          </button>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500 fill-blue-500" />
                <span className="font-bold text-gray-900 dark:text-white">
                  Destacar por {selectedTier.label}
                </span>
              </div>
              <span className="text-lg font-black text-blue-500">
                ${(prices?.[selectedTier.key] ?? 0).toLocaleString('es-AR')} ARS
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              "{service.titulo}"
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email de MercadoPago
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={payerEmail}
                onChange={e => { setPayerEmail(e.target.value); setError(''); }}
                placeholder="tu@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Destacar con MercadoPago</span>
              </>
            )}
          </button>
        </>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
        Pago seguro procesado por MercadoPago
      </p>
    </div>
  );
}
