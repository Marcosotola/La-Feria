// src/components/layout/DesktopNavigation.js
'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Home, Heart, Grid3X3, Package, Briefcase, ChevronLeft,
  ChevronRight, User, LogOut, Store, ShoppingBag, Star,
  MessageSquare, Users, LayoutDashboard, Settings, ChevronDown, Shield
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CATEGORIAS_PRODUCTOS, CATEGORIAS_SERVICIOS, CATEGORIAS_EMPLEO } from '@/types'
import { 
  productIconMap, 
  serviceIconMap, 
  employmentIconMap, 
  categoryColors 
} from '@/constants/categoryUI'
import Link from 'next/link'
import Image from 'next/image'

export default function DesktopNavigation() {
  // TODOS LOS HOOKS PRIMERO
  const { isAuthenticated, loading, user, userData, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showSubcategories, setShowSubcategories] = useState(false)
  const dropdownRef = useRef(null)

  // DESPUÉS DE LOS HOOKS, LAS CONDICIONES
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  const isAdmin = userData?.role === 'admin'

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
        setSelectedCategory(null)
        setShowSubcategories(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    {
      id: 'home',
      label: 'Inicio',
      icon: Home,
      href: '/'
    },
    {
      id: 'ferias',
      label: 'Ferias',
      href: '/ferias'
    },
    {
      id: 'productos',
      label: 'Productos',
      icon: Package,
      href: '/productos',
      hasDropdown: true,
      categories: Object.values(CATEGORIAS_PRODUCTOS || {}),
      type: 'productos'
    },
    {
      id: 'servicios',
      label: 'Servicios',
      icon: Grid3X3,
      href: '/servicios',
      hasDropdown: true,
      categories: Object.values(CATEGORIAS_SERVICIOS || {}),
      type: 'servicios'
    },
    {
      id: 'empleos',
      label: 'Empleos',
      icon: Briefcase,
      href: '/empleos',
      hasDropdown: true,
      categories: Object.values(CATEGORIAS_EMPLEO || {}),
      type: 'empleos'
    },
    {
      id: 'stores',
      label: 'Tiendas',
      icon: Store,
      href: '/tiendas'
    }
  ]

  const userItem = isAuthenticated 
    ? {
        id: 'user',
        label: userData?.firstName || 'Cuenta',
        icon: User,
        href: '/dashboard',
        hasDropdown: true
      }
    : null

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

  const handleNavClick = (item) => {
    // Si tiene dropdown (productos, servicios, empleos, user)
    if (item.hasDropdown) {
      setActiveDropdown(activeDropdown === item.id ? null : item.id)
      setSelectedCategory(null)
      setShowSubcategories(false)
      return
    }

    // Para items sin dropdown, navegar directamente
    if (item.href) {
      router.push(item.href)
      setActiveDropdown(null)
    }
  }

  const handleCategoryClick = (category, itemType, itemHref) => {
    if (category.subcategorias && Object.keys(category.subcategorias).length > 0) {
      setSelectedCategory({ ...category, itemType, itemHref })
      setShowSubcategories(true)
    } else {
      handleNavigate(itemType, category.id, null)
    }
  }

  const handleSubcategoryClick = (subcategoria) => {
    handleNavigate(selectedCategory.itemType, selectedCategory.id, subcategoria)
  }

  const handleNavigate = (type, categoryId, subcategoria) => {
    console.log('Navegando a:', { type, categoryId, subcategoria })
    setActiveDropdown(null)
    setSelectedCategory(null)
    setShowSubcategories(false)
    
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
  }

  const handleViewAll = (href) => {
    router.push(href)
    setActiveDropdown(null)
    setSelectedCategory(null)
    setShowSubcategories(false)
  }

  const handleBackToMain = () => {
    setShowSubcategories(false)
    setSelectedCategory(null)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setActiveDropdown(null)
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleUserMenuNavigation = (href) => {
    router.push(href)
    setActiveDropdown(null)
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

  // No mostrar en rutas de dashboard
  if (isDashboardRoute) {
    return null
  }

  const renderCategoriesDropdown = (item) => {
    const ItemIcon = item.icon

    // Vista de subcategorías
    if (showSubcategories && selectedCategory) {
      return (
        <div className="w-80">
          {/* Header con botón de volver */}
          <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBackToMain}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {selectedCategory.nombre}
            </h3>
          </div>

          {/* Lista de subcategorías */}
          <div className="p-2 max-h-96 overflow-y-auto">
            {Object.entries(selectedCategory.subcategorias).map(([key, value]) => {
              const categoryColor = categoryColors[selectedCategory.id] || 'from-brand-teal-500 to-brand-teal-600';
              return (
                <button
                  key={key}
                  onClick={() => handleSubcategoryClick(value)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-left group"
                >
                  <div className={`w-2 h-2 bg-gradient-to-br ${categoryColor} rounded-full flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1">
                    {getSubcategoryName(key)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      )
    }

    // Vista principal de categorías
    return (
      <div className="w-80">
        {/* Ver todos */}
        <div className="p-2">
          <button
            onClick={() => handleViewAll(item.href)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-all duration-200 text-left group mb-2"
          >
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ItemIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-primary-700 dark:text-primary-300 text-sm leading-tight">
                Ver todos los {item.label}
              </h4>
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">
                Explorar todas las categorías
              </p>
            </div>
          </button>

          {/* Lista de categorías */}
          <div className="max-h-96 overflow-y-auto space-y-1">
            {item.categories?.map((category) => {
              const hasSubcategories = category.subcategorias && Object.keys(category.subcategorias).length > 0
              const subcategoriesCount = hasSubcategories ? Object.keys(category.subcategorias).length : 0
              
              // Obtener icono y color específico
              const iconMaps = {
                productos: productIconMap,
                servicios: serviceIconMap,
                empleos: employmentIconMap
              };
              const SpecificIcon = iconMaps[item.type]?.[category.id] || ItemIcon;
              const categoryColor = categoryColors[category.id] || 'from-gray-400 to-gray-500';

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category, item.type, item.href)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-left group"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${categoryColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                    <SpecificIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight group-hover:text-gray-900 dark:group-hover:text-white">
                      {category.nombre}
                    </h4>
                    {hasSubcategories && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {subcategoriesCount} subcategorías
                      </p>
                    )}
                  </div>
                  {hasSubcategories && (
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderUserDropdown = () => {
    return (
      <div className="w-80 p-3">
        {/* Header del usuario */}
        <div className="bg-gradient-to-r from-brand-teal-600 to-brand-teal-800 rounded-xl p-3 shadow-lg mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-white">
                {getUserInitials()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-white text-sm leading-tight">
                {userData?.firstName} {userData?.lastName}
              </h4>
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

        {/* Secciones del menú */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {finalUserMenuSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-2 py-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.section}
                </p>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleUserMenuNavigation(item.href)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-left group"
                    >
                      <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-teal-50 dark:group-hover:bg-brand-teal-900/40 transition-colors">
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-400" />
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
            className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 text-left group border border-red-200 dark:border-red-800"
          >
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 dark:group-hover:bg-red-900/60 transition-colors">
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
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
      </div>
    )
  }

  return (
    <nav className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between" ref={dropdownRef}>
          {/* Navegación principal - Izquierda */}
          <div className="flex items-center">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeDropdown === item.id
              
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => handleNavClick(item)}
                    className={`
                      flex items-center gap-2 py-4 px-4 text-sm font-medium transition-all duration-200 relative cursor-pointer
                      ${isActive 
                        ? 'text-brand-teal-500 dark:text-brand-teal-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-brand-teal-500 dark:hover:text-brand-teal-400'
                      }
                    `}
                  >
                    {item.id === 'ferias' ? (
                      <div className="relative w-5 h-5">
                        <Image
                          src="/icon.png"
                          alt="Ferias"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
                    )}
                    
                    {/* Indicador de activo */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal-500 dark:bg-brand-teal-400" />
                    )}
                  </button>

                  {/* Dropdown */}
                  {isActive && item.hasDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      {(item.id === 'productos' || item.id === 'servicios' || item.id === 'empleos') && renderCategoriesDropdown(item)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sección derecha - Usuario o Registro */}
          <div className="flex items-center gap-4">
            {isAuthenticated && userItem ? (
              <div className="relative">
                <button
                  onClick={() => handleNavClick(userItem)}
                  className={`
                    flex items-center gap-2 py-4 px-4 text-sm font-medium transition-all duration-200 relative cursor-pointer
                    ${activeDropdown === 'user'
                      ? 'text-brand-teal-500 dark:text-brand-teal-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-brand-teal-500 dark:hover:text-brand-teal-400'
                    }
                  `}
                >
                  <User className="w-4 h-4" />
                  <span>{userItem.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                  
                  {/* Indicador de activo */}
                  {activeDropdown === 'user' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal-500 dark:bg-brand-teal-400" />
                  )}
                </button>

                {/* Dropdown de usuario */}
                {activeDropdown === 'user' && (
                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    {renderUserDropdown()}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/register')}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              >
                <Store className="w-4 h-4" />
                <span className="text-sm">¿Eres nuevo? Crea tu tienda aquí</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}