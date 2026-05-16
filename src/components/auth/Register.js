'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
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
  Building2,
  AlertCircle,
  Upload,
  Camera
} from 'lucide-react'
import { 
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase/config'
import Toast from '@/components/ui/Toast'

export default function Register({ onSwitchToLogin }) {
  const {
    signInWithPhone,
    verifyOtp,
    signInWithGoogle,
    registerWithEmail,
    refreshUserData,
    user: authCtxUser,
    userData: authCtxUserData,
    needsProfileCompletion
  } = useAuth()

  const recaptchaVerifierRef = useRef(null)
  const recaptchaContainerRef = useRef(null)

  const reinitRecaptcha = useCallback(() => {
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear() } catch (_) {}
      recaptchaVerifierRef.current = null
    }
    if (recaptchaContainerRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, { size: 'invisible' })
    }
  }, [])

  useEffect(() => {
    // Crear el container fuera del árbol de React para que no lo reconcilie
    const container = document.createElement('div')
    document.body.appendChild(container)
    recaptchaContainerRef.current = container
    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, container, { size: 'invisible' })

    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear() } catch (_) {}
        recaptchaVerifierRef.current = null
      }
      if (recaptchaContainerRef.current && document.body.contains(recaptchaContainerRef.current)) {
        document.body.removeChild(recaptchaContainerRef.current)
        recaptchaContainerRef.current = null
      }
    }
  }, [])

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  
  // Datos del perfil
  const [authUser, setAuthUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [phoneParts, setPhoneParts] = useState({ area: '', number: '' })
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    businessName: '', // Para puesteros
  })

  // Documentación para Organizadores
  const [dniFiles, setDniFiles] = useState({ front: null, back: null })
  const [dniPreviews, setDniPreviews] = useState({ front: null, back: null })

  const [regMethod, setRegMethod] = useState('phone') // 'phone' | 'email'
  const [emailData, setEmailData] = useState({ email: '', password: '', confirmPassword: '' })
  const [showToast, setShowToast] = useState(false)

  const [permissions, setPermissions] = useState({
    notifications: false,
    location: false
  })

  // Si el usuario ya está autenticado (Google o teléfono) sin perfil completo,
  // saltar directo al paso 3 (selección de rol) para no pedir datos de auth de nuevo
  useEffect(() => {
    if (!authCtxUser || step !== 1) return

    // Google: tiene doc con isGoogleUser=true y profileCompleted=false
    if (needsProfileCompletion && authCtxUserData?.isGoogleUser) {
      setAuthUser(authCtxUser)
      setProfileData(prev => ({
        ...prev,
        firstName: authCtxUserData.firstName || '',
        lastName: authCtxUserData.lastName || '',
        email: authCtxUserData.email || '',
      }))
      setStep(3)
      return
    }

    // Teléfono: autenticado pero sin doc en Firestore (registro incompleto o viene del login)
    if (needsProfileCompletion && !authCtxUserData && authCtxUser.phoneNumber) {
      setAuthUser(authCtxUser)
      setStep(3)
    }
  }, [authCtxUser, needsProfileCompletion, authCtxUserData, step])

  // === PASO 1: Enviar SMS ===
  const handleSendOtp = async (e) => {
    e.preventDefault()
    const cleanNumber = phoneParts.number.trim()
    if (cleanNumber.length < 10) {
      setError('Número demasiado corto (ingresá Cód. Área + Número sin 0 ni 15)')
      setShowToast(true)
      return
    }
    setLoading(true)
    setError(null)
    setShowToast(false)
    try {
      const fullPhone = `+549${cleanNumber}`
      const result = await signInWithPhone(fullPhone, recaptchaVerifierRef.current)
      setConfirmationResult(result)
      setStep(2)
    } catch (err) {
      reinitRecaptcha()
      setError('Error al enviar SMS. Verificá el número e intentá de nuevo.')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  // === PASO 2: Verificar OTP ===
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setShowToast(false)
    try {
      const result = await confirmationResult.confirm(otp)
      setAuthUser(result.user)
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      if (userDoc.exists() && userDoc.data().profileCompleted) {
        window.location.href = '/dashboard'
      } else {
        setStep(3)
      }
    } catch (err) {
      setError('Código incorrecto')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  // === EMAIL REGISTER ===
  const handleEmailRegister = async (e) => {
    e.preventDefault()
    
    if (emailData.password !== emailData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setShowToast(true)
      return
    }

    if (emailData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setShowToast(true)
      return
    }

    setLoading(true)
    setError(null)
    setShowToast(false)
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        emailData.email, 
        emailData.password
      )
      
      await sendEmailVerification(userCredential.user)
      
      setAuthUser(userCredential.user)
      setStep(3)
    } catch (err) {
      console.error("Error en registro por email:", err)
      let msg = 'Error en el registro'
      if (err.code === 'auth/email-already-in-use') msg = 'El email ya está registrado'
      if (err.code === 'auth/invalid-email') msg = 'Email inválido'
      setError(msg)
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  // === PASO 3: Selección de Rol ===
  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setStep(4)
  }

  const generateStoreSlug = (businessName, displayName) => {
    const name = businessName || displayName || 'tienda'
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  // === PASO 4: Guardar Perfil ===
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let dniUrls = { front: '', back: '' }

      if (selectedRole === 'organizer') {
        if (!dniFiles.front || !dniFiles.back) {
          throw new Error('Debes subir ambas fotos del DNI')
        }

        const frontRef = ref(storage, `users/${authUser.uid}/dni_front_${Date.now()}`)
        const frontSnapshot = await uploadBytes(frontRef, dniFiles.front)
        dniUrls.front = await getDownloadURL(frontSnapshot.ref)

        const backRef = ref(storage, `users/${authUser.uid}/dni_back_${Date.now()}`)
        const backSnapshot = await uploadBytes(backRef, dniFiles.back)
        dniUrls.back = await getDownloadURL(backSnapshot.ref)
      }

      const needsStore = selectedRole === 'puestero' || selectedRole === 'organizer'
      const storeSlug = needsStore
        ? generateStoreSlug(profileData.businessName, `${profileData.firstName} ${profileData.lastName}`)
        : ''

      const finalData = {
        ...profileData,
        role: selectedRole,
        uid: authUser.uid,
        phoneNumber: authUser.phoneNumber || '',
        email: profileData.email || authUser.email || '',
        createdAt: new Date().toISOString(),
        profileCompleted: true,
        accountStatus: 'pending',
        storeSlug,
        storeUrl: storeSlug ? `/tienda/${storeSlug}` : '',
        dniPhotos: selectedRole === 'organizer' ? dniUrls : null,
      }

      await setDoc(doc(db, 'users', authUser.uid), finalData)
      setStep(5)
    } catch (err) {
      setError(err.message || 'Error al guardar el perfil')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      setDniFiles(prev => ({ ...prev, [type]: file }))
      setDniPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }))
    }
  }

  // === GOOGLE REGISTER ===
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    setShowToast(false)
    try {
      const result = await signInWithGoogle()
      if (result?.needsCompletion) {
        setAuthUser(result.user)
        setStep(3)
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('Error al continuar con Google. Intentá de nuevo.')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  // === PASO 5: Permisos y Guardar ===
  const handleCompleteRegistration = async () => {
    setLoading(true)
    try {
      const updateData = {
        permissions,
        updatedAt: new Date(),
        accountStatus: 'active'
      }

      await setDoc(doc(db, 'users', authUser.uid), updateData, { merge: true })
      await refreshUserData()
      
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Error al finalizar el registro')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  const requestNotifications = () => {
    setPermissions(prev => ({ ...prev, notifications: !prev.notifications }))
  }

  const requestLocation = () => {
    setPermissions(prev => ({ ...prev, location: !prev.location }))
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col justify-start pt-4 pb-8 px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-900 py-6 px-5 sm:py-10 sm:px-8 shadow-2xl rounded-[3rem] border border-gray-100 dark:border-gray-800 transition-all">
            
            {/* CABECERA DINÁMICA */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div 
                    key={s} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-6 bg-brand-teal-500' : 'w-2 bg-gray-100 dark:bg-gray-800'}`}
                  />
                ))}
              </div>
              {step > 1 && step < 5 && (
                <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* PASO 1: MÉTODO DE REGISTRO */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Únete a La Feria</h3>
                  <p className="text-sm text-gray-500 font-medium">Elige tu método de registro preferido.</p>
                </div>

                {/* Toggle de Método */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  <button
                    onClick={() => setRegMethod('phone')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${regMethod === 'phone' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    CELULAR
                  </button>
                  <button
                    onClick={() => setRegMethod('email')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${regMethod === 'email' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    EMAIL
                  </button>
                  <button
                    onClick={() => setRegMethod('google')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${regMethod === 'google' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    GOOGLE
                  </button>
                </div>

                {regMethod === 'phone' && (
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
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-teal-500 rounded-[2rem] transition-all font-black text-lg"
                        />
                      </div>
                      <div className="px-4 space-y-0.5">
                        <p className="text-[10px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight text-center">
                          ⚠️ Ingresar <span className="text-primary-600">SIN el 0</span> y <span className="text-primary-600">SIN el 15</span>
                        </p>
                        <p className="text-[10px] text-gray-400 text-center font-medium">
                          Recibirás un SMS con un código de 6 dígitos para validar tu identidad.
                        </p>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-black rounded-[2rem] shadow-xl shadow-brand-teal-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Continuar <ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </form>
                )}

                {regMethod === 'email' && (
                  <form onSubmit={handleEmailRegister} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-3">
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-teal-500" />
                        <input
                          type="email"
                          required
                          placeholder="Correo Electrónico"
                          value={emailData.email}
                          onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-teal-500 rounded-[2rem] transition-all font-bold"
                        />
                      </div>
                      <div className="relative group">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-teal-500" />
                        <input
                          type="password"
                          required
                          placeholder="Contraseña (mín. 6 caracteres)"
                          value={emailData.password}
                          onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-teal-500 rounded-[2rem] transition-all font-bold"
                        />
                      </div>
                      <div className="relative group">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-teal-500" />
                        <input
                          type="password"
                          required
                          placeholder="Confirmar Contraseña"
                          value={emailData.confirmPassword}
                          onChange={(e) => setEmailData({ ...emailData, confirmPassword: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-teal-500 rounded-[2rem] transition-all font-bold"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-black rounded-[2rem] shadow-xl shadow-brand-teal-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Crear Cuenta <ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </form>
                )}

                {regMethod === 'google' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <p className="text-sm text-gray-500 text-center font-medium">
                      Registrate rápido con tu cuenta de Google.<br/>
                      <span className="text-xs text-gray-400">Si ya tenés cuenta, te va a reconocer automáticamente.</span>
                    </p>
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full py-4 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
                          Continuar con Google
                        </>
                      )}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setError(null)
                    setShowToast(false)
                    onSwitchToLogin()
                  }}
                  className="mt-6 w-full py-4 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-black text-gray-600 dark:text-gray-400 hover:border-brand-teal-500 hover:text-brand-teal-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
                >
                  ¿Ya tienes cuenta? <span className="text-brand-teal-600 group-hover:scale-105 transition-transform">Inicia sesión</span>
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
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 px-4 tracking-widest text-center block">
                      Ingresa aquí el código que recibiste por SMS
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="- - - - - -"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full py-5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-brand-teal-500 rounded-2xl transition-all font-black text-center text-3xl tracking-[0.5em] placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-black rounded-[2rem] shadow-xl shadow-brand-teal-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verificar Código <ArrowRight className="w-5 h-5" /></>}
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
                    value={profileData.email || authUser?.email || ''}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 font-bold"
                  />

                  {(selectedRole === 'puestero' || selectedRole === 'organizer') && (
                    <input
                      required
                      placeholder={selectedRole === 'organizer' ? 'Nombre de tu feria o emprendimiento' : 'Nombre de tu tienda / puesto'}
                      value={profileData.businessName}
                      onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal-500 font-bold"
                    />
                  )}

                  {selectedRole === 'organizer' && (
                    <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 px-2">Identidad (Obligatorio para Organizadores)</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'front')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          />
                          <div className={`aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${dniPreviews.front ? 'border-brand-teal-500 bg-brand-teal-50' : 'border-gray-200 dark:border-gray-800'}`}>
                            {dniPreviews.front ? (
                              <img src={dniPreviews.front} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                              <>
                                <Camera className="w-6 h-6 text-gray-400 mb-1" />
                                <span className="text-[10px] font-bold text-gray-500">DNI FRENTE</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'back')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          />
                          <div className={`aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${dniPreviews.back ? 'border-brand-teal-500 bg-brand-teal-50' : 'border-gray-200 dark:border-gray-800'}`}>
                            {dniPreviews.back ? (
                              <img src={dniPreviews.back} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                              <>
                                <Camera className="w-6 h-6 text-gray-400 mb-1" />
                                <span className="text-[10px] font-bold text-gray-500">DNI DORSO</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Siguiente Paso <ArrowRight className="w-5 h-5" /></>}
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
                  onClick={handleCompleteRegistration}
                  disabled={loading}
                  className="w-full py-5 bg-brand-teal-600 text-white font-black rounded-[2rem] shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>¡Listos para empezar! <CheckCircle2 className="w-5 h-5" /></>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast 
        message={error} 
        type="error" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </>
  )
}