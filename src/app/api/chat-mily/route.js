// src/app/api/chat-mily/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { analyzeSearchIntent } from '@/lib/ai/openaiService';
import { db } from '@/lib/firebase/config';
import { collection, query, getDocs, limit } from 'firebase/firestore';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Buscar productos
async function searchProducts(searchQuery, analysis) {
  try {
    console.log('🔎 Buscando productos...');
    
    const productsRef = collection(db, 'productos');
    const q = query(productsRef, limit(100));
    const snapshot = await getDocs(q);
    
    let productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    productos = productos.filter(p => p.estado === 'disponible');

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);

    productos = productos.filter(producto => {
      const searchableText = `
        ${producto.nombre || ''} 
        ${producto.titulo || ''}
        ${producto.descripcion || ''} 
        ${producto.categoria || ''}
        ${producto.subcategoria || ''}
        ${producto.palabrasClave?.join(' ') || ''}
      `.toLowerCase();

      const matchesSearchTerms = searchTerms.some(term => searchableText.includes(term));
      const matchesAIKeywords = analysis.palabras_clave?.some(palabra => searchableText.includes(palabra.toLowerCase()));
      const matchesAICategories = analysis.categorias_productos?.some(cat => {
        const catLower = cat.toLowerCase();
        const prodCat = (producto.categoria || '').toLowerCase();
        
        if (prodCat === catLower) return true;
        if (prodCat.includes(catLower) || catLower.includes(prodCat)) return true;
        
        const catWords = catLower.split('_');
        const prodCatWords = prodCat.split('_');
        return catWords.some(word => prodCatWords.includes(word));
      });

      return matchesSearchTerms || matchesAIKeywords || matchesAICategories;
    });

    return productos.slice(0, 5);
  } catch (error) {
    console.error('Error buscando productos:', error);
    return [];
  }
}

// Buscar servicios
async function searchServices(searchQuery, analysis) {
  try {
    console.log('🔎 Buscando servicios...');
    
    const servicesRef = collection(db, 'servicios');
    const q = query(servicesRef, limit(100));
    const snapshot = await getDocs(q);
    
    let servicios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    servicios = servicios.filter(s => s.estado === 'disponible');

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);

    servicios = servicios.filter(servicio => {
      const searchableText = `
        ${servicio.titulo || ''} 
        ${servicio.descripcion || ''} 
        ${servicio.categoria || ''}
        ${servicio.subcategoria || ''}
        ${servicio.palabrasClave?.join(' ') || ''}
      `.toLowerCase();

      const matchesSearchTerms = searchTerms.some(term => searchableText.includes(term));
      const matchesAIKeywords = analysis.palabras_clave?.some(palabra => searchableText.includes(palabra.toLowerCase()));
      const matchesAICategories = analysis.categorias_servicios?.some(cat => {
        const catLower = cat.toLowerCase();
        const servCat = (servicio.categoria || '').toLowerCase();
        return servCat === catLower || servCat.includes(catLower) || catLower.includes(servCat);
      });

      return matchesSearchTerms || matchesAIKeywords || matchesAICategories;
    });

    return servicios.slice(0, 5);
  } catch (error) {
    console.error('Error buscando servicios:', error);
    return [];
  }
}

// Buscar empleos
async function searchJobs(searchQuery, analysis) {
  try {
    console.log('🔎 Buscando empleos...');
    
    const jobsRef = collection(db, 'empleos');
    const q = query(jobsRef, limit(100));
    const snapshot = await getDocs(q);
    
    let empleos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    empleos = empleos.filter(e => e.estado === 'activo');

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);

    empleos = empleos.filter(empleo => {
      const searchableText = `
        ${empleo.titulo || ''} 
        ${empleo.descripcion || ''} 
        ${empleo.categoria || ''}
        ${empleo.subcategoria || ''}
        ${empleo.habilidades?.join(' ') || ''}
      `.toLowerCase();

      const matchesSearchTerms = searchTerms.some(term => searchableText.includes(term));
      const matchesAIKeywords = analysis.palabras_clave?.some(palabra => searchableText.includes(palabra.toLowerCase()));
      const matchesAICategories = analysis.categorias_empleos?.some(cat => {
        const catLower = cat.toLowerCase();
        const jobCat = (empleo.categoria || '').toLowerCase();
        return jobCat === catLower || jobCat.includes(catLower) || catLower.includes(jobCat);
      });

      return matchesSearchTerms || matchesAIKeywords || matchesAICategories;
    });

    return empleos.slice(0, 5);
  } catch (error) {
    console.error('Error buscando empleos:', error);
    return [];
  }
}

// Generar respuesta de Mily
async function getMilyResponse(userMessage, conversationHistory, analysis, searchResults) {
  const totalResults = searchResults.productos.length + searchResults.servicios.length + searchResults.empleos.length;
  const hasResults = totalResults > 0;

  const systemPrompt = `Eres Mily, asistente virtual amigable de La Feria (Argentina).

PERSONALIDAD:
- Alegre, cercana, usas emojis ocasionalmente (máximo 2)
- Hablas español argentino natural
- Profesional pero amigable

${hasResults ? `
HAY ${totalResults} RESULTADOS:
- Productos: ${searchResults.productos.length}
- Servicios: ${searchResults.servicios.length}
- Empleos: ${searchResults.empleos.length}

Responde:
1. Menciona brevemente qué encontraste
2. Sé entusiasta
3. Sugiere revisar las tarjetas de abajo
4. MUY BREVE (2-3 líneas)

Ejemplos:
"¡Genial! Encontré ${totalResults} opciones para vos 😊 Mirá las tarjetas!"
"¡Perfecto! Tengo ${searchResults.productos.length} productos que te pueden gustar 🎁"
` : `
NO HAY RESULTADOS para: "${userMessage}"

Responde:
1. Sé empática pero positiva
2. Sugiere reformular
3. Da ejemplos
4. Breve (2-3 líneas)

Ejemplo:
"No encontré nada con eso 😅 ¿Probás de otra forma? Ej: 'regalos para mamá' o 'plomero'"
`}

IMPORTANTE: Máximo 3 líneas, lenguaje argentino casual.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-4).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.8,
      max_tokens: 100,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error OpenAI:', error);
    return 'Ups, tuve un problemita técnico 😅 ¿Probás de nuevo?';
  }
}

// Endpoint principal
export async function POST(request) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje inválido' },
        { status: 400 }
      );
    }

    console.log('💬 Mensaje del usuario:', message);

    // 1. Analizar intención con IA
    const intentAnalysis = await analyzeSearchIntent(message);
    
    if (!intentAnalysis.success) {
      console.error('❌ Error en análisis:', intentAnalysis.error);
    }

    const analysis = intentAnalysis.data;
    console.log('✅ Análisis IA:', JSON.stringify(analysis, null, 2));

    // 2. Buscar en Firestore
    const searchResults = {
      productos: [],
      servicios: [],
      empleos: [],
    };

    if (analysis.tipo_busqueda.includes('productos')) {
      searchResults.productos = await searchProducts(message, analysis);
    }

    if (analysis.tipo_busqueda.includes('servicios')) {
      searchResults.servicios = await searchServices(message, analysis);
    }

    if (analysis.tipo_busqueda.includes('empleos')) {
      searchResults.empleos = await searchJobs(message, analysis);
    }

    const totalResults = searchResults.productos.length + searchResults.servicios.length + searchResults.empleos.length;
    console.log('📊 Resultados totales:', totalResults);

    // 3. Generar respuesta de Mily
    const milyResponse = await getMilyResponse(message, conversationHistory, analysis, searchResults);

    // 4. Preparar resultados
    const allResults = [
      ...searchResults.productos.map(p => ({ ...p, type: 'producto' })),
      ...searchResults.servicios.map(s => ({ ...s, type: 'servicio' })),
      ...searchResults.empleos.map(e => ({ ...e, type: 'empleo' }))
    ];

    return NextResponse.json({
      response: milyResponse,
      results: allResults,
      analysis: {
        intencion: analysis.intencion,
        tipo_busqueda: analysis.tipo_busqueda
      }
    });

  } catch (error) {
    console.error('💥 Error en chat-mily:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}