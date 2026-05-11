// src/app/api/mercadopago/create-subscription/route.js
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail } = body;

    console.log('📥 Creating subscription for user:', { userId, userName, userEmail });

    // Validaciones
    if (!userId || !userEmail) {
      return NextResponse.json({ 
        error: 'userId y userEmail son requeridos' 
      }, { status: 400 });
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN not configured');
      return NextResponse.json({ 
        error: 'MercadoPago no configurado correctamente' 
      }, { status: 500 });
    }

    // Verificar si estamos usando credenciales de TEST
    const isTestMode = process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-');
    console.log('🔑 Using TEST credentials:', isTestMode);

    // Asegurar que la URL no tenga barra final
    let baseUrl = process.env.NEXT_PUBLIC_URL || 'https://laferia.vercel.app';
    baseUrl = baseUrl.replace(/\/$/, ''); // Eliminar barra final si existe
    
    const isLocalDev = baseUrl.includes('localhost');
    
    console.log('🌐 Using base URL:', baseUrl);
    console.log('🔧 Development mode:', isLocalDev);

    const preApproval = new PreApproval(client);

    // Calcular fechas
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Inicio del día actual
    
    const subscriptionData = {
      reason: 'Suscripción Tienda Online - La Feria',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 2000,
        currency_id: 'ARS'
      },
      back_url: `${baseUrl}/payment/subscription/success`,
      payer_email: userEmail,
      external_reference: `subscription_${userId}`,
      status: 'pending'
    };

    console.log('🔄 Creating subscription with data:', JSON.stringify(subscriptionData, null, 2));

    const result = await preApproval.create({ body: subscriptionData });

    console.log('✅ Subscription created successfully:', result.id);
    console.log('📋 Full result:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      subscriptionId: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      status: result.status
    });

  } catch (error) {
    console.error('❌ =================================');
    console.error('❌ ERROR CREATING SUBSCRIPTION');
    console.error('❌ =================================');
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Error cause:', error.cause);
    
    // Intentar obtener más detalles del error de MercadoPago
    if (error.cause) {
      console.error('Error cause details:', JSON.stringify(error.cause, null, 2));
    }
    
    // Si hay información de la respuesta de la API
    if (error.response) {
      console.error('API Response:', JSON.stringify(error.response, null, 2));
    }
    
    console.error('Full error object:', error);
    console.error('❌ =================================');
    
    // Determinar el mensaje de error apropiado
    let errorMessage = 'Error creating subscription';
    let errorHint = '';
    
    if (error.message?.includes('forbidden') || error.status === 403) {
      errorMessage = 'Las suscripciones no están habilitadas en tu cuenta de MercadoPago';
      errorHint = 'Debes activar las suscripciones en: MercadoPago → Tu negocio → Configuración → Suscripciones';
    } else if (error.message?.includes('unauthorized') || error.status === 401) {
      errorMessage = 'Token de acceso inválido';
      errorHint = 'Verifica que MERCADOPAGO_ACCESS_TOKEN sea correcto';
    } else if (error.message?.includes('not found') || error.status === 404) {
      errorMessage = 'Endpoint de suscripciones no disponible';
      errorHint = 'Puede que tu país no soporte suscripciones de MercadoPago';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error.message,
      hint: errorHint,
      status: error.status,
      needsActivation: error.status === 403
    }, { status: 500 });
  }
}