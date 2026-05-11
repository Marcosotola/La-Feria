// src/components/chat/ChatWithMily.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ShoppingBag, Briefcase, Package, Mic, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import SearchResults from '../search/SearchResults';
import { cn } from '@/lib/utils';


export default function ChatWithMily() {
  // Estados para el Chat
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'mily',
      text: '¡Hola! Soy la IA de La Feria 🛍️ ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Estados para la Búsqueda Convencional
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const searchContainerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Inicializar Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleInputChange({ target: { value: transcript } }); // Trigger search behavior
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Error de reconocimiento:', event.error);
        setIsListening(false);
        
        // Manejo amigable de errores comunes
        if (event.error === 'not-allowed') {
          alert('El micrófono está bloqueado. Por favor, actívalo en la configuración de tu navegador para usar la búsqueda por voz.');
        } else if (event.error === 'network') {
          alert('Error de red. Verifica tu conexión a internet.');
        }
      };


      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // No enfocar automáticamente al abrir el modal si ya hay texto (usuario escribiendo)
      if (!inputValue) {
        setTimeout(() => {
          // inputRef.current?.focus(); // Quizás no sea necesario enfocar el input del chat si ya escribió en la barra
        }, 300);
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // --- Lógica del Chat (Mily) ---

  const handleSendMessage = async (forcedMessage = null) => {
    const messageText = forcedMessage || inputValue;
    if (!messageText.trim() || isLoading) return;

    // Si el modal no está abierto, abrirlo
    if (!isOpen) {
      setIsOpen(true);
      setShowResults(false);
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = messageText;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-mily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.slice(-5),
        }),
      });

      if (!response.ok) throw new Error('Error en la respuesta');

      const data = await response.json();

      const milyMessage = {
        id: Date.now() + 1,
        type: 'mily',
        text: data.response,
        results: data.results || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, milyMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'mily',
        text: 'Ay no... Tuve un problema técnico 😅 ¿Podrías intentar de nuevo?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Lógica de Búsqueda Convencional ---

  const handleStandardSearch = async (query) => {
    if (!query || query.trim().length < 3) {
      setResults(null);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: query }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (err) {
      console.error('Error searching:', err);
      setSearchError('Hubo un error al buscar. Intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Si el modal está abierto, no buscamos (es chat)
    if (isOpen) return;

    // Debounce para búsqueda
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (value.trim().length >= 3) {
        handleStandardSearch(value);
      } else {
        setShowResults(false);
      }
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Si el modal está abierto, enviar mensaje al chat
      if (isOpen) {
        handleSendMessage();
      } else {
        // Si no, ejecutar búsqueda estándar inmediata
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        handleStandardSearch(inputValue);
      }
    }
  };

  const toggleListening = (e) => {
    e.stopPropagation(); // Prevenir abrir modal si fuera el caso antiguo
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz 😢');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'producto': return <ShoppingBag className="w-4 h-4" />;
      case 'servicio': return <Briefcase className="w-4 h-4" />;
      case 'empleo': return <Package className="w-4 h-4" />;
      default: return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getResultLink = (result) => {
    const slug = result.tiendaInfo?.slug || result.storeSlug || 'tienda';
    if (result.type === 'producto') return `/tienda/${slug}/producto/${result.id}`;
    if (result.type === 'servicio') return `/tienda/${slug}/servicios/${result.id}`;
    if (result.type === 'empleo') return `/tienda/${slug}/empleos/${result.id}`;
    return '#';
  };

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-md mx-auto px-2">
      {/* Barra de búsqueda Unificada con UX Mejorada */}
      <div
        className={cn(
          "flex items-center bg-white dark:bg-gray-800 rounded-3xl p-1.5 border-2 transition-all duration-500 shadow-xl shadow-brand-teal-500/10",
          isOpen ? 'opacity-0 pointer-events-none scale-95 absolute' : 'opacity-100 relative scale-100',
          "border-brand-teal-500/30 focus-within:border-brand-teal-500 focus-within:ring-4 focus-within:ring-brand-teal-500/10"
        )}
      >
        {/* Lado Izquierdo: Mily con Invitación al Chat */}
        <button 
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative flex-shrink-0 group flex items-center gap-2 pl-1 pr-3 py-1 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-900/20 rounded-2xl transition-all duration-300"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-teal-400 to-brand-teal-600 rounded-full flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-brand-teal-100">
              <Sparkles className="w-2.5 h-2.5 text-brand-teal-500 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col items-start leading-none hidden sm:flex">
            <span className="text-[10px] font-black text-brand-teal-600 dark:text-brand-teal-400 uppercase tracking-tighter">Chat</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase">IA</span>
          </div>
          
          {/* Tooltip de invitación (Solo móvil o desktop sutil) */}
          {!inputValue && (
            <div className="absolute -top-10 left-0 bg-brand-teal-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg animate-bounce shadow-lg pointer-events-none whitespace-nowrap">
              Pregúntame ✨
              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-brand-teal-600 rotate-45" />
            </div>
          )}

        </button>

        {/* Separador vertical sutil */}
        <div className="w-px h-8 bg-gray-100 dark:bg-gray-700 mx-1"></div>

        {/* Input con Placeholder Dinámico */}
        <div className="flex-1 min-w-0 px-2 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Busca o chatea con la IA..."
            className="w-full py-2.5 outline-none bg-transparent text-sm font-semibold text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
          />
          
          {/* Barra de Carga Sutil (Solo aparece al buscar) */}
          {isSearching && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal-100 dark:bg-brand-teal-900 overflow-hidden rounded-full">
              <div className="h-full bg-brand-teal-500 animate-progress-fast" />
            </div>
          )}
        </div>

        {/* Acciones Consolidadas (Minimalistas) */}
        <div className="flex items-center gap-0.5 pr-1">
          {/* Botón Borrar (Solo si hay texto) */}
          {inputValue && (
            <button
              onClick={() => setInputValue('')}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Borrar"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Micrófono para Búsqueda por Voz - Diseño de Botón Mejorado */}
          <button
            onClick={toggleListening}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[50px] border-2 shadow-sm",
              isListening 
                ? 'bg-red-500 border-red-500 text-white scale-110 shadow-red-500/20' 
                : 'bg-brand-teal-50 dark:bg-brand-teal-900/20 border-brand-teal-100 dark:border-brand-teal-800 text-brand-teal-600 hover:border-brand-teal-300 hover:bg-brand-teal-100/50 dark:hover:bg-brand-teal-800/40 hover:shadow-md'
            )}
            title="Buscar por voz"
          >
            <Mic className={cn("w-4 h-4", isListening ? "text-white" : "text-brand-teal-600")} />
            <span className={cn("text-[8px] font-black uppercase mt-0.5 tracking-tighter", isListening ? "text-white" : "text-brand-teal-700")}>
              Voz
            </span>
          </button>

        </div>
      </div>

      {/* Estilo para la animación de carga */}
      <style jsx>{`
        @keyframes progress-fast {
          0% { width: 0%; left: 0%; }
          50% { width: 50%; left: 25%; }
          100% { width: 0%; left: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 1s infinite linear;
          width: 30%;
          position: absolute;
        }
      `}</style>

      {/* Resultados de Búsqueda */}
      {showResults && !isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-2">
          <SearchResults
            results={results}
            error={searchError}
            searchQuery={inputValue}
            onClose={() => setShowResults(false)}
          />
        </div>
      )}

      {/* Chat Modal (Mily) */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed lg:absolute top-[5%] lg:top-full left-1/2 lg:left-auto lg:right-0 -translate-x-1/2 lg:translate-x-0 lg:translate-y-0 lg:mt-4 w-[95vw] max-w-[480px] lg:w-[400px] h-[85vh] lg:h-auto lg:max-h-[650px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 z-[70] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">

            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-6 bg-gradient-to-br from-brand-teal-500 to-brand-teal-700">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-lg border-2 border-brand-teal-500">
                    <Sparkles className="w-3 h-3 text-brand-teal-500" />
                  </div>
                </div>
                <div className="text-white">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg tracking-tight">IA</h3>
                    <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                      Inteligente
                    </span>
                  </div>
                  <p className="text-xs text-white/80 font-medium italic">Asistente de La Feria</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 group"
              >
                <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800/50 space-y-6"
            >
              {messages.map((message) => (
                <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {message.type === 'user' ? (
                    <div className="flex justify-end">
                      <div className="bg-brand-teal-500 text-white rounded-3xl rounded-tr-sm px-5 py-3 max-w-[85%] shadow-lg shadow-brand-teal-500/10">
                        <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3 items-end">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-brand-teal-400 to-brand-teal-600 rounded-xl flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z" />
                          </svg>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-3xl rounded-bl-sm px-5 py-3 max-w-[85%] shadow-sm border border-gray-100 dark:border-gray-700">
                          <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed font-medium">{message.text}</p>
                        </div>
                      </div>

                      {/* Sugerencias iniciales (Solo se muestran después del primer mensaje de la IA) */}
                      {message.id === 1 && messages.length === 1 && (
                        <div className="ml-11 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-700 delay-300">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prueba preguntando:</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { text: 'Quiero un regalo para mi mamá 🎁', icon: '🎁' },
                              { text: '¿Qué puedo comer hoy? 🍕', icon: '🍕' },
                              { text: 'Busco servicios de limpieza 🧹', icon: '🧹' },
                              { text: '¿Hay ofertas en calzado? 👟', icon: '👟' }
                            ].map((sug, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  handleSendMessage(sug.text);
                                }}
                                className="bg-white dark:bg-gray-800 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-900/30 border border-gray-100 dark:border-gray-700 hover:border-brand-teal-200 text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                {sug.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.results && message.results.length > 0 && (
                        <div className="ml-11 grid grid-cols-1 gap-3">
                          {message.results.map((result) => (
                            <Link
                              key={result.id}
                              href={getResultLink(result)}
                              onClick={() => setIsOpen(false)}
                              className="group block bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-brand-teal-200 dark:hover:border-brand-teal-900/30"
                            >
                              <div className="flex gap-4">
                                {(result.imagenes?.[0] || result.imagenPrincipal || result.foto) && (
                                  <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-600 shadow-inner">
                                    <Image
                                      src={result.imagenes?.[0] || result.imagenPrincipal || result.foto}
                                      alt={result.nombre || result.titulo}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-brand-teal-500 bg-brand-teal-50 dark:bg-brand-teal-900/20 p-1 rounded-lg">
                                      {getResultIcon(result.type)}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                      {result.type}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-brand-teal-500 transition-colors">
                                    {result.nombre || result.titulo}
                                  </h4>
                                  {result.precio && (
                                    <p className="text-sm font-black text-brand-teal-600 dark:text-brand-teal-400 mt-1">
                                      ${result.precio.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 items-end animate-in fade-in duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-teal-400 to-brand-teal-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z" />
                    </svg>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-3xl rounded-bl-sm px-5 py-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-brand-teal-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-brand-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input del Chat */}
            <div className="flex-shrink-0 p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 focus-within:border-brand-teal-500 transition-colors">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  disabled={isLoading}
                  autoFocus
                  className="flex-1 bg-transparent px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 placeholder:text-gray-400 outline-none"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleListening}
                    disabled={isLoading}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                      isListening 
                        ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' 
                        : 'bg-brand-teal-50 dark:bg-brand-teal-900/20 border-brand-teal-100 dark:border-brand-teal-800 text-brand-teal-600 hover:bg-brand-teal-100'
                    )}
                    title="Hablar con IA"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                      !inputValue.trim() || isLoading
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        : 'bg-brand-teal-500 text-white shadow-brand-teal-500/20 hover:bg-brand-teal-600 active:scale-90'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}