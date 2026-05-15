'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation'
import {
  User, Heart, MessageSquare, Store,
  MapPin, ChevronRight, Loader2
} from 'lucide-react'

const ROLE_META = {
  admin:     { label: 'Administrador',     color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  organizer: { label: 'Organizador',       color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' },
  puestero:  { label: 'Puestero / Feriante', color: 'bg-brand-teal-100 text-brand-teal-700 dark:bg-brand-teal-900/30 dark:text-brand-teal-300' },
  user:      { label: 'Cliente',           color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
}

export default function Dashboard() {
  const { isAuthenticated, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!isAuthenticated || !userData) return null

  const role = userData.role || 'user'
  const isAdmin     = role === 'admin'
  const isOrganizer = role === 'organizer' || isAdmin
  const isPuestero  = role === 'puestero'  || isOrganizer
  const roleMeta    = ROLE_META[role] ?? ROLE_META.user

  const firstName = userData.firstName || userData.businessName || userData.email?.split('@')[0] || 'Usuario'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
      <DashboardTopNavigation />

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 ${roleMeta.color}`}>
            {roleMeta.label}
          </span>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
            Hola, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ¿Qué querés gestionar hoy?
          </p>
        </div>

        {/* ── Ferias — organizer + admin ── */}
        {isOrganizer && (
          <DashSection title="Ferias">
            <DashCard
              icon={MapPin}
              color="orange"
              title="Mis Ferias"
              description="Creá y gestioná tus ferias"
              href="/dashboard/organizer"
              router={router}
            />
          </DashSection>
        )}

        {/* ── Comercio — puestero + organizer + admin ── */}
        {isPuestero && (
          <DashSection title="Comercio">
            <DashCard
              icon={Store}
              color="teal"
              title="Mi Tienda"
              description="Administrá productos, servicios y empleos"
              href="/dashboard/store"
              router={router}
            />
          </DashSection>
        )}

        {/* ── Sección Personal — todos ── */}
        <DashSection title="Personal">
          <DashCard
            icon={User}
            color="blue"
            title="Mi Perfil"
            description="Información personal y configuración"
            href="/dashboard/profile"
            router={router}
          />
          <DashCard
            icon={Heart}
            color="pink"
            title="Favoritos"
            description="Productos y servicios guardados"
            href="/dashboard/favorites"
            router={router}
          />
          <DashCard
            icon={MessageSquare}
            color="purple"
            title="Reseñas"
            description="Tus comentarios y valoraciones"
            href="/dashboard/reviews"
            router={router}
          />
        </DashSection>

      </div>
    </div>
  )
}

// ── Sección con título separador ──────────────────────────────────────────────
function DashSection({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
        {title}
      </h2>
      <div className="space-y-2.5">
        {children}
      </div>
    </div>
  )
}

// ── Card horizontal mobile-first ──────────────────────────────────────────────
const CARD_COLORS = {
  blue:   { bg: 'bg-blue-500',         light: 'bg-blue-50   dark:bg-blue-900/20'   },
  pink:   { bg: 'bg-pink-500',         light: 'bg-pink-50   dark:bg-pink-900/20'   },
  purple: { bg: 'bg-purple-500',       light: 'bg-purple-50 dark:bg-purple-900/20' },
  teal:   { bg: 'bg-brand-teal-600',   light: 'bg-brand-teal-50 dark:bg-brand-teal-900/20' },
  orange: { bg: 'bg-primary-500',      light: 'bg-primary-50 dark:bg-primary-900/20' },
  indigo: { bg: 'bg-indigo-500',       light: 'bg-indigo-50 dark:bg-indigo-900/20' },
  rose:   { bg: 'bg-rose-500',         light: 'bg-rose-50   dark:bg-rose-900/20'   },
}

function DashCard({ icon: Icon, color, title, description, href, router }) {
  const c = CARD_COLORS[color] ?? CARD_COLORS.blue
  return (
    <button
      onClick={() => router.push(href)}
      className="w-full flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left"
    >
      <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-gray-900 dark:text-white text-sm leading-tight">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
    </button>
  )
}
