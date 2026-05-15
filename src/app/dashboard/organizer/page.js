'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  Plus, MapPin, Store, ArrowLeft, Loader2,
  Calendar, Clock, Pencil, Trash2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getFairsByOrganizer, deleteFair } from '@/lib/services/fairsService'

export default function OrganizerDashboard() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()

  const [fairs, setFairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!authLoading && user) loadFairs()
  }, [user, authLoading])

  const loadFairs = async () => {
    const data = await getFairsByOrganizer(user.uid)
    setFairs(data)
    setLoading(false)
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    const result = await deleteFair(id)
    if (result.success) setFairs(prev => prev.filter(f => f.id !== id))
    setConfirmDeleteId(null)
    setDeleting(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-28">

      {/* Cabecera */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Mis Ferias</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestioná tus ferias publicadas</p>
        </div>
        <Link
          href="/dashboard/organizer/new-fair"
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-primary-500/30 text-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nueva
        </Link>
      </div>

      {/* Lista */}
      {fairs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <Store className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            Todavía no tenés ferias
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
            Creá tu primera feria para que aparezca en el mapa y los puesteros puedan encontrarla.
          </p>
          <Link
            href="/dashboard/organizer/new-fair"
            className="inline-flex items-center gap-2 bg-primary-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-primary-500/30 text-sm hover:bg-primary-600 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Crear mi primera feria
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {fairs.map(fair => {
            const isConfirming = confirmDeleteId === fair.id
            return (
              <div
                key={fair.id}
                className="flex gap-3 bg-white dark:bg-gray-900 rounded-3xl p-3 shadow-sm border border-gray-100 dark:border-gray-800"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100 dark:bg-gray-800">
                  {fair.image ? (
                    <Image src={fair.image} alt={fair.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎪</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                  <h3 className="font-black text-gray-900 dark:text-white text-sm leading-snug mb-1 line-clamp-1">
                    {fair.name}
                  </h3>
                  <div className="space-y-0.5">
                    {(fair.locationName || fair.address) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary-500 shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {fair.locationName || fair.address}
                        </span>
                      </div>
                    )}
                    {fair.days && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-brand-teal-500 shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {fair.days}{fair.hours ? ` · ${fair.hours}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`inline-block mt-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    fair.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {fair.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-1.5 self-center shrink-0">
                  {isConfirming ? (
                    <>
                      <button
                        onClick={() => handleDelete(fair.id)}
                        disabled={deleting}
                        className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center transition-colors"
                      >
                        {deleting ? '…' : 'Sí'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black flex items-center justify-center"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push(`/dashboard/organizer/edit-fair/${fair.id}`)}
                        className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(fair.id)}
                        className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
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
