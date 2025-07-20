import React, { useState, useEffect } from 'react';
import { Users, Shield, Edit2, Trash2, UserPlus, Eye, EyeOff, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, UserPermissions } from '../types';

const UserManagement: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const adminUser: User = {
      id: '1',
      username: 'admin',
      email: 'Peinture.aec@gmail.com',
      role: 'admin',
      permissions: {
        canCreateAppointments: true,
        canEditAppointments: true,
        canDeleteAppointments: true,
        canViewAppointments: true,
        canCreateQuotes: true,
        canEditQuotes: true,
        canDeleteQuotes: true,
        canViewQuotes: true,
        canManageSettings: true,
        canManageUsers: true,
        canUseVoiceControl: true,
        canExportData: true
      }
    };

    const allUsers = [adminUser, ...registeredUsers.map((u: any) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role || 'user',
      permissions: u.permissions || {
        canCreateAppointments: false,
        canEditAppointments: false,
        canDeleteAppointments: false,
        canViewAppointments: true,
        canCreateQuotes: false,
        canEditQuotes: false,
        canDeleteQuotes: false,
        canViewQuotes: true,
        canManageSettings: false,
        canManageUsers: false,
        canUseVoiceControl: false,
        canExportData: false
      }
    }))];

    setUsers(allUsers);
  };

  const updateUserPermissions = (userId: string, permissions: UserPermissions) => {
    if (userId === '1') return; // Ne pas modifier l'admin principal

    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const updatedUsers = registeredUsers.map((u: any) => 
      u.id === userId ? { ...u, permissions } : u
    );
    localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
    loadUsers();
  };

  const deleteUser = (userId: string) => {
    if (userId === '1') return; // Ne pas supprimer l'admin principal
    if (userId === currentUser?.id) return; // Ne pas se supprimer soi-même

    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const updatedUsers = registeredUsers.filter((u: any) => u.id !== userId);
      localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
      loadUsers();
    }
  };

  const togglePermission = (userId: string, permission: keyof UserPermissions) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.id === '1') return;

    const updatedPermissions = {
      ...user.permissions,
      [permission]: !user.permissions[permission]
    };

    updateUserPermissions(userId, updatedPermissions);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-green-300 bg-green-900/50';
      case 'user': return 'text-blue-300 bg-blue-900/50';
      default: return 'text-gray-300 bg-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'user': return 'Utilisateur';
      default: return 'Utilisateur';
    }
  };

  const permissionLabels: Record<keyof UserPermissions, string> = {
    canCreateAppointments: 'Créer des rendez-vous',
    canEditAppointments: 'Modifier des rendez-vous',
    canDeleteAppointments: 'Supprimer des rendez-vous',
    canViewAppointments: 'Voir les rendez-vous',
    canCreateQuotes: 'Créer des devis',
    canEditQuotes: 'Modifier des devis',
    canDeleteQuotes: 'Supprimer des devis',
    canViewQuotes: 'Voir les devis',
    canManageSettings: 'Gérer les paramètres',
    canManageUsers: 'Gérer les utilisateurs',
    canUseVoiceControl: 'Utiliser le contrôle vocal',
    canExportData: 'Exporter les données'
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Accès refusé</h2>
        <p className="text-gray-400">Vous n'avez pas les droits pour accéder à cette section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des utilisateurs</h1>
          <p className="text-gray-300 mt-1">Gérez les comptes et les permissions</p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 shadow-xl">
        <div className="p-6 border-b border-gray-600">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Utilisateurs ({users.length})
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="border border-gray-600 rounded-xl p-4 bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-white">{user.username}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                        {user.id === currentUser?.id && (
                          <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                            Vous
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowPermissions(showPermissions === user.id ? null : user.id)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-gray-600 rounded-lg"
                      title="Voir/Modifier les permissions"
                    >
                      {showPermissions === user.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    
                    {user.id !== '1' && user.id !== currentUser?.id && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-gray-600 rounded-lg"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions Panel */}
                {showPermissions === user.id && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <h4 className="font-medium text-white mb-3">Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(permissionLabels).map(([permission, label]) => (
                        <label key={permission} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-600/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={user.permissions[permission as keyof UserPermissions]}
                            onChange={() => togglePermission(user.id, permission as keyof UserPermissions)}
                            disabled={user.id === '1'} // Admin principal non modifiable
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-300">{label}</span>
                        </label>
                      ))}
                    </div>
                    
                    {user.id === '1' && (
                      <p className="text-xs text-gray-400 mt-3 italic">
                        Les permissions de l'administrateur principal ne peuvent pas être modifiées.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Legend */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Guide des permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-300 mb-2">Rendez-vous</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• <strong>Voir :</strong> Consulter la liste et le calendrier</li>
              <li>• <strong>Créer :</strong> Ajouter de nouveaux rendez-vous</li>
              <li>• <strong>Modifier :</strong> Éditer les rendez-vous existants</li>
              <li>• <strong>Supprimer :</strong> Effacer des rendez-vous</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-purple-300 mb-2">Devis</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• <strong>Voir :</strong> Consulter les devis créés</li>
              <li>• <strong>Créer :</strong> Générer de nouveaux devis</li>
              <li>• <strong>Modifier :</strong> Éditer les devis existants</li>
              <li>• <strong>Supprimer :</strong> Effacer des devis</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-300 mb-2">Administration</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• <strong>Paramètres :</strong> Modifier la configuration</li>
              <li>• <strong>Utilisateurs :</strong> Gérer les comptes</li>
              <li>• <strong>Export :</strong> Télécharger les données</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-300 mb-2">Fonctionnalités</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• <strong>Contrôle vocal :</strong> Utiliser la reconnaissance vocale</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;