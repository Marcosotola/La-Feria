// src/app/payment/success/page.js
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft, Star, Loader, Briefcase, Store } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product_id');
  const serviceId = searchParams.get('service_id');
  const employmentId = searchParams.get('employment_id');
  const storeId = searchParams.get('store_id');
  const status = searchParams.get('status');
  const paymentId = searchParams.get('payment_id');

  // Determinar tipo de item
  let itemType, itemId, dashboardPath, sectionLabel, icon;

  if (storeId) {
    itemType = 'tienda';
    itemId = storeId;
    dashboardPath = '/dashboard/tienda';
    sectionLabel = 'Tiendas Destacadas';
    icon = <Store className="w-5 h-5" />;
  } else if (employmentId) {
    itemType = 'empleo';
    itemId = employmentId;
    dashboardPath = '/dashboard/tienda/empleos';
    sectionLabel = 'Empleos Destacados';
    icon = <Briefcase className="w-5 h-5 fill-current" />;
  } else if (serviceId) {
    itemType = 'servicio';
    itemId = serviceId;
    dashboardPath = '/dashboard/tienda/servicios';
    sectionLabel = 'Servicios Destacados';
    icon = <Star className="w-5 h-5 fill-current" />;
  } else {
    itemType = 'producto';
    itemId = productId;
    dashboardPath = '/dashboard/tienda/productos';
    sectionLabel = 'Productos Destacados';
    icon = <Star className="w-5 h-5 fill-current" />;
  }

  return (
    <div className="max-w-md w-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tu {itemType} ahora está destacado por 7 días
          </p>
          
          {paymentId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              ID de pago: {paymentId}
            </p>
          )}
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-yellow-700 dark:text-yellow-300 mb-2">
            {icon}
            <span className="font-medium capitalize">{itemType} Destacado</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Aparecerá en la sección principal del home
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-left">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
              Beneficios activos:
            </h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ Aparece en sección "{sectionLabel}"</li>
              <li>✅ Badge especial de "DESTACADO"</li>
              <li>✅ Mayor visibilidad y {itemType === 'empleo' ? 'postulaciones' : 'contactos'}</li>
              <li>✅ Duración: 7 días completos</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href={dashboardPath}
            className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a mis {itemType}s</span>
          </Link>
          
          <Link
            href="/"
            className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            {itemType === 'empleo' ? <Briefcase className="w-4 h-4" /> : <Star className="w-4 h-4" />}
            <span>Ver {itemType}s destacados</span>
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Gracias por tu contribución a La Feria
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentSuccessLoading() {
  return (
    <div className="max-w-md w-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <Loader className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <Suspense fallback={<PaymentSuccessLoading />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}