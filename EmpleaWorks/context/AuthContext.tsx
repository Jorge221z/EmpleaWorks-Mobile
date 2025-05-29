import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register, logout, getUser } from '@/api/axios';
import { useNotificationContext } from './NotificationContext'; // Import NotificationContext
import Logger from '../utils/logger';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  setUser: (user: any | null) => void;
  setIsAuthenticated: (value: boolean) => void;
}

/** Nuestra autenticación funciona de la siguiente forma:
 *  una vez que el usuario se registra/logea se almacena un token en el dispositivo movil y 
 *  mientras que este permanezca almacenado no será necesario inicar sesión en el dispositivo  */
 



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { sendNotification } = useNotificationContext(); // Get sendNotification function

  // Comprueba el estado de autenticación al inicio
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          // Si hay token, intentar obtener información del usuario
          const userData = await getUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        Logger.error('Error verificando autenticación:', error);
        // Si hay error, limpiar token
        await AsyncStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Función de login
  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try { //la idea es manejar la funcion de login de axios pero de forma mas explicita y recibir fallos mas concretos mas que fallos solo de llamada a la API //
      const response = await login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error?.message || 'Error al iniciar sesión');
      Logger.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de registro
  const handleRegister = async (userData: any) => {
    setError(null);
    setIsLoading(true);
    try { //La idea similar a la de handleLogin, manejar mejor posibles fallos derivados del registro que nos provee la API
      const response = await register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      // Send notification on successful registration
      sendNotification({
        title: "¡Registro Exitoso! 🎉",
        body: "Revisa el email que te acabamos de enviar para verificar tu correo.",
      });
    } catch (error: any) {
      setError(error?.message || 'Error al registrarse');
      Logger.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      Logger.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    error,
    setUser,
    setIsAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};