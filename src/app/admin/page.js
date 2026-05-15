// src/app/admin/page.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, ShoppingBag, Wrench, Briefcase,
  Star, MessageSquare, TrendingUp,
  Activity, MapPin, Store
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function AdminDashboard() {
  const { isAuthenticated, userData, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFairs: 0,
    totalStores: 0,
    totalProducts: 0,
    totalServices: 0,
    totalJobs: 0,
    totalReviews: 0,
    totalNotifications: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    if (!loading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      
      const [users, fairs, products, services, jobs, reviews, notifications] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'ferias')),
        getDocs(collection(db, 'productos')),
        getDocs(collection(db, 'servicios')),
        getDocs(collection(db, 'empleos')),
        getDocs(collection(db, 'comentarios')),
        getDocs(collection(db, 'notifications'))
      ]);

      // Tiendas = usuarios con storeSlug configurado
      const storesCount = users.docs.filter(d => d.data().storeSlug).length;

      setStats({
        totalUsers: users.size,
        totalFairs: fairs.size,
        totalStores: storesCount,
        totalProducts: products.size,
        totalServices: services.size,
        totalJobs: jobs.size,
        totalReviews: reviews.size,
        totalNotifications: notifications.size
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || !isAuthenticated || !userData || !isAdmin) {
    return null;
  }

  const statCards = [
    { title: 'Usuarios',      value: stats.totalUsers,        icon: Users,        color: 'indigo', href: '/admin/usuarios'   },
    { title: 'Ferias',        value: stats.totalFairs,        icon: MapPin,       color: 'orange', href: '/admin/ferias'     },
    { title: 'Tiendas',       value: stats.totalStores,       icon: Store,        color: 'teal',   href: '/admin/tiendas'    },
    { title: 'Productos',     value: stats.totalProducts,     icon: ShoppingBag,  color: 'green',  href: '/admin/productos'  },
    { title: 'Servicios',     value: stats.totalServices,     icon: Wrench,       color: 'blue',   href: '/admin/servicios'  },
    { title: 'Empleos',       value: stats.totalJobs,         icon: Briefcase,    color: 'purple', href: '/admin/empleos'    },
    { title: 'Reseñas',       value: stats.totalReviews,      icon: Star,         color: 'pink',   href: '/admin/comentarios'},
    { title: 'Notificaciones',value: stats.totalNotifications,icon: MessageSquare,color: 'cyan',   href: '/admin/mensajeria' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      indigo:  'bg-indigo-100  dark:bg-indigo-900/20  text-indigo-600  dark:text-indigo-400',
      green:   'bg-green-100   dark:bg-green-900/20   text-green-600   dark:text-green-400',
      blue:    'bg-blue-100    dark:bg-blue-900/20    text-blue-600    dark:text-blue-400',
      purple:  'bg-purple-100  dark:bg-purple-900/20  text-purple-600  dark:text-purple-400',
      pink:    'bg-pink-100    dark:bg-pink-900/20    text-pink-600    dark:text-pink-400',
      cyan:    'bg-cyan-100    dark:bg-cyan-900/20    text-cyan-600    dark:text-cyan-400',
      orange:  'bg-orange-100  dark:bg-orange-900/20  text-orange-600  dark:text-orange-400',
      teal:    'bg-teal-100    dark:bg-teal-900/20    text-teal-600    dark:text-teal-400'
    };
    return colors[color];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido, {userData?.firstName || 'Administrador'}. Aquí tienes un resumen de la plataforma.
        </p>
      </div>

      {/* Estadísticas */}
      {loadingStats ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
            {statCards.map((stat) => (
              <button
                key={stat.title}
                onClick={() => router.push(stat.href)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-left"
              >
                <div className={`w-9 h-9 rounded-lg ${getColorClasses(stat.color)} flex items-center justify-center mb-2`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">
                  {loadingStats ? '–' : stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {stat.title}
                </p>
              </button>
            ))}
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resumen de Actividad
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Accesos Rápidos
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/admin/usuarios')}
                    className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Gestionar Usuarios
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.totalUsers} usuarios registrados
                    </p>
                  </button>
                  
                  <button
                    onClick={() => router.push('/admin/mensajeria')}
                    className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Enviar Notificación
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Comunicación masiva
                    </p>
                  </button>

                  <button
                    onClick={() => router.push('/admin/ferias')}
                    className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Gestionar Ferias
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.totalFairs} ferias publicadas
                    </p>
                  </button>
                  <button
                    onClick={() => router.push('/admin/comentarios')}
                    className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Moderar Reseñas
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.totalReviews} reseñas totales
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Contenido Publicado
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Tiendas',   value: stats.totalStores,    icon: Store,       color: 'text-teal-600 dark:text-teal-400',   href: '/admin/tiendas'   },
                    { label: 'Productos', value: stats.totalProducts,  icon: ShoppingBag, color: 'text-green-600 dark:text-green-400', href: '/admin/productos' },
                    { label: 'Servicios', value: stats.totalServices,  icon: Wrench,      color: 'text-blue-600 dark:text-blue-400',   href: '/admin/servicios' },
                    { label: 'Empleos',   value: stats.totalJobs,      icon: Briefcase,   color: 'text-purple-600 dark:text-purple-400',href: '/admin/empleos'  },
                  ].map(({ label, value, icon: Icon, color, href }) => (
                    <button
                      key={label}
                      onClick={() => router.push(href)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}