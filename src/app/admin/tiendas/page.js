'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Search, X, ExternalLink, Loader2, User } from 'lucide-react'
import Image from 'next/image'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export default function AdminTiendasPage() {
  const router = useRouter()
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadStores = async () => {
      const snap = await getDocs(collection(db, 'users'))
      const withStores = snap.docs
        .filter(d => d.data().storeSlug)
        .map(d => ({ id: d.id, ...d.data() }))
      setStores(withStores)
      setLoading(false)
    }
    loadStores()
  }, [])

  const filtered = stores.filter(s =>
    !search.trim() ||
    s.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    s.storeSlug?.toLowerCase().includes(search.toLowerCase())
  )

  const ROLE_LABELS = {
    organizer: 'Organizador',
    puestero: 'Puestero',
    admin: 'Admin',
    user: 'Usuario'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Tiendas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? '...' : `${stores.length} tiendas activas en la plataforma`}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre de negocio o slug..."
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
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
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {search ? 'Sin resultados' : 'No hay tiendas'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(store => (
            <div key={store.id} className="flex gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm">

              {/* Logo */}
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {store.storeLogo ? (
                  <Image src={store.storeLogo} alt={store.businessName || ''} fill className="object-contain p-1" sizes="56px" />
                ) : (
                  <Store className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-0.5">
                <p className="font-black text-gray-900 dark:text-white text-sm leading-tight">
                  {store.businessName || `${store.firstName || ''} ${store.lastName || ''}`.trim() || 'Sin nombre'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-500 truncate">{store.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                    {ROLE_LABELS[store.role] || store.role}
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">/{store.storeSlug}</span>
                </div>
              </div>

              {/* Ver tienda */}
              <div className="flex items-center shrink-0">
                <a
                  href={`/tienda/${store.storeSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center hover:bg-teal-100 transition-colors"
                  title="Ver tienda"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
