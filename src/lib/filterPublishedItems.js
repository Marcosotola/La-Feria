// src/lib/filterPublishedItems.js
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

function isStorePublished(storeData) {
  if (!storeData) return false;
  const isApproved = storeData.accountStatus === 'approved' || storeData.accountStatus === 'true';
  return isApproved && storeData.storePublished === true;
}

// Dado un set de uids de dueños de tienda, devuelve el subconjunto cuya tienda
// está aprobada (suscripción activa) Y publicada (el dueño la hizo pública).
export async function getPublishedStoreIds(ownerIds) {
  const uniqueIds = [...new Set(ownerIds)].filter(Boolean);
  const published = new Set();
  if (uniqueIds.length === 0) return published;

  // Firestore soporta hasta 30 valores por consulta "in"
  for (let i = 0; i < uniqueIds.length; i += 30) {
    const chunk = uniqueIds.slice(i, i + 30);
    const q = query(collection(db, 'users'), where(documentId(), 'in', chunk));
    const snap = await getDocs(q);
    snap.forEach(docSnap => {
      if (isStorePublished(docSnap.data())) published.add(docSnap.id);
    });
  }
  return published;
}

// Filtra una lista de items (productos/servicios/empleos) dejando solo los que
// pertenecen a una tienda aprobada y publicada al público.
export async function filterItemsByPublishedStore(items, ownerIdField = 'usuarioId') {
  const publishedIds = await getPublishedStoreIds(items.map(item => item[ownerIdField]));
  return items.filter(item => publishedIds.has(item[ownerIdField]));
}
