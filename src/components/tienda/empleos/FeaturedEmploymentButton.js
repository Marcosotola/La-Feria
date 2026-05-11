// src/components/tienda/empleos/FeaturedEmploymentButton.js
'use client';

import { useState } from 'react';
import { Star, Loader2, Clock, CheckCircle2 } from 'lucide-react';

export default function FeaturedEmploymentButton({ 
  empleo,
  publicacion, // Aceptar también publicacion
  variant = 'default',
  user
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState(1000);

  // Usar empleo o publicacion (son lo mismo, diferentes nombres)
  const item = empleo || publicacion;

  // Verificar si el empleo está destacado y activo
  const isFeatured = item?.featured && 
                     item?.featuredUntil && 
                     new Date(item.featuredUntil.toDate?.() || item.featuredUntil) > new Date();

  // Calcular días restantes
  const getDaysRemaining = () => {
    if (!isFeatured) return 0;
    
    const until = new Date(item.featuredUntil.toDate?.() || item.featuredUntil);
    const now = new Date();
    const diff = until - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleFeature = async () => {
    try {
      setLoading(true);
      setError('');

      // Validar que tengamos un item
      if (!item?.id) {
        setError('Error: No se encontró el empleo');
        setLoading(false);
        return;
      }

      // Validar que el usuario esté logueado
      if (!user?.uid) {
        setError('Debes iniciar sesión para destacar publicaciones');
        setLoading(false);
        return;
      }

      // Validar monto mínimo
      if (amount < 100) {
        setError('El monto mínimo es $100');
        setLoading(false);
        return;
      }

      const preferenceData = {
        employmentId: item.id,
        userId: user.uid,
        userName: user.displayName || user.email || 'Usuario',
        employmentTitle: item.titulo || 'Empleo',
        amount: parseFloat(amount),
        type: 'employment'
      };

      console.log('📤 Sending preference data:', preferenceData);

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferenceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear preferencia de pago');
      }

      console.log('✅ Preference created:', data.preferenceId);
      console.log('🔗 Redirecting to:', data.init_point);

      // Redirigir directamente a MercadoPago
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió la URL de pago de MercadoPago');
      }

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  // Si ya está destacado
  if (isFeatured) {
    const daysLeft = getDaysRemaining();
    
    if (variant === 'compact') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <CheckCircle2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
            {daysLeft}d restantes
          </span>
        </div>
      );
    }

    return (
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <Star className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-100">
              ¡Empleo Destacado!
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Visible en la página principal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200 bg-white/50 dark:bg-black/20 px-3 py-2 rounded-lg">
          <Clock className="w-4 h-4" />
          <span className="font-medium">
            {daysLeft} {daysLeft === 1 ? 'día restante' : 'días restantes'}
          </span>
        </div>
      </div>
    );
  }

  // Botón para destacar
  if (variant === 'compact') {
    return (
      <button
        onClick={handleFeature}
        disabled={loading || !user}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Star className="w-4 h-4" />
        )}
        <span>{loading ? 'Procesando...' : 'Destacar'}</span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-yellow-200 dark:border-yellow-700">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex-shrink-0">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              Destaca tu empleo
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Aparece en la sección destacada del inicio durante 7 días
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Mayor visibilidad en la página principal</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Más postulantes o contactos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Destacado durante 7 días completos</span>
          </div>
        </div>

        {/* Input de monto voluntario */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contribución voluntaria (mínimo $100)
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
              $
            </span>
            <input
              type="number"
              min="100"
              step="100"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 100)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="1000"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sugerencia: $1000 - Ayuda a mantener La Feria funcionando
          </p>
        </div>

        <button
          onClick={handleFeature}
          disabled={loading || !user || amount < 100}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <Star className="w-5 h-5" />
              <span>Destacar Ahora</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!user && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Debes iniciar sesión para destacar publicaciones
          </p>
        </div>
      )}

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        El pago se procesa de forma segura a través de MercadoPago
      </p>
    </div>
  );
}