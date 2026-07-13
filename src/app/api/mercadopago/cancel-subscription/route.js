// src/app/api/mercadopago/cancel-subscription/route.js
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    const subRef = adminDb.collection('subscriptions').doc(userId);
    const subDoc = await subRef.get();
    const mpSubscriptionId = subDoc.exists ? subDoc.data().mercadopagoSubscriptionId : null;

    if (mpSubscriptionId) {
      try {
        const preApproval = new PreApproval(client);
        await preApproval.update({ id: mpSubscriptionId, body: { status: 'cancelled' } });
      } catch (mpError) {
        console.error('❌ Error cancelando en MercadoPago:', mpError);
        return NextResponse.json({
          error: 'No se pudo cancelar la suscripción en MercadoPago',
          details: mpError.message,
        }, { status: 500 });
      }
    }

    await adminDb.collection('users').doc(userId).update({
      accountStatus: 'pending',
      'subscription.isActive': false,
      'subscription.status': 'cancelled',
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (subDoc.exists) {
      await subRef.update({
        status: 'cancelled',
        cancelledAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error cancelando suscripción:', error);
    return NextResponse.json({
      error: 'Error al cancelar la suscripción',
      details: error.message,
    }, { status: 500 });
  }
}
