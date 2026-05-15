// src/components/admin/AdminNavBadges.js
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  Wrench,
  Briefcase,
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MapPin,
  Store,
  DollarSign
} from 'lucide-react';

export default function AdminNavBadges() {
  const router = useRouter();
  const pathname = usePathname();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const navItems = [
    {
      id: 'panel',
      name: 'Panel',
      icon: LayoutDashboard,
      color: 'red',
      description: 'Vista general',
      href: '/admin'
    },
    {
      id: 'usuarios',
      name: 'Usuarios',
      icon: Users,
      color: 'indigo',
      description: 'Gestionar usuarios',
      href: '/admin/usuarios'
    },
    {
      id: 'ferias',
      name: 'Ferias',
      icon: MapPin,
      color: 'orange',
      description: 'Todas las ferias',
      href: '/admin/ferias'
    },
    {
      id: 'tiendas',
      name: 'Tiendas',
      icon: Store,
      color: 'teal',
      description: 'Todas las tiendas',
      href: '/admin/tiendas'
    },
    {
      id: 'productos',
      name: 'Productos',
      icon: ShoppingBag,
      color: 'green',
      description: 'Admin productos',
      href: '/admin/productos'
    },
    {
      id: 'servicios',
      name: 'Servicios',
      icon: Wrench,
      color: 'blue',
      description: 'Admin servicios',
      href: '/admin/servicios'
    },
    {
      id: 'empleos',
      name: 'Empleos',
      icon: Briefcase,
      color: 'purple',
      description: 'Ofertas y búsquedas',
      href: '/admin/empleos'
    },
    {
      id: 'resenas',
      name: 'Reseñas',
      icon: Star,
      color: 'pink',
      description: 'Moderar reseñas',
      href: '/admin/comentarios'
    },
    {
      id: 'mensajeria',
      name: 'Mensajería',
      icon: MessageSquare,
      color: 'cyan',
      description: 'Notificaciones',
      href: '/admin/mensajeria'
    },
    {
      id: 'precios',
      name: 'Precios',
      icon: DollarSign,
      color: 'red',
      description: 'Gestionar precios',
      href: '/admin/configuracion/precios'
    }
  ];

  const getColorClasses = (color, isActive) => {
    const colorMap = {
      red: {
        active: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-900/50 border-2 border-red-300',
        inactive: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 dark:from-red-900/20 dark:to-red-800/30 dark:text-red-300 dark:hover:from-red-900/40 dark:hover:to-red-800/50 border-2 border-red-200 hover:border-red-300 dark:border-red-700'
      },
      indigo: {
        active: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 border-2 border-indigo-300',
        inactive: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 hover:from-indigo-100 hover:to-indigo-200 dark:from-indigo-900/20 dark:to-indigo-800/30 dark:text-indigo-300 dark:hover:from-indigo-900/40 dark:hover:to-indigo-800/50 border-2 border-indigo-200 hover:border-indigo-300 dark:border-indigo-700'
      },
      green: {
        active: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/50 border-2 border-green-300',
        inactive: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 dark:from-green-900/20 dark:to-green-800/30 dark:text-green-300 dark:hover:from-green-900/40 dark:hover:to-green-800/50 border-2 border-green-200 hover:border-green-300 dark:border-green-700'
      },
      blue: {
        active: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50 border-2 border-blue-300',
        inactive: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 dark:from-blue-900/20 dark:to-blue-800/30 dark:text-blue-300 dark:hover:from-blue-900/40 dark:hover:to-blue-800/50 border-2 border-blue-200 hover:border-blue-300 dark:border-blue-700'
      },
      purple: {
        active: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/50 border-2 border-purple-300',
        inactive: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 dark:from-purple-900/20 dark:to-purple-800/30 dark:text-purple-300 dark:hover:from-purple-900/40 dark:hover:to-purple-800/50 border-2 border-purple-200 hover:border-purple-300 dark:border-purple-700'
      },
      pink: {
        active: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/50 border-2 border-pink-300',
        inactive: 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 hover:from-pink-100 hover:to-pink-200 dark:from-pink-900/20 dark:to-pink-800/30 dark:text-pink-300 dark:hover:from-pink-900/40 dark:hover:to-pink-800/50 border-2 border-pink-200 hover:border-pink-300 dark:border-pink-700'
      },
      cyan: {
        active: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/50 border-2 border-cyan-300',
        inactive: 'bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 hover:from-cyan-100 hover:to-cyan-200 dark:from-cyan-900/20 dark:to-cyan-800/30 dark:text-cyan-300 dark:hover:from-cyan-900/40 dark:hover:to-cyan-800/50 border-2 border-cyan-200 hover:border-cyan-300 dark:border-cyan-700'
      },
      orange: {
        active: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/50 border-2 border-orange-300',
        inactive: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 hover:from-orange-100 hover:to-orange-200 dark:from-orange-900/20 dark:to-orange-800/30 dark:text-orange-300 dark:hover:from-orange-900/40 dark:hover:to-orange-800/50 border-2 border-orange-200 hover:border-orange-300 dark:border-orange-700'
      },
      teal: {
        active: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-200 dark:shadow-teal-900/50 border-2 border-teal-300',
        inactive: 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 hover:from-teal-100 hover:to-teal-200 dark:from-teal-900/20 dark:to-teal-800/30 dark:text-teal-300 dark:hover:from-teal-900/40 dark:hover:to-teal-800/50 border-2 border-teal-200 hover:border-teal-300 dark:border-teal-700'
      }
    };
    
    return isActive ? colorMap[color].active : colorMap[color].inactive;
  };

  const handleClick = (item) => {
    router.push(item.href);
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile */}
        <div className="relative md:hidden">
          {canScrollLeft && (
            <button
              onClick={handleScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={handleScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide py-3 gap-2 px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl min-w-[95px] text-center font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${getColorClasses(item.color, isActive)}`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-semibold whitespace-nowrap">{item.name}</span>
                  <span className={`text-xs mt-0.5 opacity-75 whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex justify-center py-4 gap-3 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`group flex flex-col items-center p-4 rounded-xl min-w-[110px] text-center font-medium transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 ${getColorClasses(item.color, isActive)}`}
              >
                <Icon className={`w-6 h-6 mb-2 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-bold mb-1">{item.name}</span>
                <span className={`text-xs opacity-75 ${isActive ? 'font-medium' : ''}`}>
                  {item.description}
                </span>
                {isActive && (
                  <div className="w-4 h-0.5 bg-white rounded-full mt-1.5 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tablet */}
        <div className="hidden sm:grid md:hidden grid-cols-3 gap-3 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`group flex items-center p-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${getColorClasses(item.color, isActive)}`}
              >
                <Icon className={`w-5 h-5 mr-2.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{item.name}</span>
                  <span className={`text-xs opacity-75 ${isActive ? 'font-medium' : ''}`}>
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}