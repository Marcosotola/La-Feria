'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
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
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'
import { getFairById, updateFair } from '@/lib/services/fairsService'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const inputClass = 'w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-semibold text-gray-900 dark:text-white placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500'
const timeClass = 'px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-semibold text-gray-900 dark:text-white text-sm'

export default function EditFairPage() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const params = useParams()

  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [addressFound, setAddressFound] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationName: '',
    address: '',
    lat: -31.417,
    lng: -64.183,
  })

  // Schedule builder
  const [schedule, setSchedule] = useState([])
  const [pending, setPending] = useState({ day: '', from: '', to: '' })

  const addEntry = () => {
    if (!pending.day || !pending.from || !pending.to) return
    setSchedule(prev => [...prev, pending])
    setPending({ day: '', from: '', to: '' })
  }

  const removeEntry = (index) => {
    setSchedule(prev => prev.filter((_, i) => i !== index))
  }

  // Imágenes existentes y nuevas
  const [existingImages, setExistingImages] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const totalImages = existingImages.length + newFiles.length

  useEffect(() => {
    if (!params?.id) return
    getFairById(params.id).then(fair => {
      if (!fair) { setNotFound(true); setPageLoading(false); return }

      const isAdmin = userData?.role === 'admin'
      const isOwner = user && fair.creatorId === user.uid
      if (!isAdmin && !isOwner) { router.replace('/ferias'); return }

      setFormData({
        name: fair.name || '',
        description: fair.description || '',
        locationName: fair.locationName || '',
        address: fair.address || '',
        lat: fair.location?.lat ?? -31.417,
        lng: fair.location?.lng ?? -64.183,
      })

      // Cargar schedule estructurado si existe
      if (fair.schedule?.length) {
        setSchedule(fair.schedule)
      }

      const gallery = fair.gallery?.length ? fair.gallery : (fair.image ? [fair.image] : [])
      setExistingImages(gallery)

      if (fair.location?.lat) setAddressFound(true)
      setPageLoading(false)
    })
  }, [params?.id, user, userData, router])

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files)
    if (totalImages + files.length > 5) { alert('Máximo 5 fotos en total'); return }
    setNewFiles(prev => [...prev, ...files])
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removeExistingImage = (index) => setExistingImages(prev => prev.filter((_, i) => i !== index))
  const removeNewImage = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => { URL.revokeObjectURL(prev[index]); return prev.filter((_, i) => i !== index) })
  }

  const searchAddress = async () => {
    if (!formData.address) return
    setSearchingAddress(true)
    setAddressFound(false)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`)
      const data = await res.json()
      if (data?.length > 0) {
        setFormData(prev => ({ ...prev, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }))
        setAddressFound(true)
      } else {
        alert('No se encontró la dirección. Intentá ser más específico (Calle, Número, Ciudad)')
      }
    } catch { alert('Error al buscar la dirección') }
    finally { setSearchingAddress(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    if (totalImages === 0) { alert('La feria debe tener al menos una foto'); return }
    if (!addressFound) { alert("Primero buscá y confirmá la dirección con 'Buscar Ubicación'"); return }
    if (schedule.length === 0) { alert('Agregá al menos un día y horario'); return }

    setSaving(true)
    try {
      let uploadedUrls = []
      if (newFiles.length > 0) {
        uploadedUrls = await Promise.all(
          newFiles.map(async file => {
            const imageRef = ref(storage, `fairs/${user.uid}/${Date.now()}_${file.name}`)
            const snapshot = await uploadBytes(imageRef, file)
            return getDownloadURL(snapshot.ref)
          })
        )
      }

      const allImages = [...existingImages, ...uploadedUrls]
      const uniqueDays = [...new Set(schedule.map(e => e.day))]
      const daysStr = uniqueDays.join(', ')

      const result = await updateFair(params.id, {
        name: formData.name,
        description: formData.description,
        locationName: formData.locationName,
        address: formData.address,
        schedule,
        days: daysStr,
        hours: '',
        image: allImages[0],
        gallery: allImages,
        location: { lat: formData.lat, lng: formData.lng },
      })

      if (result.success) {
        router.push(`/ferias/${params.id}`)
      } else {
        alert('Error al guardar: ' + result.error)
      }
    } catch (err) {
      console.error('Error updating fair:', err)
      alert('Error al guardar la feria')
    } finally {
      setSaving(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-5xl">🎪</p>
        <p className="font-black text-gray-700 dark:text-gray-300 text-lg">Feria no encontrada</p>
        <Link href="/ferias" className="text-primary-500 font-bold underline underline-offset-2">← Volver a ferias</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href={`/ferias/${params.id}`}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" /> Volver a la feria
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">Editar Feria</h1>
        <p className="text-gray-500 mb-8 font-medium">Actualizá la información de tu feria.</p>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* FOTOS */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
              Fotos ({totalImages}/5)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {existingImages.map((url, i) => (
                <div key={`ex-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {newPreviews.map((url, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group ring-2 ring-brand-teal-400 ring-offset-2">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 left-1 bg-brand-teal-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">Nueva</div>
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {totalImages < 5 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-brand-teal-500 hover:bg-brand-teal-50/30 transition-all group">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-brand-teal-500" />
                  <span className="text-[10px] font-black text-gray-400 group-hover:text-brand-teal-500 mt-2">AGREGAR</span>
                  <input type="file" multiple accept="image/*" onChange={handleNewImages} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* CAMPOS */}
          <div className="space-y-8">

            {/* Nombre + Lugar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Nombre de la Feria</label>
                <input
                  required
                  type="text"
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

            {/* Dirección */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Ubicación Exacta</label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    required
                    type="text"
                    placeholder="Calle, número, ciudad"
                    value={formData.address}
                    onChange={e => { setFormData({ ...formData, address: e.target.value }); setAddressFound(false) }}
                    className={`${inputClass} pl-14`}
                  />
                </div>
                <button
                  type="button"
                  onClick={searchAddress}
                  disabled={searchingAddress}
                  className={`px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${addressFound ? 'bg-green-500 text-white' : 'bg-brand-teal-600 text-white shadow-lg shadow-brand-teal-600/20'}`}
                >
                  {searchingAddress ? <Loader2 className="w-5 h-5 animate-spin" /> : addressFound ? <CheckCircle2 className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                  {addressFound ? 'Ubicación Lista' : 'Buscar Ubicación'}
                </button>
              </div>
              {addressFound && (
                <p className="text-[10px] text-green-600 font-bold uppercase px-4">✓ Coordenadas: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
              )}
            </div>

            {/* Días y Horarios */}
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Días y Horarios</label>

              {schedule.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
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
                    <input type="time" value={pending.from} onChange={e => setPending(p => ({ ...p, from: e.target.value }))} className={timeClass} />
                  </div>
                  <span className="text-gray-400 font-bold mt-4">–</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider px-1">Hasta</span>
                    <input type="time" value={pending.to} onChange={e => setPending(p => ({ ...p, to: e.target.value }))} className={timeClass} />
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
              <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Descripción</label>
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
            disabled={saving}
            className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xl rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="w-6 h-6" /> Guardar Cambios</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
