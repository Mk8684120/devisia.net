import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserPermissions } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PERMISSIONS: UserPermissions = {
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
};

const LIMITED_USER_PERMISSIONS: UserPermissions = {
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
};

const DEFAULT_USER: User = {
  id: '1',
  username: 'admin',
  email: 'Peinture.aec@gmail.com',
  role: 'admin',
  permissions: ADMIN_PERMISSIONS
};

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'Devis@25!!'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Migration pour ajouter les permissions aux anciens utilisateurs
      if (!parsedUser.permissions) {
        parsedUser.permissions = parsedUser.role === 'admin' ? ADMIN_PERMISSIONS : LIMITED_USER_PERMISSIONS;
        parsedUser.role = parsedUser.role || 'admin';
        localStorage.setItem('auth_user', JSON.stringify(parsedUser));
      }
      setUser(parsedUser);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Vérifier les identifiants par défaut
    if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
      setUser(DEFAULT_USER);
      localStorage.setItem('auth_user', JSON.stringify(DEFAULT_USER));
      return true;
    }

    // Vérifier les utilisateurs enregistrés
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const foundUser = registeredUsers.find((u: any) => 
      u.username === username && u.password === password
    );

    if (foundUser) {
      const userToLogin: User = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role || 'user',
        permissions: foundUser.permissions || LIMITED_USER_PERMISSIONS
      };
      setUser(userToLogin);
      localStorage.setItem('auth_user', JSON.stringify(userToLogin));
      return true;
    }

    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Récupérer les utilisateurs existants
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      
      // Vérifier si l'utilisateur existe déjà
      const userExists = registeredUsers.some((u: any) => 
        u.username === username || u.email === email
      );

      // Vérifier aussi contre l'utilisateur par défaut
      if (username === DEFAULT_CREDENTIALS.username || email === DEFAULT_USER.email) {
        return false;
      }

      if (userExists) {
        return false;
      }

      // Créer le nouvel utilisateur avec des droits limités
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // En production, il faudrait hasher le mot de passe
        role: 'user',
        permissions: LIMITED_USER_PERMISSIONS,
        createdAt: new Date().toISOString()
      };

      // Ajouter à la liste des utilisateurs
      registeredUsers.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(registeredUsers));

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return user?.permissions[permission] || false;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      hasPermission,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};