// src/components/dashboard/UserManagementSection.js
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, Trash2, UserCheck, UserX, 
  Building, ExternalLink, CheckCircle, XCircle, Clock, Shield, User, Grid, List,
  Users, ChevronLeft, RefreshCw, CreditCard
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { getPricing } from '@/lib/services/pricingService';

const UserManagementSection = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = userData?.role === 'admin';

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'), orderBy('firstName', 'asc'));
      const querySnapshot = await getDocs(usersQuery);
      
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.familyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.accountStatus === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Cambiar rol de usuario
  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      setActionLoading(true);
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date()
      });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole, updatedAt: new Date() } : user
      ));
      
      alert(`Rol cambiado a ${newRole === 'admin' ? 'Admin' : 'Usuario'} exitosamente`);
    } catch (error) {
      console.error('Error actualizando rol:', error);
      alert('Error actualizando el rol del usuario');
    } finally {
      setActionLoading(false);
    }
  };
  const confirmStatusChange = (userId, currentStatus, newStatus, user) => {
    setStatusChangeData({ userId, currentStatus, newStatus, user });
    setShowStatusChangeModal(true);
  };

  // Actualizar estado de cuenta
  const updateAccountStatus = async () => {
    if (!statusChangeData) return;

    const { userId, newStatus } = statusChangeData;
    
    try {
      setActionLoading(true);
      
      const updateData = {
        accountStatus: newStatus,
        updatedAt: new Date()
      };

      if (newStatus === 'approved') {
        const nextBillingDate = new Date();
        nextBillingDate.setDate(nextBillingDate.getDate() + 30);
        const pricing = await getPricing();

        updateData.subscription = {
          isActive: true,
          planType: 'tienda_online',
          startDate: new Date(),
          expiresAt: nextBillingDate,
          amount: pricing.tienda.mensual,
          currency: 'ARS',
          autoRenewal: false,
          activationMethod: 'manual_admin',
          activatedBy: userData?.uid || 'admin',
          activatedByEmail: userData?.email || 'admin'
        };
      }

      if (newStatus === 'pending') {
        updateData.subscription = {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: userData?.uid || 'admin',
          deactivatedByEmail: userData?.email || 'admin'
        };
      }

      await updateDoc(doc(db, 'users', userId), updateData);
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, ...updateData } : u
      ));
      
      setShowStatusChangeModal(false);
      setStatusChangeData(null);
      
      const statusLabels = {
        'pending': 'pendiente',
        'approved': 'aprobado',
        'suspended': 'suspendido'
      };
      
      alert(`Usuario cambiado a ${statusLabels[newStatus]} exitosamente`);
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error actualizando el estado del usuario');
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar usuario
  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setActionLoading(true);
      await deleteDoc(doc(db, 'users', userToDelete.id));
      
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      setShowDeleteModal(false);
      setUserToDelete(null);
      alert('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error eliminando el usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      suspended: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      suspended: <XCircle className="w-3 h-3" />
    };

    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      suspended: 'Suspendido'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {icons[status]}
        {labels[status] || 'Desconocido'}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
      user: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
    };

    const icons = {
      admin: <Shield className="w-3 h-3" />,
      user: <User className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[role] || styles.user}`}>
        {icons[role]}
        {role === 'admin' ? 'Admin' : 'Usuario'}
      </span>
    );
  };

  // Modal de detalles del usuario (solo lectura con foto de perfil)
  const UserDetailsModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full my-8">
          <div className="p-6">
            {/* Header con foto de perfil */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {/* Foto de perfil */}
                {selectedUser.profileImage ? (
                  <img 
                    src={selectedUser.profileImage} 
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                    <span className="text-3xl font-bold text-white">
                      {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Badges de estado y rol */}
            <div className="flex gap-3 mb-6">
              {getStatusBadge(selectedUser.accountStatus)}
              {getRoleBadge(selectedUser.role)}
            </div>

            {/* Información del usuario */}
            <div className="space-y-6">
              {/* Información Personal */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                  Información Personal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Nombre Completo
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedUser.firstName} {selectedUser.lastName} {selectedUser.familyName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Teléfono
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedUser.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Dirección
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedUser.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del Negocio */}
              {selectedUser.businessName && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                    Información del Negocio
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Nombre del Negocio
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedUser.businessName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Slug
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedUser.storeSlug || 'N/A'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        URL de la Tienda
                      </label>
                      {selectedUser.storeUrl ? (
                        <a 
                          href={selectedUser.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-2"
                        >
                          {selectedUser.storeUrl}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <p className="text-sm text-gray-900 dark:text-white">N/A</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Suscripción */}
              {selectedUser.subscription?.isActive && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                    Suscripción
                  </h4>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-900 dark:text-green-100">
                        Suscripción Activa
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Método:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedUser.subscription.activationMethod === 'manual_admin' 
                            ? '👤 Activación Manual' 
                            : '💳 Pago Online'}
                        </p>
                      </div>
                      {selectedUser.subscription.expiresAt && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Expira:</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(selectedUser.subscription.expiresAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                  Fechas
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Registro
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Última Actualización
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedUser.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de confirmación de cambio de estado
  const StatusChangeModal = () => {
    if (!statusChangeData) return null;

    const { currentStatus, newStatus, user } = statusChangeData;
    
    const messages = {
      'pending_to_approved': {
        title: '✅ Aprobar Usuario Manualmente',
        description: `¿Aprobar a ${user.firstName} ${user.lastName} sin pago? Esto activará su tienda por 30 días.`,
        note: 'La suscripción no se renovará automáticamente. Ideal para casos especiales, promociones o usuarios que no pueden pagar online.',
        color: 'green'
      },
      'approved_to_pending': {
        title: '⏸️ Cambiar a Pendiente',
        description: `¿Desactivar la tienda de ${user.firstName} ${user.lastName}?`,
        note: 'Se desactivará su tienda pública y volverá al estado pendiente.',
        color: 'yellow'
      },
      'approved_to_suspended': {
        title: '🚫 Suspender Usuario',
        description: `¿Suspender a ${user.firstName} ${user.lastName}?`,
        note: 'El usuario no podrá acceder a su tienda ni publicar contenido.',
        color: 'red'
      },
      'suspended_to_approved': {
        title: '🔓 Reactivar Usuario',
        description: `¿Reactivar a ${user.firstName} ${user.lastName}?`,
        note: 'El usuario recuperará acceso completo a su tienda.',
        color: 'green'
      },
      'suspended_to_pending': {
        title: '↩️ Volver a Pendiente',
        description: `¿Cambiar a ${user.firstName} ${user.lastName} a estado pendiente?`,
        note: 'El usuario podrá activar su tienda mediante pago.',
        color: 'yellow'
      },
      'pending_to_suspended': {
        title: '🚫 Suspender Usuario',
        description: `¿Suspender a ${user.firstName} ${user.lastName}?`,
        note: 'El usuario no podrá acceder a su tienda ni publicar contenido.',
        color: 'red'
      }
    };

    const key = `${currentStatus}_to_${newStatus}`;
    const config = messages[key] || {
      title: 'Cambiar Estado',
      description: `¿Cambiar el estado de ${user.firstName} ${user.lastName}?`,
      note: '',
      color: 'gray'
    };

    const colorClasses = {
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
    };

    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {config.title}
          </h3>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {config.description}
          </p>

          {config.note && (
            <div className={`rounded-lg p-3 mb-4 border ${colorClasses[config.color]}`}>
              <p className="text-xs font-medium">
                {config.note}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowStatusChangeModal(false);
                setStatusChangeData(null);
              }}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={updateAccountStatus}
              disabled={actionLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${
                config.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                config.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-red-600 hover:bg-red-700'
              }`}
            >
              {actionLoading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // User Card Component
  const UserCard = ({ user }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-white">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      {user.businessName && (
        <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Building className="w-3.5 h-3.5" />
            <span className="font-medium">{user.businessName}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        {getStatusBadge(user.accountStatus)}
        {getRoleBadge(user.role)}
      </div>

      {user.subscription?.isActive && (
        <div className="mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
          <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            {user.subscription.activationMethod === 'manual_admin' ? 'Activación Manual' : 'Suscripción Activa'}
          </p>
        </div>
      )}

      <div className="relative pt-3 border-t border-gray-100 dark:border-gray-700">
        <details className="group">
          <summary className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors list-none">
            <span>Acciones</span>
          </summary>
          
          <div className="mt-2 space-y-1">
            <button
              onClick={() => {
                setSelectedUser(user);
                setShowUserModal(true);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-left text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver Detalles
            </button>

            {user.accountStatus === 'pending' && (
              <>
                <button
                  onClick={() => confirmStatusChange(user.id, user.accountStatus, 'approved', user)}
                  className="w-full px-3 py-2 text-xs font-medium text-left text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Aprobar Manualmente
                </button>
                <button
                  onClick={() => confirmStatusChange(user.id, user.accountStatus, 'suspended', user)}
                  className="w-full px-3 py-2 text-xs font-medium text-left text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors flex items-center gap-2"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Suspender
                </button>
              </>
            )}

            {user.accountStatus === 'approved' && (
              <>
                <button
                  onClick={() => confirmStatusChange(user.id, user.accountStatus, 'pending', user)}
                  className="w-full px-3 py-2 text-xs font-medium text-left text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Cambiar a Pendiente
                </button>
                <button
                  onClick={() => confirmStatusChange(user.id, user.accountStatus, 'suspended', user)}
                  className="w-full px-3 py-2 text-xs font-medium text-left text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors flex items-center gap-2"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Suspender
                </button>
              </>
            )}

            {user.accountStatus === 'suspended' && (
              <>
                <button
                  onClick={() => confirmStatusChange(user.id, user.accountStatus, 'approved', user)}
                  className="w-full px-3 py-2 text-xs font-medium text-left text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reactivar y Aprobar
                </button>
                <button
                  onClick={() => confirmStatusChange(user.id, user.accountStatus, 'pending', user)}
                  className="w-full px-3 py-2 text-xs font-medium text-left text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Volver a Pendiente
                </button>
              </>
            )}

            {/* Cambiar Rol */}
            <button
              onClick={() => toggleUserRole(user.id, user.role)}
              disabled={actionLoading}
              className="w-full px-3 py-2 text-xs font-medium text-left text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2"
            >
              <Shield className="w-3.5 h-3.5" />
              {user.role === 'admin' ? 'Cambiar a Usuario' : 'Hacer Admin'}
            </button>

            <button
              onClick={() => {
                setUserToDelete(user);
                setShowDeleteModal(true);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-left text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar Usuario
            </button>
          </div>
        </details>
      </div>
    </div>
  );

  // Modal de confirmación de eliminación
  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium mb-4">Confirmar Eliminación</h3>
        <p className="text-sm mb-6">
          ¿Eliminar a <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setUserToDelete(null);
            }}
            className="px-4 py-2 text-sm border rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={deleteUser}
            disabled={actionLoading}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md"
          >
            {actionLoading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Acceso Denegado</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4">
        <button onClick={() => window.history.back()} className="mb-4 flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver
        </button>
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-2xl font-bold">{users.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-yellow-600">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.accountStatus === 'pending').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-green-600">Aprobados</div>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.accountStatus === 'approved').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-red-600">Suspendidos</div>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.accountStatus === 'suspended').length}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="suspended">Suspendidos</option>
            </select>
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="px-3 py-2 border rounded-lg"
            >
              {viewMode === 'table' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : (
          <>
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Negocio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{user.businessName || 'N/A'}</td>
                          <td className="px-6 py-4">{getStatusBadge(user.accountStatus)}</td>
                          <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {user.accountStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => confirmStatusChange(user.id, user.accountStatus, 'approved', user)}
                                    className="text-green-600 hover:text-green-900 p-1 rounded"
                                    title="Aprobar manualmente"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => confirmStatusChange(user.id, user.accountStatus, 'suspended', user)}
                                    className="text-orange-600 hover:text-orange-900 p-1 rounded"
                                    title="Suspender"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              
                              {user.accountStatus === 'approved' && (
                                <>
                                  <button
                                    onClick={() => confirmStatusChange(user.id, user.accountStatus, 'pending', user)}
                                    className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                                    title="Cambiar a pendiente"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => confirmStatusChange(user.id, user.accountStatus, 'suspended', user)}
                                    className="text-orange-600 hover:text-orange-900 p-1 rounded"
                                    title="Suspender"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              
                              {user.accountStatus === 'suspended' && (
                                <>
                                  <button
                                    onClick={() => confirmStatusChange(user.id, user.accountStatus, 'approved', user)}
                                    className="text-green-600 hover:text-green-900 p-1 rounded"
                                    title="Reactivar usuario"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => confirmStatusChange(user.id, user.accountStatus, 'pending', user)}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                    title="Volver a pendiente"
                                  >
                                    <Clock className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => toggleUserRole(user.id, user.role)}
                                disabled={actionLoading}
                                className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                title={user.role === 'admin' ? 'Cambiar a Usuario' : 'Hacer Admin'}
                              >
                                <Shield className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setUserToDelete(user);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showUserModal && <UserDetailsModal />}
      {showDeleteModal && <DeleteConfirmModal />}
      {showStatusChangeModal && <StatusChangeModal />}
    </div>
  );
};

export default UserManagementSection;