import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { handleGoogleCallback } from '@/api/axios';
import Constants from 'expo-constants';
import Logger from './logger';

// Define interfaces
interface GoogleCallbackResponse {
  token: string;
  user: User;
}

interface User {
  id: string;
  name: string;
  email: string;
  // Agrega otros campos según necesites
}

// Función para procesar el callback de Google con el idToken
export const handleGoogleLogin = async (idToken: string): Promise<{ user: User; token: string }> => {
  try {
    Logger.log('Llamando a handleGoogleCallback con idToken válido');
    const response = await handleGoogleCallback(idToken);
    
    if (!response || !response.token || !response.user) {
      Logger.error('Respuesta inválida del backend:', response);
      throw new Error('Respuesta inválida del servidor');
    }
    
    const { token: authToken, user } = response;
    await AsyncStorage.setItem('auth_token', authToken); // Almacena el token
    return { user, token: authToken };
  } catch (error: any) {
    Logger.error('Error en handleGoogleLogin:', error);
    
    // Check for specific backend errors
    if (error.message && (
        error.message.includes("Google_Client") || 
        error.message.includes("google/apiclient") ||
        (error.exception === "Error" && error.file && error.file.includes("GoogleController.php"))
    )) {
      throw new Error('El servidor no tiene instalada la biblioteca de Google. Contacta al administrador del servidor.');
    }
    
    // Check for token validation errors with more specific message
    if (error.error === "Token inválido" || 
        (typeof error.message === 'string' && error.message.includes("Token inválido")) ||
        (typeof error.message === 'string' && error.message.includes("Invalid token"))) {
      throw new Error('Token inválido: El GOOGLE_CLIENT_ID_MOBILE en el servidor no coincide con el Web Client ID de la app.');
    }
    
    // Extraer mensaje significativo del error
    const errorMessage = 
      typeof error === 'string' ? error :
      error.error ? error.error :
      error.message ? error.message :
      'Error en la autenticación con Google';
    
    throw new Error(errorMessage);
  }
};

/**
 * Cierra la sesión de Google si existe
 */
export const signOutFromGoogle = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }
    try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut();
    Logger.log('Usuario desconectado de Google correctamente');
  } catch (error) {
    Logger.warn('Error al cerrar sesión de Google:', error);
  }
};

// Función para iniciar sesión con Google
export const signInWithGoogle = async (forceAccountSelection = false) => {
  try {
    if (Platform.OS === 'web') {
      throw new Error('Google Sign-in no soportado en web aún');
    }

    const { GoogleSignin, statusCodes } = await import('@react-native-google-signin/google-signin');

    // Obtén el webClientId desde app.json
    const webClientId = Constants.expoConfig?.extra?.googleWebClientId;

    if (!webClientId) {
      throw new Error('No se encontró configuración de Google Web Client ID');
    }

    Logger.log('Configurando GoogleSignin con Web Client ID:', webClientId);

    // Configura GoogleSignin con webClientId (sin androidClientId, que causa error)
    GoogleSignin.configure({
      scopes: ['profile', 'email'], // Asegúrate de solicitar estos scopes
      webClientId: webClientId,
      offlineAccess: true, // Solicitar acceso offline para obtener idToken
      // Removido androidClientId ya que causa error
    });

    // If forceAccountSelection is true, sign out first to force account picker
    if (forceAccountSelection) {
      Logger.log('Forzando selección de cuenta: cerrando sesión previa de Google...');
      await GoogleSignin.signOut();
    }

    // Verifica Google Play Services
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      Logger.log('✅ Google Play Services disponibles');
    } catch (playError) {
      Logger.error('Error con Google Play Services:', playError);
      if (
        typeof playError === 'object' &&
        playError !== null &&
        'code' in playError &&
        (playError as any).code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        throw new Error('Google Play Services no está disponible en este dispositivo');
      }
      throw playError;
    }

    // Realiza el inicio de sesión
    try {
      Logger.log('Iniciando Google Sign-In...');
      const userInfo = await GoogleSignin.signIn();
      
      // Mostrar la estructura completa (sin datos sensibles)
      Logger.log('Estructura completa de respuesta:', JSON.stringify(userInfo, null, 2));
      
      // Analizar la estructura real recibida
      Logger.log('Propiedades de nivel superior:', Object.keys(userInfo));
      
      // Obtener idToken según la estructura detectada
      let idToken = null;
      
      // Según el log anterior, la estructura tiene type y data
      if (userInfo.type === 'success' && userInfo.data) {
        Logger.log('Estructura identificada: { type, data }');
        const { data } = userInfo;
        Logger.log('Propiedades en data:', Object.keys(data));
        
        // Buscar idToken en data
        if (data.idToken) {
          Logger.log('idToken encontrado en data.idToken');
          idToken = data.idToken;
        } else if (data.serverAuthCode) {
          Logger.log('serverAuthCode encontrado, pero no idToken');
          throw new Error('Se obtuvo serverAuthCode pero no idToken. El backend debe implementar intercambio de código.');
        }
      } 
      // Verificación de estructura tradicional (en caso de cambio en la biblioteca)
      else if ((userInfo as { idToken?: string }).idToken) {
        Logger.log('idToken encontrado en raíz del objeto');
        idToken = (userInfo as { idToken?: string }).idToken;
      } else if (
        typeof userInfo === 'object' &&
        userInfo !== null &&
        'user' in userInfo &&
        (userInfo as any).user &&
        (userInfo as any).user.idToken
      ) {
        Logger.log('idToken encontrado en user.idToken');
        idToken = (userInfo as any).user.idToken;
      } else if ('serverAuthCode' in userInfo && (userInfo as any).serverAuthCode) {
        Logger.log('serverAuthCode encontrado, pero no idToken');
        throw new Error('Se obtuvo serverAuthCode pero no idToken. El backend debe implementar intercambio de código.');
      }

      if (!idToken) {
        Logger.error('No se pudo obtener idToken de la respuesta de Google Sign-In');
        throw new Error('No se obtuvo el idToken. Comprueba la configuración de Google Cloud Console.');
      }

      Logger.log('✅ idToken obtenido correctamente');
      
      // Envía el idToken al backend
      return await handleGoogleLogin(idToken);
    } catch (signInError) {
      if (
        typeof signInError === 'object' &&
        signInError !== null &&
        'code' in signInError
      ) {        if ((signInError as any).code === 'DEVELOPER_ERROR') {
          Logger.error('DEVELOPER_ERROR detectado - Problema de configuración SHA-1');
          throw new Error('Error de configuración con Google Sign-In. Verifica que el SHA-1 esté registrado en Google Cloud Console.');
        }
        if ((signInError as any).code === statusCodes.SIGN_IN_CANCELLED) {
          throw new Error('Inicio de sesión cancelado por el usuario');
        }
      }
      throw signInError;
    }
  } catch (error) {
    Logger.error('Error en sign-in con Google:', error);
    throw error instanceof Error ? error : new Error('Error al autenticarse con Google');
  }
};