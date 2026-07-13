// src/components/tienda/StoreWhatsAppButton.js
'use client';

import { MessageCircle } from 'lucide-react';

export default function StoreWhatsAppButton({ storeData, storeConfig }) {
  if (!storeConfig?.showWhatsApp || !storeData?.whatsapp) return null;

  const message = `Hola! Vi tu tienda en La Feria${storeData.businessName ? ` (${storeData.businessName})` : ''} y quería consultarte.`;
  const url = `https://wa.me/${storeData.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
    >
      <MessageCircle className="w-7 h-7" fill="white" />
    </a>
  );
}
