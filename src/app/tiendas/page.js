'use client'

import { useState, useEffect } from 'react'
import { Search, Store, MapPin, ExternalLink, Loader2, Filter, X, ChevronDown } from 'lucide-react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { getAllFairs } from '@/lib/services/fairsService'
import Link from 'next/link'

const TIPOS_NEGOCIO = [
  { value: '', label: 'Todos los tipos' },
  { value: 'producto_fisico', label: 'Productos' },
  { value: 'servicio', label: 'Servicios' },
  { value: 'digital', label: 'Digital' },
  { value: 'mixta', label: 'Mixto' },
]

export default function TiendasPage() {
  const [tiendas, setTiendas] = useState([])
  const [ferias, setFerias] = useState([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [feriaFiltro, setFeriaFiltro] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [showFiltros, setShowFiltros] = useState(false)

  useEffect(() => {
    Promise.all([cargarTiendas(), cargarFerias()])
  }, [])

  const cargarTiendas = async () => {
    try {
      setLoading(true)
      const snapshot = await getDocs(
        query(collection(db, 'users'), where('accountStatus', 'in', ['approved', 'true']))
      )
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.storeSlug)
        .sort((a, b) =>
          (a.businessName || '').toLowerCase().localeCompare((b.businessName || '').toLowerCase())
        )
      setTiendas(data)
    } catch (error) {
      console.error('Error cargando tiendas:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarFerias = async () => {
    const data = await getAllFairs()
    setFerias(data)
  }

  const tiendasFiltradas = tiendas.filter(tienda => {
    // Filtro de texto
    if (busqueda) {
      const q = busqueda.toLowerCase()
      const match =
        tienda.businessName?.toLowerCase().includes(q) ||
        tienda.slogan?.toLowerCase().includes(q) ||
        tienda.address?.toLowerCase().includes(q)
      if (!match) return false
    }
    // Filtro por feria
    if (feriaFiltro) {
      if (!tienda.myFairs?.includes(feriaFiltro)) return false
    }
    // Filtro por tipo de negocio
    if (tipoFiltro) {
      if (tienda.tipoNegocio !== tipoFiltro) return false
    }
    return true
  })

  const hayFiltrosActivos = busqueda || feriaFiltro || tipoFiltro

  const limpiarFiltros = () => {
    setBusqueda('')
    setFeriaFiltro('')
    setTipoFiltro('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barra superior con búsqueda y filtros */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          {/* Búsqueda + botón filtros */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tiendas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showFiltros || feriaFiltro || tipoFiltro
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {(feriaFiltro || tipoFiltro) && (
                <span className="w-2 h-2 rounded-full bg-orange-500" />
              )}
            </button>
          </div>

          {/* Panel de filtros desplegable */}
          {showFiltros && (
            <div className="flex flex-wrap gap-3 pb-1">
              {/* Filtro por feria */}
              <div className="relative">
                <select
                  value={feriaFiltro}
                  onChange={(e) => setFeriaFiltro(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="">Todas las ferias</option>
                  {ferias.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Filtro por tipo */}
              <div className="relative">
                <select
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {TIPOS_NEGOCIO.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Limpiar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading
              ? 'Cargando...'
              : `${tiendasFiltradas.length} ${tiendasFiltradas.length === 1 ? 'tienda' : 'tiendas'}`}
          </p>
          {feriaFiltro && (
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              Feria: {ferias.find(f => f.id === feriaFiltro)?.name}
            </span>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : tiendasFiltradas.length === 0 ? (
          <EmptyState hayFiltros={hayFiltrosActivos} onLimpiar={limpiarFiltros} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {tiendasFiltradas.map(tienda => (
              <TiendaCard key={tienda.id} tienda={tienda} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TiendaCard({ tienda }) {
  const nombre = tienda.businessName || 'Tienda'
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={`/tienda/${tienda.storeSlug}`}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-200 group flex flex-col h-full"
    >
      <div className="aspect-square bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 relative flex items-center justify-center p-4">
        {tienda.featured && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
            Destacada
          </span>
        )}
        {tienda.storeLogo && !imageError ? (
          <img
            src={tienda.storeLogo}
            alt={nombre}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <Store className="w-12 h-12 sm:w-14 sm:h-14 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors text-sm leading-tight min-h-[2.5rem]">
          {nombre}
        </h3>
        {tienda.slogan && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 flex-1">{tienda.slogan}</p>
        )}
        {tienda.address && (
          <div className="flex items-start gap-1 text-xs text-gray-400 dark:text-gray-500 mt-auto">
            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{tienda.address}</span>
          </div>
        )}
      </div>

      <div className="px-3 pb-3 pt-0">
        <div className="flex items-center justify-center text-xs text-orange-600 dark:text-orange-400 font-medium group-hover:underline">
          Ver tienda
          <ExternalLink className="w-3 h-3 ml-1" />
        </div>
      </div>
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ hayFiltros, onLimpiar }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-5 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
        <Store className="w-10 h-10 text-orange-600 dark:text-orange-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {hayFiltros ? 'Sin resultados para esa búsqueda' : 'Todavía no hay tiendas'}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-5 max-w-sm mx-auto text-sm">
        {hayFiltros
          ? 'Probá con otros filtros o buscá por un término diferente.'
          : 'Pronto habrá tiendas de feriantes disponibles en la plataforma.'}
      </p>
      {hayFiltros && (
        <button
          onClick={onLimpiar}
          className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
        >
          Ver todas las tiendas
        </button>
      )}
    </div>
  )
}
