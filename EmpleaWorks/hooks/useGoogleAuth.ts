import { useState } from 'react';
import { router } from 'expo-router';
import { signInWithGoogle, signOutFromGoogle } from '@/utils/authUtils';
import { useAuth } from '@/context/AuthContext';
import Constants from 'expo-constants';
import { Alert } from 'react-native';
import Logger from '../utils/logger';

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setIsAuthenticated } = useAuth();

  // Usamos la configuración de app.json correcta
  const ANDROID_CLIENT_ID = Constants.expoConfig?.extra?.googleAndroidClientId || '';
  const WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleWebClientId || '';

  const login = async (forceAccountSelection = true) => {
    try {
      setIsLoading(true);
      setError(null);
      
      Logger.log('Iniciando login con Google...');
      Logger.log('Android Client ID:', ANDROID_CLIENT_ID);
      Logger.log('Web Client ID:', WEB_CLIENT_ID);
      Logger.log('Forzar selección de cuenta:', forceAccountSelection ? 'Sí' : 'No');

      if (!WEB_CLIENT_ID) {
        throw new Error('Falta configuración Web Client ID');
      }

      // Intentar la autenticación con Google, forzando la selección de cuenta
      const { user, token } = await signInWithGoogle(forceAccountSelection);
      
      Logger.log('Login con Google exitoso!');
      Logger.log('Usuario autenticado:', user?.name || 'Desconocido');
      
      // Update auth context with the user info
      if (setUser) {
        setUser(user);
      }
      
      // Explicitly set authentication state to true
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }
      
      // Add a slight delay before navigation to ensure state updates are processed
      setTimeout(() => {
        Logger.log('Redirigiendo a pantalla principal...');
        try {
          router.replace('/(tabs)');
          Logger.log('Redirección ejecutada');
        } catch (navError) {
          Logger.error('Error en navegación:', navError);
          // Fallback navigation if the first attempt fails
          try {
            router.push('/(tabs)');
            Logger.log('Navegación alternativa ejecutada');
          } catch (fallbackError) {
            Logger.error('Error en navegación alternativa:', fallbackError);
          }
        }
      }, 300);
      
      return { user, token };
    } catch (err: any) {
      const errorMessage = typeof err === 'string' 
        ? err 
        : err.message || 'Error al iniciar sesión con Google';
      
      setError(errorMessage);
      Logger.error('Google auth error:', err);
      
      // Mostrar mensaje específico basado en el tipo de error
      if (errorMessage.includes('conexión') || errorMessage.includes('network')) {
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.'
        );
      } else if (errorMessage.includes('configuración') || errorMessage.includes('SHA-1')) {
        Alert.alert(
          'Error de configuración',
          'Hay un problema con la configuración de Google Sign-In. Contacta al soporte técnico.'
        );
      } else {
        Alert.alert(
          'Error de autenticación',
          errorMessage
        );
      }
      
      throw errorMessage;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a method to explicitly sign out from Google
  const signOut = async () => {
    try {
      await signOutFromGoogle();
    } catch (error) {
      Logger.warn('Error signing out from Google:', error);
    }
  };

  return {
    login,
    signOut,
    isLoading,
    error
  };
}
