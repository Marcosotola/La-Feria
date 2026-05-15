// src/app/api/mercadopago/webhook/route.js
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    console.log('🔔 Webhook received at:', new Date().toISOString());
    
    const body = await request.json();
    console.log('📦 Webhook body:', JSON.stringify(body, null, 2));
    
    const { type, data, action } = body;

    // ==================== PAGOS DE SUSCRIPCIÓN (authorized_payment) ====================
    if (type === 'subscription_authorized_payment') {
      console.log('💰 Processing subscription payment:', data.id);
      
      try {
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: data.id });
        
        console.log('💳 Payment details:', JSON.stringify(paymentData, null, 2));
        
        const userId = paymentData.external_reference?.replace('subscription_', '');
        
        if (!userId) {
          console.error('❌ No user ID found in payment');
          return NextResponse.json({ received: true, error: 'No user ID' });
        }
        
        if (paymentData.status === 'approved') {
          console.log('✅ Activating subscription for user:', userId);
          
          await handleSubscriptionActivation(userId, {
            id: paymentData.id,
            external_reference: paymentData.external_reference,
            status: 'authorized'
          });
          
          // Registrar pago
          await adminDb.collection('subscription_payments').add({
            userId: userId,
            paymentId: paymentData.id,
            amount: paymentData.transaction_amount,
            status: paymentData.status,
            paymentDate: FieldValue.serverTimestamp(),
            externalReference: paymentData.external_reference
          });
          
          console.log('✅ Subscription activated for user:', userId);
        }
        
      } catch (error) {
        console.error('❌ Error processing subscription payment:', error);
      }
      
      return NextResponse.json({ received: true });
    }

    // ==================== SUSCRIPCIONES ====================
    if (type === 'subscription_preapproval' || type === 'preapproval') {
      console.log('💎 Processing subscription notification:', data.id, 'Action:', action);
      
      try {
        const preApproval = new PreApproval(client);
        const subscriptionData = await preApproval.get({ id: data.id });
        
        console.log('📋 Subscription details:', JSON.stringify(subscriptionData, null, 2));
        
        const userId = subscriptionData.external_reference?.replace('subscription_', '');
        
        if (!userId) {
          console.error('❌ No user ID found in subscription');
          return NextResponse.json({ received: true, error: 'No user ID' });
        }

        // Manejar diferentes acciones de suscripción
        switch (action) {
          case 'created':
          case 'approved':
          case 'authorized':
          case 'updated': // ⭐ AGREGAR ESTE CASO
            console.log('✅ Subscription activated/updated for user:', userId);
            await handleSubscriptionActivation(userId, subscriptionData);
            break;
            
          case 'paused':
            console.log('⏸️ Subscription paused for user:', userId);
            await handleSubscriptionPause(userId, subscriptionData);
            break;
            
          case 'cancelled':
            console.log('❌ Subscription cancelled for user:', userId);
            await handleSubscriptionCancellation(userId, subscriptionData);
            break;
            
          default:
            console.log('ℹ️ Subscription action not handled:', action);
        }

      } catch (error) {
        console.error('❌ Error processing subscription:', error);
      }
      
      return NextResponse.json({ received: true });
    }

    // ==================== PAGOS ÚNICOS (productos/servicios/empleos) ====================
    if (type === 'payment') {
      console.log('💳 Processing payment notification for ID:', data.id);
      
      try {
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: data.id });
        
        console.log('💰 Payment status:', paymentData.status);
        console.log('💰 Payment state:', paymentData.status_detail);
        console.log('🏷️ Payment metadata:', JSON.stringify(paymentData.metadata, null, 2));
        console.log('📝 External reference:', paymentData.external_reference);

        // Verificar si es un pago de suscripción recurrente
        if (paymentData.external_reference?.startsWith('subscription_')) {
          console.log('🔄 Recurring subscription payment detected');
          const userId = paymentData.external_reference.replace('subscription_', '');
          
          if (paymentData.status === 'approved') {
            console.log('✅ Activating subscription for user:', userId);
            
            // Activar suscripción del usuario
            await handleSubscriptionActivation(userId, {
              id: paymentData.id,
              external_reference: paymentData.external_reference,
              status: 'authorized'
            });
            
            // Registrar pago de renovación
            await adminDb.collection('subscription_payments').add({
              userId: userId,
              paymentId: paymentData.id,
              amount: paymentData.transaction_amount,
              status: paymentData.status,
              paymentDate: FieldValue.serverTimestamp(),
              externalReference: paymentData.external_reference
            });
            
            console.log('✅ Subscription payment recorded for user:', userId);
          }
          
          return NextResponse.json({ received: true });
        }

        // Resto del código para pagos únicos (destacados)
        const isSuccessfulPayment = paymentData.status === 'approved' || 
                                  paymentData.status === 'in_process' ||
                                  (paymentData.status === 'pending' && paymentData.status_detail === 'pending_waiting_payment');

        if (isSuccessfulPayment) {
          console.log('✅ Payment successful, processing...');
          
          let item_id, user_id, amount, item_type;
          
          if (paymentData.metadata && Object.keys(paymentData.metadata).length > 0) {
            item_id = paymentData.metadata.item_id;
            user_id = paymentData.metadata.user_id;
            amount = paymentData.metadata.amount || paymentData.transaction_amount;
            item_type = paymentData.metadata.item_type || 'product';
            console.log('📋 Data from metadata:', { item_id, user_id, amount, item_type });
          }
          
          if (!item_id && paymentData.external_reference) {
            console.log('🔍 Extracting from external_reference:', paymentData.external_reference);
            const parts = paymentData.external_reference.split('_');
            if (parts.length >= 3) {
              item_type = parts[0];
              item_id = parts[1];
              user_id = parts[2];
              amount = paymentData.transaction_amount;
              console.log('📋 Data from external_reference:', { item_id, user_id, amount, item_type });
            }
          }
          
          if (!item_id) {
            console.error('❌ Missing item_id - test notification');
            return NextResponse.json({ received: true, note: 'Test notification processed' });
          }
          
          if (!user_id) {
            console.warn('⚠️ Missing user_id, using default');
            user_id = 'test_user';
          }

          let collectionName, itemLabel;
          
          if (item_type === 'employment') {
            collectionName = 'empleos';
            itemLabel = 'empleo';
          } else if (item_type === 'service') {
            collectionName = 'servicios';
            itemLabel = 'servicio';
          } else {
            collectionName = 'productos';
            itemLabel = 'producto';
          }
          
          const featuredDays = parseInt(paymentData.metadata?.featured_days) || 7;
          const featuredUntil = new Date();
          featuredUntil.setDate(featuredUntil.getDate() + featuredDays);

          try {
            console.log(`🔄 Updating ${itemLabel} in Firebase...`);
            
            const itemRef = adminDb.collection(collectionName).doc(item_id);
            
            await itemRef.update({
              featured: true,
              featuredUntil: featuredUntil,
              featuredPaymentId: paymentData.id,
              featuredAmount: parseFloat(amount || paymentData.transaction_amount || 0),
              fechaDestacado: FieldValue.serverTimestamp()
            });

            console.log(`✅ ${itemLabel} updated successfully in ${collectionName}`);

            await adminDb.collection('featured_payments').add({
              itemId: item_id,
              itemType: item_type,
              userId: user_id,
              paymentId: paymentData.id,
              amount: parseFloat(amount || paymentData.transaction_amount || 0),
              status: paymentData.status,
              featuredUntil: featuredUntil,
              externalReference: paymentData.external_reference,
              fechaCreacion: FieldValue.serverTimestamp(),
              paymentMethod: paymentData.payment_method_id || 'unknown',
              payerEmail: paymentData.payer?.email || 'test@example.com',
              statusDetail: paymentData.status_detail
            });

            console.log(`🎉 ${itemLabel} ${item_id} featured until ${featuredUntil.toISOString()}`);
            
          } catch (firebaseError) {
            console.error('❌ Error updating Firebase:', firebaseError);
            return NextResponse.json({ 
              received: true,
              error: 'Database error but notification acknowledged',
              details: firebaseError.message 
            });
          }

        }

      } catch (paymentError) {
        console.error('❌ Error getting payment data:', paymentError);
        if (paymentError.message?.includes('404') || paymentError.message?.includes('not found')) {
          console.log('📝 Test payment ID not found, responding OK');
          return NextResponse.json({ received: true, note: 'Test notification with fake ID' });
        }
        throw paymentError;
      }
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      received: true,
      error: 'Error processed but acknowledged',
      details: error.message 
    });
  }
}

// ==================== FUNCIONES AUXILIARES ====================

async function handleSubscriptionActivation(userId, subscriptionData) {
  try {
    console.log('🔍 Attempting to activate subscription for user:', userId);
    console.log('📋 Subscription data:', JSON.stringify(subscriptionData, null, 2));
    
    const userRef = adminDb.collection('users').doc(userId); // ✅ CAMBIO: users en lugar de usuarios
    console.log('📍 Looking in collection: users, doc:', userId);
    
    const userDoc = await userRef.get();
    console.log('📄 User doc exists:', userDoc.exists);
    
    if (!userDoc.exists) {
      console.error('❌ User not found in "users" collection:', userId);
      return;
    }

    await updateUserSubscription(userRef, subscriptionData, userId);
    console.log('✅ User activated with subscription:', userId);
  } catch (error) {
    console.error('❌ Error activating subscription:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

async function updateUserSubscription(userRef, subscriptionData, userId) {
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);

  console.log('💾 Updating user document...');
  
  // Actualizar usuario a "approved"
  await userRef.update({
    accountStatus: 'approved',
    subscription: {
      isActive: true,
      planType: 'tienda_online',
      startDate: FieldValue.serverTimestamp(),
      expiresAt: nextBillingDate,
      mercadopagoSubscriptionId: subscriptionData.id,
      amount: 2000,
      currency: 'ARS',
      autoRenewal: true
    },
    updatedAt: FieldValue.serverTimestamp()
  });

  console.log('✅ User document updated');

  // Crear/actualizar documento de suscripción
  console.log('💾 Creating subscription document...');
  await adminDb.collection('subscriptions').doc(userId).set({
    userId: userId,
    status: 'active',
    mercadopagoSubscriptionId: subscriptionData.id,
    planType: 'tienda_online',
    amount: 2000,
    currency: 'ARS',
    startDate: FieldValue.serverTimestamp(),
    nextBillingDate: nextBillingDate,
    currentPeriodStart: FieldValue.serverTimestamp(),
    currentPeriodEnd: nextBillingDate,
    autoRenewal: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
  
  console.log('✅ Subscription document created');
}

async function handleSubscriptionPause(userId, subscriptionData) {
  try {
    const userRef = adminDb.collection('usuarios').doc(userId);
    const subscriptionRef = adminDb.collection('subscriptions').doc(userId);

    await userRef.update({
      'subscription.isActive': false,
      'subscription.status': 'paused',
      updatedAt: FieldValue.serverTimestamp()
    });

    await subscriptionRef.update({
      status: 'paused',
      pausedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    console.log('⏸️ Subscription paused for user:', userId);
  } catch (error) {
    console.error('❌ Error pausing subscription:', error);
  }
}

async function handleSubscriptionCancellation(userId, subscriptionData) {
  try {
    const userRef = adminDb.collection('usuarios').doc(userId);
    const subscriptionRef = adminDb.collection('subscriptions').doc(userId);

    await userRef.update({
      accountStatus: 'pending', // Volver a pending
      'subscription.isActive': false,
      'subscription.status': 'cancelled',
      updatedAt: FieldValue.serverTimestamp()
    });

    await subscriptionRef.update({
      status: 'cancelled',
      cancelledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    console.log('❌ Subscription cancelled, user returned to pending:', userId);
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}