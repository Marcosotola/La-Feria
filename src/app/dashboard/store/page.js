// src/app/dashboard/store/page.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import StoreNavBadges from '@/components/layout/StoreNavBadges';
import BusinessInfoSection from '@/components/store/BusinessInfoSection';
import StoreLogoSection from '@/components/store/StoreLogoSection';
import StoreConfigSection from '@/components/store/StoreConfigSection';
import StoreFairsSection from '@/components/store/StoreFairsSection';
import ToastContainer from '@/components/ui/ToastContainer';
import useToast from '@/hooks/useToast';
import { Store, ChevronLeft } from 'lucide-react';

export default function StorePage() {
  const { isAuthenticated, userData, user, loading } = useAuth();
  const router = useRouter();
  const { toasts, showSuccess, showError, hideToast } = useToast();

  const [activeSection, setActiveSection] = useState('business');
  const [storeConfig, setStoreConfig] = useState(null);

  // Estados para logo de tienda
  const [logoState, setLogoState] = useState({
    url: '',
    uploading: false,
    preview: null
  });

  // Cargar configuración de la tienda para los colores
  useEffect(() => {
    if (userData?.storeConfig) {
      setStoreConfig(userData.storeConfig);
    }
  }, [userData]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (userData) {
      setLogoState(prev => ({
        ...prev,
        url: userData.storeLogo || ''
      }));
    }
  }, [userData]);

  // Función mejorada para mostrar mensajes con toast
  const showMessage = (type, message) => {
    if (type === 'success') {
      showSuccess(message);
    } else {
      showError(message);
    }
  };

  // Callback para actualizar colores en tiempo real
  const handleConfigUpdate = (newConfig) => {
    setStoreConfig(newConfig);
  };

  // Obtener colores con fallbacks
  const getPrimaryColor = () => {
    return storeConfig?.primaryColor || '#3B82F6';
  };

  const getSecondaryColor = () => {
    return storeConfig?.secondaryColor || '#8B5CF6';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'business':
        return <BusinessInfoSection showMessage={showMessage} />;
      case 'logo':
        return (
          <StoreLogoSection
            logoState={logoState}
            setLogoState={setLogoState}
            showMessage={showMessage}
          />
        );
      case 'config':
        return (
          <StoreConfigSection 
            showMessage={showMessage}
            onConfigUpdate={handleConfigUpdate}
          />
        );
      case 'fairs':
        return <StoreFairsSection showMessage={showMessage} />;
      default:
        return <BusinessInfoSection showMessage={showMessage} />;
    }
  };

  const primaryColor = getPrimaryColor();
  const secondaryColor = getSecondaryColor();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />
      
      {/* Header de la tienda con colores dinámicos */}
      <div 
        className="relative transition-all duration-500"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Botón volver */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver a Mi Cuenta
          </button>

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
                {userData?.city || 'Ubicación no especificada'}
              </p>
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 bg-white/20 text-white border border-white/30">
                Tema: {storeConfig?.theme ? 
                  storeConfig.theme.charAt(0).toUpperCase() + storeConfig.theme.slice(1) 
                  : 'Moderno'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges de navegación */}
      <StoreNavBadges 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveSection()}
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  );
}