// src/app/api/chat-mily/route.js
import { NextResponse } from 'next/server';
import { analyzeSearchIntent, getMilyResponse } from '@/lib/ai/geminiService';
import { db } from '@/lib/firebase/config';
import { collection, query, getDocs, limit } from 'firebase/firestore';

async function searchProducts(searchQuery, analysis) {
  try {
    const snapshot = await getDocs(query(collection(db, 'productos'), limit(100)));
    let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.estado === 'disponible');

    const terms = searchQuery.toLowerCase().split(' ').filter(t => t.length > 2);
    items = items.filter(p => {
      const text = `${p.nombre||''} ${p.titulo||''} ${p.descripcion||''} ${p.categoria||''} ${p.palabrasClave?.join(' ')||''}`.toLowerCase();
      return terms.some(t => text.includes(t))
        || analysis.palabras_clave?.some(k => text.includes(k.toLowerCase()))
        || analysis.categorias_productos?.some(c => {
          const pc = (p.categoria||'').toLowerCase();
          return pc === c || pc.includes(c) || c.includes(pc);
        });
    });
    return items.slice(0, 5);
  } catch { return []; }
}

async function searchServices(searchQuery, analysis) {
  try {
    const snapshot = await getDocs(query(collection(db, 'servicios'), limit(100)));
    let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(s => s.estado === 'disponible');

    const terms = searchQuery.toLowerCase().split(' ').filter(t => t.length > 2);
    items = items.filter(s => {
      const text = `${s.titulo||''} ${s.descripcion||''} ${s.categoria||''} ${s.palabrasClave?.join(' ')||''}`.toLowerCase();
      return terms.some(t => text.includes(t))
        || analysis.palabras_clave?.some(k => text.includes(k.toLowerCase()))
        || analysis.categorias_servicios?.some(c => (s.categoria||'').toLowerCase().includes(c));
    });
    return items.slice(0, 5);
  } catch { return []; }
}

async function searchJobs(searchQuery, analysis) {
  try {
    const snapshot = await getDocs(query(collection(db, 'empleos'), limit(100)));
    let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(e => e.estado === 'activo');

    const terms = searchQuery.toLowerCase().split(' ').filter(t => t.length > 2);
    items = items.filter(e => {
      const text = `${e.titulo||''} ${e.descripcion||''} ${e.categoria||''} ${e.habilidades?.join(' ')||''}`.toLowerCase();
      return terms.some(t => text.includes(t))
        || analysis.palabras_clave?.some(k => text.includes(k.toLowerCase()))
        || analysis.categorias_empleos?.some(c => (e.categoria||'').toLowerCase().includes(c));
    });
    return items.slice(0, 5);
  } catch { return []; }
}

async function searchFairs(searchQuery, analysis) {
  try {
    const snapshot = await getDocs(query(collection(db, 'ferias'), limit(100)));
    let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(f => f.estado !== 'inactivo' && f.estado !== 'cancelada');

    const terms = searchQuery.toLowerCase().split(' ').filter(t => t.length > 2);
    items = items.filter(f => {
      const text = `${f.nombre||''} ${f.descripcion||''} ${f.tipo||''} ${f.categoria||''} ${f.ubicacion||''}`.toLowerCase();
      return terms.some(t => text.includes(t))
        || analysis.palabras_clave?.some(k => text.includes(k.toLowerCase()))
        || analysis.categorias_ferias?.some(c => text.includes(c.replace('_', ' ')));
    });
    return items.slice(0, 5);
  } catch { return []; }
}

export async function POST(request) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 });
    }

    console.log('💬 Mensaje del usuario:', message);

    const intentAnalysis = await analyzeSearchIntent(message);
    const analysis = intentAnalysis.data;
    console.log('✅ Análisis IA:', JSON.stringify(analysis));

    const searchResults = { productos: [], servicios: [], empleos: [], ferias: [] };

    await Promise.all([
      analysis.tipo_busqueda.includes('productos') && searchProducts(message, analysis).then(r => searchResults.productos = r),
      analysis.tipo_busqueda.includes('servicios') && searchServices(message, analysis).then(r => searchResults.servicios = r),
      analysis.tipo_busqueda.includes('empleos')   && searchJobs(message, analysis).then(r => searchResults.empleos = r),
      analysis.tipo_busqueda.includes('ferias')    && searchFairs(message, analysis).then(r => searchResults.ferias = r),
    ]);

    const total = Object.values(searchResults).reduce((s, a) => s + a.length, 0);
    console.log('📊 Resultados totales:', total);

    const milyResponse = await getMilyResponse(message, conversationHistory, analysis, searchResults);

    const allResults = [
      ...searchResults.productos.map(p => ({ ...p, type: 'producto' })),
      ...searchResults.servicios.map(s => ({ ...s, type: 'servicio' })),
      ...searchResults.empleos.map(e => ({ ...e, type: 'empleo' })),
      ...searchResults.ferias.map(f => ({ ...f, type: 'feria' })),
    ];

    return NextResponse.json({
      response: milyResponse,
      results: allResults,
      analysis: { intencion: analysis.intencion, tipo_busqueda: analysis.tipo_busqueda }
    });

  } catch (error) {
    console.error('💥 Error en chat-mily:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
