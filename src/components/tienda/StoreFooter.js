// src/components/tienda/StoreFooter.js
'use client';

import Link from 'next/link';
import { Mail, MessageCircle, Facebook, Instagram, Twitter, Linkedin, Globe } from 'lucide-react';

export default function StoreFooter({ storeData, storeConfig }) {
  const primaryColor = storeConfig?.primaryColor || '#ea580c';
  const social = storeConfig?.socialLinks || {};

  const hasWhatsApp = storeConfig?.showWhatsApp && storeData?.whatsapp;
  const hasEmail = !!storeData?.email;
  const hasSocial = social.facebook || social.instagram || social.twitter || social.linkedin || social.website;

  if (!hasWhatsApp && !hasEmail && !hasSocial) return null;

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Contacto */}
          {(hasWhatsApp || hasEmail) && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {hasWhatsApp && (
                <a
                  href={`https://wa.me/${storeData.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:opacity-80 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4" style={{ color: primaryColor }} />
                  WhatsApp
                </a>
              )}
              {hasEmail && (
                <a
                  href={`mailto:${storeData.email}`}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:opacity-80 transition-opacity"
                >
                  <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                  {storeData.email}
                </a>
              )}
            </div>
          )}

          {/* Redes sociales */}
          {hasSocial && (
            <div className="flex items-center gap-2">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-blue-600 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-pink-600 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-sky-500 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-blue-700 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {social.website && (
                <a href={social.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {storeConfig?.showAbout && storeData?.storeSlug && (
          <div className="text-center mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <Link
              href={`/tienda/${storeData.storeSlug}/nosotros`}
              className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              Conocé más sobre nosotros
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
}
