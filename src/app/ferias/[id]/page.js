'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MapPin, Calendar, ChevronLeft, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { getFairById } from '@/lib/services/fairsService'

function Skeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28 animate-pulse">
      <div className="h-72 bg-gray-200 dark:bg-gray-800" />
      <div className="px-5 pt-5 space-y-3 max-w-2xl mx-auto">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-2xl w-1/3" />
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-2xl w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-xl w-5/6" />
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl mt-4" />
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    </div>
  )
}

export default function FeriaDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [fair, setFair] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)

  useEffect(() => {
    if (!params?.id) return
    getFairById(params.id).then(data => {
      setFair(data)
      setLoading(false)
    })
  }, [params?.id])

  if (loading) return <Skeleton />

  if (!fair) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pb-28">
        <p className="text-5xl">🎪</p>
        <p className="font-black text-gray-700 dark:text-gray-300 text-lg">Feria no encontrada</p>
        <button
          onClick={() => router.back()}
          className="text-primary-500 font-bold text-sm underline underline-offset-2"
        >
          ← Volver
        </button>
      </div>
    )
  }

  const allImages = [fair.image, ...(fair.gallery || [])].filter(Boolean)

  const mapUrl = fair.location
    ? `https://www.google.com/maps?q=${fair.location.lat},${fair.location.lng}`
    : fair.address
    ? `https://www.google.com/maps/search/${encodeURIComponent(fair.address)}`
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28">

      {/* ── Hero Image ── */}
      <div className="relative h-72 md:h-96 bg-gray-200 dark:bg-gray-800">
        {allImages[selectedImg] ? (
          <Image
            src={allImages[selectedImg]}
            alt={fair.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-300 to-primary-600 flex items-center justify-center">
            <span className="text-7xl">🎪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-5 left-5 z-10 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 active:scale-90 transition-all"
          aria-label="Volver"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* ── Gallery thumbnails ── */}
      {allImages.length > 1 && (
        <div
          className="flex gap-2 px-5 mt-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImg(i)}
              className={`shrink-0 relative w-16 h-16 rounded-xl overflow-hidden transition-all ${
                selectedImg === i
                  ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950 opacity-100'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-5 pt-5 max-w-2xl mx-auto">

        {/* Status badge */}
        <span className="inline-block mb-3 text-[10px] font-black uppercase tracking-widest text-brand-teal-600 dark:text-brand-teal-400 bg-brand-teal-50 dark:bg-brand-teal-900/20 px-3 py-1 rounded-full">
          Activa
        </span>

        {/* Name */}
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-5">
          {fair.name}
        </h1>

        {/* Info cards */}
        <div className="space-y-3 mb-6">
          {(fair.locationName || fair.address) && (
            <InfoCard
              color="primary"
              icon={MapPin}
              label="Ubicación"
              main={fair.locationName || fair.address}
              sub={fair.address && fair.address !== fair.locationName ? fair.address : null}
            />
          )}
          {fair.days && (
            <InfoCard
              color="teal"
              icon={Calendar}
              label="Días y horarios"
              main={fair.days}
              sub={fair.hours || null}
            />
          )}
        </div>

        {/* Description */}
        {fair.description && (
          <div className="mb-7">
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">
              Sobre esta feria
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {fair.description}
            </p>
          </div>
        )}

        {/* Map CTA */}
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-black rounded-2xl shadow-lg shadow-brand-teal-600/30 transition-all active:scale-95"
          >
            <MapPin className="w-5 h-5" />
            Ver en el mapa
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
        )}
      </div>
    </div>
  )
}

function InfoCard({ color, icon: Icon, label, main, sub }) {
  const colors = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      icon: 'text-primary-600 dark:text-primary-400',
      iconBg: 'bg-primary-100 dark:bg-primary-900/40',
    },
    teal: {
      bg: 'bg-brand-teal-50 dark:bg-brand-teal-900/20',
      icon: 'text-brand-teal-600 dark:text-brand-teal-400',
      iconBg: 'bg-brand-teal-100 dark:bg-brand-teal-900/40',
    },
  }
  const c = colors[color]

  return (
    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{main}</p>
        {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
