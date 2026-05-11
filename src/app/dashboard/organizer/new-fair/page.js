'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Clock, 
  Save, 
  Loader2,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'
import { createFair } from '@/lib/services/fairsService'

export default function NewFairPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationName: '',
    address: '',
    days: '',
    hours: '',
    lat: -31.417, // Default Córdoba
    lng: -64.183
  })
  
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      let imageUrl = ''
      if (imageFile) {
        const imageRef = ref(storage, `fairs/${Date.now()}_${imageFile.name}`)
        const snapshot = await uploadBytes(imageRef, imageFile)
        imageUrl = await getDownloadURL(snapshot.ref)
      }

      const fairData = {
        name: formData.name,
        description: formData.description,
        locationName: formData.locationName,
        address: formData.address,
        days: formData.days,
        hours: formData.hours,
        image: imageUrl || 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop',
        location: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        }
      }

      const result = await createFair(fairData, user.uid)
      if (result.success) {
        router.push('/dashboard/organizer')
      } else {
        alert("Error: " + result.error)
      }
    } catch (error) {
      console.error("Error creating fair:", error)
      alert("Error al crear la feria")
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
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Nueva Feria</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Subida de Imagen */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Foto de la Feria
            </label>
            <div 
              className={`relative h-64 w-full rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 ${
                imagePreview ? 'border-primary-500' : 'border-gray-300 dark:border-gray-700 hover:border-primary-400'
              }`}
            >
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Haz clic para subir una foto</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 5MB</p>
                  </div>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nombre de la Feria</label>
              <input 
                required
                type="text"
                placeholder="Ej. Feria de Artesanos del Centro"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>

            {/* Lugar / Plaza */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lugar / Referencia</label>
              <input 
                required
                type="text"
                placeholder="Ej. Plaza San Martín"
                value={formData.locationName}
                onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Dirección exacta</label>
            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                required
                type="text"
                placeholder="Calle, número, ciudad"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Días */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Días de funcionamiento</label>
              <div className="relative">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  required
                  type="text"
                  placeholder="Ej. Sábados y Domingos"
                  value={formData.days}
                  onChange={(e) => setFormData({...formData, days: e.target.value})}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Horarios */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Horarios</label>
              <div className="relative">
                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  required
                  type="text"
                  placeholder="Ej. 10:00 a 20:00 hs"
                  value={formData.hours}
                  onChange={(e) => setFormData({...formData, hours: e.target.value})}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Coordenadas (Para simplificar por ahora, luego pondremos un mapa) */}
          <div className="bg-primary-50 dark:bg-primary-900/10 p-6 rounded-3xl border border-primary-100 dark:border-primary-900/20">
            <h4 className="font-bold text-primary-700 dark:text-primary-400 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Ubicación en el Mapa
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Latitud</label>
                <input 
                  type="number" 
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: e.target.value})}
                  className="w-full bg-white dark:bg-gray-900 rounded-xl px-4 py-2 text-sm" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Longitud</label>
                <input 
                  type="number" 
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({...formData, lng: e.target.value})}
                  className="w-full bg-white dark:bg-gray-900 rounded-xl px-4 py-2 text-sm" 
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-3 italic">
              * Por ahora usa estas coordenadas. En la siguiente actualización pondremos un selector visual en el mapa.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary-500/40 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Publicando Feria...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" /> Publicar Feria Real
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
