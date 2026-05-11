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
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-accent-600 dark:bg-accent-700 border border-accent-700 dark:border-accent-800 shadow-sm active:scale-95 transition-all group"
              aria-label="Cambiar modo"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              )}
            </button>

            <Link href="/about" className="flex-1 flex items-center justify-center gap-3 group relative">
              <div className="relative flex flex-col items-center">
                <Image
                  src="/logos/logo.png"
                  alt="La Feria Logo"
                  width={64}
                  height={64}
                  className="w-16 h-16 relative z-10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 drop-shadow-sm"
                  priority
                />
                {/* Sombra de la base para efecto flotado */}
                <div className="w-8 h-1.5 bg-black/10 dark:bg-black/30 blur-[3px] rounded-[100%] mt-[-2px] transition-all duration-300 group-hover:scale-125 group-hover:bg-black/5 group-hover:blur-[4px]"></div>
              </div>
              <h1 className="text-3xl font-black transition-all duration-300 tracking-tighter relative group-hover:scale-105">
                <span className="text-brand-teal-700 dark:text-brand-teal-400 drop-shadow-[0_4px_3px_rgba(0,0,0,0.1)]">La</span>{' '}
                <span className="text-primary-500 dark:text-primary-400 drop-shadow-[0_4px_3px_rgba(0,0,0,0.1)]">Feria</span>
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
                className={`w-12 h-12 flex items-center justify-center rounded-xl bg-accent-600 dark:bg-accent-700 border border-accent-700 dark:border-accent-800 shadow-sm active:scale-95 transition-all ${
                  isAuthenticated ? 'border-brand-teal-400 dark:border-brand-teal-600 ring-2 ring-accent-500/20' : ''
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={getUserButtonText()}
              >
                {isAuthenticated ? (
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-teal-400 to-brand-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-white">
                      {getUserInitials()}
                    </span>
                  </div>
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
                {isAuthenticated && (
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                )}
              </button>

              {/* Dropdown menú móvil mejorado */}
              {isAuthenticated && showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  {/* Header del menú */}
                  <div className="bg-gradient-to-r from-brand-teal-600 to-brand-teal-800 p-4">
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
                              <div className="w-9 h-9 bg-brand-teal-50 dark:bg-brand-teal-900/20 rounded-lg flex items-center justify-center group-hover:bg-brand-teal-100 dark:group-hover:bg-brand-teal-900/40 transition-colors pointer-events-none">
                                <Icon className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
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

          {/* CTA móvil unificado - Solo para usuarios no autenticados */}
          {!isAuthenticated && !loading && (
            <div className="mb-4">
              <button
                onClick={handleCreateStore}
                className="w-full flex items-center justify-between bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-5 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-xl shadow-primary-500/40 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm">¿Eres nuevo por aquí?</span>
                </div>
                <div className="flex items-center gap-2 bg-white text-primary-600 px-4 py-1.5 rounded-xl shadow-sm">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-bold">Crear tienda</span>
                </div>
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
            {/* Logo Desktop con enlace - Efecto flotado */}
            <Link href="/about" className="flex items-center flex-shrink-0 gap-5 group relative">
              <div className="relative flex flex-col items-center">
                <Image
                  src="/logos/logo.png"
                  alt="La Feria Logo"
                  width={112}
                  height={112}
                  className="w-28 h-28 relative z-10 transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 drop-shadow-md"
                  priority
                />
                {/* Sombra de la base para efecto flotado */}
                <div className="w-16 h-2 bg-black/10 dark:bg-black/30 blur-[4px] rounded-[100%] mt-[-4px] transition-all duration-300 group-hover:scale-110 group-hover:bg-black/5 group-hover:blur-[6px]"></div>
              </div>
              <h1 className="text-4xl xl:text-5xl font-black transition-all duration-300 tracking-tighter relative group-hover:scale-105">
                <span className="text-brand-teal-600 dark:text-brand-teal-400 drop-shadow-[0_5px_4px_rgba(0,0,0,0.12)]">La</span>{' '}
                <span className="text-primary-500 dark:text-primary-400 drop-shadow-[0_5px_4px_rgba(0,0,0,0.12)]">Feria</span>
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
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-accent-600 dark:bg-accent-700 border border-accent-700 dark:border-accent-800 hover:bg-accent-500 dark:hover:bg-accent-600 shadow-sm transition-all group"
                title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                aria-label="Cambiar modo"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                ) : (
                  <Moon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
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
                  title={getUserButtonText()}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl bg-accent-600 dark:bg-accent-700 border border-accent-700 dark:border-accent-800 hover:bg-accent-500 dark:hover:bg-accent-600 shadow-sm transition-all ${
                    isAuthenticated ? 'border-brand-teal-400 dark:border-brand-teal-600 ring-2 ring-accent-500/20' : ''
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isAuthenticated ? (
                    <div className="w-9 h-9 bg-gradient-to-br from-brand-teal-400 to-brand-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-sm font-semibold text-white">
                        {getUserInitials()}
                      </span>
                    </div>
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                  {isAuthenticated && (
                    <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  )}
                </button>

                {/* Dropdown menú desktop mejorado */}
                {isAuthenticated && showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    {/* Header del menú */}
                    <div className="bg-gradient-to-r from-brand-teal-600 to-brand-teal-800 p-4">
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
                                <div className="w-9 h-9 bg-brand-teal-50 dark:bg-brand-teal-900/20 rounded-lg flex items-center justify-center group-hover:bg-brand-teal-100 dark:group-hover:bg-brand-teal-900/40 transition-colors pointer-events-none">
                                  <Icon className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
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