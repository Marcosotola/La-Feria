'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Save,
  Loader2,
  Upload,
  X,
  Search,
  CheckCircle2,
  Plus,
  Navigation,
  MousePointerClick,
  Info
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'
import { createFair } from '@/lib/services/fairsService'

const LocationPickerMap = dynamic(
  () => import('@/components/location/LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center rounded-b-2xl">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }
)

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const inputClass = 'w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-semibold text-gray-900 dark:text-white placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500'
const timeClass = 'px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-semibold text-gray-900 dark:text-white text-sm'

export default function NewFairPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationName: '',
    address: ''
  })

  // Location state
  const [pinPosition, setPinPosition] = useState(null)       // [lat, lng] o null
  const [resolvedAddress, setResolvedAddress] = useState('')  // dirección resuelta
  const [reverseGeocoding, setReverseGeocoding] = useState(false)
  const [locationConfirmed, setLocationConfirmed] = useState(false)
  const [flyKey, setFlyKey] = useState(0)
  const [flyZoom, setFlyZoom] = useState(14)

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  // Schedule builder
  const [schedule, setSchedule] = useState([])
  const [pending, setPending] = useState({ day: '', from: '', to: '' })

  // Images
  const [imageFiles, setImageFiles] = useState([])
  const [previews, setPreviews] = useState([])

  // On mount: center map on user's geolocation
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setPinPosition([lat, lng])
        setFlyZoom(14)
        setFlyKey(k => k + 1)
        // Don't set locationConfirmed — user still needs to interact
      },
      () => {} // silently fall back to default Córdoba center
    )
  }, [])

  const reverseGeocode = async (lat, lng) => {
    setReverseGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      if (data?.display_name) {
        setResolvedAddress(data.display_name)
        // Build a short address for storage
        const a = data.address || {}
        const parts = [
          a.road || a.pedestrian || a.path || a.square || '',
          a.house_number || '',
          a.suburb || a.neighbourhood || a.quarter || '',
          a.city || a.town || a.village || a.municipality || ''
        ].filter(Boolean)
        // Remove consecutive duplicates from Nominatim quirks
        const shortAddr = [...new Set(parts)].join(', ')
        setFormData(prev => ({ ...prev, address: shortAddr || data.display_name }))
      }
    } catch {} finally {
      setReverseGeocoding(false)
    }
  }

  const handleMapClick = (lat, lng) => {
    setPinPosition([lat, lng])
    setLocationConfirmed(true)
    setSearchResults([])
    reverseGeocode(lat, lng)
  }

  const handlePinDrag = (lat, lng) => {
    setPinPosition([lat, lng])
    setLocationConfirmed(true)
    reverseGeocode(lat, lng)
  }

  const searchAddress = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchResults([])
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ar&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      if (data?.length > 0) {
        setSearchResults(data)
      } else {
        alert('No se encontraron resultados. Probá agregando el barrio o la ciudad.')
      }
    } catch {
      alert('Error al buscar. Revisá tu conexión.')
    } finally {
      setSearching(false)
    }
  }

  const selectResult = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setPinPosition([lat, lng])
    setResolvedAddress(result.display_name)
    setFormData(prev => ({ ...prev, address: result.display_name }))
    setLocationConfirmed(true)
    setSearchResults([])
    setSearchQuery('')
    setFlyZoom(16)
    setFlyKey(k => k + 1)
  }

  const clearLocation = () => {
    setLocationConfirmed(false)
    setResolvedAddress('')
    setFormData(prev => ({ ...prev, address: '' }))
    setSearchQuery('')
    setSearchResults([])
    // keep pinPosition so map stays centered
  }

  const addEntry = () => {
    if (!pending.day || !pending.from || !pending.to) return
    setSchedule(prev => [...prev, pending])
    setPending({ day: '', from: '', to: '' })
  }

  const removeEntry = (index) => {
    setSchedule(prev => prev.filter((_, i) => i !== index))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (imageFiles.length + files.length > 5) {
      alert('Máximo 5 fotos permitidas')
      return
    }
    setImageFiles(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    if (imageFiles.length === 0) {
      alert('Subí al menos una foto de la feria')
      return
    }
    if (!locationConfirmed || !pinPosition) {
      alert('Confirmá la ubicación tocando el mapa o usando el buscador')
      return
    }
    if (schedule.length === 0) {
      alert('Agregá al menos un día y horario')
      return
    }

    setLoading(true)
    try {
      const imageUrls = await Promise.all(
        imageFiles.map(async file => {
          const imageRef = ref(storage, `fairs/${user.uid}/${Date.now()}_${file.name}`)
          const snapshot = await uploadBytes(imageRef, file)
          return getDownloadURL(snapshot.ref)
        })
      )

      const uniqueDays = [...new Set(schedule.map(e => e.day))]
      const daysStr = uniqueDays.join(', ')

      const result = await createFair({
        name: formData.name,
        description: formData.description,
        locationName: formData.locationName,
        address: formData.address,
        schedule,
        days: daysStr,
        hours: '',
        image: imageUrls[0],
        gallery: imageUrls,
        location: { lat: pinPosition[0], lng: pinPosition[1] }
      }, user.uid)

      if (result.success) {
        router.push('/dashboard/organizer')
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err) {
      console.error('Error creating fair:', err)
      alert('Error al crear la feria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/dashboard/organizer"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" /> Volver al panel
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">Nueva Feria</h1>
        <p className="text-gray-500 mb-8 font-medium">Publica tu feria para que miles de personas puedan encontrarla.</p>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* FOTOS */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
              Fotos de la Feria (Hasta 5)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {previews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img src={preview} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-brand-teal-500 hover:bg-brand-teal-50/30 transition-all group">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-brand-teal-500" />
                  <span className="text-[10px] font-black text-gray-400 group-hover:text-brand-teal-500 mt-2">SUBIR</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-8">

            {/* Nombre + Lugar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Nombre de la Feria</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Feria de Artesanos del Centro"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Lugar / Referencia</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Plaza San Martín"
                  value={formData.locationName}
                  onChange={e => setFormData({ ...formData, locationName: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* UBICACIÓN */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Ubicación en el Mapa</label>

              {/* Instrucciones */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wide">
                  <Info className="w-4 h-4 shrink-0" />
                  Cómo marcar la ubicación
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 mt-0.5">
                      <MousePointerClick className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Tocá el mapa</p>
                      <p className="text-[11px] text-blue-500 dark:text-blue-400 leading-snug mt-0.5">Hacé clic directo en el lugar exacto. El pin se coloca ahí y se detecta la dirección automáticamente.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Buscá por nombre</p>
                      <p className="text-[11px] text-blue-500 dark:text-blue-400 leading-snug mt-0.5">Escribí el nombre de una plaza, calle o lugar y elegí el resultado correcto de la lista.</p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-blue-500 dark:text-blue-400 pt-1 border-t border-blue-200 dark:border-blue-700">
                  Una vez ubicado el pin, podés arrastrarlo para ajustar la posición exacta.
                </p>
              </div>

              {/* Buscador */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Plaza de las Américas, Calle Colón 123, Terminal..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setSearchResults([]) }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={searchAddress}
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-brand-teal-600 text-white shadow-lg shadow-brand-teal-600/20 disabled:opacity-50 transition-all shrink-0"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Buscar
                </button>
              </div>

              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{searchResults.length} resultados — elegí el correcto</p>
                  </div>
                  {searchResults.map((result, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectResult(result)}
                      className="w-full text-left px-4 py-3.5 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors flex items-start gap-3 group border-b border-gray-50 dark:border-gray-800 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">{result.display_name}</p>
                        {result.address?.state && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{result.address.state}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Mapa */}
              <div className={`rounded-2xl overflow-hidden border-2 transition-colors ${locationConfirmed ? 'border-teal-400 dark:border-teal-600' : 'border-gray-200 dark:border-gray-700'}`}>
                {/* Header del mapa */}
                <div className={`px-4 py-3 flex items-center gap-3 transition-colors ${locationConfirmed ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-gray-50 dark:bg-gray-800/60'}`}>
                  {locationConfirmed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-teal-700 dark:text-teal-300">Ubicación confirmada</p>
                        {reverseGeocoding ? (
                          <p className="text-[11px] text-teal-500 flex items-center gap-1 mt-0.5">
                            <Loader2 className="w-3 h-3 animate-spin" /> Detectando dirección...
                          </p>
                        ) : resolvedAddress ? (
                          <p className="text-[11px] text-teal-600 dark:text-teal-400 truncate mt-0.5">{resolvedAddress}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={clearLocation}
                        className="text-teal-400 hover:text-red-500 transition-colors shrink-0 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 text-gray-400 shrink-0" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tocá el mapa para colocar el pin en la ubicación de tu feria
                      </p>
                    </>
                  )}
                </div>

                {/* Mapa */}
                <LocationPickerMap
                  position={pinPosition}
                  flyKey={flyKey}
                  flyZoom={flyZoom}
                  onPositionChange={handlePinDrag}
                  onMapClick={handleMapClick}
                />

                {/* Tip arrastrar */}
                {locationConfirmed && (
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] text-gray-400 text-center">
                      Podés arrastrar el pin para ajustar la posición exacta
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Días y Horarios */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Días y Horarios</label>
                <p className="text-[11px] text-gray-400 mt-1">Agregá cada día con su horario. Podés agregar varios días distintos.</p>
              </div>

              {schedule.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {schedule.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-xl px-3 py-2">
                      <Calendar className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span className="text-sm font-bold text-teal-700 dark:text-teal-300">{entry.day}</span>
                      <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="text-sm text-teal-600 dark:text-teal-400">{entry.from} – {entry.to}</span>
                      <button type="button" onClick={() => removeEntry(i)} className="text-teal-300 hover:text-red-500 transition-colors ml-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl">
                <select
                  value={pending.day}
                  onChange={e => setPending(p => ({ ...p, day: e.target.value }))}
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-semibold text-gray-900 dark:text-white text-sm"
                >
                  <option value="" disabled>Día de la semana</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider px-1">Desde</span>
                    <input
                      type="time"
                      value={pending.from}
                      onChange={e => setPending(p => ({ ...p, from: e.target.value }))}
                      className={timeClass}
                    />
                  </div>
                  <span className="text-gray-400 font-bold mt-4">–</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider px-1">Hasta</span>
                    <input
                      type="time"
                      value={pending.to}
                      onChange={e => setPending(p => ({ ...p, to: e.target.value }))}
                      className={timeClass}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addEntry}
                  disabled={!pending.day || !pending.from || !pending.to}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-teal-600 text-white font-black rounded-xl disabled:opacity-40 hover:bg-brand-teal-700 transition-all text-sm self-end"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Descripción / Detalles</label>
              <textarea
                rows="3"
                placeholder="Contá qué tiene de especial tu feria..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-medium resize-none text-gray-900 dark:text-white placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xl rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Publicando Feria...</>
            ) : (
              <><Save className="w-6 h-6" /> Publicar Feria</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
