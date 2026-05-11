'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheck, 
  Upload, 
  Plus, 
  MapPin, 
  Store, 
  ArrowRight, 
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar
} from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase/config'
import Link from 'next/link'
import { getFairsByOrganizer } from '@/lib/services/fairsService'

export default function OrganizerDashboard() {
  const { user, userData, refreshUserData, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [fairs, setFairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  
  // Estados para el registro
  const [files, setFiles] = useState({ front: null, back: null })
  const [previews, setPreviews] = useState({ front: null, back: null })
  const [uploadStatus, setUploadStatus] = useState('idle') // idle, uploading, success, error

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (userData?.role === 'organizer' || userData?.role === 'admin') {
      loadFairs()
    } else {
      setLoading(false)
    }
  }, [user, userData, authLoading])

  const loadFairs = async () => {
    setLoading(true)
    const data = await getFairsByOrganizer(user.uid)
    setFairs(data)
    setLoading(false)
  }

  const handleFileChange = (e, side) => {
    const file = e.target.files[0]
    if (file) {
      setFiles(prev => ({ ...prev, [side]: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [side]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRegisterAsOrganizer = async () => {
    if (!files.front || !files.back) {
      alert('Por favor sube ambas fotos de tu DNI')
      return
    }

    try {
      setUploadStatus('uploading')
      
      // 1. Subir fotos a Firebase Storage
      const frontRef = ref(storage, `users/${user.uid}/dni_front_${Date.now()}`)
      const backRef = ref(storage, `users/${user.uid}/dni_back_${Date.now()}`)
      
      const [frontSnap, backSnap] = await Promise.all([
        uploadBytes(frontRef, files.front),
        uploadBytes(backRef, files.back)
      ])
      
      const [frontUrl, backUrl] = await Promise.all([
        getDownloadURL(frontSnap.ref),
        getDownloadURL(backSnap.ref)
      ])
      
      // 2. Actualizar rol y datos en Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'organizer',
        dniFrontUrl: frontUrl,
        dniBackUrl: backUrl,
        organizerStatus: 'approved', // Auto-aprobado como pidió el usuario
        updatedAt: new Date()
      })
      
      await refreshUserData()
      setUploadStatus('success')
    } catch (error) {
      console.error("Error al registrar organizador:", error)
      setUploadStatus('error')
    }
  }

  if (authLoading || (loading && (userData?.role === 'organizer' || userData?.role === 'admin'))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    )
  }

  // VISTA DE REGISTRO (Si no es organizador)
  if (userData?.role !== 'organizer' && userData?.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">
          <div className="w-16 h-16 bg-brand-teal-100 dark:bg-brand-teal-900/30 rounded-2xl flex items-center justify-center mb-8">
            <ShieldCheck className="w-10 h-10 text-brand-teal-600" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Conviértete en Organizador
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg leading-relaxed">
            Para gestionar ferias, publicar ubicaciones y coordinar puesteros, necesitamos validar tu identidad con una foto de tu DNI. Este proceso es automático y te dará acceso instantáneo a las herramientas de gestión.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Frente DNI */}
            <div className="relative group">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-2">
                DNI Frente
              </label>
              <div 
                className={`relative h-48 rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-3 ${
                  previews.front ? 'border-brand-teal-500' : 'border-gray-300 dark:border-gray-700 hover:border-brand-teal-400'
                }`}
              >
                {previews.front ? (
                  <img src={previews.front} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-brand-teal-500 transition-colors" />
                    <span className="text-xs font-medium text-gray-500">Haz clic para subir foto</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'front')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Dorso DNI */}
            <div className="relative group">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-2">
                DNI Dorso
              </label>
              <div 
                className={`relative h-48 rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-3 ${
                  previews.back ? 'border-brand-teal-500' : 'border-gray-300 dark:border-gray-700 hover:border-brand-teal-400'
                }`}
              >
                {previews.back ? (
                  <img src={previews.back} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-brand-teal-500 transition-colors" />
                    <span className="text-xs font-medium text-gray-500">Haz clic para subir foto</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'back')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleRegisterAsOrganizer}
            disabled={uploadStatus === 'uploading' || !files.front || !files.back}
            className="w-full py-4 bg-brand-teal-600 hover:bg-brand-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-brand-teal-600/30 transition-all flex items-center justify-center gap-3"
          >
            {uploadStatus === 'uploading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando identidad...
              </>
            ) : (
              <>
                Completar Registro <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {uploadStatus === 'success' && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-6 h-6" />
              <p className="font-bold">¡Identidad validada! Ya eres Organizador. Redirigiendo...</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // DASHBOARD DE ORGANIZADOR
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            Panel de Organizador
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tus ferias y puntos de encuentro.
          </p>
        </div>
        <Link 
          href="/dashboard/organizer/new-fair"
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Crear Nueva Feria
        </Link>
      </div>

      {fairs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aún no tienes ferias</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Comienza por crear tu primera feria para que aparezca en el mapa principal y los puesteros puedan unirse.
          </p>
          <Link 
            href="/dashboard/organizer/new-fair"
            className="text-primary-600 font-black hover:underline"
          >
            Crear mi primera feria →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fairs.map((fair) => (
            <div 
              key={fair.id}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={fair.image || 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=600&auto=format&fit=crop'} 
                  alt={fair.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900">
                  {fair.status === 'active' ? 'Activa' : 'Inactiva'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 line-clamp-1">{fair.name}</h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <span className="truncate">{fair.locationName || fair.location?.address || 'Ubicación pendiente'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 text-brand-teal-500" />
                    <span>{fair.days || 'Días no especificados'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4 text-accent-500" />
                    <span>{fair.hours || 'Horarios no especificados'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {fair.stalls?.length || 0} Puesteros
                  </span>
                  <Link 
                    href={`/dashboard/organizer/edit/${fair.id}`}
                    className="text-brand-teal-600 font-black text-sm hover:underline"
                  >
                    Gestionar →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
