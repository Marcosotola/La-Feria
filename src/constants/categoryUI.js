import {
  Smartphone, Car, Home, Shirt, Sofa, PawPrint, UtensilsCrossed, Palette,
  Dumbbell, BookOpen, Baby, Heart, Music, Building2, Package,
  UserCheck, Wrench, Sparkles, GraduationCap, Truck, PartyPopper,
  Settings, Shield, DollarSign, Stethoscope, CircleHelp,
  Briefcase, Code, TrendingUp, Hammer, ChefHat, Users,
  Activity, MapPin, HardHat, ShoppingCart, Camera, ShieldCheck, Zap,
  Leaf, Scale
} from 'lucide-react';

// Mapeo de iconos para productos
export const productIconMap = {
  'tecnologia': Smartphone,
  'vehiculos': Car,
  'inmuebles': Home,
  'moda_belleza': Shirt,
  'hogar_decoracion': Sofa,
  'mascotas': PawPrint,
  'alimentos_bebidas': UtensilsCrossed,
  'arte_manualidades': Palette,
  'deportes_fitness': Dumbbell,
  'libros_educacion': BookOpen,
  'bebes_ninos': Baby,
  'salud_bienestar': Heart,
  'musica_entretenimiento': Music,
  'industria_comercio': Building2,
  'servicios': Briefcase,
  'trabajo': Briefcase,
  'otros': Package
};

// Mapeo de iconos para servicios
export const serviceIconMap = {
  'belleza_y_bienestar': Sparkles,
  'salud_y_medicina': Stethoscope,
  'educacion_y_capacitacion': GraduationCap,
  'tecnologia_e_informatica': Code,
  'hogar_y_mantenimiento': Wrench,
  'automotriz': Car,
  'eventos_y_celebraciones': PartyPopper,
  'deportes_y_fitness': Dumbbell,
  'mascotas': PawPrint,
  'consultoria_y_negocios': Briefcase,
  'marketing_y_publicidad': TrendingUp,
  'diseño_y_creatividad': Palette,
  'fotografia_y_video': Camera,
  'musica_y_entretenimiento': Music,
  'gastronomia': ChefHat,
  'jardineria_y_paisajismo': Leaf,
  'limpieza': Home,
  'transporte_y_logistica': Truck,
  'servicios_legales': Scale,
  'servicios_financieros': DollarSign,
  'otros': CircleHelp
};

// Mapeo de iconos para empleos
export const employmentIconMap = {
  'administracion': Briefcase,
  'tecnologia': Code,
  'marketing': TrendingUp,
  'ventas': ShoppingCart,
  'salud': Activity,
  'belleza': Sparkles,
  'educacion': Users,
  'gastronomia': ChefHat,
  'construccion': HardHat,
  'hogar': Home,
  'transporte': MapPin,
  'eventos': Camera,
  'automotriz': Car,
  'legal': Scale,
  'seguridad': ShieldCheck,
  'mascotas': PawPrint,
  'otro': Briefcase
};

// Colores para cada tipo principal (Sincronizados con el logo)
export const mainCategoryColors = {
  productos: 'from-amber-400 to-amber-500',
  servicios: 'from-accent-400 to-accent-500',
  empleos: 'from-brand-teal-700 to-brand-teal-800'
};

// Colores específicos para subcategorías
export const categoryColors = {
  // Productos
  'tecnologia': 'from-blue-500 to-indigo-600',
  'vehiculos': 'from-red-500 to-orange-600',
  'inmuebles': 'from-green-500 to-emerald-600',
  'moda_belleza': 'from-pink-500 to-rose-600',
  'hogar_decoracion': 'from-amber-500 to-yellow-600',
  'mascotas': 'from-purple-500 to-violet-600',
  'alimentos_bebidas': 'from-orange-500 to-red-500',
  'arte_manualidades': 'from-indigo-500 to-purple-600',
  'deportes_fitness': 'from-cyan-500 to-blue-600',
  'libros_educacion': 'from-teal-500 to-green-600',
  'bebes_ninos': 'from-pink-400 to-purple-500',
  'salud_bienestar': 'from-green-400 to-teal-500',
  'musica_entretenimiento': 'from-violet-500 to-purple-600',
  'industria_comercio': 'from-gray-500 to-slate-600',
  'servicios': 'from-blue-600 to-cyan-600',
  'trabajo': 'from-emerald-600 to-teal-600',
  'otros': 'from-gray-400 to-gray-600',

  // Servicios
  'belleza_y_bienestar': 'from-pink-600 to-rose-700',
  'salud_y_medicina': 'from-emerald-600 to-teal-700',
  'educacion_y_capacitacion': 'from-green-600 to-emerald-700',
  'tecnologia_e_informatica': 'from-blue-600 to-indigo-700',
  'hogar_y_mantenimiento': 'from-amber-600 to-orange-700',
  'automotriz': 'from-red-600 to-orange-700',
  'eventos_y_celebraciones': 'from-purple-600 to-violet-700',
  'deportes_y_fitness': 'from-cyan-600 to-teal-700',
  'mascotas': 'from-purple-500 to-violet-600',
  'consultoria_y_negocios': 'from-slate-600 to-gray-700',
  'marketing_y_publicidad': 'from-pink-500 to-rose-600',
  'diseño_y_creatividad': 'from-indigo-500 to-purple-600',
  'fotografia_y_video': 'from-gray-600 to-slate-700',
  'musica_y_entretenimiento': 'from-violet-500 to-purple-600',
  'gastronomia': 'from-orange-500 to-red-500',
  'jardineria_y_paisajismo': 'from-green-500 to-emerald-600',
  'limpieza': 'from-cyan-500 to-blue-600',
  'transporte_y_logistica': 'from-gray-600 to-slate-700',
  'servicios_legales': 'from-slate-700 to-gray-800',
  'servicios_financieros': 'from-yellow-600 to-amber-700',
  'otros': 'from-gray-400 to-gray-600',

  // Empleos
  'administracion': 'from-slate-600 to-gray-700',
  'tecnologia': 'from-blue-600 to-indigo-700',
  'marketing': 'from-pink-500 to-rose-600',
  'ventas': 'from-green-600 to-emerald-700',
  'salud': 'from-emerald-600 to-teal-700',
  'belleza': 'from-pink-600 to-rose-700',
  'educacion': 'from-teal-600 to-cyan-700',
  'gastronomia': 'from-red-600 to-rose-700',
  'construccion': 'from-orange-600 to-red-700',
  'hogar': 'from-amber-600 to-orange-700',
  'transporte': 'from-gray-600 to-slate-700',
  'eventos': 'from-purple-600 to-violet-700',
  'automotriz': 'from-red-600 to-orange-700',
  'legal': 'from-slate-700 to-gray-800',
  'seguridad': 'from-indigo-600 to-blue-700',
  'mascotas': 'from-purple-500 to-violet-600',
  'otro': 'from-gray-500 to-slate-600'
};
