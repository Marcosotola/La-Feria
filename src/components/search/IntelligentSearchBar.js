'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, X, Mic, Loader2 } from 'lucide-react';
import SearchResults from './SearchResults';
import { cn } from '@/lib/utils';

export default function IntelligentSearchBar({ className = '' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);
  const router = useRouter();

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query) => {
    if (!query || query.trim().length < 3) {
      setResults(null);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchQuery: query }),
      });

      if (!response.ok) {
        throw new Error(`Error en la búsqueda: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      setShowResults(true);

    } catch (err) {
      console.error('Error en búsqueda inteligente:', err);
      setError('Hubo un error al buscar. Intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    handleSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults(null);
    setShowResults(false);
    setError(null);
  };

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl mx-auto z-50", className)}>
      {/* Etiqueta de la característica (Mágico/IA) */}
      <div className="flex items-center gap-1.5 mb-2 ml-1">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-teal-500/10 dark:bg-brand-teal-500/20">
          <Sparkles className="w-3 h-3 text-brand-teal-600 dark:text-brand-teal-400" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-teal-700 dark:text-brand-teal-300">
          Asistente Inteligente
        </span>
      </div>

      {/* Contenedor de la barra de búsqueda */}
      <form 
        onSubmit={handleSubmit} 
        className={cn(
          "relative group transition-all duration-300 ease-in-out",
          isFocused ? "scale-[1.01]" : "scale-100"
        )}
      >
        <div className={cn(
          "relative flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300",
          isFocused 
            ? "border-brand-teal-500 shadow-brand-teal-500/10 ring-4 ring-brand-teal-500/5" 
            : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 shadow-gray-200/50 dark:shadow-black/20"
        )}>
          {/* Icono Principal */}
          <div className="pl-4 pr-2 text-gray-400 group-focus-within:text-brand-teal-500 transition-colors">
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          {/* Input Principal */}
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onChange={handleInputChange}
            placeholder="¿Qué estás buscando hoy?"
            className="w-full py-4 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400 text-base md:text-lg font-medium"
          />

          {/* Acciones del lado derecho */}
          <div className="flex items-center gap-2 pr-2 ml-auto">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {!searchQuery && (
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-400 transition-colors hidden sm:block"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}

            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className={cn(
                "px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300",
                searchQuery.trim() 
                  ? "bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/30 hover:bg-brand-teal-600 transform active:scale-90" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 opacity-50"
              )}
            >
              BUSCAR
            </button>
          </div>
        </div>

        {/* Efecto de brillo detrás cuando está enfocado */}
        {isFocused && (
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-teal-400 to-accent-400 rounded-2xl blur opacity-20 -z-10 animate-pulse" />
        )}
      </form>

      {/* Resultados con mejor espaciado y transición */}
      {showResults && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <SearchResults
            results={results}
            error={error}
            searchQuery={searchQuery}
            onClose={() => {
              setShowResults(false);
              setIsFocused(false);
            }}
          />
        </div>
      )}
      
      {/* Sugerencias rápidas (Opcional, mejora el visual) */}
      {!showResults && !searchQuery && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sugerencias</p>
          <div className="flex flex-wrap gap-2">
            {['Regalo para mamá', 'Sushi a domicilio', 'Clases de guitarra', 'Ropa usada'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  handleSearch(tag);
                }}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-900/30 hover:text-brand-teal-600 dark:hover:text-brand-teal-400 text-sm text-gray-600 dark:text-gray-300 rounded-full transition-colors border border-gray-100 dark:border-gray-600"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}