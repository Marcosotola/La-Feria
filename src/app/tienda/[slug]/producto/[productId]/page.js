import { adminDb } from '@/lib/firebase/admin';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { productId } = params;

  try {
    const productDoc = await adminDb.collection('productos').doc(productId).get();

    if (!productDoc.exists) {
      return {
        title: 'Producto no encontrado',
      };
    }

    const product = productDoc.data();
    const title = product.titulo || product.nombre || 'Producto';
    const description = product.descripcion?.substring(0, 160) || 'Detalles del producto en La Feria';
    const image = product.imagenes?.[0] || '/icon-512.png';

    return {
      title: `${title} - La Feria`,
      description,
      openGraph: {
        title,
        description,
        images: [image],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'La Feria',
    };
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug, productId } = params;

  try {
    // Cargar producto usando Admin SDK
    const productDoc = await adminDb.collection('productos').doc(productId).get();

    if (!productDoc.exists) {
      notFound();
    }

    const product = { id: productDoc.id, ...productDoc.data() };

    // Cargar datos de la tienda
    let storeData = null;
    if (product.usuarioId) {
      const storeDoc = await adminDb.collection('users').doc(product.usuarioId).get();
      if (storeDoc.exists) {
        storeData = storeDoc.data();
      }
    }

    // Convertir Timestamps de Firestore a objetos planos (JSON serializable)
    const serializeProduct = (p) => {
      const serialized = { ...p };
      if (serialized.fechaCreacion?.toDate) serialized.fechaCreacion = serialized.fechaCreacion.toDate().toISOString();
      if (serialized.featuredUntil?.toDate) serialized.featuredUntil = serialized.featuredUntil.toDate().toISOString();
      return serialized;
    };

    return (
      <ProductDetailClient
        product={serializeProduct(product)}
        storeData={storeData}
        slug={slug}
        productId={productId}
      />
    );
  } catch (error) {
    console.error('Error loading product on server:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Ocurrió un error al cargar el producto</h2>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }
}
