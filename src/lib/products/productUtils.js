// src/lib/products/productUtils.js

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ESTADOS_PRODUCTO } from '@/types/product';

/**
 * Obtiene productos de una tienda con filtros
 */
export const getStoreProducts = async (storeId, options = {}) => {
  try {
    const {
      categoria = null,
      estado = ESTADOS_PRODUCTO.DISPONIBLE,
      limite = 20,
      ordenarPor = 'fechaCreacion',
      orden = 'desc',
      lastVisible = null
    } = options;

    const productsRef = collection(db, 'products');
    let q = query(
      productsRef,
      where('storeId', '==', storeId)
    );

    // Filtro por estado
    if (estado) {
      q = query(q, where('estado', '==', estado));
    }

    // Filtro por categoría
    if (categoria) {
      q = query(q, where('categoria', '==', categoria));
    }

    // Ordenamiento
    q = query(q, orderBy(ordenarPor, orden));

    // Paginación
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    // Límite
    q = query(q, limit(limite));

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      products,
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === limite
    };
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

/**
 * Obtiene un producto específico por ID
 */
export const getProductById = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists()) {
      return {
        id: productDoc.id,
        ...productDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    throw error;
  }
};

/**
 * Incrementa las vistas de un producto
 */
export const incrementProductViews = async (productId) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      totalVistas: increment(1),
      fechaUltimaVista: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementando vistas:', error);
  }
};

/**
 * Incrementa las ventas de un producto
 */
export const incrementProductSales = async (productId, cantidad = 1) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      totalVentas: increment(cantidad),
      fechaUltimaVenta: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementando ventas:', error);
  }
};

/**
 * Actualiza el stock de un producto
 */
export const updateProductStock = async (productId, newStock) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      stock: newStock,
      fechaActualizacion: serverTimestamp()
    });
  } catch (error) {
    console.error('Error actualizando stock:', error);
    throw error;
  }
};

/**
 * Busca productos por texto
 */
export const searchProducts = async (storeId, searchTerm, options = {}) => {
  try {
    const {
      categoria = null,
      limite = 20
    } = options;

    // Obtener todos los productos de la tienda (Firestore no soporta búsqueda de texto nativa)
    const productsRef = collection(db, 'products');
    let q = query(
      productsRef,
      where('storeId', '==', storeId),
      where('estado', '==', ESTADOS_PRODUCTO.DISPONIBLE)
    );

    if (categoria) {
      q = query(q, where('categoria', '==', categoria));
    }

    q = query(q, limit(100)); // Obtener más para filtrar localmente

    const querySnapshot = await getDocs(q);
    const allProducts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtrar por término de búsqueda
    const searchLower = searchTerm.toLowerCase();
    const filteredProducts = allProducts.filter(product =>
      product.titulo.toLowerCase().includes(searchLower) ||
      product.descripcion.toLowerCase().includes(searchLower) ||
      product.palabrasClave?.some(keyword => 
        keyword.toLowerCase().includes(searchLower)
      ) ||
      product.etiquetas?.some(tag => 
        tag.toLowerCase().includes(searchLower)
      )
    );

    return filteredProducts.slice(0, limite);
  } catch (error) {
    console.error('Error buscando productos:', error);
    throw error;
  }
};

/**
 * Obtiene productos relacionados (misma categoría)
 */
export const getRelatedProducts = async (product, limite = 4) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('storeId', '==', product.storeId),
      where('categoria', '==', product.categoria),
      where('estado', '==', ESTADOS_PRODUCTO.DISPONIBLE),
      limit(limite + 1) // +1 para excluir el producto actual
    );

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(p => p.id !== product.id) // Excluir el producto actual
      .slice(0, limite);

    return products;
  } catch (error) {
    console.error('Error obteniendo productos relacionados:', error);
    return [];
  }
};

/**
 * Obtiene productos destacados de una tienda
 */
export const getFeaturedProducts = async (storeId, limite = 6) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('storeId', '==', storeId),
      where('estado', '==', ESTADOS_PRODUCTO.DISPONIBLE),
      where('tipoDestacado', '!=', 'normal'),
      orderBy('tipoDestacado'),
      orderBy('fechaCreacion', 'desc'),
      limit(limite)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo productos destacados:', error);
    return [];
  }
};

/**
 * Obtiene estadísticas de productos de una tienda
 */
export const getProductStats = async (storeId) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('storeId', '==', storeId));
    
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => doc.data());

    const stats = {
      total: products.length,
      disponibles: products.filter(p => p.estado === ESTADOS_PRODUCTO.DISPONIBLE).length,
      agotados: products.filter(p => p.estado === ESTADOS_PRODUCTO.AGOTADO).length,
      pausados: products.filter(p => p.estado === ESTADOS_PRODUCTO.PAUSADO).length,
      stockBajo: products.filter(p => 
        p.gestionStock === 'limitado' && 
        p.stock <= p.stockMinimo && 
        p.stock > 0
      ).length,
      sinStock: products.filter(p => 
        p.gestionStock === 'limitado' && p.stock === 0
      ).length,
      totalVentas: products.reduce((sum, p) => sum + (p.totalVentas || 0), 0),
      totalVistas: products.reduce((sum, p) => sum + (p.totalVistas || 0), 0)
    };

    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      total: 0,
      disponibles: 0,
      agotados: 0,
      pausados: 0,
      stockBajo: 0,
      sinStock: 0,
      totalVentas: 0,
      totalVistas: 0
    };
  }
};

/**
 * Valida si un producto puede ser comprado/contactado
 */
export const isProductAvailable = (product) => {
  if (product.estado !== ESTADOS_PRODUCTO.DISPONIBLE) {
    return false;
  }

  if (product.gestionStock === 'limitado' && product.stock <= 0) {
    return false;
  }

  return true;
};

/**
 * Formatea el mensaje de WhatsApp para un producto
 */
export const formatWhatsAppMessage = (product, storeData) => {
  const baseMessage = product.contacto?.mensaje || 
    `Hola! Me interesa tu producto: ${product.titulo}`;
  
  const productUrl = `${window.location.origin}/tienda/${storeData.storeSlug}/producto/${product.slug || product.id}`;
  
  return `${baseMessage}\n\nVer producto: ${productUrl}`;
};

/**
 * Genera URL de contacto de WhatsApp
 */
export const getWhatsAppUrl = (product, storeData) => {
  const phone = product.contacto?.whatsapp || storeData?.phoneNumber || '';
  const cleanPhone = phone.replace(/\D/g, '');
  const message = formatWhatsAppMessage(product, storeData);
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};