'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Search, X, ChevronRight, Navigation, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { getAllFairs, deleteFair } from '@/lib/services/fairsService'

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function SkeletonCard() {
  return (
    <div className="flex gap-3 bg-white dark:bg-gray-900 rounded-3xl p-3 border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="w-24 h-24 rounded-2xl bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 py-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
      </div>
    </div>
  )
}

export default function FeriasPage() {
  const router = useRouter()
  const { user, userData } = useAuth()

  const [fairs, setFairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')
  const [userCoords, setUserCoords] = useState(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = userData?.role === 'admin'
  const isOrganizer = isAdmin || userData?.role === 'organizer'

  const canEdit = (fair) =>
    isAdmin || (user && fair.creatorId === user.uid)

  const handleOrganizerCta = () => {
    if (isOrganizer) {
      router.push('/dashboard/organizer/new-fair')
    } else {
      router.push('/register')
    }
  }

  useEffect(() => {
    getAllFairs().then(data => {
      setFairs(data)
      setLoading(false)
    })
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation || loadingLocation) return
    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setSort('distance')
        setLoadingLocation(false)
      },
      () => setLoadingLocation(false),
      { timeout: 8000 }
    )
  }, [loadingLocation])

  const handleDelete = async (fairId) => {
    setDeleting(true)
    const result = await deleteFair(fairId)
    if (result.success) {
      setFairs(prev => prev.filter(f => f.id !== fairId))
    }
    setConfirmDeleteId(null)
    setDeleting(false)
  }

  const filtered = useMemo(() => {
    let list = [...fairs]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        f =>
          f.name?.toLowerCase().includes(q) ||
          f.locationName?.toLowerCase().includes(q) ||
          f.address?.toLowerCase().includes(q)
      )
    }

    if (sort === 'az') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'))
    } else if (sort === 'distance' && userCoords) {
      list.sort((a, b) => {
        const dA = a.location
          ? getDistanceKm(userCoords.lat, userCoords.lng, a.location.lat, a.location.lng)
          : Infinity
        const dB = b.location
          ? getDistanceKm(userCoords.lat, userCoords.lng, b.location.lat, b.location.lng)
          : Infinity
        return dA - dB
      })
    }

    return list
  }, [fairs, search, sort, userCoords])

  const sortOptions = [
    { id: 'recent', label: 'Recientes' },
    { id: 'az', label: 'A – Z' },
    {
      id: 'distance',
      label: userCoords ? 'Más cercanas' : 'Cercanas',
      icon: Navigation,
      action: !userCoords ? requestLocation : undefined,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28">

      {/* ── Header ── */}
      <div className="bg-brand-teal-900 text-white pt-10 pb-20 px-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-7 h-7">
              <Image src="/icon.png" alt="La Feria" fill className="object-contain" />
            </div>
            <span className="text-primary-400 font-bold tracking-widest uppercase text-[10px]">
              La Feria
            </span>
          </div>
          <h1 className="text-3xl font-black mb-1 leading-tight">Ferias Locales</h1>
          <p className="text-white/60 text-sm mb-6">Encontrá los eventos cerca tuyo</p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o dirección..."
              className="w-full pl-12 pr-11 py-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm shadow-xl border-0 focus:ring-2 focus:ring-primary-500 outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 -mt-10">

        {/* Sort chips */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {sortOptions.map(opt => {
            const Icon = opt.icon
            const isActive = sort === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => (opt.action ? opt.action() : setSort(opt.id))}
                disabled={loadingLocation && opt.id === 'distance'}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-primary-500/30 shadow-lg'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {loadingLocation && opt.id === 'distance' ? 'Buscando...' : opt.label}
              </button>
            )
          })}
        </div>

        {/* CTA compacto */}
        <button
          onClick={handleOrganizerCta}
          className="w-full flex items-center gap-3 bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl px-4 py-3 mb-4 shadow-md shadow-primary-500/20 active:scale-[0.98] transition-transform text-left"
        >
          <span className="text-2xl leading-none">🎪</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-tight">¿Organizás una feria?</p>
            <p className="text-white/80 text-xs">
              {isOrganizer ? 'Publicá una nueva' : 'Registrate como organizador'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70 shrink-0" />
        </button>

        {/* Count */}
        {!loading && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 px-1">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'feria encontrada' : 'ferias encontradas'}
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🎪</p>
            <p className="font-black text-gray-700 dark:text-gray-300 text-lg">
              {search ? 'Sin resultados' : 'Todavía no hay ferias'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {search ? 'Probá con otra búsqueda' : 'Volvé pronto'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-5 text-sm text-primary-500 font-bold underline underline-offset-2"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(fair => {
              const dist =
                userCoords && fair.location
                  ? getDistanceKm(
                      userCoords.lat,
                      userCoords.lng,
                      fair.location.lat,
                      fair.location.lng
                    )
                  : null

              const editable = canEdit(fair)
              const isConfirming = confirmDeleteId === fair.id

              return (
                <div
                  key={fair.id}
                  onClick={() => !isConfirming && router.push(`/ferias/${fair.id}`)}
                  className="flex gap-3 bg-white dark:bg-gray-900 rounded-3xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100 dark:bg-gray-800">
                    {fair.image ? (
                      <Image
                        src={fair.image}
                        alt={fair.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                        <span className="text-3xl">🎪</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-black text-gray-900 dark:text-white text-[15px] leading-snug mb-1.5 line-clamp-2">
                      {fair.name}
                    </h3>
                    <div className="space-y-1">
                      {(fair.locationName || fair.address) && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {fair.locationName || fair.address}
                          </span>
                        </div>
                      )}
                      {fair.days && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-brand-teal-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {fair.days}
                            {fair.hours ? ` · ${fair.hours}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    {dist !== null && (
                      <span className="inline-block mt-1.5 text-[10px] font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                        {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}
                      </span>
                    )}
                  </div>

                  {/* Acciones o chevron */}
                  {editable ? (
                    <div
                      className="flex flex-col gap-1.5 self-center shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      {isConfirming ? (
                        <>
                          <button
                            onClick={() => handleDelete(fair.id)}
                            disabled={deleting}
                            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black transition-colors flex items-center justify-center"
                          >
                            {deleting ? '…' : 'Sí'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black transition-colors flex items-center justify-center"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => router.push(`/dashboard/organizer/edit-fair/${fair.id}`)}
                            className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(fair.id)}
                            className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 self-center shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
