// src/components/store/TiendaSetupChecklist.js
'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

export default function TiendaSetupChecklist({ userData }) {
  const isApproved = userData?.accountStatus === 'approved' || userData?.accountStatus === 'true';

  const items = [
    {
      label: 'Nombre y URL de tu tienda',
      done: !!(userData?.businessName && userData?.storeSlug),
      href: null,
    },
    {
      label: 'Logo de tu tienda',
      done: !!userData?.storeLogo,
      href: '/dashboard/tienda/logo',
    },
    {
      label: 'WhatsApp de contacto',
      done: !!userData?.whatsapp,
      href: null,
    },
    {
      label: 'Suscripción activa',
      done: isApproved,
      href: null,
      hint: !isApproved ? 'Suscribite desde el botón "Publicar" de arriba' : null,
    },
    {
      label: 'Tienda publicada',
      done: userData?.storePublished === true,
      href: null,
      hint: userData?.storePublished !== true ? 'Publicá desde el botón "Publicar" de arriba' : null,
    },
  ];

  const doneCount = items.filter(i => i.done).length;
  const total = items.length;
  const percent = Math.round((doneCount / total) * 100);

  if (doneCount === total) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tu tienda está lista al {percent}%
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{doneCount}/{total}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-brand-teal-500 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="space-y-2.5">
        {items.map((item) => {
          const Wrapper = item.href && !item.done ? Link : 'div';
          const wrapperProps = item.href && !item.done ? { href: item.href } : {};
          return (
            <li key={item.label}>
              <Wrapper
                {...wrapperProps}
                className={`flex items-center justify-between gap-2 ${item.href && !item.done ? 'group cursor-pointer' : ''}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.done ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className={`text-sm ${item.done ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white font-medium'}`}>
                      {item.label}
                    </span>
                    {item.hint && (
                      <p className="text-xs text-gray-400">{item.hint}</p>
                    )}
                  </div>
                </div>
                {item.href && !item.done && (
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-teal-500 transition-colors flex-shrink-0" />
                )}
              </Wrapper>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
