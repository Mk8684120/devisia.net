import React, { ReactNode } from 'react';
import { Calendar, BarChart3, List, Settings, LogOut, Mic, Calculator, Shield, Users, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'calendar' | 'appointments' | 'quotes' | 'quote-manager' | 'settings' | 'users';
  onNavigate: (page: 'dashboard' | 'calendar' | 'appointments' | 'quotes' | 'quote-manager' | 'settings' | 'users') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout, hasPermission, isAdmin } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3, permission: null },
    { id: 'calendar', label: 'Calendrier', icon: Calendar, permission: 'canViewAppointments' as const },
    { id: 'appointments', label: 'Rendez-vous', icon: List, permission: 'canViewAppointments' as const },
    { id: 'quotes', label: 'Devis', icon: FileText, permission: 'canViewQuotes' as const },
    { id: 'users', label: 'Utilisateurs', icon: Users, permission: 'canManageUsers' as const },
    { id: 'settings', label: 'Paramètres', icon: Settings, permission: 'canManageSettings' as const }
  ];

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'user': return 'Utilisateur';
      default: return 'Utilisateur';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-green-400';
      case 'user': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Planificateur Pro</h1>
                  <p className="text-xs text-gray-300">Rendez-vous & Devis Vocaux</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm text-gray-300 bg-gray-700/50 px-4 py-2 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user?.username?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium text-white">{user?.username}</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-xs ${getRoleColor(user?.role || 'user')}`}>
                      {getRoleLabel(user?.role || 'user')}
                    </p>
                    {user?.role === 'admin' && (
                      <Shield className="h-3 w-3 text-green-400" />
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl min-h-[calc(100vh-4rem)] border-r border-gray-700">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const hasAccess = !item.permission || hasPermission(item.permission);
                
                if (!hasAccess) return null;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                        currentPage === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md hover:scale-102'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.id === 'quotes' && hasPermission('canUseVoiceControl') && (
                        <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          🎤
                        </span>
                      )}
                      {item.id === 'quote-manager' && (
                        <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                          Pro
                        </span>
                      )}
                      {item.id === 'users' && (
                        <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Permissions Info */}
          <div className="p-4 mt-8">
            <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl p-4 border border-gray-600">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Vos droits</span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                {user?.role === 'admin' ? (
                  <p>Accès complet à toutes les fonctionnalités</p>
                ) : (
                  <div>
                    <p>• Consultation des données</p>
                    <p>• Accès limité aux modifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voice Control Info */}
          {hasPermission('canUseVoiceControl') && (
            <div className="p-4">
              <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Mic className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Contrôle vocal</span>
                </div>
                <p className="text-xs text-gray-300">
                  Créez des rendez-vous et des devis par la voix
                </p>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;