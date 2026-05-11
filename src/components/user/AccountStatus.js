// src/components/user/AccountStatus.js
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/contexts/AuthContext';
import { CheckCircle, Clock, MessageCircle, Send, Star, Shield } from 'lucide-react';

export default function AccountStatus({ userId, showComments = true }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (!userId || !showComments) return;

    // Suscribirse a los comentarios en tiempo real
    const commentsQuery = query(
      collection(db, 'users', userId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [userId, showComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitLoading(true);
    try {
      await addDoc(collection(db, 'users', userId, 'comments'), {
        text: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName || `${user.firstName} ${user.lastName}`,
        authorEmail: user.email,
        createdAt: new Date(),
        rating: 5 // Podrías agregar un sistema de calificación más adelante
      });

      setNewComment('');
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      alert('Error al enviar el comentario');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const isValidated = userData.accountStatus === 'validated';
  const isPending = userData.accountStatus === 'pending';

  return (
    <div className="space-y-6">
      {/* Estado de la cuenta */}
      <div className={`p-4 rounded-xl border-2 ${
        isValidated 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center space-x-3">
          {isValidated ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Clock className="w-6 h-6 text-yellow-600" />
          )}
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {isValidated ? 'Cuenta Validada' : 'Cuenta Pendiente de Validación'}
            </h3>
            <p className="text-sm text-gray-600">
              {isValidated 
                ? 'Esta cuenta ha sido verificada por un administrador de La Feria'
                : 'Esta cuenta está pendiente de verificación por un administrador'
              }
            </p>
          </div>

          {isValidated && (
            <Shield className="w-6 h-6 text-green-600" />
          )}
        </div>
      </div>

      {/* Información del usuario */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Usuario</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="font-medium">{userData.firstName} {userData.lastName}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Familia</p>
            <p className="font-medium">{userData.familyName}</p>
          </div>
          
          {userData.businessName && (
            <div>
              <p className="text-sm text-gray-600">Negocio</p>
              <p className="font-medium">{userData.businessName}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-600">Miembro desde</p>
            <p className="font-medium">
              {new Date(userData.createdAt?.seconds * 1000).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Sección de comentarios */}
      {showComments && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Comentarios de la comunidad ({comments.length})
            </h3>
          </div>

          {/* Formulario para nuevo comentario */}
          {user && user.uid !== userId && (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario sobre este usuario..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                  
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submitLoading}
                      className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitLoading ? 'Enviando...' : 'Comentar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Lista de comentarios */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                Aún no hay comentarios. ¡Sé el primero en comentar!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {comment.authorName?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{comment.authorName}</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (comment.rating || 5) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt?.seconds * 1000).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}