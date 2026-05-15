import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function generarCategoriasParaPrompt() {
  const categoriasProductos = [
    'alimentos_bebidas', 'panaderia_reposteria', 'ropa_indumentaria',
    'accesorios_complementos', 'hogar_decoracion', 'electronica_tecnologia',
    'libros_revistas', 'juguetes_juegos', 'deportes_fitness', 'salud_bienestar',
    'belleza_cosmetica', 'mascotas', 'jardin_exterior', 'herramientas',
    'vehiculos_accesorios', 'arte_manualidades', 'otros'
  ].join(', ');

  const categoriasServicios = [
    'belleza_y_bienestar', 'salud_y_medicina', 'educacion_y_capacitacion',
    'tecnologia_e_informatica', 'hogar_y_mantenimiento', 'automotriz',
    'eventos_y_celebraciones', 'deportes_y_fitness', 'mascotas',
    'consultoria_y_negocios', 'marketing_y_publicidad', 'diseño_y_creatividad',
    'fotografia_y_video', 'musica_y_entretenimiento', 'gastronomia',
    'jardineria_y_paisajismo', 'limpieza', 'transporte_y_logistica',
    'servicios_legales', 'servicios_financieros', 'otros'
  ].join(', ');

  const categoriasEmpleos = [
    'administracion', 'tecnologia', 'salud', 'belleza', 'educacion',
    'gastronomia', 'construccion', 'hogar', 'transporte', 'ventas',
    'marketing', 'eventos', 'automotriz', 'legal', 'seguridad', 'mascotas', 'otro'
  ].join(', ');

  const categoriasFerias = [
    'artesanal', 'gastronomica', 'general', 'vintage_retro',
    'agricola_organica', 'cultural_artistica', 'infantil', 'navideña',
    'electronica', 'libros', 'ropa', 'otro'
  ].join(', ');

  return { productos: categoriasProductos, servicios: categoriasServicios, empleos: categoriasEmpleos, ferias: categoriasFerias };
}

export async function analyzeSearchIntent(searchQuery) {
  try {
    const categorias = generarCategoriasParaPrompt();

    const prompt = `Eres un asistente que analiza búsquedas en un marketplace local argentino llamado "La Feria".

La plataforma tiene: productos de feriantes, servicios profesionales, ofertas/búsquedas de empleo, y ferias (eventos/mercados con horarios y ubicación).

El usuario buscó: "${searchQuery}"

Responde ÚNICAMENTE con JSON válido (sin markdown) con esta estructura exacta:
{
  "intencion": "descripción breve de qué busca",
  "tipo_busqueda": ["productos", "servicios", "empleos", "ferias"],
  "categorias_productos": ["cat1", "cat2"],
  "categorias_servicios": ["cat1"],
  "categorias_empleos": ["cat1"],
  "categorias_ferias": ["cat1"],
  "palabras_clave": ["palabra1", "palabra2"],
  "es_para_regalar": false,
  "genero_objetivo": "cualquiera"
}

CATEGORÍAS PRODUCTOS: ${categorias.productos}
CATEGORÍAS SERVICIOS: ${categorias.servicios}
CATEGORÍAS EMPLEOS: ${categorias.empleos}
CATEGORÍAS FERIAS: ${categorias.ferias}

REGLAS:
- tipo_busqueda solo incluye los tipos relevantes (puede ser uno o varios)
- Si busca "feria", "mercado", "feria artesanal", "ferias del domingo" → incluir "ferias"
- Si busca "vino" → productos: ["alimentos_bebidas"]
- Si busca "plomero" → servicios: ["hogar_y_mantenimiento"], empleos: ["construccion"]
- Si busca "trabajo de programador" → empleos: ["tecnologia"]
- Si busca "regalo para mamá" → productos múltiples, es_para_regalar: true, genero_objetivo: "femenino"
- Incluye siempre palabras_clave relevantes y sinónimos

Ejemplos:
"vino tinto" → {"intencion":"buscar vino","tipo_busqueda":["productos"],"categorias_productos":["alimentos_bebidas"],"categorias_servicios":[],"categorias_empleos":[],"categorias_ferias":[],"palabras_clave":["vino","tinto","bebida","malbec"],"es_para_regalar":false,"genero_objetivo":"cualquiera"}
"feria artesanal domingo" → {"intencion":"buscar feria artesanal","tipo_busqueda":["ferias"],"categorias_productos":[],"categorias_servicios":[],"categorias_empleos":[],"categorias_ferias":["artesanal"],"palabras_clave":["feria","artesanal","domingo","mercado"],"es_para_regalar":false,"genero_objetivo":"cualquiera"}
"busco trabajo diseñador" → {"intencion":"buscar empleo diseño","tipo_busqueda":["empleos"],"categorias_productos":[],"categorias_servicios":[],"categorias_empleos":["tecnologia","marketing"],"categorias_ferias":[],"palabras_clave":["trabajo","empleo","diseño","diseñador","web"],"es_para_regalar":false,"genero_objetivo":"cualquiera"}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 600,
      },
    });

    console.log('🤖 Llamando a Gemini (análisis)...');
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    console.log('📨 Respuesta Gemini:', content);

    const analysis = JSON.parse(content);
    console.log('✅ Análisis parseado correctamente');

    return { success: true, data: analysis };

  } catch (error) {
    console.error('❌ Error analyzing search intent:', error);
    return {
      success: false,
      error: error.message,
      data: {
        intencion: searchQuery,
        tipo_busqueda: ['productos', 'servicios', 'empleos'],
        categorias_productos: [],
        categorias_servicios: [],
        categorias_empleos: [],
        categorias_ferias: [],
        palabras_clave: searchQuery.toLowerCase().split(' ').filter(w => w.length > 2),
        es_para_regalar: false,
        genero_objetivo: 'cualquiera'
      }
    };
  }
}

export async function getMilyResponse(userMessage, conversationHistory, analysis, searchResults) {
  const totalResults =
    (searchResults.productos?.length || 0) +
    (searchResults.servicios?.length || 0) +
    (searchResults.empleos?.length || 0) +
    (searchResults.ferias?.length || 0);
  const hasResults = totalResults > 0;

  const breakdown = hasResults
    ? [
        searchResults.productos?.length ? `${searchResults.productos.length} producto(s)` : '',
        searchResults.servicios?.length ? `${searchResults.servicios.length} servicio(s)` : '',
        searchResults.empleos?.length ? `${searchResults.empleos.length} empleo(s)` : '',
        searchResults.ferias?.length ? `${searchResults.ferias.length} feria(s)` : '',
      ].filter(Boolean).join(', ')
    : '';

  const recentHistory = conversationHistory.slice(-4)
    .map(m => `${m.type === 'user' ? 'Usuario' : 'Mily'}: ${m.text}`)
    .join('\n');

  const prompt = `Sos Mily, asistente virtual alegre y cercana de La Feria Argentina. Hablás en español argentino, usás máximo 2 emojis y respondés en 2-3 líneas.

${recentHistory ? `Conversación previa:\n${recentHistory}\n` : ''}
El usuario preguntó: "${userMessage}"
${hasResults
    ? `Encontraste ${totalResults} resultado(s): ${breakdown}. Respondé entusiasmada mencionando brevemente qué encontraste y sugerí revisar las tarjetas.`
    : `No encontraste resultados. Respondé empáticamente y sugerí reformular con ejemplos como "regalos para mamá", "plomero", "feria artesanal".`
  }`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.8, maxOutputTokens: 150 },
  });

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error Gemini Mily:', error);
    return 'Ups, tuve un problemita técnico 😅 ¿Probás de nuevo?';
  }
}
