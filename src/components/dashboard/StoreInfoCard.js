// src/components/dashboard/StoreInfoCard.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { 
  Store,
  Globe,
  MapPin,
  Palette,
  Eye,
  Package,
  Wrench,
  Briefcase,
  MessageCircle,
  Phone,
  MessageSquare,
  ExternalLink,
  Copy,
  CheckCircle,
  Settings,
  QrCode,
  Download,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function StoreInfoCard() {
  const { userData } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Construir URL de la tienda usando solo el slug
  const getStoreSlug = () => {
    if (userData?.storeSlug) {
      return userData.storeSlug;
    } else if (userData?.businessName) {
      return userData.businessName.toLowerCase().replace(/\s+/g, '-');
    } else {
      return 'mi-tienda';
    }
  };

  const storeSlug = getStoreSlug();
  const storeUrl = `laferia.vercel.app/tienda/${storeSlug}`;
  const fullStoreUrl = `https://${storeUrl}`;
  
  // Generar URL del QR con colores personalizados
  const primaryColor = userData?.storeConfig?.primaryColor?.replace('#', '') || '3B82F6';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullStoreUrl)}&color=${primaryColor}&bgcolor=FFFFFF&margin=10`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullStoreUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-${userData?.businessName?.replace(/\s+/g, '-') || 'tienda'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActiveServices = () => {
    const services = [];
    if (userData?.storeConfig?.showProducts) services.push({ icon: Package, label: 'Productos' });
    if (userData?.storeConfig?.showServices) services.push({ icon: Wrench, label: 'Servicios' });
    if (userData?.storeConfig?.showJobs) services.push({ icon: Briefcase, label: 'Empleos' });
    if (userData?.storeConfig?.showTestimonials) services.push({ icon: MessageCircle, label: 'Testimonios' });
    if (userData?.storeConfig?.showContactForm) services.push({ icon: MessageSquare, label: 'Contacto' });
    if (userData?.storeConfig?.showGallery) services.push({ icon: Eye, label: 'Galería' });
    return services;
  };

  const activeServices = getActiveServices();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header principal con colores personalizados */}
      <div 
        className="px-6 py-6 relative"
        style={{ 
          background: `linear-gradient(135deg, ${userData?.storeConfig?.primaryColor || '#3B82F6'}, ${userData?.storeConfig?.secondaryColor || '#8B5CF6'})` 
        }}
      >
        <div className="flex items-center space-x-4">
          {/* Logo de la tienda */}
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white/30">
              {userData?.storeLogo ? (
                <img
                  src={userData.storeLogo}
                  alt="Logo de la tienda"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <Store className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
              {userData?.businessName || 'Mi Tienda'}
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              Tema: {userData?.storeConfig?.theme || 'Classic'}
            </p>
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 bg-white/20 text-white border border-white/30">
              <Eye className="w-3 h-3 mr-1" />
              Tienda activa
            </div>
          </div>
        </div>

        {/* Modal QR Code */}
        {showQR && (
          <div className="mt-4 p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Código QR de tu tienda
              </h4>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-3 bg-white rounded-lg shadow-sm mb-3">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code de la tienda" 
                  className="mx-auto"
                  onError={(e) => {
                    e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullStoreUrl)}`;
                  }}
                />
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Escanea para visitar tu tienda
              </p>
              
              <button
                onClick={downloadQR}
                className="inline-flex items-center px-3 py-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <Download className="w-3 h-3 mr-1" />
                Descargar QR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* URL de la tienda */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Globe className="w-3 h-3 mr-1" />
              URL de tu tienda
            </div>
            <p className="text-primary-600 dark:text-primary-400 font-mono text-sm break-all">
              {storeUrl}
            </p>
          </div>
          
          {/* Acciones - siempre debajo en móvil */}
          <div className="flex items-center space-x-4">
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
            
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <QrCode className="w-3 h-3" />
              <span>QR</span>
            </button>
            
            <a
              href={fullStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Abrir</span>
            </a>
          </div>
        </div>
      </div>

      {/* Información de la tienda */}
      <div className="p-6">
        {/* Ubicación y contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Ubicación */}
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Ubicación
              </p>
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {userData?.address ? `${userData.address}, ${userData.city}` : userData?.city || 'No especificada'}
              </p>
            </div>
          </div>

          {/* Teléfono */}
          {userData?.storeConfig?.showPhone && userData?.phone && (
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Teléfono
                </p>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {userData.phone}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Colores de la tienda */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Palette className="w-4 h-4 text-gray-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Paleta de colores
            </h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: userData?.storeConfig?.primaryColor || '#3B82F6' }}
              ></div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Primario</p>
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                  {userData?.storeConfig?.primaryColor || '#3B82F6'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: userData?.storeConfig?.secondaryColor || '#8B5CF6' }}
              ></div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Secundario</p>
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                  {userData?.storeConfig?.secondaryColor || '#8B5CF6'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Servicios activos */}
        {activeServices.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Servicios activos
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeServices.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {service.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Configuración rápida */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Última actualización: {userData?.updatedAt ? new Date(userData.updatedAt.toDate()).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : 'N/A'}
          </div>
          
          <a 
            href="/dashboard/store"
            className="flex items-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            <Settings className="w-3 h-3 mr-1" />
            Configurar tienda
          </a>
        </div>
      </div>
    </div>
  );
}