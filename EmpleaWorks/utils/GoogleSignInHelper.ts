import { Platform, Linking } from 'react-native';
import Constants from 'expo-constants';

// Interfaz para resultados de diagnóstico
interface DiagnosticResult {
  clientId: string;
  platform: string;
  version: number;
  isExpoGo: boolean;
  isDebugBuild: boolean;
  hasPlayServices: boolean;
  isEmulator: boolean;
}

/**
 * Realiza un diagnóstico completo del entorno para Google Sign-In
 */
export const diagnoseGoogleSignIn = async (): Promise<DiagnosticResult> => {
  // Obtener información básica del entorno
  const clientId = Constants.expoConfig?.extra?.googleAndroidClientId || '';
  const platform = Platform.OS;
  const version = Platform.Version as number;
  const isExpoGo = Constants.appOwnership === 'expo';
  
  // Determinar si es una build de desarrollo
  // Nota: Esto es una aproximación, puede necesitar ajustes según tu configuración
  const isDebugBuild = __DEV__;
  
  // Verificar si es un emulador
  const isEmulator = await checkIfEmulator();
  
  // Verificar Play Services
  let hasPlayServices = false;
  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    hasPlayServices = true;
  } catch (error) {
    console.error('Error verificando Play Services:', error);
  }
  
  return {
    clientId,
    platform,
    version,
    isExpoGo,
    isDebugBuild,
    hasPlayServices,
    isEmulator
  };
};

/**
 * Verifica si el dispositivo es un emulador
 */
export const checkIfEmulator = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    return (
      Platform.constants.Brand?.includes('google') ||
      Platform.constants.Manufacturer?.includes('Google') ||
      Platform.constants.Model?.includes('sdk') ||
      Platform.constants.Model?.includes('Emulator') ||
      Platform.constants.Model?.includes('Android SDK')
    );
  } else if (Platform.OS === 'ios') {
    return __DEV__ && !process.env.EXPO_PRODUCTION;
  }
  return false;
};

/**
 * Abre la consola de Google Cloud para configurar el SHA-1
 */
export const openGoogleCloudConsole = () => {
  Linking.openURL('https://console.cloud.google.com/apis/credentials');
};

/**
 * Abre la documentación sobre cómo obtener el SHA-1
 */
export const openSHA1Documentation = () => {
  Linking.openURL('https://developers.google.com/android/guides/client-auth');
};

/**
 * Genera instrucciones para obtener y configurar el SHA-1 según el entorno
 */
export const getInstructionsForSHA1 = async (): Promise<string[]> => {
  const env = await diagnoseGoogleSignIn();
  const instructions: string[] = [];
  
  if (env.isExpoGo) {
    instructions.push(
      '📱 Estás usando Expo Go',
      'Google Sign-In requiere una build personalizada para funcionar correctamente',
      '',
      '1. Crea una build de desarrollo con EAS:',
      '   npx eas build --platform android --profile development',
      '',
      '2. O usa expo-auth-session para autenticación web (compatible con Expo Go)'
    );
  } else {
    instructions.push(
      '📱 Estás usando una build independiente',
      '',
      '1. Para obtener el SHA-1 de esta build:'
    );
    
    if (env.isDebugBuild) {
      instructions.push(
        '   • Esta es una build de desarrollo',
        '   • Ejecuta: cd android && ./gradlew signingReport',
        '   • Busca la línea SHA-1 bajo "Variant: debug"'
      );
    } else {
      instructions.push(
        '   • Esta es una build de producción',
        '   • Si usas un keystore personalizado, ejecuta:',
        '     keytool -list -v -keystore <ruta-a-tu-keystore>',
        '   • Si usas Google Play App Signing, obtén los SHA-1 de:',
        '     Google Play Console → Tu app → Configuración → Integridad de la app'
      );
    }
  }
  
  instructions.push(
    '',
    '2. Registra el SHA-1 en Google Cloud Console:',
    '   • Ve a: https://console.cloud.google.com/apis/credentials',
    '   • Edita tu ID de cliente OAuth para Android:',
    `     ${env.clientId}`,
    '   • Añade el SHA-1 en "Huellas digitales de certificado"',
    '   • Guarda los cambios y espera unos minutos'
  );
  
  return instructions;
};

/**
 * Analiza y muestra la estructura de respuesta de Google Sign-In
 */
export const analyzeGoogleSignInResponse = (response: any) => {
  console.log('=== ANÁLISIS DE RESPUESTA DE GOOGLE SIGN-IN ===');
  
  // Mostrar estructura general
  console.log('Propiedades de nivel superior:', Object.keys(response));
  
  // Verificar si tiene estructura { type, data }
  if (response.type && response.data) {
    console.log('Estructura detectada: { type, data }');
    console.log('Type:', response.type);
    console.log('Propiedades en data:', Object.keys(response.data));
    
    // Verificar si data tiene idToken
    if (response.data.idToken) {
      console.log('✅ idToken encontrado en data.idToken');
    } else {
      console.log('❌ No se encontró idToken en data');
    }
    
    // Verificar si data tiene serverAuthCode
    if (response.data.serverAuthCode) {
      console.log('⚠️ serverAuthCode encontrado en data');
    }
  } 
  // Verificar estructura tradicional
  else {
    console.log('Estructura tradicional (sin type/data)');
    
    // Verificar si tiene idToken directamente
    if (response.idToken) {
      console.log('✅ idToken encontrado en raíz del objeto');
    } 
    // Verificar si tiene user con idToken
    else if (response.user && response.user.idToken) {
      console.log('✅ idToken encontrado en user.idToken');
    } 
    // Verificar si tiene serverAuthCode
    else if (response.serverAuthCode) {
      console.log('⚠️ serverAuthCode encontrado, pero no idToken');
    } else {
      console.log('❌ No se encontró idToken ni serverAuthCode');
    }
  }
  
  console.log('=== FIN DE ANÁLISIS ===');
  
  return {
    hasIdToken: !!(
      (response.type === 'success' && response.data && response.data.idToken) || 
      response.idToken || 
      (response.user && response.user.idToken)
    ),
    hasServerAuthCode: !!(
      (response.type === 'success' && response.data && response.data.serverAuthCode) || 
      response.serverAuthCode
    ),
    structure: response.type && response.data ? 'type-data' : 'traditional'
  };
};
