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
      
      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      
      if (userDoc.exists()) {
        window.location.href = '/dashboard'
      } else {
        // Es un usuario nuevo que entró por login, mandarlo a completar registro
        window.location.href = '/register'
      }
    } catch (err) {
      setError('Código incorrecto')
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
      await loginWithEmail(emailData.email, emailData.password)
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Credenciales incorrectas')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8 bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        
        <div className="text-center relative z-10">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
            Bienvenido a <span className="text-primary-600">La Feria</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Inicia sesión para continuar
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
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
                <div className="px-4 space-y-1">
                  <p className="text-[10px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight text-center">
                    ⚠️ Ingresar <span className="text-primary-600">SIN el 0</span> y <span className="text-primary-600">SIN el 15</span>
                  </p>
                  <p className="text-[10px] text-gray-400 text-center font-medium">
                    Recibirás un SMS con un código de 6 dígitos para validar tu identidad.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-black rounded-[2rem] shadow-xl shadow-brand-teal-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Enviar Código <ArrowRight className="w-5 h-5" /></>}
                </button>
              </div>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white dark:bg-gray-900 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Otras formas de acceso
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={signInWithGoogle}
                className="py-4 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" /> Google
              </button>
              <button
                onClick={() => setStep(3)}
                className="py-4 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Mail className="w-4 h-4" /> Email
              </button>
            </div>

            <button
              onClick={() => {
                setError(null)
                setShowToast(false)
                onSwitchToRegister()
              }}
              className="mt-6 w-full py-4 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-black text-gray-600 dark:text-gray-400 hover:border-brand-teal-500 hover:text-brand-teal-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
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

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Acceso por Email</h3>
              <p className="text-sm text-gray-500 font-medium">Ingresa tus credenciales para continuar.</p>
            </div>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-teal-500" />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={emailData.email}
                  onChange={(e) => setEmailData({...emailData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-teal-500 rounded-[2rem] transition-all font-bold"
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
                  className="w-full pl-12 pr-4 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-teal-500 rounded-[2rem] transition-all font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-black rounded-[2rem] shadow-xl shadow-brand-teal-600/30 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <>Iniciar Sesión <ArrowRight className="w-5 h-5" /></>}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-center text-xs text-gray-400 font-bold hover:text-brand-teal-600 transition-colors uppercase tracking-widest">Usar otro método</button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}