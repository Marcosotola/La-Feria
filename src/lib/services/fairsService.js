import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  GeoPoint
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'ferias';

/**
 * Crea una nueva feria en la base de datos
 */
export const createFair = async (fairData, creatorId) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...fairData,
      creatorId,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // El cliente debe enviar latitude y longitude para crear el GeoPoint
      location: fairData.location ? new GeoPoint(fairData.location.lat, fairData.location.lng) : null
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating fair:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtiene todas las ferias activas para el mapa
 */
export const getAllFairs = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convertir GeoPoint a objeto plano para el componente de mapa
      location: doc.data().location ? {
        lat: doc.data().location.latitude,
        lng: doc.data().location.longitude
      } : null
    }));
  } catch (error) {
    console.error("Error getting fairs:", error);
    return [];
  }
};

/**
 * Obtiene las ferias creadas por un organizador específico
 */
export const getFairsByOrganizer = async (organizerId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('creatorId', '==', organizerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting organizer fairs:", error);
    return [];
  }
};

/**
 * Actualiza los datos de una feria
 */
export const updateFair = async (fairId, updateData) => {
  try {
    const fairRef = doc(db, COLLECTION_NAME, fairId);
    
    // Si hay datos de ubicación, actualizamos el GeoPoint
    const finalData = { ...updateData, updatedAt: serverTimestamp() };
    if (updateData.location) {
      finalData.location = new GeoPoint(updateData.location.lat, updateData.location.lng);
    }

    await updateDoc(fairRef, finalData);
    return { success: true };
  } catch (error) {
    console.error("Error updating fair:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Elimina (o desactiva) una feria
 */
export const deleteFair = async (fairId) => {
  try {
    const fairRef = doc(db, COLLECTION_NAME, fairId);
    // Preferimos desactivar en lugar de borrar físicamente
    await updateDoc(fairRef, { 
      status: 'inactive',
      deletedAt: serverTimestamp() 
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting fair:", error);
    return { success: false, error: error.message };
  }
};
