// src/components/layout/Header.js
'use client'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { 
  User, Moon, Sun, Plus, HelpCircle, LogOut, 
  LayoutDashboard, Heart, Star, Store, 
  ChevronRight, Shield
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ChatWithMily from '@/components/chat/ChatWithMily'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, loading, user, userData, signOut } = useAuth()
  const userMenuRef = useRef(null)

  const router = useRouter()

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const isAdmin = userData?.role === 'admin'

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleCreateStore = () => {
    router.push('/register')
  }

  const handleNewUser = () => {
    router.push('/register')
  }

  const handleUserAction = () => {
    if (loading) return

    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu)
    } else {
      router.push('/login')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleNavigation = (href) => {
    setShowUserMenu(false)
    router.push(href)
  }

  const getUserButtonText = () => {
    if (loading) return 'Cargando...'
    if (isAuthenticated) {
      return userData?.firstName ? `Hola, ${userData.firstName}` : 'Mi cuenta'
    }
    return 'Mi cuenta'
  }

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase()
    }
    if (userData?.email) {
      return userData.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Opciones del menú de usuario
  const userMenuSections = [
    {
      section: 'Dashboard',
      items: [
        {
          id: 'dashboard',
          label: 'Mi Cuenta',
          icon: LayoutDashboard,
          href: '/dashboard',
          description: 'Vista general'
        }
      ]
    },
    {
      section: 'Personal',
      items: [
        {
          id: 'profile',
          label: 'Perfil',
          icon: User,
          href: '/dashboard/profile',
          description: 'Información personal'
        },
        {
          id: 'favorites',
          label: 'Favoritos',
          icon: Heart,
          href: '/dashboard/favorites',
          description: 'Productos guardados'
        },
        {
          id: 'reviews',
          label: 'Reseñas',
          icon: Star,
          href: '/dashboard/reviews',
          description: 'Tus comentarios'
        }
      ]
    },
    {
      section: 'Tienda',
      items: [
        {
          id: 'store',
          label: 'Mi Tienda',
          icon: Store,
          href: '/dashboard/store',
          description: 'Gestiona tu negocio'
        }
      ]
    }
  ]

  // Opciones adicionales para admin
  const adminMenuSection = {
    section: 'Administración',
    items: [
      {
        id: 'admin',
        label: 'Panel Admin',
        icon: Shield,
        href: '/admin',
        description: 'Gestión del sistema'
      }
    ]
  }

  const finalUserMenuSections = isAdmin 
    ? [...userMenuSections, adminMenuSection]
    : userMenuSections

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Header Mobile */}
      <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Botón Dark/Light Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Cambiar modo"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-primary-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-primary-500" />
              )}
            </button>

            {/* Logo Mobile con enlace */}
            <Link href="/about" className="flex-1 flex items-center justify-center gap-3 group">
              <Image
                src="/logos/logo.png"
                alt="La Feria Logo"
                width={64}
                height={64}
                className="w-16 h-16 transition-transform duration-200 group-hover:scale-105"
                priority
              />
              <h1 className="text-2xl font-bold transition-colors duration-200">
                <span className="text-brand-teal-500 group-hover:text-brand-teal-600">La</span>{' '}
                <span className="text-primary-500 group-hover:text-primary-600">Feria</span>
              </h1>
            </Link>

            {/* Botón Usuario - Móvil */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleUserAction()
                }}
                disabled={loading}
                className={`p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative ${
                  isAuthenticated ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={getUserButtonText()}
              >
                {isAuthenticated ? (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {getUserInitials()}
                    </span>
                  </div>
                ) : (
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                {isAuthenticated && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                )}
              </button>

              {/* Dropdown menú móvil mejorado */}
              {isAuthenticated && showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  {/* Header del menú */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {userData?.firstName} {userData?.lastName}
                        </p>
                        <p className="text-xs text-white/80 truncate">
                          {userData?.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                            Administrador
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Opciones del menú */}
                  <div className="py-2 max-h-96 overflow-y-auto">
                    {finalUserMenuSections.map((section, idx) => (
                      <div key={idx} className={idx > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}>
                        <div className="px-4 py-2">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {section.section}
                          </p>
                        </div>
                        {section.items.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleNavigation(item.href)
                              }}
                              onTouchEnd={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleNavigation(item.href)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group active:bg-gray-100 dark:active:bg-gray-600"
                              style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                              <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors pointer-events-none">
                                <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div className="flex-1 min-w-0 text-left pointer-events-none">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.label}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {item.description}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 pointer-events-none" />
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Footer con logout */}
                  <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group rounded-lg"
                    >
                      <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                        <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          Cerrar sesión
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-500">
                          Salir de tu cuenta
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTAs móviles integrados - Solo para usuarios no autenticados */}
          {!isAuthenticated && !loading && (
            <div className="flex items-center justify-between mb-4 px-1">
              <button
                onClick={handleNewUser}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors font-medium"
              >
                <HelpCircle className="w-4 h-4" />
                ¿Eres nuevo?
              </button>

              <button
                onClick={handleCreateStore}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Crear tienda
              </button>
            </div>
          )}

          {/* Chat con Mily - Móvil */}
          <ChatWithMily />
        </div>
      </header>

      {/* Header Desktop */}
      <header className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-8">
            {/* Logo Desktop con enlace */}
            <Link href="/about" className="flex items-center flex-shrink-0 gap-4 group">
              <Image
                src="/logos/logo.png"
                alt="La Feria Logo"
                width={112}
                height={112}
                className="w-28 h-28 transition-transform duration-200 group-hover:scale-105"
                priority
              />
              <h1 className="text-3xl xl:text-4xl font-bold transition-colors duration-200">
                <span className="text-brand-teal-500 group-hover:text-brand-teal-600">La</span>{' '}
                <span className="text-primary-500 group-hover:text-primary-600">Feria</span>
              </h1>
            </Link>

            {/* Chat con Mily - Desktop */}
            <div className="flex-1 max-w-2xl mx-8">
              <ChatWithMily />
            </div>

            {/* Acciones Desktop */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                aria-label="Cambiar modo"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500 transition-all duration-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500 transition-all duration-300" />
                )}
              </button>

              {/* Botón Usuario Desktop */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUserAction()
                  }}
                  disabled={loading}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-semibold text-white">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div className="text-left hidden xl:block">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {userData?.firstName || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isAdmin ? 'Administrador' : 'Mi cuenta'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {getUserButtonText()}
                      </span>
                    </>
                  )}
                  {isAuthenticated && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  )}
                </button>

                {/* Dropdown menú desktop mejorado */}
                {isAuthenticated && showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    {/* Header del menú */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {getUserInitials()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">
                            {userData?.firstName} {userData?.lastName}
                          </p>
                          <p className="text-xs text-white/80 truncate">
                            {userData?.email}
                          </p>
                          {isAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                              Administrador
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Opciones del menú */}
                    <div className="py-2 max-h-96 overflow-y-auto">
                      {finalUserMenuSections.map((section, idx) => (
                        <div key={idx} className={idx > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}>
                          <div className="px-4 py-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {section.section}
                            </p>
                          </div>
                          {section.items.map((item) => {
                            const Icon = item.icon
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleNavigation(item.href)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                              >
                                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors pointer-events-none">
                                  <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="flex-1 min-w-0 text-left pointer-events-none">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.label}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {item.description}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Footer con logout */}
                    <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group rounded-lg"
                      >
                        <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                          <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            Cerrar sesión
                          </p>
                          <p className="text-xs text-red-500 dark:text-red-500">
                            Salir de tu cuenta
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}