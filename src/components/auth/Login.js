'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { RecaptchaVerifier } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { 
  Phone, 
  Key, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  Mail,
  Lock
} from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import Toast from '@/components/ui/Toast'

export default function Login({ onSwitchToRegister }) {
  const {
    signInWithPhone,
    signInWithGoogle,
    loginWithEmail
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

  const [step, setStep] = useState(1) // 1: Method Select / Phone, 2: OTP, 3: Email Login
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showToast, setShowToast] = useState(false)

  // Datos
  const [phoneParts, setPhoneParts] = useState({ area: '', number: '' })
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  
  const [emailData, setEmailData] = useState({ email: '', password: '' })
  const [loginMethod, setLoginMethod] = useState('phone')

  // === TELÉFONO ===
  const handleSendOtp = async (e) => {
    e.preventDefault()
    
    // Limpiamos espacios por si las dudas
    const cleanNumber = phoneParts.number.trim()
    const fullPhone = `+549${cleanNumber}`
    
    // Validación: Un número argentino completo (Cod. Área + Local) suele tener 10 dígitos
    if (cleanNumber.length < 10) {
      setError('Número demasiado corto (ingresá Cód. Área + Número)')
      setShowToast(true)
      return
    }
    
    setLoading(true)
    setError(null)
    setShowToast(false)
    try {
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setShowToast(false)
    try {
      const result = await confirmationResult.confirm(otp)
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      if (userDoc.exists() && userDoc.data().profileCompleted) {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/register'
      }
    } catch (err) {
      setError('Código incorrecto')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  // === GOOGLE ===
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    setShowToast(false)
    try {
      const result = await signInWithGoogle()
      if (result?.needsCompletion) {
        window.location.href = '/register'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('Error al iniciar sesión con Google. Intentá de nuevo.')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  // === EMAIL ===
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setShowToast(false)
    try {
      const result = await loginWithEmail(emailData.email, emailData.password)
      if (!result?.userData?.profileCompleted) {
        window.location.href = '/register'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      let msg = 'Email o contraseña incorrectos'
      if (err.message?.includes('verifica') || err.message?.includes('verified')) {
        msg = 'Verificá tu email antes de continuar'
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No existe una cuenta con ese email'
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Email o contraseña incorrectos'
      }
      setError(msg)
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-start pt-4 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        
        <div className="text-center relative z-10">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            Bienvenido a <span className="text-primary-600">La Feria</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Inicia sesión para continuar
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            {/* Method tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              <button
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${loginMethod === 'phone' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                CELULAR
              </button>
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${loginMethod === 'email' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                EMAIL
              </button>
              <button
                onClick={() => setLoginMethod('google')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${loginMethod === 'google' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                GOOGLE
              </button>
            </div>

            {/* Phone */}
            {loginMethod === 'phone' && (
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
                      Recibirás un SMS con un código de 6 dígitos.
                    </p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-black rounded-[2rem] shadow-xl shadow-brand-teal-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Enviar Código <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>
            )}

            {/* Email */}
            {loginMethod === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-teal-500" />
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={emailData.email}
                    onChange={(e) => setEmailData({...emailData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-teal-500 rounded-[2rem] transition-all font-bold"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-teal-500" />
                  <input
                    type="password"
                    required
                    placeholder="Tu contraseña"
                    value={emailData.password}
                    onChange={(e) => setEmailData({...emailData, password: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-teal-500 rounded-[2rem] transition-all font-bold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-black rounded-[2rem] shadow-xl shadow-brand-teal-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Iniciar Sesión <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>
            )}

            {/* Google */}
            {loginMethod === 'google' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-sm text-gray-500 text-center font-medium">
                  Ingresá con tu cuenta de Google.<br/>
                  <span className="text-xs text-gray-400">Si sos nuevo, se creará tu cuenta automáticamente.</span>
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

            {/* Register link - siempre visible */}
            <button
              onClick={() => {
                setError(null)
                setShowToast(false)
                onSwitchToRegister()
              }}
              className="w-full py-3 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-black text-gray-600 dark:text-gray-400 hover:border-brand-teal-500 hover:text-brand-teal-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
            >
              ¿No tienes cuenta? <span className="text-brand-teal-600 group-hover:scale-105 transition-transform">Regístrate gratis</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Verifica tu código</h3>
              <p className="text-sm text-gray-500">Enviado al {phoneParts.number}</p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-4 tracking-widest text-center block">
                  Ingresa aquí el código que recibiste por SMS
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="- - - - - -"
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
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Ingresar ahora <ArrowRight className="w-5 h-5" /></>}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-center text-xs text-gray-400 font-bold hover:text-brand-teal-600 transition-colors uppercase tracking-widest">Volver atrás</button>
            </form>
          </div>
        )}


      </div>
    </div>
  )
}