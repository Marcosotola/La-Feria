// src/components/tienda/StoreNavigation.js
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Wrench, 
  Briefcase, 
  Camera, 
  MessageCircle, 
  Users,
  Home,
  X
} from 'lucide-react';

const StoreNavigation = ({ 
  storeConfig, 
  isMobileMenuOpen,
  onMobileMenuClose,
  storeSlug
}) => {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('inicio');

  // Detectar la sección activa según la URL
  useEffect(() => {
    if (!pathname) return;

    if (pathname === `/tienda/${storeSlug}`) {
      setActiveSection('inicio');
    } else if (pathname.includes('/productos')) {
      setActiveSection('productos');
    } else if (pathname.includes('/servicios')) {
      setActiveSection('servicios');
    } else if (pathname.includes('/empleos')) {
      setActiveSection('empleos');
    } else if (pathname.includes('/galeria')) {
      setActiveSection('galeria');
    } else if (pathname.includes('/resenas')) {
      setActiveSection('resenas');
    } else if (pathname.includes('/nosotros')) {
      setActiveSection('nosotros');
    }
  }, [pathname, storeSlug]);

  // Obtener items de navegación
  const getNavigationItems = () => {
    const items = [];
    
    // Siempre mostrar "Inicio" al principio
    items.push({
      id: 'inicio',
      label: 'Inicio',
      icon: Home,
      path: `/tienda/${storeSlug}`
    });
    
    if (storeConfig?.showProducts) {
      items.push({
        id: 'productos',
        label: 'Productos',
        icon: Package,
        path: `/tienda/${storeSlug}/productos`
      });
    }
    
    if (storeConfig?.showServices) {
      items.push({
        id: 'servicios',
        label: 'Servicios',
        icon: Wrench,
        path: `/tienda/${storeSlug}/servicios`
      });
    }
    
    if (storeConfig?.showJobs) {
      items.push({
        id: 'empleos',
        label: 'Empleos',
        icon: Briefcase,
        path: `/tienda/${storeSlug}/empleos`
      });
    }
    
    if (storeConfig?.showGallery) {
      items.push({
        id: 'galeria',
        label: 'Galería',
        icon: Camera,
        path: `/tienda/${storeSlug}/galeria`
      });
    }
    
    if (storeConfig?.showTestimonials) {
      items.push({
        id: 'resenas',
        label: 'Reseñas',
        icon: MessageCircle,
        path: `/tienda/${storeSlug}/resenas`
      });
    }
    
    if (storeConfig?.showAbout) {
      items.push({
        id: 'nosotros',
        label: 'Nosotros',
        icon: Users,
        path: `/tienda/${storeSlug}/nosotros`
      });
    }
    
    return items;
  };

  const navigationItems = getNavigationItems();

  const handleItemClick = () => {
    // Cerrar menú móvil al hacer click
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const getItemClasses = (itemId) => {
    const isActive = activeSection === itemId;
    const baseClasses = "flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200";
    
    if (isActive) {
      return `${baseClasses} text-white shadow-lg transform scale-105`;
    }
    
    return `${baseClasses} text-gray-700 dark:text-gray-300 hover:text-white hover:shadow-md hover:transform hover:scale-105`;
  };

  return (
    <>
      {/* DESKTOP NAVIGATION */}
      <nav className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-1 py-4 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={getItemClasses(item.id)}
                  style={{
                    backgroundColor: isActive 
                      ? storeConfig?.primaryColor || '#ea580c'
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = storeConfig?.primaryColor || '#ea580c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MOBILE NAVIGATION OVERLAY */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay de fondo */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onMobileMenuClose}
          />
          
          {/* Menú móvil */}
          <div className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300">
            
            {/* Header del menú */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Navegación
              </h3>
              <button
                onClick={onMobileMenuClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Items de navegación */}
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    onClick={handleItemClick}
                    className={`w-full ${getItemClasses(item.id)} justify-start`}
                    style={{
                      backgroundColor: isActive 
                        ? storeConfig?.primaryColor || '#ea580c'
                        : 'transparent'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Información adicional en el menú móvil */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Tienda online
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StoreNavigation;