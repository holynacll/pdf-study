import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/auth/auth.service';

/**
 * Context de Autenticação - Refatorado
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Apenas gerencia estado de autenticação, não lógica de negócio
 * - Dependency Inversion: Depende de abstração (authService), não de implementação
 *
 * A lógica de autenticação foi movida para authService, seguindo SRP
 */

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login com Google - delega para authService
  const loginWithGoogle = async () => {
    try {
      return await authService.loginWithGoogle();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  // Logout - delega para authService
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  // Observar mudanças de autenticação
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
