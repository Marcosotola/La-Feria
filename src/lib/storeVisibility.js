// src/lib/storeVisibility.js

// El dueño de la tienda siempre puede verla (vista previa), esté publicada o no.
// El resto del público solo la ve si tiene suscripción activa Y el dueño la publicó explícitamente.
export function canViewStore(storeData, viewerUid) {
  if (!storeData) return false;
  if (viewerUid && storeData.id === viewerUid) return true;
  const isApproved = storeData.accountStatus === 'approved' || storeData.accountStatus === 'true';
  return isApproved && storeData.storePublished === true;
}
