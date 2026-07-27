//app/productos/page.js

'use client'
import { useState, useEffect, Suspense } from 'react'
import { Search, Filter, Grid, List, MapPin } from 'lucide-react'
import {
  CONDICION_PRODUCTO
} from '@/types/product'
import { CATEGORIAS_PRODUCTOS } from '@/types/categories'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import ProductCard from '@/components/tienda/productos/ProductCard'

import { useSearchParams } from 'next/navigation'

function ProductosContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('categoria')

  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [vistaGrid, setVistaGrid] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: categoryParam || '',
    condicion: '',
    precioMin: '',
    precioMax: '',
    ordenar: 'recientes'
  })

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cargar productos desde Firebase
  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      setLoading(true)

      // Query base - solo productos disponibles
      let productosQuery = query(
        collection(db, 'productos'),
        where('estado', '==', 'disponible'),
        orderBy('fechaCreacion', 'desc'),
        limit(50) // Limitar a 50 productos inicialmente
      )

      const snapshot = await getDocs(productosQuery)
      const productosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setProductos(productosData)
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = (todosProductos) => {
    let resultado = [...todosProductos]

    // Filtro de búsqueda
    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(p =>
        (p.titulo && p.titulo.toLowerCase().includes(busquedaLower)) ||
        (p.nombre && p.nombre.toLowerCase().includes(busquedaLower)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(busquedaLower))
      )
    }

    // Filtro de categoría
    if (filtros.categoria) {
      resultado = resultado.filter(p => p.categoria === filtros.categoria)
    }

    // Filtro de condición
    if (filtros.condicion) {
      resultado = resultado.filter(p => p.condicion === filtros.condicion)
    }

    // Filtro de precio
    if (filtros.precioMin) {
      resultado = resultado.filter(p => p.precio >= Number(filtros.precioMin))
    }
    if (filtros.precioMax) {
      resultado = resultado.filter(p => p.precio <= Number(filtros.precioMax))
    }

    // Ordenamiento
    switch (filtros.ordenar) {
      case 'precio-asc':
        resultado.sort((a, b) => (a.precio || 0) - (b.precio || 0))
        break
      case 'precio-desc':
        resultado.sort((a, b) => (b.precio || 0) - (a.precio || 0))
        break
      case 'populares':
        resultado.sort((a, b) => (b.totalVistas || 0) - (a.totalVistas || 0))
        break
      case 'recientes':
      default:
        resultado.sort((a, b) => {
          const dateA = a.fechaCreacion?.toDate?.() || new Date(0)
          const dateB = b.fechaCreacion?.toDate?.() || new Date(0)
          return dateB - dateA
        })
        break
    }

    return resultado
  }

  const productosFiltrados = aplicarFiltros(productos)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Botones de vista */}
            <div className="flex gap-2">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filtros</span>
              </button>

              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setVistaGrid(true)}
                  className={`p-2 ${vistaGrid ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setVistaGrid(false)}
                  className={`p-2 ${!vistaGrid ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de filtros */}
          <FiltersSidebar
            filtros={filtros}
            setFiltros={setFiltros}
            mostrar={mostrarFiltros}
          />

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Resultados info */}
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-gray-600 dark:text-gray-400">
                {productosFiltrados.length} productos encontrados
              </p>

              <select
                value={filtros.ordenar}
                onChange={(e) => setFiltros({ ...filtros, ordenar: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="populares">Más populares</option>
              </select>
            </div>

            {/* Grid/Lista de productos */}
            {loading ? (
              <LoadingSkeleton vistaGrid={vistaGrid} />
            ) : productosFiltrados.length === 0 ? (
              <EmptyState />
            ) : (
              <div className={vistaGrid
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                : 'flex flex-col gap-4'
              }>
                {productosFiltrados.map(producto => (
                  <ProductCard
                    key={producto.id}
                    product={producto}
                    variant={vistaGrid ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 'featured-compact' : 'grid') : 'list'}
                    showContactInfo={true}
                    showStoreInfo={true}
                    onClick={() => window.location.href = `/tienda/${producto.tiendaInfo?.slug}/producto/${producto.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Filtros
function FiltersSidebar({ filtros, setFiltros, mostrar }) {
  if (!mostrar) return null

  return (
    <div className="lg:w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-fit lg:sticky lg:top-24">
      <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Filtros</h3>

      {/* Categoría */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categoría
        </label>
        <select
          value={filtros.categoria}
          onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todas las categorías</option>
          {Object.values(CATEGORIAS_PRODUCTOS).map(categoria => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Condición */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Condición
        </label>
        <select
          value={filtros.condicion}
          onChange={(e) => setFiltros({ ...filtros, condicion: e.target.value })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todas</option>
          <option value={CONDICION_PRODUCTO.NUEVO}>Nuevo</option>
          <option value={CONDICION_PRODUCTO.USADO}>Usado</option>
          <option value={CONDICION_PRODUCTO.REACONDICIONADO}>Reacondicionado</option>
          <option value={CONDICION_PRODUCTO.ARTESANAL}>Artesanal</option>
        </select>
      </div>

      {/* Rango de precio */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rango de precio
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={filtros.precioMin}
            onChange={(e) => setFiltros({ ...filtros, precioMin: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Máx"
            value={filtros.precioMax}
            onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Botón limpiar filtros */}
      <button
        onClick={() => setFiltros({
          busqueda: '',
          categoria: '',
          condicion: '',
          precioMin: '',
          precioMax: '',
          ordenar: 'recientes'
        })}
        className="w-full py-2 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

// Loading skeleton
function LoadingSkeleton({ vistaGrid }) {
  return (
    <div className={vistaGrid
      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
      : 'flex flex-col gap-4'
    }>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Estado vacío
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <Search className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No se encontraron productos
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Intenta ajustar los filtros o buscar algo diferente
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Ver todos los productos
      </button>
    </div>
  )
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900"><LoadingSkeleton vistaGrid={true} /></div>}>
      <ProductosContent />
    </Suspense>
  )
}