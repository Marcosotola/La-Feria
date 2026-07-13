// src/lib/storeConfigUtils.js
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Configuración por defecto para nuevas tiendas
export const defaultStoreConfig = {
  // Secciones de contenido
  showProducts: true,
  showServices: true,
  showJobs: false,
  showGallery: false,
  showTestimonials: false,
  showAbout: true,

  // Personalización visual
  theme: 'modern',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  
  // Redes sociales
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    website: ''
  },
  
  // Configuración de contacto
  showWhatsApp: true
};

// Obtener configuración de la tienda
export const getStoreConfig = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && userDoc.data().storeConfig) {
      // Combinar configuración existente con valores por defecto
      // para asegurar que todas las propiedades estén presentes
      return {
        ...defaultStoreConfig,
        ...userDoc.data().storeConfig,
        // Asegurar que socialLinks sea un objeto completo
        socialLinks: {
          ...defaultStoreConfig.socialLinks,
          ...(userDoc.data().storeConfig?.socialLinks || {})
        }
      };
    }
    return defaultStoreConfig;
  } catch (error) {
    console.error('Error al obtener configuración de tienda:', error);
    return defaultStoreConfig;
  }
};

// Guardar configuración de la tienda
export const saveStoreConfig = async (userId, config) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      storeConfig: config
    });
    return { success: true };
  } catch (error) {
    console.error('Error al guardar configuración de tienda:', error);
    return { success: false, error: error.message };
  }
};

// Inicializar configuración por defecto para un usuario nuevo
export const initializeStoreConfig = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && !userDoc.data().storeConfig) {
      await updateDoc(doc(db, 'users', userId), {
        storeConfig: defaultStoreConfig
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error al inicializar configuración de tienda:', error);
    return { success: false, error: error.message };
  }
};

// Obtener configuración para la vista pública de la tienda
export const getPublicStoreConfig = async (userId) => {
  try {
    const config = await getStoreConfig(userId);
    
    // Filtrar solo las configuraciones necesarias para la vista pública
    return {
      showProducts: config.showProducts,
      showServices: config.showServices,
      showJobs: config.showJobs,
      showGallery: config.showGallery,
      showTestimonials: config.showTestimonials,
      showAbout: config.showAbout,
      theme: config.theme,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      socialLinks: config.socialLinks,
      showWhatsApp: config.showWhatsApp
    };
  } catch (error) {
    console.error('Error al obtener configuración pública de tienda:', error);
    return defaultStoreConfig;
  }
};

// Validar URLs de redes sociales
export const validateSocialUrl = (url, platform) => {
  if (!url || url.trim() === '') return true; // URLs vacías son válidas
  
  try {
    const urlObj = new URL(url);
    
    // Validaciones específicas por plataforma
    switch (platform) {
      case 'facebook':
        return urlObj.hostname.includes('facebook.com') || urlObj.hostname.includes('fb.com');
      case 'instagram':
        return urlObj.hostname.includes('instagram.com');
      case 'twitter':
        return urlObj.hostname.includes('twitter.com') || urlObj.hostname.includes('x.com');
      case 'linkedin':
        return urlObj.hostname.includes('linkedin.com');
      case 'website':
        return true; // Cualquier URL válida para sitio web
      default:
        return true;
    }
  } catch {
    return false;
  }
};

// Aplicar tema a CSS custom properties
export const applyThemeToCSS = (theme, primaryColor, secondaryColor) => {
  const root = document.documentElement;
  
  // Aplicar colores personalizados
  root.style.setProperty('--store-primary', primaryColor);
  root.style.setProperty('--store-secondary', secondaryColor);
  
  // Aplicar configuraciones específicas del tema
  switch (theme) {
    case 'modern':
      root.style.setProperty('--store-border-radius', '0.5rem');
      root.style.setProperty('--store-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
      break;
    case 'classic':
      root.style.setProperty('--store-border-radius', '0.25rem');
      root.style.setProperty('--store-shadow', '0 2px 4px rgba(0, 0, 0, 0.1)');
      break;
    case 'minimal':
      root.style.setProperty('--store-border-radius', '0');
      root.style.setProperty('--store-shadow', 'none');
      break;
    case 'colorful':
      root.style.setProperty('--store-border-radius', '1rem');
      root.style.setProperty('--store-shadow', '0 8px 25px -8px rgba(0, 0, 0, 0.2)');
      break;
    default:
      break;
  }
};

// Obtener configuración de tema CSS
export const getThemeCSS = (theme, primaryColor, secondaryColor) => {
  const baseStyles = `
    :root {
      --store-primary: ${primaryColor};
      --store-secondary: ${secondaryColor};
    }
  `;
  
  const themeSpecificStyles = {
    modern: `
      .store-container {
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
    `,
    classic: `
      .store-container {
        border-radius: 0.25rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `,
    minimal: `
      .store-container {
        border-radius: 0;
        box-shadow: none;
      }
    `,
    colorful: `
      .store-container {
        border-radius: 1rem;
        box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
      }
    `
  };
  
  return baseStyles + (themeSpecificStyles[theme] || themeSpecificStyles.modern);
};