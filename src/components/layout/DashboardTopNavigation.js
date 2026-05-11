// src/components/layout/DashboardTopNavigation.js

'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  BarChart3, User, ChevronDown, Store, ExternalLink, House, 
  Heart, Star, ShoppingBag, Menu, X, Shield
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
    {
      id: 'home',
      label: 'Inicio',
      icon: House,
      href: '/',
      color: 'gray',
      showAlways: true
    },
    {
      id: 'dashboard',
      label: 'Panel',
      icon: BarChart3,
      href: '/dashboard',
      color: 'purple',
      showAlways: true
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      href: '/dashboard/profile',
      color: 'blue',
      showAlways: true
    },
    {
      id: 'store',
      label: 'Tienda',
      icon: Store,
      href: '/dashboard/store',
      color: 'orange',
      showAlways: true
    },
    {
      id: 'products',
      label: 'Productos',
      icon: ShoppingBag,
      href: '/dashboard/store/products',
      color: 'green',
      showAlways: false,
      mobileOnly: true
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Heart,
      href: '/dashboard/favorites',
      color: 'pink',
      showAlways: true
    },
    {
      id: 'reviews',
      label: 'Reseñas',
      icon: Star,
      href: '/dashboard/reviews',
      color: 'yellow',
      showAlways: true
    }
  ]

  // Item de admin (ahora es solo uno)
  const adminItem = {
    id: 'admin',
    label: 'Panel Admin',
    icon: Shield,
    href: '/admin',
    color: 'red'
  }

  // Colores por tipo
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
    const allItems = [...navItems, ...(isAdmin ? [adminItem] : [])]
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
                href={`https://laferia.vercel.app/tienda/${storeUrl}`}
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
                {[...navItems.filter(item => item.showAlways), ...(isAdmin ? [adminItem] : [])].map((item) => {
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
                href={`https://laferia.vercel.app/tienda/${storeUrl}`}
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
                href={`https://laferia.vercel.app/tienda/${storeUrl}`}
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
            <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
              
              {/* Sección principal */}
              <div className="py-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.href)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                        active 
                          ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-medium' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Sección de admin */}
              {isAdmin && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
                  <button
                    onClick={() => navigateTo(adminItem.href)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                      isActive(adminItem.href)
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold' 
                        : 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                    }`}
                  >
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <span>{adminItem.label}</span>
                    {isActive(adminItem.href) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    )}
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