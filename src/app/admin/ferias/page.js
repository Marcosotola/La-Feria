'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search, X, Pencil, Trash2, Plus, Loader2, Eye } from 'lucide-react'
import Image from 'next/image'
import { getAllFairs, deleteFair } from '@/lib/services/fairsService'

export default function AdminFeriasPage() {
  const router = useRouter()
  const [fairs, setFairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getAllFairs().then(data => { setFairs(data); setLoading(false) })
  }, [])

  const handleDelete = async (id) => {
    setDeleting(true)
    const result = await deleteFair(id)
    if (result.success) setFairs(prev => prev.filter(f => f.id !== id))
    setConfirmDeleteId(null)
    setDeleting(false)
  }

  const filtered = fairs.filter(f =>
    !search.trim() ||
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.address?.toLowerCase().includes(search.toLowerCase()) ||
    f.locationName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Ferias</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? '...' : `${fairs.length} ferias publicadas`}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/organizer/new-fair')}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-500/30 text-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nueva Feria
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, dirección..."
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {search ? 'Sin resultados' : 'No hay ferias'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(fair => {
            const isConfirming = confirmDeleteId === fair.id
            return (
              <div key={fair.id} className="flex gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm">

                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative bg-gray-100 dark:bg-gray-700">
                  {fair.image ? (
                    <Image src={fair.image} alt={fair.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎪</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="font-black text-gray-900 dark:text-white text-sm leading-tight line-clamp-1">{fair.name}</p>
                  {(fair.locationName || fair.address) && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="text-xs text-gray-500 truncate">{fair.locationName || fair.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      fair.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {fair.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                    {fair.creatorId && (
                      <span className="text-[9px] text-gray-400 font-mono">uid: {fair.creatorId.slice(0, 8)}…</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 self-center shrink-0">
                  {isConfirming ? (
                    <>
                      <button
                        onClick={() => handleDelete(fair.id)}
                        disabled={deleting}
                        className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center"
                      >
                        {deleting ? '…' : 'Sí'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black flex items-center justify-center"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push(`/ferias/${fair.id}`)}
                        className="w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 transition-colors"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/organizer/edit-fair/${fair.id}`)}
                        className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(fair.id)}
                        className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
