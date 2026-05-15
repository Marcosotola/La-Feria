'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import {
  Settings,
  Image as ImageIcon,
  Palette,
  Package,
  Wrench,
  Briefcase,
  ImageIcon as GalleryIcon,
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'info',          name: 'Información', icon: Settings,     color: 'blue',   href: '/dashboard/tienda',               exact: true  },
  { id: 'logo',          name: 'Logo',         icon: ImageIcon,    color: 'purple', href: '/dashboard/tienda/logo'                        },
  { id: 'apariencia',    name: 'Apariencia',   icon: Palette,      color: 'green',  href: '/dashboard/tienda/configuracion'               },
  { id: 'nosotros',      name: 'Nosotros',     icon: Heart,        color: 'pink',   href: '/dashboard/tienda/nosotros'                    },
  { id: 'productos',     name: 'Productos',    icon: Package,      color: 'blue',   href: '/dashboard/tienda/productos'                   },
  { id: 'servicios',     name: 'Servicios',    icon: Wrench,       color: 'green',  href: '/dashboard/tienda/servicios'                   },
  { id: 'empleos',       name: 'Empleos',      icon: Briefcase,    color: 'purple', href: '/dashboard/tienda/empleos'                     },
  { id: 'galeria',       name: 'Galería',      icon: GalleryIcon,  color: 'orange', href: '/dashboard/tienda/galeria'                     },
];

const COLOR_MAP = {
  blue:   { active: 'bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50 border-2 border-blue-400',     inactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 border-2 border-blue-200 dark:border-blue-700'   },
  purple: { active: 'bg-purple-500 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/50 border-2 border-purple-400', inactive: 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40 border-2 border-purple-200 dark:border-purple-700' },
  green:  { active: 'bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-green-900/50 border-2 border-green-400',   inactive: 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40 border-2 border-green-200 dark:border-green-700'   },
  pink:   { active: 'bg-pink-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/50 border-2 border-pink-400',       inactive: 'bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:hover:bg-pink-900/40 border-2 border-pink-200 dark:border-pink-700'       },
  orange: { active: 'bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/50 border-2 border-orange-400', inactive: 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/40 border-2 border-orange-200 dark:border-orange-700' },
};

export default function StoreNavBadges() {
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const getColors = (item) => {
    const map = COLOR_MAP[item.color] || COLOR_MAP.blue;
    return isActive(item) ? map.active : map.inactive;
  };

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mobile / tablet: scroll horizontal */}
        <div className="relative lg:hidden">
          {canScrollLeft && (
            <button onClick={() => scrollRef.current?.scrollBy({ left: -180, behavior: 'smooth' })}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          {canScrollRight && (
            <button onClick={() => scrollRef.current?.scrollBy({ left: 180, behavior: 'smooth' })}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide py-3 gap-2 px-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl min-w-[88px] text-center font-medium transition-all duration-200 hover:scale-105 ${getColors(item)}`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold whitespace-nowrap">{item.name}</span>
                  {active && <div className="w-3 h-0.5 bg-white rounded-full mt-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: flex centrado */}
        <div className="hidden lg:flex justify-center py-3 gap-2 overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[100px] text-center font-medium transition-all duration-200 hover:scale-105 hover:-translate-y-1 ${getColors(item)}`}
              >
                <Icon className="w-5 h-5 mb-1.5" />
                <span className="text-sm font-bold">{item.name}</span>
                {active && <div className="w-4 h-0.5 bg-white rounded-full mt-1" />}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
