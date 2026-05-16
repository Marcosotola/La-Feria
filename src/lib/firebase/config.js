// src/lib/firebase/config.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase (evitar múltiples inicializaciones)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Inicializar App Check y messaging solo en el cliente
let messaging = null;
if (typeof window !== 'undefined') {
  if (process.env.NODE_ENV === 'development') {
    // Desarrollo: bypass reCAPTCHA, usar números de prueba de Firebase Console
    auth.settings.appVerificationDisabledForTesting = true;
  } else {
    // Producción: App Check con reCAPTCHA Enterprise para phone auth
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider('6LeSM-AsAAAAAIY4YxApMXFW45hJacgQYoMxK0oa'),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (_) {
      // Ya inicializado (hot reload)
    }
  }

  isSupported().then(supported => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, auth, db, storage, messaging };
export default app;