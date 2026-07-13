// src/components/store/StoreConfigSection.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import useToast from '@/hooks/useToast';
import CustomColorPicker from '@/components/ui/CustomColorPicker';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Settings, 
  Store, 
  Palette, 
  Eye, 
  EyeOff, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Globe,
  MessageCircle,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  QrCode,
  Download,
  Copy,
  ExternalLink,
  Check,
  Heart
} from 'lucide-react';

const StoreConfigSection = ({ showMessage }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [storeSlug, setStoreSlug] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  
  const saveTimeoutRef = useRef(null);
  const savedIndicatorTimeoutRef = useRef(null);
  
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const loadConfig = async () => {
      if (!user?.uid) return;
      
      try {
        console.log('🔄 Cargando configuración del usuario:', user.uid);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!mounted) return;
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('📄 Datos del usuario:', userData);
          console.log('⚙️ storeConfig en Firestore:', userData.storeConfig);
          
          const defaultConfig = {
            showProducts: true,
            showServices: true,
            showJobs: false,
            showGallery: false,
            showTestimonials: false,
            showAbout: true,
            theme: 'modern',
            primaryColor: '#2563eb',
            secondaryColor: '#64748b',
            socialLinks: {
              facebook: '',
              instagram: '',
              twitter: '',
              linkedin: '',
              website: ''
            },
            showWhatsApp: true
          };

          if (userData.storeConfig) {
            const loadedConfig = {
              ...defaultConfig,
              ...userData.storeConfig,
              socialLinks: {
                ...defaultConfig.socialLinks,
                ...(userData.storeConfig.socialLinks || {})
              }
            };
            
            console.log('✅ Configuración cargada:', loadedConfig);
            console.log('🎨 Colores cargados:', {
              primario: loadedConfig.primaryColor,
              secundario: loadedConfig.secondaryColor
            });
            
            setConfig(loadedConfig);
          } else {
            console.log('⚠️ No hay storeConfig, usando defaults');
            setConfig(defaultConfig);
          }
          
          if (userData.storeSlug) {
            setStoreSlug(userData.storeSlug);
            setStoreUrl(`${window.location.origin}/tienda/${userData.storeSlug}`);
          }
        }
      } catch (error) {
        console.error('❌ Error al cargar configuración:', error);
        if (mounted) {
          showMessage('error', 'Error al cargar la configuración');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadConfig();
    
    return () => {
      mounted = false;
    };
  }, [user?.uid, showMessage]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (savedIndicatorTimeoutRef.current) {
        clearTimeout(savedIndicatorTimeoutRef.current);
      }
    };
  }, []);

  const debouncedSave = useCallback(async (newConfig) => {
    if (!user?.uid) return;
    
    setAutoSaving(true);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('💾 Guardando automáticamente:', newConfig);
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          storeConfig: newConfig
        });
        
        console.log('✅ Guardado exitoso');
        window.dispatchEvent(new Event('storeConfigUpdated'));

        setAutoSaving(false);
        setLastSaved(new Date());
        
        if (savedIndicatorTimeoutRef.current) {
          clearTimeout(savedIndicatorTimeoutRef.current);
        }
        savedIndicatorTimeoutRef.current = setTimeout(() => {
          setLastSaved(null);
        }, 2000);
        
      } catch (error) {
        console.error('❌ Error al guardar configuración:', error);
        setAutoSaving(false);
        showMessage('error', 'Error al guardar los cambios');
      }
    }, 1000);
  }, [user?.uid, showMessage]);

  const handleSave = async () => {
    if (!user?.uid || !config) return;
    
    console.log('🔘 Guardado manual:', config);
    
    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        storeConfig: config
      });
      window.dispatchEvent(new Event('storeConfigUpdated'));
      showMessage('success', 'Configuración guardada correctamente');
      console.log('✅ Guardado manual exitoso');
    } catch (error) {
      console.error('❌ Error al guardar configuración:', error);
      showMessage('error', 'Error al guardar la configuración');
    }
    setSaving(false);
  };

  const handleSectionToggle = (section) => {
    setConfig(prev => {
      if (!prev) return prev;
      const newConfig = {
        ...prev,
        [section]: !prev[section]
      };
      debouncedSave(newConfig);
      return newConfig;
    });
  };

  const handleSocialLinkChange = (platform, value) => {
    setConfig(prev => {
      if (!prev) return prev;
      const newConfig = {
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      };
      debouncedSave(newConfig);
      return newConfig;
    });
  };

  const handleThemeChange = (theme) => {
    setConfig(prev => {
      if (!prev) return prev;
      const newConfig = {
        ...prev,
        theme
      };
      debouncedSave(newConfig);
      return newConfig;
    });
  };

  const handleColorChange = (colorType, value) => {
    console.log('🎨 Cambiando color:', colorType, '→', value);
    
    setConfig(prev => {
      if (!prev) return prev;
      
      const newConfig = {
        ...prev,
        [colorType]: value
      };
      
      console.log('📦 Nueva config:', newConfig);
      
      debouncedSave(newConfig);
      
      return newConfig;
    });
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    const size = 1024;
    tempCanvas.width = size;
    tempCanvas.height = size;
    const ctx = tempCanvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(canvas, 0, 0, size, size);

    tempCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qr-tienda-${storeSlug}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });

    showMessage('success', 'Código QR descargado correctamente');
  };

  const copyUrl = () => {
    if (storeUrl) {
      navigator.clipboard.writeText(storeUrl);
      showMessage('success', 'URL copiada al portapapeles');
    }
  };

  const openStore = () => {
    if (storeUrl) {
      window.open(storeUrl, '_blank');
    }
  };

  const themes = [
    { value: 'modern', label: 'Moderno' },
    { value: 'classic', label: 'Clásico' },
    { value: 'minimal', label: 'Minimalista' },
    { value: 'colorful', label: 'Colorido' }
  ];

  const contentSections = [
    { key: 'showAbout', label: 'Nosotros', icon: Heart },
    { key: 'showProducts', label: 'Productos', icon: Store },
    { key: 'showServices', label: 'Servicios', icon: Settings },
    { key: 'showJobs', label: 'Empleos', icon: Globe },
    { key: 'showGallery', label: 'Galería de Fotos', icon: Eye },
    { key: 'showTestimonials', label: 'Testimonios', icon: MessageCircle }
  ];

  const contactSections = [
    { key: 'showWhatsApp', label: 'WhatsApp', icon: MessageCircle }
  ];

  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/tu-pagina' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/tu-perfil' },
    { key: 'twitter', label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/tu-perfil' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/tu-empresa' },
    { key: 'website', label: 'Sitio Web', icon: Globe, placeholder: 'https://tu-sitio-web.com' }
  ];

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuración de Tienda
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Personaliza qué elementos mostrar en tu tienda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {autoSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </div>
          )}
          {lastSaved && !autoSaving && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-slide-in">
              <Check className="w-4 h-4" />
              <span>Guardado</span>
            </div>
          )}
        </div>
      </div>

      {storeSlug && storeUrl && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <QrCode className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            Código QR de tu Tienda
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-shrink-0">
              <div className="bg-white p-2 rounded border border-gray-200">
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={storeUrl}
                  size={120}
                  level="H"
                  includeMargin={true}
                  fgColor={config.primaryColor}
                  bgColor="#ffffff"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2 w-full min-w-0">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL de tu tienda
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={storeUrl}
                    readOnly
                    className="flex-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-gray-100 min-w-0"
                  />
                  <button
                    onClick={copyUrl}
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-xs font-medium flex items-center gap-1.5 flex-shrink-0"
                    title="Copiar URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copiar</span>
                  </button>
                  <button
                    onClick={openStore}
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center flex-shrink-0"
                    title="Abrir tienda"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={downloadQR}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Descargar QR
                </button>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                El QR usa el color primario de tu tienda
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          Secciones de Contenido
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentSections.map(({ key, label, icon: Icon }) => (
            <label key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <input
                type="checkbox"
                checked={config[key]}
                onChange={() => handleSectionToggle(key)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-gray-100">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          Personalización Visual
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tema de la Tienda
            </label>
            <select
              value={config.theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {themes.map(theme => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Primario: {config.primaryColor}
              </label>
              <CustomColorPicker
                value={config.primaryColor}
                onChange={(color) => handleColorChange('primaryColor', color)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Secundario: {config.secondaryColor}
              </label>
              <CustomColorPicker
                value={config.secondaryColor}
                onChange={(color) => handleColorChange('secondaryColor', color)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          Redes Sociales
        </h3>
        
        <div className="space-y-4">
          {socialPlatforms.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </label>
              <input
                type="url"
                value={config.socialLinks[key]}
                onChange={(e) => handleSocialLinkChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          Contacto
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {contactSections.map(({ key, label, icon: Icon }) => (
            <label key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <input
                type="checkbox"
                checked={config[key]}
                onChange={() => handleSectionToggle(key)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-gray-100">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Guardar Configuración
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StoreConfigSection;