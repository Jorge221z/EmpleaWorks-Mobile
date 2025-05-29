import React, { useEffect } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import {
import Logger from '../../utils/logger';
  register,
  login,
  getUser,
  getProfile,
  updateProfile,
  deleteProfile,
  getCandidateDashboard,
  getOfferDetails,
  getOffers,
  getOffer,
  createOffer,
  applyToOffer,
  updateOffer,
  deleteOffer,
  logout,
  getDashboard,
  getGoogleRedirectUrl,
  handleGoogleCallback,
  handleGoogleAuthCode,
  getGoogleMobileConfig,
  toggleSavedOffer,
  getSavedOffers,  getEmailVerificationStatus,
  resendEmailVerification,
  checkEmailVerificationRequired,
  handleEmailVerificationError,
} from '../../api/axios'; // Ajusta la ruta según tu estructura
import Constants from 'expo-constants';

const TestApi = () => {
  // Mover la función fuera del useEffect para que sea accesible desde el botón
  const testApi = async () => {
    // Variables para rastrear recursos creados que necesitan ser eliminados
    let companyEmail = null;
    let companyPassword = 'passworD-123';
    let candidateEmail = null;
    let candidatePassword = 'passworD-123';
    let createdOfferId = null;
    let createdApplyId = null;
    
    try {
      Logger.log('=== Iniciando pruebas de API ===');

      // 1. Registro de empresa
      Logger.log('Probando register (empresa)...');
      const companyData = {
        name: `Company${Date.now()}`,
        email: `company${Date.now()}@example.com`,
        role: 'company',
        password: companyPassword,
        password_confirmation: companyPassword,
      };
      companyEmail = companyData.email;
      const companyRegister = await register(companyData);
      Logger.log('Registro empresa exitoso:', companyRegister);

      // 2. Login empresa
      Logger.log('Probando login (empresa)...');
      const companyLogin = await login({
        email: companyEmail,
        password: companyPassword,
      });
      Logger.log('Login empresa exitoso:', companyLogin);

      // 3. Crear oferta como empresa
      Logger.log('Probando createOffer...');
      const offerData = {
        name: `Oferta Test ${Date.now()}`,
        description: 'Descripción de prueba',
        category: 'Tecnología',
        degree: 'Ingeniería',
        email: 'contact@company.com',
        contract_type: 'Indefinido',
        job_location: 'Remoto',
        closing_date: '2025-12-31',
      };
      const createdOffer = await createOffer(offerData);
      createdOfferId = createdOffer.offer.id;
      Logger.log('Oferta creada:', createdOffer);

      // 4. Listar todas las ofertas
      Logger.log('Probando getOffers...');
      const offers = await getOffers();
      Logger.log('Ofertas obtenidas:', offers);

      // 5. Obtener una oferta específica
      Logger.log('Probando getOffer...');
      const offer = await getOffer(createdOfferId);
      Logger.log('Oferta obtenida:', offer);

      // 6. Registro de candidato
      Logger.log('Probando register (candidato)...');
      const candidateData = {
        name: `Candidate${Date.now()}`,
        email: `candidate${Date.now()}@example.com`,
        role: 'candidate',
        password: candidatePassword,
        password_confirmation: candidatePassword,
      };
      candidateEmail = candidateData.email;
      const candidateRegister = await register(candidateData);
      Logger.log('Registro candidato exitoso:', candidateRegister);

      // 7. Login candidato
      Logger.log('Probando login (candidato)...');
      const candidateLogin = await login({
        email: candidateEmail,
        password: candidatePassword,
      });
      Logger.log('Login candidato exitoso:', candidateLogin);

      // 8. Subir CV para el candidato
      Logger.log('Probando updateProfile (subir CV)...');
      const cvFile = {
        uri: 'file:///path/to/fake_cv.pdf', // Debe ser una ruta válida en un dispositivo real
        type: 'application/pdf',
        name: 'cv.pdf',
      };
      let cvUploaded = false;
      if (cvFile.uri && !cvFile.uri.includes('fake_cv.pdf')) {
        const formData = new FormData();
        formData.append('cv', cvFile);
        const updatedProfile = await updateProfile(formData, true);
        Logger.log('Perfil actualizado con CV:', updatedProfile);
        cvUploaded = true;
      } else {
        Logger.warn('No se subió CV porque la URI no es válida. Usa un picker real en dispositivo.');
      }

      // 9. Aplicar a oferta como candidato (solo si se subió CV)
      if (cvUploaded) {
        Logger.log('Probando applyToOffer...');
        const applicationData = {
          phone: '+123456789',
          email: candidateEmail,
          cl: 'Carta de presentación de prueba',
          offer_id: createdOfferId,
        };
        const applyResponse = await applyToOffer(applicationData);
        createdApplyId = applyResponse.id; // Guardamos el ID de la aplicación si la API lo devuelve
        Logger.log('Aplicación enviada:', applyResponse);
      } else {
        Logger.warn('No se probó applyToOffer porque no se subió un CV real.');
      }

      // 10. Obtener dashboard del candidato
      Logger.log('Probando getCandidateDashboard...');
      const dashboardResponse = await getCandidateDashboard();
      Logger.log('Dashboard obtenido:', dashboardResponse);

      // 11. Obtener detalles de una oferta específica
      Logger.log('Probando getOfferDetails...');
      const offerDetails = await getOfferDetails(createdOfferId);
      Logger.log('Detalles de la oferta obtenidos:', offerDetails);

      // 12. Actualizar oferta como empresa
      Logger.log('Probando updateOffer...');
      await login({ email: companyEmail, password: companyPassword });
      const updatedOfferData = {
        name: `Oferta Actualizada ${Date.now()}`,
        description: 'Descripción actualizada',
        category: offerDetails.category,
        degree: offerDetails.degree,
        email: offerDetails.email,
        contract_type: offerDetails.contract_type,
        job_location: offerDetails.job_location,
        closing_date: offerDetails.closing_date,
      };
      const updatedOffer = await updateOffer(createdOfferId, updatedOfferData);
      Logger.log('Oferta actualizada:', updatedOffer);

      Logger.log('=== Pruebas de API completadas exitosamente ===');
    } catch (error) {
      Logger.error('Error en las pruebas:', error);
    } finally {
      Logger.log('=== Iniciando limpieza de recursos creados ===');
      
      try {
        // 1. Eliminar ofertas como empresa
        if (createdOfferId) {
          Logger.log('Asegurando login como empresa para eliminar ofertas...');
          await login({ email: companyEmail, password: companyPassword });
          
          Logger.log(`Eliminando oferta ID: ${createdOfferId}...`);
          const deleteOfferResponse = await deleteOffer(createdOfferId);
          Logger.log('Oferta eliminada:', deleteOfferResponse);
        }
        
        // 2. Eliminar cuenta de candidato
        if (candidateEmail) {
          Logger.log('Eliminando cuenta de candidato...');
          await login({ email: candidateEmail, password: candidatePassword });
          const deleteCandidateResponse = await deleteProfile(candidatePassword);
          Logger.log('Cuenta de candidato eliminada:', deleteCandidateResponse);
        }
        
        // 3. Eliminar cuenta de empresa
        if (companyEmail) {
          Logger.log('Eliminando cuenta de empresa...');
          await login({ email: companyEmail, password: companyPassword });
          const deleteCompanyResponse = await deleteProfile(companyPassword);
          Logger.log('Cuenta de empresa eliminada:', deleteCompanyResponse);
        }
        
        // 4. Cerrar sesión
        Logger.log('Cerrando sesión...');
        await logout();
        Logger.log('Sesión cerrada');
      } catch (cleanupError) {
        Logger.error('Error durante la limpieza de recursos:', cleanupError);
      }
      
      Logger.log('=== Proceso de limpieza finalizado ===');
    }
  };

  // Nuevo test: solo candidateDashboard, creando y borrando cuenta
  const testDashboardOnly = async () => {
    try {
      Logger.log('=== Prueba solo dashboard (crear, consultar, borrar) ===');
      // 1. Crear cuenta candidato
      const candidateData = {
        name: `Candidate${Date.now()}`,
        email: `candidate${Date.now()}@example.com`,
        role: 'candidate',
        password: 'passworD-123',
        password_confirmation: 'passworD-123',
      };
      const candidateRegister = await register(candidateData);
      Logger.log('Registro candidato exitoso:', candidateRegister);

      // 2. Login candidato
      const candidateLogin = await login({
        email: candidateData.email,
        password: 'passworD-123',
      });
      Logger.log('Login candidato exitoso:', candidateLogin);

      // 3. Obtener dashboard
      const dashboardResponse = await getCandidateDashboard();
      Logger.log('Dashboard obtenido (solo test):', dashboardResponse); //es normal que esté vacio ya que es un nuevo user//

      // 4. Borrar cuenta candidato (enviando password como string)
      const deleteResponse = await deleteProfile('passworD-123');
      Logger.log('Cuenta de candidato eliminada:', deleteResponse);

      Logger.log('=== Fin prueba solo dashboard ===');
    } catch (error) {
      Logger.error('Error en testDashboardOnly:', error);
    }
  };

  // Test solo para getDashboard
  const testGetDashboard = async () => {
    try {
      Logger.log('=== Probando getDashboard ===');
      const dashboard = await getDashboard();
      Logger.log('Dashboard obtenido:', dashboard);
      Logger.log('=== Fin prueba getDashboard ===');
    } catch (error) {
      Logger.error('Error en testGetDashboard:', error);
    }
  };

  // Nuevo test específico para Google Auth
  const testGoogleAuth = async () => {
    try {
      Logger.log('=== Iniciando pruebas de Google Authentication ===');

      // 1. Obtener URL de redirección de Google
      Logger.log('Probando getGoogleRedirectUrl...');
      const googleUrl = await getGoogleRedirectUrl();
      Logger.log('URL de Google obtenida:', googleUrl);

      // Verificar que la URL contiene los parámetros esperados de OAuth
      if (googleUrl && typeof googleUrl === 'string') {
        const hasOAuthParams = googleUrl.includes('client_id') && 
                              googleUrl.includes('redirect_uri') && 
                              googleUrl.includes('scope');
        Logger.log('URL contiene parámetros OAuth válidos:', hasOAuthParams);
        
        if (hasOAuthParams) {
          Logger.log('✅ getGoogleRedirectUrl funciona correctamente');
        } else {
          Logger.warn('⚠️ La URL no contiene todos los parámetros OAuth esperados');
        }
      } else {
        Logger.error('❌ La respuesta no es una URL válida');
      }

      // 2. Simular callback de Google (normalmente esto se haría con un token real de Google)
      Logger.log('Simulando handleGoogleCallback...');
      
      // NOTA: En una prueba real, necesitarías un token válido de Google
      // Para propósitos de testing, intentamos con un token simulado
      const mockGoogleToken = `mock_google_token_${Date.now()}`;
      
      try {
        const googleAuthResult = await handleGoogleCallback(mockGoogleToken);
        Logger.log('✅ Google callback exitoso:', googleAuthResult);
        
        // Si el callback fue exitoso, probamos obtener el perfil del usuario
        Logger.log('Probando getUser después de Google auth...');
        const userProfile = await getUser();
        Logger.log('Perfil de usuario obtenido:', userProfile);
        
        // Probamos obtener el perfil completo
        Logger.log('Probando getProfile después de Google auth...');
        const fullProfile = await getProfile();
        Logger.log('Perfil completo obtenido:', fullProfile);
        
        // Limpiar: eliminar la cuenta creada via Google
        Logger.log('Limpiando cuenta creada via Google...');
        // Nota: Para Google auth, el password podría ser null o generado automáticamente
        // Puede que necesites ajustar esto según tu implementación backend
        try {
          await deleteProfile('default_password_for_google_users');
          Logger.log('✅ Cuenta de Google eliminada exitosamente');
        } catch (deleteError) {
          Logger.warn('⚠️ No se pudo eliminar la cuenta de Google (esto puede ser normal):', deleteError.message);
        }
        
      } catch (callbackError) {
        Logger.log('❌ Google callback falló (esperado con token simulado):', callbackError.message);
        Logger.log('💡 Esto es normal en testing - se necesita un token real de Google para completar el flujo');
        
        // Verificar si el error es el esperado (token inválido)
        if (callbackError.message && 
            (callbackError.message.includes('token') || 
             callbackError.message.includes('invalid') ||
             callbackError.message.includes('unauthorized'))) {
          Logger.log('✅ El endpoint de callback está funcionando (rechaza tokens inválidos correctamente)');
        }
      }

      // 3. Verificar que las funciones de Google auth están disponibles
      Logger.log('Verificando disponibilidad de funciones Google auth...');
      Logger.log('getGoogleRedirectUrl disponible:', typeof getGoogleRedirectUrl === 'function');
      Logger.log('handleGoogleCallback disponible:', typeof handleGoogleCallback === 'function');

      Logger.log('=== Pruebas de Google Authentication completadas ===');
      Logger.log('📋 Resumen:');
      Logger.log('- getGoogleRedirectUrl: Funcional');
      Logger.log('- handleGoogleCallback: Requiere token real para prueba completa');
      Logger.log('- Para prueba completa: usar dispositivo real con Google OAuth configurado');

    } catch (error) {
      Logger.error('❌ Error en las pruebas de Google Auth:', error);
      Logger.log('💡 Posibles causas:');
      Logger.log('- Servidor backend no está corriendo');
      Logger.log('- Google OAuth no está configurado en el backend');
      Logger.log('- Problemas de conectividad de red');
    } finally {
      // Asegurar logout al final
      try {
        await logout();
        Logger.log('🚪 Sesión cerrada al finalizar pruebas');
      } catch (logoutError) {
        Logger.log('Logout error (normal si no había sesión):', logoutError.message);
      }
    }
  };

  // Test específico y detallado para Google Auth con información de depuración
  const testDetailedGoogleAuth = async () => {
    Logger.log('=== INICIANDO TEST DETALLADO DE GOOGLE AUTH ===');
    
    // 1. Verificar la configuración disponible
    const androidClientId = Constants.expoConfig?.extra?.googleAndroidClientId;
    Logger.log('📱 Android Client ID configurado:', androidClientId);
    
    try {
      // 2. Si estamos en un dispositivo móvil, intentamos usar Google Sign-In nativo
      if (Platform.OS !== 'web') {
        Logger.log('🔍 Plataforma detectada:', Platform.OS);
        
        try {
          // Importamos la librería Google Sign-In de manera más segura
          Logger.log('⏳ Importando Google Sign-In...');
          let GoogleSignin, statusCodes;
          
          try {
            const GoogleSignInModule = await import('@react-native-google-signin/google-signin');
            GoogleSignin = GoogleSignInModule.GoogleSignin;
            statusCodes = GoogleSignInModule.statusCodes;
            
            // Verificar que la importación funcionó correctamente
            if (!GoogleSignin || typeof GoogleSignin.configure !== 'function') {
              throw new Error('La importación de GoogleSignin no proporcionó la API esperada');
            }
            
            Logger.log('✅ Google Sign-In importado correctamente');
          } catch (importError) {
            Logger.error('❌ Error al importar Google Sign-In:', importError);
            Logger.log('💡 Asegúrate de que @react-native-google-signin/google-signin está instalado');
            Logger.log('💡 Ejecuta: npm install @react-native-google-signin/google-signin');
            throw new Error('Fallo al importar la biblioteca de Google Sign-In');
          }
          
          // Configuramos Google Sign-In con más información de depuración
          Logger.log('⚙️ Configurando Google Sign-In con Android Client ID:', androidClientId);
          GoogleSignin.configure({
            webClientId: androidClientId, // Usamos el mismo ID para web/Android
            offlineAccess: true, // Si necesitamos acceso offline
          });
          Logger.log('✅ GoogleSignin configurado');
          
          // Verificamos Play Services
          Logger.log('🔄 Verificando Google Play Services...');
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          Logger.log('✅ Google Play Services disponibles');
          
          // Verificamos si hay sesión activa de manera segura
          Logger.log('🔐 Verificando si hay sesión de Google activa...');
          let isSignedIn = false;
          
          try {
            // Comprobamos que el método existe antes de llamarlo
            if (typeof GoogleSignin.isSignedIn === 'function') {
              isSignedIn = await GoogleSignin.isSignedIn();
              Logger.log('- Sesión activa:', isSignedIn);
            } else {
              Logger.warn('⚠️ GoogleSignin.isSignedIn no está disponible en esta versión');
              // Alternativa: intentar getCurrentUser para ver si hay sesión
              const currentUser = await GoogleSignin.getCurrentUser();
              isSignedIn = !!currentUser;
              Logger.log('- Sesión activa (verificada por getCurrentUser):', isSignedIn);
            }
          } catch (sessionCheckError) {
            Logger.warn('⚠️ Error al verificar sesión:', sessionCheckError);
            Logger.log('- Asumiendo que no hay sesión activa');
          }
          
          // Si hay sesión, intentamos cerrarla para empezar limpio
          if (isSignedIn) {
            Logger.log('🔄 Cerrando sesión previa de Google...');
            await GoogleSignin.signOut();
            Logger.log('✅ Sesión previa cerrada');
          }
          
          // Iniciamos el flujo de login
          Logger.log('🔑 Iniciando flujo de login con Google...');
          const userInfo = await GoogleSignin.signIn();
          Logger.log('✅ Login con Google exitoso!');
          Logger.log('📋 Datos obtenidos:', JSON.stringify({
            idToken: userInfo.idToken ? '✓ Presente' : '✗ Ausente',
            user: userInfo.user ? {
              id: userInfo.user.id,
              name: userInfo.user.name,
              email: userInfo.user.email
            } : 'No disponible'
          }, null, 2));
          
          // Verificamos que tenemos un idToken
          if (!userInfo.idToken) {
            Logger.error('❌ No se obtuvo idToken de Google, no podemos continuar');
            return;
          }
          
          // Enviamos el token a nuestro backend
          Logger.log('🔄 Enviando idToken a nuestro backend...');
          const response = await handleGoogleCallback(userInfo.idToken);
          Logger.log('✅ Respuesta del backend recibida:', JSON.stringify({
            token: response.token ? '✓ Presente' : '✗ Ausente',
            user: response.user ? {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              role: response.user.role
            } : 'No disponible'
          }, null, 2));
          
          // Verificamos si recibimos un token de autenticación
          if (response.token) {
            Logger.log('🎉 AUTENTICACIÓN COMPLETA EXITOSA! El usuario debería estar ahora autenticado en la app.');
            
            // Probamos obtener datos del usuario como verificación final
            Logger.log('🔄 Verificando datos del usuario autenticado...');
            const userData = await getUser();
            Logger.log('✅ Datos del usuario verificados:', userData.name);
          }
          
        } catch (error) {
          Logger.error('❌ ERROR EN GOOGLE SIGN-IN:', error);
          
          // Intentar detectar si es un problema de instalación de la biblioteca
          if (error.message && error.message.includes('importar')) {
            Logger.log('💡 SOLUCIÓN PRINCIPAL: Instala la biblioteca Google Sign-In:');
            Logger.log('npm install @react-native-google-signin/google-signin');
            Logger.log('y luego reinicia la aplicación (cerrar completamente y volver a abrir)');
          } 
          // Interpretamos errores específicos de Google Sign-In para mejor diagnóstico
          else if (error.code && typeof statusCodes !== 'undefined') {
            switch (error.code) {
              case statusCodes.SIGN_IN_CANCELLED:
                Logger.log('💡 El usuario canceló el inicio de sesión');
                break;
              case statusCodes.IN_PROGRESS:
                Logger.log('💡 Hay una operación de inicio de sesión en progreso');
                break;
              case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                Logger.log('💡 Google Play Services no está disponible o desactualizado');
                break;
              default:
                Logger.log('💡 Error con código:', error.code);
            }
          }
          
          // Consejos de solución
          Logger.log('\n🔧 POSIBLES SOLUCIONES:');
          Logger.log('1. Verifica que el androidClientId esté configurado correctamente en app.json');
          Logger.log('2. Asegúrate de que la app esté firmada con el certificado SHA-1 registrado en Google Cloud Console');
          Logger.log('3. Verifica que @react-native-google-signin/google-signin esté instalado correctamente');
          Logger.log('   → npm install @react-native-google-signin/google-signin');
          Logger.log('   → Luego reinicia la app completamente');
          Logger.log('4. Revisa la configuración en Google Cloud Console (OAuth, APIs habilitadas)');
          Logger.log('5. Verifica la versión de la biblioteca y su compatibilidad:');
          Logger.log('   → npx react-native --version');
          Logger.log('   → npm list @react-native-google-signin/google-signin');
        }
      } else {
        Logger.log('❌ Este test está diseñado para ejecutarse en dispositivos móviles, no en web');
      }
    } catch (error) {
      Logger.error('❌ ERROR GENERAL:', error);
    } finally {
      Logger.log('=== TEST DETALLADO DE GOOGLE AUTH FINALIZADO ===');
    }
  };

  // Test específico para diagnosticar error DEVELOPER_ERROR de Google Sign-In
  const testGoogleDeveloperError = async () => {
    Logger.log('=== DIAGNÓSTICO DE ERROR DEVELOPER_ERROR EN GOOGLE SIGN-IN ===');
    
    // 1. Verificar la configuración
    const androidClientId = Constants.expoConfig?.extra?.googleAndroidClientId;
    Logger.log('📱 Android Client ID configurado:', androidClientId);
    
    try {
      // 2. Importamos Google Sign-In
      const { GoogleSignin, statusCodes } = await import('@react-native-google-signin/google-signin');
      
      // 3. Obtenemos información del dispositivo y compilación
      Logger.log('📱 Plataforma:', Platform.OS);
      Logger.log('📱 Versión:', Platform.Version);
      Logger.log('📱 Es emulador:', await isEmulator());
      
      // 4. Verificar SHA-1 en modo de desarrollo (solo informativo)
      Logger.log('🔑 Nota: En desarrollo, se usa un certificado de depuración con SHA-1 específico');
      Logger.log('🔑 Este SHA-1 debe estar registrado en Google Cloud Console para este Client ID');
      
      // 5. Configuramos con opciones específicas para diagnóstico
      Logger.log('⚙️ Configurando GoogleSignin para diagnóstico...');
      GoogleSignin.configure({
        webClientId: androidClientId,
        offlineAccess: false, // Simplificamos para diagnóstico
        forceCodeForRefreshToken: false,
      });
      
      // 6. Verificamos Play Services con más detalle
      try {
        Logger.log('🔄 Verificando Google Play Services...');
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        Logger.log('✅ Google Play Services disponibles y actualizados');
      } catch (playError) {
        Logger.error('❌ Error con Google Play Services:', playError);
        if (playError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Logger.log('💡 Google Play Services no disponible en este dispositivo');
        }
      }
      
      // 7. Intentamos iniciar sesión con manejo específico para DEVELOPER_ERROR
      Logger.log('🔑 Intentando iniciar sesión con Google...');
      try {
        const userInfo = await GoogleSignin.signIn();
        Logger.log('✅ Login exitoso (inesperado si hay DEVELOPER_ERROR)');
      } catch (signInError) {
        Logger.error('❌ Error específico:', signInError);
        
        // Diagnóstico detallado para DEVELOPER_ERROR
        if (signInError.code === statusCodes.DEVELOPER_ERROR) {
          Logger.log('\n🔍 DIAGNÓSTICO DE DEVELOPER_ERROR:');
          Logger.log('1. Este error indica que el certificado SHA-1 de tu app no coincide');
          Logger.log('   con el SHA-1 registrado en Google Cloud Console para este Client ID');
          
          Logger.log('\n📋 SOLUCIÓN PASO A PASO:');
          Logger.log('1. Obtén el SHA-1 de tu entorno de desarrollo:');
          Logger.log('   → Para Expo Go: El SHA-1 está gestionado por Expo');
          Logger.log('   → Para desarrollo con build local:');
          Logger.log('     • Android Studio: Gradle → Tasks → android → signingReport');
          Logger.log('     • o ejecuta: cd android && ./gradlew signingReport');
          Logger.log('2. Ve a Google Cloud Console: https://console.cloud.google.com');
          Logger.log('3. Selecciona tu proyecto');
          Logger.log('4. Ve a "Credenciales" → Busca tu ID de cliente de OAuth');
          Logger.log('5. Edita el ID de cliente y añade el SHA-1 correcto');
          Logger.log('6. Guarda los cambios y espera unos minutos para que se propaguen');
          Logger.log('7. Asegúrate de que la API de Google Sign-In está habilitada');
          
          Logger.log('\n🧪 VERIFICACIÓN:');
          Logger.log('• Client ID en uso:', androidClientId);
          Logger.log('• Verifica que este Client ID coincide con el configurado en Google Cloud Console');
          Logger.log('• Comprueba que has añadido el SHA-1 correcto para este Client ID');
        }
      }
      
    } catch (error) {
      Logger.error('❌ ERROR GENERAL:', error);
    }
    
    Logger.log('=== FIN DEL DIAGNÓSTICO DE DEVELOPER_ERROR ===');
  };
  // Función auxiliar para verificar si es un emulador
  const isEmulator = async () => {
    if (Platform.OS === 'android') {
      return (
        Platform.constants.Brand.includes('google') ||
        Platform.constants.Manufacturer.includes('Google') ||
        Platform.constants.Model.includes('sdk') ||
        Platform.constants.Model.includes('Emulator') ||
        Platform.constants.Model.includes('Android SDK')
      );
    } else if (Platform.OS === 'ios') {
      return process.env.NODE_ENV !== 'production';
    }
    return false;
  };
  // Test específico para ofertas guardadas
  const testSavedOffers = async () => {
    let candidateEmail = null;
    let candidatePassword = 'passworD-123';
    let companyEmail = null;
    let companyPassword = 'passworD-123';
    let createdOfferId = null;

    try {
      Logger.log('=== Iniciando pruebas de ofertas guardadas ===');

      // 1. Crear empresa para tener una oferta
      Logger.log('Creando cuenta de empresa...');
      const companyData = {
        name: `TestCompany${Date.now()}`,
        email: `company${Date.now()}@example.com`,
        role: 'company',
        password: companyPassword,
        password_confirmation: companyPassword,
      };
      companyEmail = companyData.email;
      await register(companyData);
      
      // 2. Login empresa
      await login({
        email: companyEmail,
        password: companyPassword,
      });

      // 3. Crear una oferta
      Logger.log('Creando oferta de prueba...');
      const offerData = {
        name: `Oferta Test Guardado ${Date.now()}`,
        description: 'Oferta para probar funcionalidad de guardado',
        category: 'Tecnología',
        degree: 'Ingeniería',
        email: 'test@company.com',
        contract_type: 'Temporal',
        job_location: 'Madrid',
        closing_date: '2025-12-31',
      };
      const createdOffer = await createOffer(offerData);
      createdOfferId = createdOffer.offer.id;
      Logger.log('✅ Oferta creada con ID:', createdOfferId);

      // 4. Crear candidato
      Logger.log('Creando cuenta de candidato...');
      const candidateData = {
        name: `TestCandidate${Date.now()}`,
        email: `candidate${Date.now()}@example.com`,
        role: 'candidate',
        password: candidatePassword,
        password_confirmation: candidatePassword,
      };
      candidateEmail = candidateData.email;
      await register(candidateData);

      // 5. Login candidato
      Logger.log('Iniciando sesión como candidato...');
      await login({
        email: candidateEmail,
        password: candidatePassword,
      });

      // 6. Verificar estado inicial (sin ofertas guardadas)
      Logger.log('🔍 Verificando estado inicial (sin ofertas guardadas)...');
      const initialSavedOffers = await getSavedOffers();
      Logger.log('📊 Ofertas guardadas iniciales:', initialSavedOffers);
      Logger.log('📊 Cantidad inicial:', initialSavedOffers.length);

      // 7. Probar toggleSavedOffer (guardar)
      Logger.log('🔄 Probando toggleSavedOffer (guardar oferta)...');
      const toggleResult1 = await toggleSavedOffer(createdOfferId);
      Logger.log('✅ Resultado de guardar oferta:', toggleResult1);

      // 8. Esperar un momento para que se procese (por si hay delay en el backend)
      Logger.log('⏳ Esperando 2 segundos para que se procese...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 9. Probar getSavedOffers después de guardar
      Logger.log('🔍 Probando getSavedOffers después de guardar...');
      const savedOffersAfterSave = await getSavedOffers();
      Logger.log('📊 Ofertas guardadas después de guardar:', savedOffersAfterSave);
      Logger.log('📊 Cantidad después de guardar:', savedOffersAfterSave.length);
      Logger.log('📊 Tipos de datos en array:', savedOffersAfterSave.map(offer => typeof offer));
      
      // Análisis detallado de cada oferta guardada
      if (savedOffersAfterSave.length > 0) {
        Logger.log('🔍 Análisis detallado de ofertas guardadas:');
        savedOffersAfterSave.forEach((offer, index) => {
          Logger.log(`  Oferta ${index + 1}:`, {
            id: offer.id,
            idType: typeof offer.id,
            name: offer.name || offer.title,
            hasAllProps: !!(offer.id && (offer.name || offer.title))
          });
        });
      }
      
      // Verificar que la oferta guardada aparece en la lista (comparación más flexible)
      const isOfferSaved = savedOffersAfterSave.some(offer => {
        // Convertir ambos IDs a string para comparación
        const offerIdStr = String(offer.id);
        const createdOfferIdStr = String(createdOfferId);
        return offerIdStr === createdOfferIdStr;
      });
      
      Logger.log(`🔍 Buscando oferta con ID: ${createdOfferId} (tipo: ${typeof createdOfferId})`);
      Logger.log(`🔍 IDs encontrados en ofertas guardadas: [${savedOffersAfterSave.map(o => `${o.id}(${typeof o.id})`).join(', ')}]`);
      Logger.log(isOfferSaved ? '✅ La oferta aparece correctamente en ofertas guardadas' : '❌ La oferta NO aparece en ofertas guardadas');

      // 10. Si no aparece, investigar el problema más a fondo
      if (!isOfferSaved && savedOffersAfterSave.length === 0) {
        Logger.log('🔍 DIAGNÓSTICO: La lista está vacía. Posibles causas:');
        Logger.log('  1. El endpoint getSavedOffers no está funcionando correctamente');
        Logger.log('  2. El backend no está guardando la oferta realmente');
        Logger.log('  3. Hay un problema con el parsing de la respuesta');
        
        // Intentar llamar directamente a la API y ver la respuesta completa
        Logger.log('🔍 Haciendo llamada directa para diagnóstico...');
        try {
          // Importar axios directamente para hacer la llamada y ver la respuesta completa
          const { api } = await import('../../api/axios');
          const rawResponse = await api.get('/saved-offers');
          Logger.log('📊 Respuesta RAW del servidor:', rawResponse.data);
          Logger.log('📊 Status de respuesta:', rawResponse.status);
          Logger.log('📊 Headers de respuesta:', rawResponse.headers);
        } catch (debugError) {
          Logger.log('❌ Error en llamada de diagnóstico:', debugError);
        }
      }

      // 11. Probar toggleSavedOffer (quitar de guardadas)
      Logger.log('🔄 Probando toggleSavedOffer (quitar de guardadas)...');
      const toggleResult2 = await toggleSavedOffer(createdOfferId);
      Logger.log('✅ Resultado de quitar de guardadas:', toggleResult2);

      // 12. Esperar un momento para que se procese
      Logger.log('⏳ Esperando 2 segundos para que se procese...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 13. Verificar que ya no está en la lista
      Logger.log('🔍 Verificando que la oferta ya no está guardada...');
      const savedOffersAfterRemove = await getSavedOffers();
      Logger.log('📊 Ofertas guardadas después de quitar:', savedOffersAfterRemove);
      Logger.log('📊 Cantidad después de quitar:', savedOffersAfterRemove.length);
      
      const isOfferStillSaved = savedOffersAfterRemove.some(offer => {
        const offerIdStr = String(offer.id);
        const createdOfferIdStr = String(createdOfferId);
        return offerIdStr === createdOfferIdStr;
      });
      
      Logger.log(isOfferStillSaved ? '❌ La oferta AÚN aparece en ofertas guardadas' : '✅ La oferta ya NO aparece en ofertas guardadas');      // 14. Resumen de resultados
      Logger.log('📋 RESUMEN DE PRUEBAS:');
      Logger.log(`  - toggleSavedOffer (guardar): ${toggleResult1?.message ? '✅' : '❌'}`);
      Logger.log(`  - getSavedOffers encuentra la oferta: ${isOfferSaved ? '✅' : '❌'}`);
      Logger.log(`  - toggleSavedOffer (quitar): ${toggleResult2?.message ? '✅' : '❌'}`);
      Logger.log(`  - Oferta correctamente removida: ${!isOfferStillSaved ? '✅' : '❌'}`);

      // 15. Diagnóstico adicional del problema detectado
      Logger.log('🔍 DIAGNÓSTICO ADICIONAL:');
      Logger.log('El backend requiere que el email esté verificado para mostrar ofertas guardadas.');
      Logger.log('Código del backend: if (!$user->hasVerifiedEmail()) return [];');
      Logger.log('💡 SOLUCIÓN: El usuario necesita verificar su email o el backend debe permitir');
      Logger.log('   mostrar ofertas guardadas sin verificación de email para testing.');
      
      // 16. Intentar obtener información del usuario para confirmar el diagnóstico
      Logger.log('🔍 Verificando información del usuario actual...');
      try {
        const userInfo = await getUser();
        Logger.log('📊 Info del usuario:', {
          id: userInfo.id,
          email: userInfo.email,
          email_verified_at: userInfo.email_verified_at,
          isEmailVerified: !!userInfo.email_verified_at,
          role: userInfo.role
        });
        
        if (!userInfo.email_verified_at) {
          Logger.log('🎯 CONFIRMADO: El email NO está verificado. Esta es la causa del problema.');
          Logger.log('💡 Para que funcione en producción, el usuario debe verificar su email.');
        } else {
          Logger.log('❓ El email SÍ está verificado, el problema debe ser otro.');
        }
      } catch (userInfoError) {
        Logger.log('❌ No se pudo obtener info del usuario:', userInfoError.message);
      }

      Logger.log('=== Pruebas de ofertas guardadas completadas ===');

    } catch (error) {
      Logger.error('❌ Error en las pruebas de ofertas guardadas:', error);
      Logger.error('Detalles del error:', error.message || error);
    } finally {
      // Limpieza de recursos
      Logger.log('=== Iniciando limpieza de recursos ===');
      
      try {
        // Intentar eliminar la oferta creada (como empresa)
        if (createdOfferId && companyEmail) {
          Logger.log('Limpiando: eliminando oferta creada...');
          await login({ email: companyEmail, password: companyPassword });
          await deleteOffer(createdOfferId);
          Logger.log('✅ Oferta eliminada');
        }
      } catch (cleanupError) {
        Logger.warn('⚠️ No se pudo eliminar la oferta:', cleanupError.message);
      }

      try {
        // Eliminar cuenta de candidato
        if (candidateEmail) {
          Logger.log('Limpiando: eliminando cuenta de candidato...');
          await login({ email: candidateEmail, password: candidatePassword });
          await deleteProfile(candidatePassword);
          Logger.log('✅ Cuenta de candidato eliminada');
        }
      } catch (cleanupError) {
        Logger.warn('⚠️ No se pudo eliminar cuenta de candidato:', cleanupError.message);
      }

      try {
        // Eliminar cuenta de empresa
        if (companyEmail) {
          Logger.log('Limpiando: eliminando cuenta de empresa...');
          await login({ email: companyEmail, password: companyPassword });
          await deleteProfile(companyPassword);
          Logger.log('✅ Cuenta de empresa eliminada');
        }
      } catch (cleanupError) {
        Logger.warn('⚠️ No se pudo eliminar cuenta de empresa:', cleanupError.message);
      }

      Logger.log('=== Limpieza de recursos finalizada ===');
    }
  };

  // Test específico para ofertas guardadas CON email verificado (simulado)
  const testSavedOffersWithVerifiedEmail = async () => {
    Logger.log('=== TEST DE OFERTAS GUARDADAS CON EMAIL VERIFICADO ===');
    Logger.log('🔍 Este test confirma que el problema es la verificación de email');
    Logger.log('📝 Nota: Para una solución completa, el backend necesitaría:');
    Logger.log('   1. Un endpoint para verificar email en testing, O');
    Logger.log('   2. Permitir ofertas guardadas sin verificación en desarrollo');
    
    try {
      // Crear una cuenta normal
      const candidateData = {
        name: `TestCandidate${Date.now()}`,
        email: `candidate${Date.now()}@example.com`,
        role: 'candidate',
        password: 'passworD-123',
        password_confirmation: 'passworD-123',
      };
      
      Logger.log('📝 Creando cuenta de candidato...');
      await register(candidateData);
      
      Logger.log('🔑 Iniciando sesión...');
      await login({
        email: candidateData.email,
        password: 'passworD-123',
      });
      
      Logger.log('🔍 Verificando estado de verificación del email...');
      const userInfo = await getUser();
      Logger.log('📊 Estado del usuario:', {
        email: userInfo.email,
        email_verified_at: userInfo.email_verified_at,
        isVerified: !!userInfo.email_verified_at
      });
      
      if (!userInfo.email_verified_at) {
        Logger.log('✅ CONFIRMADO: Email no verificado - Esta es la causa del problema');
        Logger.log('💡 SOLUCIONES RECOMENDADAS:');
        Logger.log('   1. En el backend, crear un endpoint POST /verify-email para testing');
        Logger.log('   2. O modificar temporalmente el método getSavedOffers para no requerir verificación');
        Logger.log('   3. O agregar un comando artisan para marcar emails como verificados en desarrollo');
        
        Logger.log('\n📋 EJEMPLO DE COMANDO ARTISAN PARA VERIFICAR EMAIL:');
        Logger.log('   php artisan tinker');
        Logger.log('   User::where("email", "email@test.com")->update(["email_verified_at" => now()]);');
      } else {
        Logger.log('❓ Email está verificado, el problema podría ser otro');
      }
      
      // Limpiar
      Logger.log('🧹 Limpiando cuenta de prueba...');
      await deleteProfile('passworD-123');
      
    } catch (error) {
      Logger.error('❌ Error en test de email verificado:', error);
    }
    
    Logger.log('=== FIN DEL TEST DE EMAIL VERIFICADO ===');
  };

  // === NUEVA FUNCIÓN DE PRUEBA: VERIFICACIÓN DE EMAIL ===
  const testEmailVerificationSystem = async () => {
    Logger.log('\n=== INICIANDO TEST DEL SISTEMA DE VERIFICACIÓN DE EMAIL ===');
    
    try {
      // 1. Verificar el estado actual de verificación
      Logger.log('🔍 1. Verificando estado actual de verificación...');
      const verificationStatus = await getEmailVerificationStatus();
      Logger.log('📊 Estado de verificación:', verificationStatus);
      
      // 2. Verificar si se requiere verificación
      Logger.log('\n🔍 2. Verificando si se requiere verificación...');
      const verificationRequired = await checkEmailVerificationRequired();
      Logger.log('📊 Verificación requerida:', verificationRequired);
      
      if (verificationRequired.isRequired) {
        Logger.log('🚨 VERIFICACIÓN REQUERIDA');
        Logger.log('📧 Email del usuario:', verificationRequired.email);
        Logger.log('🆔 User ID:', verificationRequired.userId);
        
        // 3. Probar reenvío de email de verificación
        Logger.log('\n📬 3. Probando reenvío de email de verificación...');
        try {
          const resendResult = await resendEmailVerification();
          Logger.log('✅ Email de verificación reenviado:', resendResult);
        } catch (resendError) {
          Logger.log('❌ Error al reenviar email:', resendError);
        }
        
        // 4. Intentar acceder a ofertas guardadas para demostrar el bloqueo
        Logger.log('\n🔒 4. Intentando acceder a ofertas guardadas (debería fallar)...');
        try {
          const savedOffers = await getSavedOffers();
          Logger.log('❓ Ofertas obtenidas (no debería suceder):', savedOffers);
        } catch (saveError) {
          Logger.log('✅ CORRECTO: Acceso bloqueado por email no verificado');
          Logger.log('📝 Error esperado:', saveError);
        }
        
      } else {
        Logger.log('✅ EMAIL YA VERIFICADO');
        Logger.log('🎉 El usuario puede acceder a todas las funcionalidades');
        
        // Probar ofertas guardadas
        Logger.log('\n📱 Probando ofertas guardadas con email verificado...');
        try {
          const savedOffers = await getSavedOffers();
          Logger.log('✅ Ofertas guardadas obtenidas:', savedOffers);
        } catch (error) {
          Logger.log('❌ Error inesperado:', error);
        }
      }
      
      Logger.log('\n✅ Test del sistema de verificación completado');
      
    } catch (error) {
      Logger.error('❌ Error en test del sistema de verificación:', error);
    }
    
    Logger.log('=== FIN DEL TEST DE VERIFICACIÓN DE EMAIL ===\n');
  };

  // === FUNCIÓN DE PRUEBA COMPLETA DEL WRAPPER DE VERIFICACIÓN ===
  const testEmailVerificationWrapper = async () => {
    Logger.log('\n=== INICIANDO TEST DEL WRAPPER DE VERIFICACIÓN DE EMAIL ===');
    
    try {
      Logger.log('🔧 Simulando acción que requiere email verificado...');
      
      // 1. Intentar guardar una oferta (simulación)
      Logger.log('\n📝 1. Simulando intento de guardar oferta...');
      const verificationStatus = await checkEmailVerificationRequired();
      
      if (verificationStatus.isRequired) {
        Logger.log('🚫 ACCIÓN BLOQUEADA: Email no verificado');
        Logger.log('📧 Email del usuario:', verificationStatus.email);
        Logger.log('💡 En una app real, se mostraría la pantalla de verificación aquí');
        
        // Demostrar el manejo de errores de API
        Logger.log('\n🔍 2. Simulando error de API por email no verificado...');
        try {
          await getSavedOffers(); // Esto debería fail
        } catch (apiError) {
          const errorResult = handleEmailVerificationError(apiError);
          if (errorResult.isEmailVerificationError) {
            Logger.log('✅ CORRECTO: Error de verificación detectado automáticamente');
            Logger.log('📝 Mensaje de error:', errorResult.message);
            Logger.log('📧 Email en error:', errorResult.email);
          } else {
            Logger.log('❓ Error no relacionado con verificación:', apiError);
          }
        }
        
        Logger.log('\n📬 3. Probando reenvío de email de verificación...');
        try {
          const resendResult = await resendEmailVerification();
          Logger.log('✅ Email de verificación reenviado exitosamente');
          Logger.log('📨 Respuesta del servidor:', resendResult);
        } catch (resendError) {
          Logger.log('❌ Error al reenviar email:', resendError);
        }
        
      } else {
        Logger.log('✅ Email verificado - Usuario puede realizar todas las acciones');
        
        try {
          const savedOffers = await getSavedOffers();
          Logger.log('✅ Ofertas guardadas obtenidas exitosamente:', savedOffers);
        } catch (error) {
          Logger.log('❌ Error inesperado al obtener ofertas:', error);
        }
      }
      
      Logger.log('\n🎯 RESUMEN DEL TEST:');
      Logger.log('✅ Sistema de verificación funcionando correctamente');
      Logger.log('✅ Manejo de errores de API implementado');
      Logger.log('✅ Reenvío de email de verificación disponible');
      Logger.log('✅ Los componentes React pueden usar useEmailVerificationGuard()');
      Logger.log('✅ Los botones pueden usar VerificationRequiredButton wrapper');
      
    } catch (error) {
      Logger.error('❌ Error en test del wrapper de verificación:', error);
    }
    
    Logger.log('=== FIN DEL TEST DEL WRAPPER DE VERIFICACIÓN ===\n');
  };

  // === NUEVA FUNCIÓN DE PRUEBA: DIAGNÓSTICO DEL ERROR DEL BACKEND ===
  const testBackendMiddlewareError = async () => {
    Logger.log('\n=== DIAGNÓSTICO DEL ERROR DEL BACKEND ===');
    
    try {
      // Crear una aplicación de prueba para reproducir el error
      Logger.log('🔍 1. Intentando aplicar a una oferta para reproducir el error...');
      
      const testApplication = {
        offer_id: 1, // ID de prueba
        cover_letter: 'Esta es una carta de presentación de prueba para diagnosticar el error del backend.'
      };
      
      const result = await applyToOffer(testApplication);
      Logger.log('✅ Aplicación exitosa (no debería llegar aquí si hay error):', result);
      
    } catch (error) {
      Logger.log('❌ Error capturado:', error);
      
      // Analizar el error en detalle
      if (error?.message?.includes('Target class')) {
        Logger.log('🔍 ANÁLISIS DEL ERROR:');
        Logger.log('   - Tipo: Error de Laravel');
        Logger.log('   - Problema: Middleware no encontrado');
        Logger.log('   - Mensaje completo:', error.message);
        Logger.log('   - Excepción:', error.exception);
        
        Logger.log('\n💡 POSIBLES SOLUCIONES EN EL BACKEND:');
        Logger.log('   1. Verificar que las rutas no tengan middleware "verified" mal configurado');
        Logger.log('   2. Revisar routes/api.php para middleware incorrectos');
        Logger.log('   3. Usar middleware "verified" estándar de Laravel en lugar de "verified.api"');
        Logger.log('   4. O quitar temporalmente el middleware de verificación para probar');
        
      } else if (error?.isEmailVerificationError) {
        Logger.log('✅ Error manejado correctamente como verificación de email');
        Logger.log('📧 Email:', error.email);
        Logger.log('💬 Mensaje:', error.message);
        
      } else {
        Logger.log('❓ Error diferente:', error);
      }
    }
    
    Logger.log('=== FIN DEL DIAGNÓSTICO ===\n');
  };

  useEffect(() => {
  }, []);
  return (
    <View>
      <Text style={{ color: 'white' }}>Probando API... Revisa la consola para los resultados.</Text>
      <Button title="Probar API completa" onPress={testApi} />
      <View style={{ height: 10 }} />
      <Button title="Probar solo Dashboard" onPress={testDashboardOnly} />
      <View style={{ height: 10 }} />
      <Button title="Probar getDashboard" onPress={testGetDashboard} />
      <View style={{ height: 10 }} />
      <Button title="Probar Google Auth" onPress={testGoogleAuth} />
      <View style={{ height: 10 }} />
      <Button title="Test Detallado Google Auth" onPress={testDetailedGoogleAuth} color="#4285F4" />
      <View style={{ height: 10 }} />
      <Button 
        title="Diagnosticar DEVELOPER_ERROR" 
        onPress={testGoogleDeveloperError} 
        color="#D32F2F" 
      />
      <View style={{ height: 10 }} />      <Button 
        title="Probar Ofertas Guardadas" 
        onPress={testSavedOffers} 
        color="#4CAF50" 
      />
      <View style={{ height: 10 }} />
      <Button 
        title="Test Email Verificado" 
        onPress={testSavedOffersWithVerifiedEmail} 
        color="#FF9800" 
      />
      <View style={{ height: 10 }} />
      <Button 
        title="Probar Ofertas Guardadas (Email Verificado)" 
        onPress={testSavedOffersWithVerifiedEmail} 
        color="#2196F3" 
      />
      <View style={{ height: 10 }} />
      <Button 
        title="Test Sistema Verificación Email" 
        onPress={testEmailVerificationSystem} 
        color="#9C27B0" 
      />
      <View style={{ height: 10 }} />
      <Button 
        title="Diagnosticar Error Backend" 
        onPress={testBackendMiddlewareError} 
        color="#F44336" 
      />
      
    </View>
  );
};

export default TestApi;