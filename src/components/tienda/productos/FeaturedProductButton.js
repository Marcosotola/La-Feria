// src/components/tienda/productos/FeaturedProductButton.js
'use client';

import { useState } from 'react';
import { Star, CreditCard, Loader, X } from 'lucide-react';

export default function FeaturedProductButton({ 
  product, 
  user, 
  onSuccess,
  onClose 
}) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(1000); // Precio por defecto: $1000
  const [error, setError] = useState('');

  const isAlreadyFeatured = () => {
    if (!product.featured) return false;
    if (!product.featuredUntil) return false;
    
    const now = new Date();
    const featuredUntil = product.featuredUntil.toDate ? 
      product.featuredUntil.toDate() : 
      new Date(product.featuredUntil);
    
    return now < featuredUntil;
  };

  const getRemainingDays = () => {
    if (!isAlreadyFeatured()) return 0;
    
    const now = new Date();
    const featuredUntil = product.featuredUntil.toDate ? 
      product.featuredUntil.toDate() : 
      new Date(product.featuredUntil);
    
    const diffTime = featuredUntil - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const handlePayment = async () => {
    if (!user) {
      alert('Debes iniciar sesión para destacar productos');
      return;
    }

    if (amount < 100) {
      setError('El monto mínimo es $100');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Enviando datos:', {
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || user.email,
        productName: product.titulo || product.nombre,
        amount: amount
      });

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          userId: user.uid,
          userName: user.displayName || user.email,
          productName: product.titulo || product.nombre,
          amount: amount
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Success data:', data);
      
      // Redirigir a MercadoPago
      if (data.init_point) {
        window.open(data.init_point, '_blank');
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('No se recibió la URL de pago');
      }

    } catch (error) {
      console.error('Payment error:', error);
      setError(`Error al procesar el pago: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (isAlreadyFeatured()) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-medium text-lg">Producto Destacado</span>
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
          Este producto está destacado por {getRemainingDays()} días más
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
          <Star className="w-5 h-5 text-yellow-500 mr-2" />
          Destacar Producto
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
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Haz que tu producto aparezca en la sección "Productos Destacados" del home por 7 días
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contribución voluntaria (desde $100)
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
          Contribución sugerida: $1000 - Ayuda a mantener La Feria funcionando
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">
          Beneficios del producto destacado:
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Aparece en la sección principal del home</li>
          <li>• Mayor visibilidad para más contactos</li>
          <li>• Badge especial de "Destacado"</li>
          <li>• Duración: 7 días completos</li>
          <li>• Apoyas el desarrollo de La Feria</li>
        </ul>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading || amount < 100}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
        Pago seguro procesado por MercadoPago
      </p>
    </div>
  );
}