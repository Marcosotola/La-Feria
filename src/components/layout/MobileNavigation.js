// src/components/layout/MobileNavigation.js

'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Home, Heart, Grid3X3, X, Package, Briefcase, ChevronLeft,
  ChevronRight, User, LogOut, Store, ShoppingBag, Star,
  MessageSquare, Users, LayoutDashboard, Settings, Shield
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CATEGORIAS_PRODUCTOS, CATEGORIAS_SERVICIOS, CATEGORIAS_EMPLEO } from '@/types'
import { 
  productIconMap, 
  serviceIconMap, 
  employmentIconMap, 
  mainCategoryColors,
  categoryColors 
} from '@/constants/categoryUI'
import Link from 'next/link'
import Image from 'next/image'

export default function MobileNavigation() {
  // TODOS LOS HOOKS PRIMERO - SIEMPRE EN EL MISMO ORDEN
  const { isAuthenticated, loading, user, userData, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('home')
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedMainCategory, setSelectedMainCategory] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showSubcategories, setShowSubcategories] = useState(false)

  // Sincronizar pestaña activa con la ruta actual
  useEffect(() => {
    if (!pathname) return

    if (pathname === '/') {
      setActiveTab('home')
    } else if (pathname.startsWith('/ferias')) {
      setActiveTab('ferias')
    } else if (pathname.startsWith('/categorias') || pathname.startsWith('/productos') || pathname.startsWith('/servicios') || pathname.startsWith('/empleos')) {
      setActiveTab('categories')
    } else if (pathname.startsWith('/tiendas')) {
      setActiveTab('stores')
    } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) {
      setActiveTab('user')
    }
  }, [pathname])

  // DESPUÉS DE LOS HOOKS, LAS CONDICIONES
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  const isAdmin = userData?.role === 'admin'

  const navItems = [
    {
      id: 'home',
      label: 'Inicio',
      icon: Home,
      href: '/'
    },
    {
      id: 'categories',
      label: 'Explorar',
      icon: Grid3X3,
      href: '/categorias',
      hasModal: true
    },
    {
      id: 'ferias',
      label: 'Ferias',
      href: '/ferias',
      isCenter: true
    },
    {
      id: 'stores',
      label: 'Tiendas',
      icon: Store,
      href: '/tiendas'
    },
    {
      id: 'user',
      label: isAuthenticated ? 'Cuenta' : 'Entrar',
      icon: User,
      href: isAuthenticated ? '/dashboard' : '/login',
      hasModal: isAuthenticated
    }
  ]

  const categoryGroups = [
    {
      title: 'Productos',
      categories: Object.values(CATEGORIAS_PRODUCTOS || {}),
      type: 'productos',
      icon: Package,
      description: 'Compra y vende productos',
      href: '/productos'
    },
    {
      title: 'Servicios',
      categories: Object.values(CATEGORIAS_SERVICIOS || {}),
      type: 'servicios',
      icon: Grid3X3,
      description: 'Encuentra servicios profesionales',
      href: '/servicios'
    },
    {
      title: 'Empleos',
      categories: Object.values(CATEGORIAS_EMPLEO || {}),
      type: 'empleos',
      icon: Briefcase,
      description: 'Busca oportunidades laborales',
      href: '/empleos'
    }
  ]

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
          description: 'Vista general',
          color: 'purple'
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
          description: 'Información personal',
          color: 'blue'
        },
        {
          id: 'favorites',
          label: 'Favoritos',
          icon: Heart,
          href: '/dashboard/favorites',
          description: 'Productos guardados',
          color: 'pink'
        },
        {
          id: 'reviews',
          label: 'Reseñas',
          icon: Star,
          href: '/dashboard/reviews',
          description: 'Tus comentarios',
          color: 'yellow'
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
          description: 'Gestiona tu negocio',
          color: 'orange'
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
        description: 'Gestión del sistema',
        color: 'indigo'
      }
    ]
  }

  // Si es admin, agregar opciones de admin
  const finalUserMenuSections = isAdmin
    ? [...userMenuSections, adminMenuSection]
    : userMenuSections

  const handleTabClick = (itemId) => {
    if (itemId === 'categories') {
      setShowCategoriesModal(true)
      setSelectedMainCategory(null)
      setSelectedCategory(null)
      setShowSubcategories(false)
      return
    }

    if (itemId === 'user' && isAuthenticated) {
      setShowUserModal(true)
      return
    }

    if (itemId === 'stores') {
      router.push('/tiendas')
      setActiveTab(itemId)
      return
    }

    if (itemId === 'ferias') {
      router.push('/ferias')
      setActiveTab(itemId)
      return
    }

    const item = navItems.find(nav => nav.id === itemId)
    if (item && item.href) {
      router.push(item.href)
    }
    setActiveTab(itemId)
  }

  const handleMainCategoryClick = (categoryGroup) => {
    setSelectedMainCategory(categoryGroup)
    setSelectedCategory(null)
    setShowSubcategories(false)
  }

  const handleCategoryClick = (category) => {
    if (category.subcategorias && Object.keys(category.subcategorias).length > 0) {
      setSelectedCategory(category)
      setShowSubcategories(true)
    } else {
      handleNavigate(selectedMainCategory.type, category.id, null)
    }
  }

  const handleSubcategoryClick = (subcategoria) => {
    handleNavigate(selectedMainCategory.type, selectedCategory.id, subcategoria)
  }

  const handleNavigate = (type, categoryId, subcategoria) => {
    console.log('Navegando a:', { type, categoryId, subcategoria })
    
    // Construir la URL con los parámetros apropiados
    let url = `/${type}`
    const params = new URLSearchParams()
    
    if (categoryId) {
      params.append('categoria', categoryId)
    }
    if (subcategoria) {
      params.append('subcategoria', subcategoria)
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    
    router.push(url)
    
    setShowCategoriesModal(false)
    setSelectedMainCategory(null)
    setSelectedCategory(null)
    setShowSubcategories(false)
  }

  const handleViewAll = (href) => {
    router.push(href)
    setShowCategoriesModal(false)
    setSelectedMainCategory(null)
    setSelectedCategory(null)
    setShowSubcategories(false)
  }

  const handleBackToMain = () => {
    if (showSubcategories) {
      setShowSubcategories(false)
      setSelectedCategory(null)
    } else {
      setSelectedMainCategory(null)
    }
  }

  const handleCloseModal = () => {
    setShowCategoriesModal(false)
    setShowUserModal(false)
    setSelectedMainCategory(null)
    setSelectedCategory(null)
    setShowSubcategories(false)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setShowUserModal(false)
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleUserMenuNavigation = (href) => {
    router.push(href)
    setShowUserModal(false)
  }

  const getSubcategoryName = (subcategoriaKey) => {
    return subcategoriaKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
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

  const renderCategoriesModalContent = () => {
    if (showSubcategories && selectedCategory) {
      return (
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(selectedCategory.subcategorias).map(([key, value]) => {
            const categoryColor = categoryColors[selectedCategory.id] || 'from-brand-teal-500 to-brand-teal-600';
            return (
              <button
                key={key}
                onClick={() => handleSubcategoryClick(value)}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left w-full group cursor-pointer"
              >
                <div className={`w-3 h-3 bg-gradient-to-br ${categoryColor} rounded-full flex-shrink-0`}></div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight group-hover:text-gray-900 dark:group-hover:text-white">
                    {getSubcategoryName(key)}
                  </h4>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            );
          })}
        </div>
      )
    }

    if (selectedMainCategory) {
      return (
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => handleViewAll(selectedMainCategory.href)}
            className="flex items-center gap-3 p-4 rounded-xl bg-brand-teal-500/10 dark:bg-brand-teal-400/10 border-2 border-brand-teal-200 dark:border-brand-teal-800 hover:bg-brand-teal-100 dark:hover:bg-brand-teal-800/30 transition-all duration-200 text-left w-full group mb-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-brand-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <selectedMainCategory.icon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-brand-teal-700 dark:text-brand-teal-300 text-base leading-tight">
                Ver todos los {selectedMainCategory.title}
              </h4>
              <p className="text-xs text-brand-teal-600 dark:text-brand-teal-400 mt-1">
                Explorar todas las categorías
              </p>
            </div>
          </button>

          {selectedMainCategory.categories.map((category) => {
            const hasSubcategories = category.subcategorias && Object.keys(category.subcategorias).length > 0
            const subcategoriesCount = hasSubcategories ? Object.keys(category.subcategorias).length : 0
            
            // Obtener icono y color específico
            const iconMaps = {
              productos: productIconMap,
              servicios: serviceIconMap,
              empleos: employmentIconMap
            };
            const SpecificIcon = iconMaps[selectedMainCategory.type]?.[category.id] || selectedMainCategory.icon;
            const categoryColor = categoryColors[category.id] || 'from-gray-400 to-gray-500';

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left w-full group cursor-pointer"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${categoryColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                  <SpecificIcon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight group-hover:text-gray-900 dark:group-hover:text-white">
                    {category.nombre}
                  </h4>
                  {hasSubcategories && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {subcategoriesCount} subcategorías
                    </p>
                  )}
                </div>
                {hasSubcategories && (
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                )}
              </button>
            )
          })}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {categoryGroups.map((group) => {
          const IconComponent = group.icon
          const groupColor = mainCategoryColors[group.type] || 'from-gray-400 to-gray-500';

          return (
            <button
              key={group.type}
              onClick={() => handleMainCategoryClick(group)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-left group cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 shadow-sm"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${groupColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md`}>
                <IconComponent className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-0.5">
                  {group.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {group.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                   <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-gray-900 shadow-sm ${
                     group.type === 'productos' ? 'text-amber-600' : 
                     group.type === 'servicios' ? 'text-accent-600' : 'text-brand-teal-700'
                   }`}>
                    {group.categories.length} categorías
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  const renderUserModalContent = () => {
    return (
      <div className="space-y-4">
        {/* Header del usuario */}
        <div className="bg-gradient-to-r from-brand-teal-600 to-brand-teal-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-white">
                {getUserInitials()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-white text-base leading-tight">
                {userData?.firstName} {userData?.lastName}
              </h4>
              <p className="text-sm text-white/80 truncate">
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

        {/* Secciones del menú */}
        {finalUserMenuSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-2 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {section.section}
              </p>
            </div>
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleUserMenuNavigation(item.href)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-900/20 transition-all duration-200 text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-teal-100 dark:group-hover:bg-brand-teal-900/40 transition-colors">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-400">
                        {item.label}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-teal-500 flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 text-left group border border-red-200 dark:border-red-800 cursor-pointer"
        >
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 dark:group-hover:bg-red-900/60 transition-colors">
            <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-red-700 dark:text-red-400 text-sm leading-tight">
              Cerrar Sesión
            </h4>
            <p className="text-xs text-red-600 dark:text-red-500">
              Salir de tu cuenta
            </p>
          </div>
        </button>
      </div>
    )
  }

  const getModalTitle = () => {
    if (showUserModal) {
      return 'Mi Cuenta'
    }
    if (showSubcategories && selectedCategory) {
      return selectedCategory.nombre
    }
    if (selectedMainCategory) {
      return selectedMainCategory.title
    }
    return 'Categorías'
  }

  return (
    <>
      {/* Navegación móvil fija */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-teal-900 border-t border-brand-teal-800 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) * 0.8 + 8px)' }}>
        <div className="flex items-center justify-around h-16 px-2 relative">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            if (item.isCenter) {
              return (
                <div key={item.id} className="relative -mt-10 flex flex-col items-center">
                  <button
                    onClick={() => handleTabClick(item.id)}
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(232,97,60,0.2)]
                      bg-white dark:bg-gray-100
                      border-4 border-primary-500 active:scale-95 transition-all duration-300
                      group relative
                    `}
                    aria-label={item.label}
                  >
                    <div className="relative z-10 w-13 h-13 transition-transform duration-500 group-hover:scale-110">
                      <Image
                        src="/icon.png"
                        alt="La Feria"
                        fill
                        className="object-contain"
                      />
                    </div>
                    {/* Brillo sutil externo si está activo */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full ring-4 ring-primary-500/30 animate-pulse" />
                    )}
                  </button>
                  <span className={`
                    mt-1 text-[10px] font-bold uppercase tracking-wider
                    ${isActive ? 'text-primary-400' : 'text-white/60'}
                  `}>
                    {item.label}
                  </span>
                </div>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  relative flex flex-col items-center justify-center py-1 min-w-0 flex-1
                  transition-all duration-300 ease-out cursor-pointer
                  ${isActive
                    ? 'text-white scale-110'
                    : 'text-white/50 hover:text-white/80'
                  }
                `}
                aria-label={item.label}
              >
                <div className="relative mb-0.5 z-10">
                  <Icon className={`
                    w-6 h-6 transition-all duration-300
                    ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}
                  `} />
                </div>

                <span className={`
                  text-[10px] font-medium transition-all duration-300 z-10 relative truncate max-w-full
                  ${isActive ? 'font-bold opacity-100' : 'opacity-70'}
                `}>
                  {item.label}
                </span>
                
                {/* Indicador sutil para tabs activos no centrales */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Modal de Categorías o Usuario */}
      {(showCategoriesModal || showUserModal) && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/50 dark:bg-black/70" onClick={handleCloseModal}>
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
              <div className="flex items-center ">
                {(selectedMainCategory || showSubcategories) && !showUserModal && (
                  <button
                    onClick={handleBackToMain}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {getModalTitle()}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4 pb-8">
              {showUserModal ? renderUserModalContent() : renderCategoriesModalContent()}
            </div>

            {/* Safe area para dispositivos con notch */}
            <div className="safe-area-inset-bottom min-h-4" />
          </div>
        </div>
      )}

      {/* Spacer para compensar la navegación fija */}
      <div className="lg:hidden h-20" />
    </>
  )
}