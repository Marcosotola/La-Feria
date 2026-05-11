'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Phone, 
  Key, 
  User, 
  Users, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Bell,
  MapPin,
  Loader2,
  Mail,
  Home,
  Building2
} from 'lucide-react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export default function Register({ onSwitchToLogin }) {
  const { 
    setupRecaptcha, 
    signInWithPhone, 
    user: authUser,
    userData,
    refreshUserData,
    signInWithGoogle
  } = useAuth()

  // Control de Pasos
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP, 3: Role, 4: Data, 5: Permissions
  
  // Si el usuario ya está autenticado (vía Login) pero no tiene perfil, saltar al paso 3
  useEffect(() => {
    if (authUser && !userData && step < 3) {
      setStep(3)
    }
  }, [authUser, userData, step])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Datos del Formulario
  const [phoneParts, setPhoneParts] = useState({ area: '', number: '' })
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [selectedRole, setSelectedRole] = useState('') // user, puestero, organizer

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    businessName: '', // Para puesteros
  })

  const [permissions, setPermissions] = useState({
    notifications: false,
    location: false
  })

  // === PASO 1: Enviar SMS ===
  const handleSendOtp = async (e) => {
    e.preventDefault()
    
    const cleanNumber = phoneParts.number.trim()
    const fullPhone = `+549${cleanNumber}`
    
    if (cleanNumber.length < 10) {
      return setError('Número demasiado corto (ingresá Cód. Área + Número)')
    }
    
    setLoading(true)
    setError(null)
    try {
      const verifier = setupRecaptcha('recaptcha-container')
      const result = await signInWithPhone(fullPhone, verifier)
      setConfirmationResult(result)
      setStep(2)
    } catch (err) {
      setError('Error al enviar SMS. Verifica el número.')
    } finally {
      setLoading(false)
    }
  }

  // === PASO 2: Verificar OTP ===
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp) return setError('Ingresa el código de 6 dígitos')

    setLoading(true)
    setError(null)
    try {
      const result = await confirmationResult.confirm(otp)
      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      
      if (userDoc.exists()) {
        // Ya existe, login directo
        window.location.href = '/dashboard'
      } else {
        // Nuevo usuario, elegir rol
        setStep(3)
      }
    } catch (err) {
      setError('Código incorrecto. Reintenta.')
    } finally {
      setLoading(false)
    }
  }

  // === PASO 3: Selección de Rol ===
  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setStep(4)
  }

  // === PASO 4: Datos del Perfil ===
  const handleProfileSubmit = (e) => {
    e.preventDefault()
    setStep(5)
  }

  // === PASO 5: Permisos y Guardar ===
  const handleFinalSubmit = async () => {
    setLoading(true)
    try {
      // 1. Guardar en Firestore
      const newUser = {
        uid: authUser.uid,
        phoneNumber: authUser.phoneNumber,
        role: selectedRole,
        ...profileData,
        permissions,
        createdAt: new Date(),
        updatedAt: new Date(),
        accountStatus: 'active'
      }

      await setDoc(doc(db, 'users', authUser.uid), newUser)
      await refreshUserData()
      
      // 2. Redirigir según rol
      if (selectedRole === 'organizer') window.location.href = '/dashboard/organizer'
      else window.location.href = '/dashboard'
      
    } catch (err) {
      setError('Error al crear perfil. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Pedir Permisos
  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {
        setPermissions(prev => ({ ...prev, location: true }))
      })
    }
  }

  const requestNotifications = async () => {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setPermissions(prev => ({ ...prev, notifications: true }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8 bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-brand-teal-500/10 rounded-full blur-3xl"></div>

        <div className="text-center relative z-10">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
            <span className="text-brand-teal-600">La</span> Feria
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Paso {step} de 5
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* CONTENEDOR RECAPTCHA INVISIBLE */}
        <div id="recaptcha-container"></div>

        {/* PASO 1: TELÉFONO */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Validación de Identidad</h3>
              <p className="text-sm text-gray-500">Ingresa tu número para comenzar.</p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1 tracking-widest">Número de Celular</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-teal-500 transition-colors" />
                  <input
                    type="tel"
                    required
                    placeholder="Cod. Área + Número (Ej: 11 1234 5678)"
                    value={phoneParts.number}
                    onChange={(e) => setPhoneParts({ ...phoneParts, number: e.target.value.replace(/\D/g, '') })}
                    className="w-full pl-12 pr-4 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-teal-500 rounded-[2rem] transition-all font-black text-lg"
                  />
                </div>
                <p className="text-[10px] font-black text-gray-900 dark:text-gray-100 px-4 uppercase tracking-tight text-center">
                  ⚠️ Ingresar <span className="text-primary-600">SIN el 0</span> y <span className="text-primary-600">SIN el 15</span>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-black rounded-[2rem] shadow-xl shadow-brand-teal-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Continuar <ArrowRight className="w-5 h-5" /></>}
                </button>
                <div className="text-center mt-4">
                  <p className="text-[10px] text-gray-500 font-medium">
                    ¿No puedes registrarte con tu número? <br />
                    <span className="text-brand-teal-600 font-black cursor-pointer hover:underline uppercase tracking-widest">Prueba otras opciones de registro</span>
                  </p>
                </div>
              </div>
            </form>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white dark:bg-gray-900 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Otras opciones de registro
                </span>
              </div>
            </div>
            <button
              onClick={signInWithGoogle}
              className="w-full py-4 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" /> Google
            </button>
          </div>
        )}

        {/* PASO 2: OTP */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Verifica tu código</h3>
              <p className="text-sm text-gray-500">Te enviamos un SMS al {phoneParts.number}</p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="* * * * * *"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-4 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-black text-center text-2xl tracking-[1em] placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-600/30 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Validar Código <ArrowRight className="w-5 h-5" /></>}
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-gray-400 font-bold hover:text-gray-600"
              >
                ¿No llegó? Cambiar número
              </button>
            </form>
          </div>
        )}

        {/* PASO 3: SELECCIÓN DE ROL */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">¿Quién eres en La Feria?</h3>
              <p className="text-sm text-gray-500">Esto nos ayuda a personalizar tu experiencia.</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect('user')}
                className="w-full p-6 border-2 border-gray-100 dark:border-gray-800 rounded-3xl hover:border-brand-teal-500 hover:bg-brand-teal-50/50 dark:hover:bg-brand-teal-900/10 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-brand-teal-100 dark:group-hover:bg-brand-teal-900/30 transition-colors">
                  <User className="w-6 h-6 text-gray-500 group-hover:text-brand-teal-600" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white">Usuario Común</h4>
                  <p className="text-xs text-gray-500">Quiero ver y comprar en ferias.</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('puestero')}
                className="w-full p-6 border-2 border-gray-100 dark:border-gray-800 rounded-3xl hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                  <Store className="w-6 h-6 text-gray-500 group-hover:text-primary-600" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white">Puestero (Feriante)</h4>
                  <p className="text-xs text-gray-500">Tengo un puesto y quiero vender.</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('organizer')}
                className="w-full p-6 border-2 border-gray-100 dark:border-gray-800 rounded-3xl hover:border-accent-500 hover:bg-accent-50/50 dark:hover:bg-accent-900/10 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-accent-100 dark:group-hover:bg-accent-900/30 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-gray-500 group-hover:text-accent-600" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white">Organizador</h4>
                  <p className="text-xs text-gray-500">Gestiono una o más ferias.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: DATOS DEL PERFIL */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Completa tus datos</h3>
              <p className="text-sm text-gray-500">Casi terminamos, necesitamos conocerte mejor.</p>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Nombre"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 font-bold"
                />
                <input
                  required
                  placeholder="Apellido"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 font-bold"
                />
              </div>
              <input
                required
                type="email"
                placeholder="Email de contacto"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 font-bold"
              />
              
              {selectedRole === 'puestero' && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 px-2">Datos del Negocio</label>
                  <input
                    required
                    placeholder="Nombre de tu Tienda"
                    value={profileData.businessName}
                    onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-primary-100 rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold mt-1"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
              >
                Siguiente Paso <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* PASO 5: PERMISOS */}
        {step === 5 && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Permisos Necesarios</h3>
              <p className="text-sm text-gray-500">Para una mejor experiencia, activa estos permisos.</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={requestNotifications}
                className={`w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between group ${permissions.notifications ? 'border-green-500 bg-green-50' : 'border-gray-100 dark:border-gray-800'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${permissions.notifications ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Bell className={`w-6 h-6 ${permissions.notifications ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm">Notificaciones</h4>
                    <p className="text-[10px] text-gray-500">Enterate de ofertas y ferias.</p>
                  </div>
                </div>
                {permissions.notifications && <CheckCircle2 className="w-6 h-6 text-green-600" />}
              </button>

              <button
                onClick={requestLocation}
                className={`w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between group ${permissions.location ? 'border-green-500 bg-green-50' : 'border-gray-100 dark:border-gray-800'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${permissions.location ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <MapPin className={`w-6 h-6 ${permissions.location ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm">Ubicación</h4>
                    <p className="text-[10px] text-gray-500">Para mostrarte ferias cercanas.</p>
                  </div>
                </div>
                {permissions.location && <CheckCircle2 className="w-6 h-6 text-green-600" />}
              </button>
            </div>

            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Finalizar Registro ✨</>}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}