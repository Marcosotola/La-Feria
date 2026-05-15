'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Sparkles,
  ShoppingBag,
  Briefcase,
  Wrench,
  AlertCircle,
  SearchX,
  Store,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SearchResults({ results, error, searchQuery, onClose }) {
  const router = useRouter();

  if (error) {
    return (
      <div className="absolute z-50 w-full mt-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-red-100 dark:border-red-900/30 p-8 text-center animate-in fade-in zoom-in duration-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¡Ups! Algo salió mal</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">{error}</p>
      </div>
    );
  }

  if (!results) return null;

  const totalResults =
    results.productos.length + results.servicios.length + results.empleos.length;

  if (totalResults === 0) {
    const keywords = results?.analysis?.palabras_clave?.filter(w => w.length > 3).slice(0, 6) || [];
    const intencion = results?.analysis?.intencion;

    return (
      <div className="absolute z-50 w-full mt-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700/50">
              <SearchX className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-base font-bold text-gray-900 dark:text-white">
              Sin resultados por ahora
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {intencion && (
          <div className="mx-5 mb-3 px-4 py-3 bg-brand-teal-50 dark:bg-brand-teal-900/20 rounded-xl border border-brand-teal-100 dark:border-brand-teal-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-teal-600 dark:text-brand-teal-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Entendí que buscás
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{intencion}"</p>
          </div>
        )}

        <div className="px-5 pb-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Todavía no hay publicaciones que coincidan. Probá con:
          </p>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keywords.map(word => (
                <span
                  key={word}
                  className="px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleItemClick = (type, item) => {
    onClose();
    const slug = item.tiendaInfo?.slug || item.storeSlug || 'tienda';
    
    if (type === 'producto') {
      router.push(`/tienda/${slug}/producto/${item.id}`);
    } else if (type === 'servicio') {
      router.push(`/tienda/${slug}/servicios/${item.id}`);
    } else if (type === 'empleo') {
      router.push(`/tienda/${slug}/empleos/${item.id}`);
    }
  };

  const ResultSection = ({ title, icon: Icon, items, type, colorClass }) => (
    <div className="p-4 md:p-6 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
          <Icon className={cn("w-4 h-4", colorClass)} />
          {title} ({items.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(type, item)}
            className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 text-left border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
          >
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
              {item.imagenes?.[0] || item.imagenPrincipal || item.foto ? (
                <Image
                  src={item.imagenes?.[0] || item.imagenPrincipal || item.foto}
                  alt={item.nombre || item.titulo}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-400 transition-colors">
                {item.nombre || item.titulo}
              </h4>
              
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Store className="w-3 h-3" />
                  <span className="truncate">{item.tiendaInfo?.nombre || 'Tienda Local'}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                {(item.precio || item.salario?.minimo || item.pretensionSalarial?.minimo) ? (
                  <span className={cn("text-sm font-black", colorClass)}>
                    ${(item.precio || item.salario?.minimo || item.pretensionSalarial?.minimo).toLocaleString()}
                    {(type === 'servicio') && ' +'}
                    {(type === 'empleo' && (item.salario?.maximo || item.pretensionSalarial?.maximo)) && ` - $${(item.salario?.maximo || item.pretensionSalarial?.maximo).toLocaleString()}`}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-400">Consultar</span>
                )}
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                  <ChevronRight className={cn("w-4 h-4", colorClass)} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="absolute z-50 w-full mt-3 bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-700 max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Header con análisis de IA - "Pensamiento Mágico" */}
      {results.analysis && (
        <div className="relative p-5 md:p-6 bg-gradient-to-br from-brand-teal-50 to-accent-50 dark:from-brand-teal-900/10 dark:to-accent-900/10 border-b border-brand-teal-100/50 dark:border-brand-teal-900/20 overflow-hidden">
          {/* Decoración IA */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-20 h-20 text-brand-teal-500" />
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center border border-brand-teal-100 dark:border-brand-teal-800">
              <Sparkles className="w-5 h-5 text-brand-teal-500 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-teal-600 dark:text-brand-teal-400 mb-1">
                Análisis Inteligente
              </p>
              <p className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 leading-relaxed italic">
                "{results.analysis.intencion}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Área de Scroll de Resultados */}
      <div className="overflow-y-auto scrollbar-hide flex-1">
        {results.productos.length > 0 && (
          <ResultSection 
            title="Productos" 
            icon={ShoppingBag} 
            items={results.productos} 
            type="producto"
            colorClass="text-primary-600" 
          />
        )}

        {results.servicios.length > 0 && (
          <ResultSection 
            title="Servicios" 
            icon={Wrench} 
            items={results.servicios} 
            type="servicio"
            colorClass="text-brand-teal-500" 
          />
        )}

        {results.empleos.length > 0 && (
          <ResultSection 
            title="Empleos y Oportunidades" 
            icon={Briefcase} 
            items={results.empleos} 
            type="empleo"
            colorClass="text-purple-500" 
          />
        )}
      </div>

      {/* Footer del Panel */}
      <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700/50 text-center">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
          Resultados encontrados: {totalResults}
        </p>
      </div>
    </div>
  );
}