// src/components/layout/DashboardTopNavigation.js

'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  BarChart3, User, ChevronDown, ChevronRight, Store, ExternalLink, House,
  Heart, Star, ShoppingBag, Menu, X, Shield, MapPin, Briefcase
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardTopNavigation() {
  const { isAuthenticated, userData } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRef = useRef(null)

  // ✅ HOOKS SIEMPRE DEBEN IR ANTES DE CUALQUIER RETURN
  // Cerrar menú móvil al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMobileMenu(false)
      }
    }

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMobileMenu])

  // ✅ AHORA SÍ PODEMOS HACER EL EARLY RETURN
  // Solo mostrar en rutas del dashboard
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  
  if (!isAuthenticated || !isDashboardRoute) {
    return null
  }

  const isAdmin = userData?.role === 'admin'
  const isOrganizer = isAdmin || userData?.role === 'organizer'
  const storeUrl = userData?.storeSlug

  const isActive = (href) => {
    // Para "Inicio", solo debe estar activo si NO estamos en el dashboard
    if (href === '/') {
      return false // Nunca activo en el dashboard
    }
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname?.startsWith(href)
  }

  const navigateTo = (href) => {
    router.push(href)
    setShowMobileMenu(false)
  }

  // Definir todos los items de navegación
  const navItems = [
    { id: 'home',      label: 'Inicio',    icon: House,       href: '/',                        color: 'gray',   desc: 'Ir a la página principal',  showAlways: true              },
    { id: 'dashboard', label: 'Panel',     icon: BarChart3,   href: '/dashboard',               color: 'purple', desc: 'Vista general',             showAlways: true              },
    { id: 'profile',   label: 'Perfil',    icon: User,        href: '/dashboard/profile',       color: 'blue',   desc: 'Información personal',      showAlways: true              },
    { id: 'store',     label: 'Tienda',    icon: Store,       href: '/dashboard/tienda',        color: 'orange', desc: 'Gestiona tu negocio',       showAlways: true              },
    { id: 'empleos',   label: 'Empleos',   icon: Briefcase,   href: '/dashboard/empleos',       color: 'teal',   desc: 'Portal de empleos',         showAlways: true              },
    { id: 'favorites', label: 'Favoritos', icon: Heart,       href: '/dashboard/favorites',     color: 'pink',   desc: 'Lo que guardaste',          showAlways: true              },
    { id: 'reviews',   label: 'Reseñas',  icon: Star,        href: '/dashboard/reviews',       color: 'yellow', desc: 'Tus comentarios',           showAlways: true              },
  ]

  // Item de ferias (solo organizer/admin)
  const feriasItem = { id: 'ferias', label: 'Mis Ferias',   icon: MapPin, href: '/dashboard/organizer', color: 'orange', desc: 'Gestionar tus ferias'   }
  const adminItem  = { id: 'admin',  label: 'Panel Admin',  icon: Shield, href: '/admin',               color: 'red',    desc: 'Gestión de la plataforma' }

  const iconColors = {
    gray:   'bg-gray-100   dark:bg-gray-700        text-gray-600   dark:text-gray-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30   text-purple-600 dark:text-purple-400',
    blue:   'bg-blue-100   dark:bg-blue-900/30     text-blue-600   dark:text-blue-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30   text-orange-600 dark:text-orange-400',
    green:  'bg-green-100  dark:bg-green-900/30    text-green-600  dark:text-green-400',
    teal:   'bg-teal-100   dark:bg-teal-900/30     text-teal-600   dark:text-teal-400',
    pink:   'bg-pink-100   dark:bg-pink-900/30     text-pink-600   dark:text-pink-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30   text-yellow-600 dark:text-yellow-400',
    red:    'bg-red-100    dark:bg-red-900/30      text-red-600    dark:text-red-400',
  }

  // Colores por tipo (tabs desktop/tablet)
  const getColorClasses = (color, isActive) => {
    const colors = {
      gray: {
        active: 'border-gray-500 text-gray-700 dark:text-gray-300',
        inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      },
      purple: {
        active: 'border-purple-500 text-purple-600 dark:text-purple-400',
        inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
      },
      blue: {
        active: 'border-blue-500 text-blue-600 dark:text-blue-400',
        inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
      },
      orange: {
        active: 'border-orange-500 text-orange-600 dark:text-orange-400',
        inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400'
      },
      green: {
        active: 'border-green-500 text-green-600 dark:text-green-400',
        inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
      },
      teal: {
        active: 'border-teal-500 text-teal-600 dark:text-teal-400',
        inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'
      },
      pink: {
        active: 'border-pink-500 text-pink-600 dark:text-pink-400',
        inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400'
      },
      yellow: {
        active: 'border-yellow-500 text-yellow-600 dark:text-yellow-400',
        inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
      },
      red: {
        active: 'border-red-500 text-red-600 dark:text-red-400',
        inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
      }
    }

    return isActive ? colors[color].active : colors[color].inactive
  }

  // Obtener el título de la página actual
  const getCurrentPageTitle = () => {
    const allItems = [
      ...navItems,
      ...(isOrganizer ? [feriasItem] : []),
      ...(isAdmin ? [adminItem] : [])
    ]
    const currentItem = allItems.find(item => isActive(item.href))
    return currentItem?.label || 'Dashboard'
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Navegación principal */}
            <div className="flex items-center">
              <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                {navItems.filter(item => item.showAlways).map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.href)}
                      className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${getColorClasses(item.color, active)}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}

                {/* Item de ferias */}
                {isOrganizer && (
                  <button
                    onClick={() => navigateTo(feriasItem.href)}
                    className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${getColorClasses(feriasItem.color, isActive(feriasItem.href))}`}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{feriasItem.label}</span>
                  </button>
                )}

                {/* Item de admin */}
                {isAdmin && (
                  <button
                    onClick={() => navigateTo(adminItem.href)}
                    className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${getColorClasses(adminItem.color, isActive(adminItem.href))}`}
                  >
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <span>{adminItem.label}</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Ver Tienda */}
            {storeUrl && (
              <a
                href={`/tienda/${storeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium transition-colors ml-4 flex-shrink-0 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span className="hidden xl:inline">Ver tienda</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* TABLET (md to lg) */}
      <div className="hidden md:block lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Navegación en scroll horizontal */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex space-x-1 min-w-max">
                {[...navItems.filter(item => item.showAlways), ...(isOrganizer ? [feriasItem] : []), ...(isAdmin ? [adminItem] : [])].map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.href)}
                      className={`flex items-center space-x-2 px-3 py-4 border-b-2 font-medium text-sm transition-all cursor-pointer ${getColorClasses(item.color, active)}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Ver Tienda */}
            {storeUrl && (
              <a
                href={`/tienda/${storeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 flex items-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium transition-colors flex-shrink-0 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE (below md) */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm" ref={dropdownRef}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex-1 flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">
                  {getCurrentPageTitle()}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Ver Tienda */}
            {storeUrl && (
              <a
                href={`/tienda/${storeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 flex items-center gap-1.5 px-3 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Mobile dropdown */}
          {showMobileMenu && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50">

              {/* Items principales */}
              <div className="py-1.5 px-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.href)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${active ? 'bg-gray-50 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[item.color]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`text-sm font-semibold leading-tight ${active ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{item.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.desc}</p>
                      </div>
                      {active
                        ? <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
                      }
                    </button>
                  )
                })}
              </div>

              {/* Ferias */}
              {isOrganizer && (
                <div className="border-t border-gray-100 dark:border-gray-700 py-1.5 px-2">
                  <button
                    onClick={() => navigateTo(feriasItem.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${isActive(feriasItem.href) ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-orange-50 dark:hover:bg-orange-900/10'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors.orange}`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-400 leading-tight">{feriasItem.label}</p>
                      <p className="text-xs text-orange-500 dark:text-orange-500 truncate">{feriasItem.desc}</p>
                    </div>
                    {isActive(feriasItem.href)
                      ? <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-orange-300 shrink-0" />
                    }
                  </button>
                </div>
              )}

              {/* Admin */}
              {isAdmin && (
                <div className="border-t border-gray-100 dark:border-gray-700 py-1.5 px-2">
                  <button
                    onClick={() => navigateTo(adminItem.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${isActive(adminItem.href) ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors.red}`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400 leading-tight">{adminItem.label}</p>
                      <p className="text-xs text-red-500 dark:text-red-500 truncate">{adminItem.desc}</p>
                    </div>
                    {isActive(adminItem.href)
                      ? <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-red-300 shrink-0" />
                    }
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlay para móvil */}
      {showMobileMenu && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 dark:bg-black/40 z-30" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  )
}