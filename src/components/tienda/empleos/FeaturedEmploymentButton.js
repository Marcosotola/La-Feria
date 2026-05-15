// src/components/tienda/empleos/FeaturedEmploymentButton.js
'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, Clock, CheckCircle2, ArrowRight, Mail, ChevronLeft } from 'lucide-react';
import { getPricing } from '@/lib/services/pricingService';
import { useAuth } from '@/contexts/AuthContext';

const TIERS = [
  { days: 3, key: 'dias3', label: '3 días', badge: '' },
  { days: 5, key: 'dias5', label: '5 días', badge: 'Popular' },
  { days: 7, key: 'dias7', label: '7 días', badge: 'Mejor valor' },
];

// Calcula días restantes de destaque
function daysRemaining(featuredUntil) {
  const until = new Date(featuredUntil.toDate?.() || featuredUntil);
  return Math.max(0, Math.ceil((until - new Date()) / 864e5));
}

export default function FeaturedEmploymentButton({
  empleo,
  publicacion,
  variant = 'default',
}) {
  const { user } = useAuth();
  const item = empleo || publicacion;

  const [step, setStep] = useState('tiers'); // 'tiers' | 'confirm'
  const [selectedTier, setSelectedTier] = useState(null);
  const [payerEmail, setPayerEmail] = useState('');
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFeatured =
    item?.featured &&
    item?.featuredUntil &&
    new Date(item.featuredUntil.toDate?.() || item.featuredUntil) > new Date();

  // Pre-cargar precios y email del usuario
  useEffect(() => {
    getPricing().then(p => setPrices(p.empleos));
    if (user?.email) setPayerEmail(user.email);
  }, [user]);

  // ── Compact variant ──────────────────────────────────────────────────────
  if (variant === 'compact') {
    if (isFeatured) {
      const d = daysRemaining(item.featuredUntil);
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <CheckCircle2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
            {d}d restantes
          </span>
        </div>
      );
    }
    return (
      <button
        onClick={() => {}}
        disabled={!user}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star className="w-4 h-4" />
        <span>Destacar</span>
      </button>
    );
  }

  // ── Estado ya destacado ──────────────────────────────────────────────────
  if (isFeatured) {
    const d = daysRemaining(item.featuredUntil);
    return (
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <Star className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-100">¡Publicación Destacada!</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Visible en la página principal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200 bg-white/50 dark:bg-black/20 px-3 py-2 rounded-lg">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{d} {d === 1 ? 'día restante' : 'días restantes'}</span>
        </div>
      </div>
    );
  }

  // ── Flujo de pago: paso 1 (selección de tier) ────────────────────────────
  const handleConfirmTier = () => {
    if (!selectedTier) return;
    setStep('confirm');
    setError('');
  };

  // ── Flujo de pago: paso 2 (confirmar y redirigir a MP) ───────────────────
  const handlePay = async () => {
    if (!item?.id || !user?.uid) return;
    if (!payerEmail.trim() || !payerEmail.includes('@')) {
      setError('Ingresá un email válido de MercadoPago');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const price = prices?.[selectedTier.key] ?? 0;
      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employmentId: item.id,
          userId: user.uid,
          userName: user.displayName || user.email,
          employmentTitle: item.titulo || 'Empleo',
          amount: price,
          featuredDays: selectedTier.days,
          payerEmail: payerEmail.trim(),
          type: 'employment',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear preferencia');
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió la URL de pago');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ── Render paso 1: selección de tier ────────────────────────────────────
  if (step === 'tiers') {
    return (
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Elegí cuántos días destacar</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tu publicación aparecerá en la sección destacada del inicio.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {TIERS.map(tier => {
            const price = prices?.[tier.key];
            const isSelected = selectedTier?.days === tier.days;
            return (
              <button
                key={tier.days}
                onClick={() => setSelectedTier(tier)}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-yellow-300'
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                    {tier.badge}
                  </span>
                )}
                <Star className={`w-5 h-5 mb-2 ${isSelected ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                <span className="font-black text-gray-900 dark:text-white text-sm">{tier.label}</span>
                {prices ? (
                  <span className="text-xs font-bold text-orange-500 mt-1">
                    ${price?.toLocaleString('es-AR')}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 mt-1">Cargando...</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirmTier}
          disabled={!selectedTier || !prices}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          El pago se procesa de forma segura a través de MercadoPago
        </p>
      </div>
    );
  }

  // ── Render paso 2: confirmar email y pagar ───────────────────────────────
  return (
    <div className="space-y-4">
      <button
        onClick={() => { setStep('tiers'); setError(''); }}
        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Cambiar plan
      </button>

      {/* Resumen del plan elegido */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-gray-900 dark:text-white">
              Destacar por {selectedTier.label}
            </span>
          </div>
          <span className="text-lg font-black text-orange-500">
            ${(prices?.[selectedTier.key] ?? 0).toLocaleString('es-AR')} ARS
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          "{item?.titulo}"
        </p>
      </div>

      {/* Email de MercadoPago */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Email de MercadoPago
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Podés usar un email diferente al de tu cuenta si lo necesitás.
        </p>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={payerEmail}
            onChange={e => { setPayerEmail(e.target.value); setError(''); }}
            placeholder="tu@email.com"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none transition-all"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        onClick={handlePay}
        disabled={loading || !payerEmail.trim()}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Redirigiendo...
          </>
        ) : (
          <>
            <Star className="w-5 h-5" />
            Ir a MercadoPago
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        El pago se procesa de forma segura a través de MercadoPago
      </p>
    </div>
  );
}
