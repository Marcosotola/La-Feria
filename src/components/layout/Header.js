// src/components/layout/Header.js
'use client'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import {
  User, Moon, Sun, Plus, HelpCircle, LogOut,
  LayoutDashboard, Heart, Star, Store, Briefcase,
  ChevronRight, Shield, MapPin, Share2, Download, X
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ChatWithMily from '@/components/chat/ChatWithMily'
import AuthGateModal from '@/components/auth/AuthGateModal'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, loading, userData, signOut } = useAuth()
  const mobileMenuRef = useRef(null)
  const desktopMenuRef = useRef(null)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  // PWA install
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true)
    window.addEventListener('appinstalled', () => { setIsInstalled(true); setInstallPrompt(null) })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Cerrar al click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      const mobile = mobileMenuRef.current
      const desktop = desktopMenuRef.current
      if (
        (mobile && !mobile.contains(e.target)) &&
        (desktop && !desktop.contains(e.target))
      ) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const isAdmin = userData?.role === 'admin'
  const isOrganizer = isAdmin || userData?.role === 'organizer'

  const toggleDarkMode = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const handleUserAction = () => {
    if (loading) return
    if (isAuthenticated) setShowUserMenu(v => !v)
    else setShowAuthGate(true)
  }

  const handleLogout = async () => {
    try { await signOut() } catch {}
    setShowUserMenu(false)
    router.push('/')
  }

  const handleNav = (href) => {
    setShowUserMenu(false)
    router.push(href)
  }

  const handleShare = async () => {
    const url = window.location.origin
    if (navigator.share) {
      try {
        await navigator.share({ title: 'La Feria', text: 'Encontrá ferias, tiendas y productos cerca tuyo', url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') { setInstallPrompt(null); setIsInstalled(true) }
  }

  const getUserInitials = () => {
    if (userData?.firstName && userData?.lastName)
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()
    if (userData?.firstName) return userData.firstName[0].toUpperCase()
    if (userData?.email) return userData.email[0].toUpperCase()
    return 'U'
  }

  const menuItems = [
    { id: 'dashboard', label: 'Mi Cuenta',  desc: 'Panel principal',          icon: LayoutDashboard, href: '/dashboard',           color: 'purple', show: true       },
    { id: 'ferias',    label: 'Mi Feria',   desc: 'Gestionar tus ferias',     icon: MapPin,          href: '/dashboard/organizer', color: 'orange', show: isOrganizer },
    { id: 'store',     label: 'Mi Tienda',  desc: 'Tu espacio de ventas',     icon: Store,           href: '/dashboard/store',     color: 'teal',   show: true       },
    { id: 'empleos',   label: 'Empleos',    desc: 'Publicar y buscar empleo', icon: Briefcase,       href: '/dashboard/empleos',   color: 'teal',   show: true       },
    { id: 'favorites', label: 'Favoritos',  desc: 'Lo que guardaste',         icon: Heart,           href: '/dashboard/favorites', color: 'pink',   show: true       },
    { id: 'reviews',   label: 'Reseñas',   desc: 'Tus comentarios',          icon: Star,            href: '/dashboard/reviews',   color: 'yellow', show: true       },
  ].filter(i => i.show)

  const iconColors = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    teal:   'bg-teal-100   dark:bg-teal-900/30   text-teal-600   dark:text-teal-400',
    pink:   'bg-pink-100   dark:bg-pink-900/30   text-pink-600   dark:text-pink-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  }

  // Avatar: foto si existe, sino iniciales
  const Avatar = ({ size = 'sm' }) => {
    const s = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-base'
    return userData?.profileImage ? (
      <img src={userData.profileImage} alt="" className={`${s} rounded-lg object-cover`} />
    ) : (
      <div className={`${s} bg-gradient-to-br from-brand-teal-400 to-brand-teal-600 rounded-lg flex items-center justify-center shadow-sm`}>
        <span className="font-bold text-white leading-none">{getUserInitials()}</span>
      </div>
    )
  }

  // Avatar para el header del dropdown (circular, más grande)
  const AvatarLg = () => userData?.profileImage ? (
    <img src={userData.profileImage} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/30" />
  ) : (
    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
      <span className="text-lg font-bold text-white">{getUserInitials()}</span>
    </div>
  )

  // Dropdown compartido entre mobile y desktop
  const UserDropdown = () => (
    <div className="w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

      {/* Cabecera */}
      <div className="bg-gradient-to-r from-brand-teal-600 to-brand-teal-800 p-4">
        <div className="flex items-center gap-3">
          <AvatarLg />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {userData?.firstName} {userData?.lastName}
            </p>
            <p className="text-xs text-white/75 truncate">{userData?.email || userData?.phone}</p>
          </div>
          <button onClick={() => setShowUserMenu(false)} className="text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel Admin — solo admins */}
      {isAdmin && (
        <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
          <button
            onClick={() => handleNav('/admin')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
          >
            <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-black text-red-700 dark:text-red-400">Panel Admin</p>
              <p className="text-xs text-red-500 dark:text-red-500">Gestión de la plataforma</p>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {/* Items de navegación */}
      <div className="py-1.5 px-2">
        {menuItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.href)}
              onTouchEnd={(e) => { e.preventDefault(); handleNav(item.href) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColors[item.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left pointer-events-none">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            </button>
          )
        })}
      </div>

      {/* Compartir e Instalar */}
      <div className="px-2 pb-1.5 border-t border-gray-100 dark:border-gray-700 pt-1.5">
        <button
          onClick={handleShare}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Compartir la app</p>
            <p className="text-xs text-gray-400">Invitá a amigos</p>
          </div>
        </button>

        {!isInstalled && (
          <button
            onClick={installPrompt ? handleInstall : undefined}
            disabled={!installPrompt}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Instalar la app</p>
              <p className="text-xs text-gray-400">{installPrompt ? 'Agregar al inicio' : 'Ya instalada o no disponible'}</p>
            </div>
          </button>
        )}
      </div>

      {/* Cerrar sesión */}
      <div className="px-2 pb-2 border-t border-gray-100 dark:border-gray-700 pt-1.5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
        >
          <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
            <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Cerrar sesión</p>
            <p className="text-xs text-red-400 dark:text-red-500">Salir de tu cuenta</p>
          </div>
        </button>
      </div>
    </div>
  )

  if (!mounted) return null

  return (
    <>
      {/* ── MOBILE ── */}
      <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">

            {/* Dark mode */}
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

            {/* Logo */}
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
                <div className="w-8 h-1.5 bg-black/10 dark:bg-black/30 blur-[3px] rounded-[100%] mt-[-2px] transition-all duration-300 group-hover:scale-125 group-hover:bg-black/5 group-hover:blur-[4px]" />
              </div>
              <h1 className="text-3xl font-black transition-all duration-300 tracking-tighter relative group-hover:scale-105">
                <span className="text-brand-teal-700 dark:text-brand-teal-400 drop-shadow-[0_4px_3px_rgba(0,0,0,0.1)]">La</span>{' '}
                <span className="text-primary-500 dark:text-primary-400 drop-shadow-[0_4px_3px_rgba(0,0,0,0.1)]">Feria</span>
              </h1>
            </Link>

            {/* Avatar mobile */}
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); handleUserAction() }}
                disabled={loading}
                className={`w-12 h-12 flex items-center justify-center rounded-xl bg-accent-600 dark:bg-accent-700 border border-accent-700 dark:border-accent-800 shadow-sm active:scale-95 transition-all overflow-hidden ${
                  isAuthenticated ? 'border-brand-teal-400 dark:border-brand-teal-600 ring-2 ring-accent-500/20 p-0.5' : ''
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Mi cuenta"
              >
                {isAuthenticated ? (
                  <>
                    <Avatar size="sm" />
                    <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                  </>
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </button>

              {isAuthenticated && showUserMenu && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <UserDropdown />
                </div>
              )}
            </div>
          </div>

          {/* CTA no autenticado */}
          {!isAuthenticated && !loading && (
            <div className="mb-4">
              <button
                onClick={() => router.push('/register')}
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

          <ChatWithMily />
        </div>
      </header>

      {/* ── DESKTOP ── */}
      <header className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-8">

            {/* Logo */}
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
                <div className="w-16 h-2 bg-black/10 dark:bg-black/30 blur-[4px] rounded-[100%] mt-[-4px] transition-all duration-300 group-hover:scale-110 group-hover:bg-black/5 group-hover:blur-[6px]" />
              </div>
              <h1 className="text-4xl xl:text-5xl font-black transition-all duration-300 tracking-tighter relative group-hover:scale-105">
                <span className="text-brand-teal-600 dark:text-brand-teal-400 drop-shadow-[0_5px_4px_rgba(0,0,0,0.12)]">La</span>{' '}
                <span className="text-primary-500 dark:text-primary-400 drop-shadow-[0_5px_4px_rgba(0,0,0,0.12)]">Feria</span>
              </h1>
            </Link>

            {/* Chat Mily */}
            <div className="flex-1 max-w-2xl mx-8">
              <ChatWithMily />
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={toggleDarkMode}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-accent-600 dark:bg-accent-700 border border-accent-700 dark:border-accent-800 hover:bg-accent-500 dark:hover:bg-accent-600 shadow-sm transition-all group"
                aria-label="Cambiar modo"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                ) : (
                  <Moon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                )}
              </button>

              {/* Avatar desktop */}
              <div className="relative" ref={desktopMenuRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleUserAction() }}
                  disabled={loading}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl bg-accent-600 dark:bg-accent-700 border border-accent-700 dark:border-accent-800 hover:bg-accent-500 dark:hover:bg-accent-600 shadow-sm transition-all overflow-hidden ${
                    isAuthenticated ? 'border-brand-teal-400 dark:border-brand-teal-600 ring-2 ring-accent-500/20 p-0.5' : ''
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isAuthenticated ? (
                    <>
                      <Avatar size="sm" />
                      <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                    </>
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </button>

                {isAuthenticated && showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <UserDropdown />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay menú usuario */}
      {showUserMenu && (
        <div
          className="fixed inset-0 bg-black/10 dark:bg-black/30 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Modal de acceso */}
      {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}
    </>
  )
}
