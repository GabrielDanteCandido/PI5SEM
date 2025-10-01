import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticateUser } from '../database/database';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username, password) => {
    try {
      const userData = await authenticateUser(username, password);
      if (userData) {
        await AsyncStorage.setItem('@user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: 'Usuário ou senha inválidos' };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};