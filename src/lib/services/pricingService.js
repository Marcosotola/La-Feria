import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const DEFAULT_PRICING = {
  empleos: {
    dias3: 500,
    dias5: 800,
    dias7: 1200,
  },
  servicios: {
    dias3: 500,
    dias5: 800,
    dias7: 1200,
  },
  productos: {
    dias3: 500,
    dias5: 800,
    dias7: 1200,
  },
  tienda: {
    mensual: 2000,
    trimestral: 5500,
    anual: 20000,
  },
};

export async function getPricing() {
  try {
    const snap = await getDoc(doc(db, 'config', 'pricing'));
    if (snap.exists()) {
      // Merge con defaults para no romper si faltan campos nuevos
      const saved = snap.data();
      return {
        empleos:   { ...DEFAULT_PRICING.empleos,   ...saved.empleos },
        servicios: { ...DEFAULT_PRICING.servicios, ...saved.servicios },
        productos: { ...DEFAULT_PRICING.productos, ...saved.productos },
        tienda:    { ...DEFAULT_PRICING.tienda,    ...saved.tienda },
      };
    }
    return DEFAULT_PRICING;
  } catch (e) {
    console.error('Error leyendo pricing:', e);
    return DEFAULT_PRICING;
  }
}

export async function updatePricing(data) {
  await setDoc(doc(db, 'config', 'pricing'), data, { merge: true });
}
