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
  Upload,
  X,
  Search,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'
import { createFair } from '@/lib/services/fairsService'

export default function NewFairPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [addressFound, setAddressFound] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationName: '',
    address: '',
    days: '',
    hours: '',
    lat: -31.417,
    lng: -64.183
  })
  
  // Multi-imágenes
  const [imageFiles, setImageFiles] = useState([])
  const [previews, setPreviews] = useState([])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (imageFiles.length + files.length > 5) {
      alert("Máximo 5 fotos permitidas")
      return
    }

    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviews([...previews, ...newPreviews])
  }

  const removeImage = (index) => {
    const newFiles = [...imageFiles]
    newFiles.splice(index, 1)
    setImageFiles(newFiles)

    const newPreviews = [...previews]
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
  }

  // Buscar dirección (Geocoding)
  const searchAddress = async () => {
    if (!formData.address) return
    setSearchingAddress(true)
    setAddressFound(false)
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const first = data[0]
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(first.lat),
          lng: parseFloat(first.lon)
        }))
        setAddressFound(true)
      } else {
        alert("No se encontró la dirección. Intenta ser más específico (Calle, Número, Ciudad)")
      }
    } catch (error) {
      console.error("Error searching address:", error)
    } finally {
      setSearchingAddress(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    if (imageFiles.length === 0) {
      alert("Sube al menos una foto de la feria")
      return
    }
    if (!addressFound) {
      alert("Primero busca y confirma la dirección en el botón 'Buscar Ubicación'")
      return
    }

    setLoading(true)
    try {
      // Subir todas las imágenes
      const uploadPromises = imageFiles.map(async (file) => {
        const imageRef = ref(storage, `fairs/${user.uid}/${Date.now()}_${file.name}`)
        const snapshot = await uploadBytes(imageRef, file)
        return await getDownloadURL(snapshot.ref)
      })

      const imageUrls = await Promise.all(uploadPromises)

      const fairData = {
        name: formData.name,
        description: formData.description,
        locationName: formData.locationName,
        address: formData.address,
        days: formData.days,
        hours: formData.hours,
        image: imageUrls[0], // Imagen principal
        gallery: imageUrls,   // Todas las imágenes
        location: {
          lat: formData.lat,
          lng: formData.lng
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
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">Nueva Feria</h1>
        <p className="text-gray-500 mb-8 font-medium">Publica tu feria para que miles de personas puedan encontrarla.</p>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* SECCIÓN FOTOS */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
              Fotos de la Feria (Hasta 5)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img src={preview} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Nombre de la Feria</label>
                <input 
                  required
                  type="text"
                  placeholder="Ej. Feria de Artesanos del Centro"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-bold"
                />
              </div>

              {/* Lugar / Plaza */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Lugar / Referencia</label>
                <input 
                  required
                  type="text"
                  placeholder="Ej. Plaza San Martín"
                  value={formData.locationName}
                  onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-bold"
                />
              </div>
            </div>

            {/* Dirección y Buscador */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Ubicación Exacta</label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    required
                    type="text"
                    placeholder="Calle, número, ciudad"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-bold"
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
                <p className="text-[10px] text-green-600 font-bold uppercase px-4">✓ Coordenadas detectadas: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Días */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Días</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    required
                    type="text"
                    placeholder="Ej. Sábados y Domingos"
                    value={formData.days}
                    onChange={(e) => setFormData({...formData, days: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-bold"
                  />
                </div>
              </div>

              {/* Horarios */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Horarios</label>
                <div className="relative">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    required
                    type="text"
                    placeholder="Ej. 10:00 a 20:00 hs"
                    value={formData.hours}
                    onChange={(e) => setFormData({...formData, hours: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Descripción / Detalles</label>
              <textarea 
                rows="3"
                placeholder="Cuenta qué tiene de especial tu feria..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 transition-all font-medium resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xl rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Publicando Feria...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" /> Publicar Feria
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
