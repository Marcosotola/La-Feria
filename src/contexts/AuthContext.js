// src/contexts/AuthContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  // Función para generar slug de la tienda
  const generateStoreSlug = (businessName, displayName) => {
    const name = businessName || displayName || 'tienda';
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  // Verificar y cargar datos del usuario
  const loadUserData = async (authUser) => {
    if (!authUser) {
      setUserData(null);
      setNeedsProfileCompletion(false);
      return null;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', authUser.uid));
      
      if (!userDoc.exists()) {
        setNeedsProfileCompletion(true);
        return null;
      }

      const data = userDoc.data();
      
      // Verificar si necesita completar perfil (usuarios de Google)
      if (data.isGoogleUser && !data.profileCompleted) {
        setNeedsProfileCompletion(true);
        return data;
      }

      setUserData(data);
      setNeedsProfileCompletion(false);
      return data;
    } catch (error) {
      setNeedsProfileCompletion(false);
      return null;
    }
  };

  // ✨ NUEVA FUNCIÓN: Refrescar datos del usuario desde Firestore
  const refreshUserData = async () => {
    if (!user?.uid) {
      console.warn('⚠️ No hay usuario autenticado para refrescar datos');
      return null;
    }

    try {
      console.log('🔄 Refrescando datos del usuario desde Firestore...');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const freshData = userDoc.data();
        setUserData(freshData);
        console.log('✅ Datos de usuario actualizados desde Firestore');
        return freshData;
      } else {
        console.warn('⚠️ Documento de usuario no encontrado');
        return null;
      }
    } catch (error) {
      console.error('❌ Error refrescando datos del usuario:', error);
      return null;
    }
  };

  // 📱 NUEVA FUNCIÓN: Configurar Recaptcha para Teléfono
  const setupRecaptcha = (containerId) => {
    if (window.recaptchaVerifier) return window.recaptchaVerifier;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
    return window.recaptchaVerifier;
  };

  const clearRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear() } catch (_) {}
      window.recaptchaVerifier = null
    }
  };

  // 📱 NUEVA FUNCIÓN: Iniciar sesión con teléfono (enviar SMS)
  const signInWithPhone = async (phoneNumber, recaptchaVerifier) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error("Error al enviar SMS:", error);
      throw error;
    }
  };

  // Login con email y contraseña
  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await loadUserData(userCredential.user);
      
      if (!userCredential.user.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error('Por favor verifica tu email antes de continuar');
      }

      return { user: userCredential.user, userData };
    } catch (error) {
      throw error;
    }
  };

  // Registro con email y contraseña
  const registerWithEmail = async (formData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      await sendEmailVerification(userCredential.user);
      
      const storeSlug = generateStoreSlug(formData.businessName, formData.firstName + ' ' + formData.lastName);
      
      const newUserData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        familyName: formData.familyName,
        businessName: formData.businessName,
        storeSlug: storeSlug,
        storeUrl: `/tienda/${storeSlug}`,
        accountStatus: 'pending',
        acceptNotifications: formData.acceptNotifications,
        emailVerified: false,
        profileCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'user'
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);
      
      // Cerrar sesión hasta que verifique email
      await firebaseSignOut(auth);
      
      return { 
        success: true, 
        message: `¡Cuenta creada exitosamente! Tu tienda estará disponible en: laferia.com/tienda/${storeSlug}\n\nPor favor verifica tu email antes de continuar.`
      };
    } catch (error) {
      throw error;
    }
  };

  // Login/Registro con Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Usuario nuevo con Google
        const newUserData = {
          email: result.user.email,
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          familyName: '',
          businessName: '',
          storeSlug: '',
          storeUrl: '',
          accountStatus: 'pending',
          acceptNotifications: false,
          emailVerified: result.user.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
          role: 'user',
          isGoogleUser: true,
          profileCompleted: false
        };

        await setDoc(doc(db, 'users', result.user.uid), newUserData);
        setNeedsProfileCompletion(true);
        return { user: result.user, needsCompletion: true };
      }

      const userData = userDoc.data();
      
      if (userData.isGoogleUser && !userData.profileCompleted) {
        setNeedsProfileCompletion(true);
        return { user: result.user, userData, needsCompletion: true };
      }

      setUserData(userData);
      setNeedsProfileCompletion(false);
      return { user: result.user, userData, needsCompletion: false };
      
    } catch (error) {
      throw error;
    }
  };

  // Completar perfil de usuario de Google
  const completeProfile = async (profileData) => {
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      const storeSlug = generateStoreSlug(profileData.businessName, user.displayName);
      
      const updateData = {
        familyName: profileData.familyName,
        businessName: profileData.businessName,
        storeSlug: storeSlug,
        storeUrl: `/tienda/${storeSlug}`,
        acceptNotifications: profileData.acceptNotifications,
        profileCompleted: true,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'users', user.uid), updateData);
      
      // Recargar datos del usuario
      await loadUserData(user);
      setNeedsProfileCompletion(false);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      setNeedsProfileCompletion(false);
    } catch (error) {
      throw error;
    }
  };

  // Listener de cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        await loadUserData(authUser);
      } else {
        setUserData(null);
        setNeedsProfileCompletion(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Estados derivados
  const isAuthenticated = !!user;
  const isEmailVerified = user?.emailVerified ?? false;
  const accountStatus = userData?.accountStatus || 'pending';
  const isApproved = accountStatus === 'approved';
  
  const value = {
    // Estados
    user,
    userData,
    loading,
    needsProfileCompletion,
    isAuthenticated,
    isEmailVerified,
    accountStatus,
    isApproved,
    
    // Funciones
    loginWithEmail,
    registerWithEmail,
    signInWithGoogle,
    completeProfile,
    resetPassword,
    signOut,
    refreshUserData,
    setupRecaptcha,
    clearRecaptcha,
    signInWithPhone
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};