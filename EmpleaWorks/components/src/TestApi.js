import React, { useEffect } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import {
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
      console.log('=== Iniciando pruebas de API ===');

      // 1. Registro de empresa
      console.log('Probando register (empresa)...');
      const companyData = {
        name: `Company${Date.now()}`,
        email: `company${Date.now()}@example.com`,
        role: 'company',
        password: companyPassword,
        password_confirmation: companyPassword,
      };
      companyEmail = companyData.email;
      const companyRegister = await register(companyData);
      console.log('Registro empresa exitoso:', companyRegister);

      // 2. Login empresa
      console.log('Probando login (empresa)...');
      const companyLogin = await login({
        email: companyEmail,
        password: companyPassword,
      });
      console.log('Login empresa exitoso:', companyLogin);

      // 3. Crear oferta como empresa
      console.log('Probando createOffer...');
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
      console.log('Oferta creada:', createdOffer);

      // 4. Listar todas las ofertas
      console.log('Probando getOffers...');
      const offers = await getOffers();
      console.log('Ofertas obtenidas:', offers);

      // 5. Obtener una oferta específica
      console.log('Probando getOffer...');
      const offer = await getOffer(createdOfferId);
      console.log('Oferta obtenida:', offer);

      // 6. Registro de candidato
      console.log('Probando register (candidato)...');
      const candidateData = {
        name: `Candidate${Date.now()}`,
        email: `candidate${Date.now()}@example.com`,
        role: 'candidate',
        password: candidatePassword,
        password_confirmation: candidatePassword,
      };
      candidateEmail = candidateData.email;
      const candidateRegister = await register(candidateData);
      console.log('Registro candidato exitoso:', candidateRegister);

      // 7. Login candidato
      console.log('Probando login (candidato)...');
      const candidateLogin = await login({
        email: candidateEmail,
        password: candidatePassword,
      });
      console.log('Login candidato exitoso:', candidateLogin);

      // 8. Subir CV para el candidato
      console.log('Probando updateProfile (subir CV)...');
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
        console.log('Perfil actualizado con CV:', updatedProfile);
        cvUploaded = true;
      } else {
        console.warn('No se subió CV porque la URI no es válida. Usa un picker real en dispositivo.');
      }

      // 9. Aplicar a oferta como candidato (solo si se subió CV)
      if (cvUploaded) {
        console.log('Probando applyToOffer...');
        const applicationData = {
          phone: '+123456789',
          email: candidateEmail,
          cl: 'Carta de presentación de prueba',
          offer_id: createdOfferId,
        };
        const applyResponse = await applyToOffer(applicationData);
        createdApplyId = applyResponse.id; // Guardamos el ID de la aplicación si la API lo devuelve
        console.log('Aplicación enviada:', applyResponse);
      } else {
        console.warn('No se probó applyToOffer porque no se subió un CV real.');
      }

      // 10. Obtener dashboard del candidato
      console.log('Probando getCandidateDashboard...');
      const dashboardResponse = await getCandidateDashboard();
      console.log('Dashboard obtenido:', dashboardResponse);

      // 11. Obtener detalles de una oferta específica
      console.log('Probando getOfferDetails...');
      const offerDetails = await getOfferDetails(createdOfferId);
      console.log('Detalles de la oferta obtenidos:', offerDetails);

      // 12. Actualizar oferta como empresa
      console.log('Probando updateOffer...');
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
      console.log('Oferta actualizada:', updatedOffer);

      console.log('=== Pruebas de API completadas exitosamente ===');
    } catch (error) {
      console.error('Error en las pruebas:', error);
    } finally {
      console.log('=== Iniciando limpieza de recursos creados ===');
      
      try {
        // 1. Eliminar ofertas como empresa
        if (createdOfferId) {
          console.log('Asegurando login como empresa para eliminar ofertas...');
          await login({ email: companyEmail, password: companyPassword });
          
          console.log(`Eliminando oferta ID: ${createdOfferId}...`);
          const deleteOfferResponse = await deleteOffer(createdOfferId);
          console.log('Oferta eliminada:', deleteOfferResponse);
        }
        
        // 2. Eliminar cuenta de candidato
        if (candidateEmail) {
          console.log('Eliminando cuenta de candidato...');
          await login({ email: candidateEmail, password: candidatePassword });
          const deleteCandidateResponse = await deleteProfile(candidatePassword);
          console.log('Cuenta de candidato eliminada:', deleteCandidateResponse);
        }
        
        // 3. Eliminar cuenta de empresa
        if (companyEmail) {
          console.log('Eliminando cuenta de empresa...');
          await login({ email: companyEmail, password: companyPassword });
          const deleteCompanyResponse = await deleteProfile(companyPassword);
          console.log('Cuenta de empresa eliminada:', deleteCompanyResponse);
        }
        
        // 4. Cerrar sesión
        console.log('Cerrando sesión...');
        await logout();
        console.log('Sesión cerrada');
      } catch (cleanupError) {
        console.error('Error durante la limpieza de recursos:', cleanupError);
      }
      
      console.log('=== Proceso de limpieza finalizado ===');
    }
  };

  // Nuevo test: solo candidateDashboard, creando y borrando cuenta
  const testDashboardOnly = async () => {
    try {
      console.log('=== Prueba solo dashboard (crear, consultar, borrar) ===');
      // 1. Crear cuenta candidato
      const candidateData = {
        name: `Candidate${Date.now()}`,
        email: `candidate${Date.now()}@example.com`,
        role: 'candidate',
        password: 'passworD-123',
        password_confirmation: 'passworD-123',
      };
      const candidateRegister = await register(candidateData);
      console.log('Registro candidato exitoso:', candidateRegister);

      // 2. Login candidato
      const candidateLogin = await login({
        email: candidateData.email,
        password: 'passworD-123',
      });
      console.log('Login candidato exitoso:', candidateLogin);

      // 3. Obtener dashboard
      const dashboardResponse = await getCandidateDashboard();
      console.log('Dashboard obtenido (solo test):', dashboardResponse); //es normal que esté vacio ya que es un nuevo user//

      // 4. Borrar cuenta candidato (enviando password como string)
      const deleteResponse = await deleteProfile('passworD-123');
      console.log('Cuenta de candidato eliminada:', deleteResponse);

      console.log('=== Fin prueba solo dashboard ===');
    } catch (error) {
      console.error('Error en testDashboardOnly:', error);
    }
  };

  // Test solo para getDashboard
  const testGetDashboard = async () => {
    try {
      console.log('=== Probando getDashboard ===');
      const dashboard = await getDashboard();
      console.log('Dashboard obtenido:', dashboard);
      console.log('=== Fin prueba getDashboard ===');
    } catch (error) {
      console.error('Error en testGetDashboard:', error);
    }
  };

  // Nuevo test específico para Google Auth
  const testGoogleAuth = async () => {
    try {
      console.log('=== Iniciando pruebas de Google Authentication ===');

      // 1. Obtener URL de redirección de Google
      console.log('Probando getGoogleRedirectUrl...');
      const googleUrl = await getGoogleRedirectUrl();
      console.log('URL de Google obtenida:', googleUrl);

      // Verificar que la URL contiene los parámetros esperados de OAuth
      if (googleUrl && typeof googleUrl === 'string') {
        const hasOAuthParams = googleUrl.includes('client_id') && 
                              googleUrl.includes('redirect_uri') && 
                              googleUrl.includes('scope');
        console.log('URL contiene parámetros OAuth válidos:', hasOAuthParams);
        
        if (hasOAuthParams) {
          console.log('✅ getGoogleRedirectUrl funciona correctamente');
        } else {
          console.warn('⚠️ La URL no contiene todos los parámetros OAuth esperados');
        }
      } else {
        console.error('❌ La respuesta no es una URL válida');
      }

      // 2. Simular callback de Google (normalmente esto se haría con un token real de Google)
      console.log('Simulando handleGoogleCallback...');
      
      // NOTA: En una prueba real, necesitarías un token válido de Google
      // Para propósitos de testing, intentamos con un token simulado
      const mockGoogleToken = `mock_google_token_${Date.now()}`;
      
      try {
        const googleAuthResult = await handleGoogleCallback(mockGoogleToken);
        console.log('✅ Google callback exitoso:', googleAuthResult);
        
        // Si el callback fue exitoso, probamos obtener el perfil del usuario
        console.log('Probando getUser después de Google auth...');
        const userProfile = await getUser();
        console.log('Perfil de usuario obtenido:', userProfile);
        
        // Probamos obtener el perfil completo
        console.log('Probando getProfile después de Google auth...');
        const fullProfile = await getProfile();
        console.log('Perfil completo obtenido:', fullProfile);
        
        // Limpiar: eliminar la cuenta creada via Google
        console.log('Limpiando cuenta creada via Google...');
        // Nota: Para Google auth, el password podría ser null o generado automáticamente
        // Puede que necesites ajustar esto según tu implementación backend
        try {
          await deleteProfile('default_password_for_google_users');
          console.log('✅ Cuenta de Google eliminada exitosamente');
        } catch (deleteError) {
          console.warn('⚠️ No se pudo eliminar la cuenta de Google (esto puede ser normal):', deleteError.message);
        }
        
      } catch (callbackError) {
        console.log('❌ Google callback falló (esperado con token simulado):', callbackError.message);
        console.log('💡 Esto es normal en testing - se necesita un token real de Google para completar el flujo');
        
        // Verificar si el error es el esperado (token inválido)
        if (callbackError.message && 
            (callbackError.message.includes('token') || 
             callbackError.message.includes('invalid') ||
             callbackError.message.includes('unauthorized'))) {
          console.log('✅ El endpoint de callback está funcionando (rechaza tokens inválidos correctamente)');
        }
      }

      // 3. Verificar que las funciones de Google auth están disponibles
      console.log('Verificando disponibilidad de funciones Google auth...');
      console.log('getGoogleRedirectUrl disponible:', typeof getGoogleRedirectUrl === 'function');
      console.log('handleGoogleCallback disponible:', typeof handleGoogleCallback === 'function');

      console.log('=== Pruebas de Google Authentication completadas ===');
      console.log('📋 Resumen:');
      console.log('- getGoogleRedirectUrl: Funcional');
      console.log('- handleGoogleCallback: Requiere token real para prueba completa');
      console.log('- Para prueba completa: usar dispositivo real con Google OAuth configurado');

    } catch (error) {
      console.error('❌ Error en las pruebas de Google Auth:', error);
      console.log('💡 Posibles causas:');
      console.log('- Servidor backend no está corriendo');
      console.log('- Google OAuth no está configurado en el backend');
      console.log('- Problemas de conectividad de red');
    } finally {
      // Asegurar logout al final
      try {
        await logout();
        console.log('🚪 Sesión cerrada al finalizar pruebas');
      } catch (logoutError) {
        console.log('Logout error (normal si no había sesión):', logoutError.message);
      }
    }
  };

  // Test específico y detallado para Google Auth con información de depuración
  const testDetailedGoogleAuth = async () => {
    console.log('=== INICIANDO TEST DETALLADO DE GOOGLE AUTH ===');
    
    // 1. Verificar la configuración disponible
    const androidClientId = Constants.expoConfig?.extra?.googleAndroidClientId;
    console.log('📱 Android Client ID configurado:', androidClientId);
    
    try {
      // 2. Si estamos en un dispositivo móvil, intentamos usar Google Sign-In nativo
      if (Platform.OS !== 'web') {
        console.log('🔍 Plataforma detectada:', Platform.OS);
        
        try {
          // Importamos la librería Google Sign-In de manera más segura
          console.log('⏳ Importando Google Sign-In...');
          let GoogleSignin, statusCodes;
          
          try {
            const GoogleSignInModule = await import('@react-native-google-signin/google-signin');
            GoogleSignin = GoogleSignInModule.GoogleSignin;
            statusCodes = GoogleSignInModule.statusCodes;
            
            // Verificar que la importación funcionó correctamente
            if (!GoogleSignin || typeof GoogleSignin.configure !== 'function') {
              throw new Error('La importación de GoogleSignin no proporcionó la API esperada');
            }
            
            console.log('✅ Google Sign-In importado correctamente');
          } catch (importError) {
            console.error('❌ Error al importar Google Sign-In:', importError);
            console.log('💡 Asegúrate de que @react-native-google-signin/google-signin está instalado');
            console.log('💡 Ejecuta: npm install @react-native-google-signin/google-signin');
            throw new Error('Fallo al importar la biblioteca de Google Sign-In');
          }
          
          // Configuramos Google Sign-In con más información de depuración
          console.log('⚙️ Configurando Google Sign-In con Android Client ID:', androidClientId);
          GoogleSignin.configure({
            webClientId: androidClientId, // Usamos el mismo ID para web/Android
            offlineAccess: true, // Si necesitamos acceso offline
          });
          console.log('✅ GoogleSignin configurado');
          
          // Verificamos Play Services
          console.log('🔄 Verificando Google Play Services...');
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          console.log('✅ Google Play Services disponibles');
          
          // Verificamos si hay sesión activa de manera segura
          console.log('🔐 Verificando si hay sesión de Google activa...');
          let isSignedIn = false;
          
          try {
            // Comprobamos que el método existe antes de llamarlo
            if (typeof GoogleSignin.isSignedIn === 'function') {
              isSignedIn = await GoogleSignin.isSignedIn();
              console.log('- Sesión activa:', isSignedIn);
            } else {
              console.warn('⚠️ GoogleSignin.isSignedIn no está disponible en esta versión');
              // Alternativa: intentar getCurrentUser para ver si hay sesión
              const currentUser = await GoogleSignin.getCurrentUser();
              isSignedIn = !!currentUser;
              console.log('- Sesión activa (verificada por getCurrentUser):', isSignedIn);
            }
          } catch (sessionCheckError) {
            console.warn('⚠️ Error al verificar sesión:', sessionCheckError);
            console.log('- Asumiendo que no hay sesión activa');
          }
          
          // Si hay sesión, intentamos cerrarla para empezar limpio
          if (isSignedIn) {
            console.log('🔄 Cerrando sesión previa de Google...');
            await GoogleSignin.signOut();
            console.log('✅ Sesión previa cerrada');
          }
          
          // Iniciamos el flujo de login
          console.log('🔑 Iniciando flujo de login con Google...');
          const userInfo = await GoogleSignin.signIn();
          console.log('✅ Login con Google exitoso!');
          console.log('📋 Datos obtenidos:', JSON.stringify({
            idToken: userInfo.idToken ? '✓ Presente' : '✗ Ausente',
            user: userInfo.user ? {
              id: userInfo.user.id,
              name: userInfo.user.name,
              email: userInfo.user.email
            } : 'No disponible'
          }, null, 2));
          
          // Verificamos que tenemos un idToken
          if (!userInfo.idToken) {
            console.error('❌ No se obtuvo idToken de Google, no podemos continuar');
            return;
          }
          
          // Enviamos el token a nuestro backend
          console.log('🔄 Enviando idToken a nuestro backend...');
          const response = await handleGoogleCallback(userInfo.idToken);
          console.log('✅ Respuesta del backend recibida:', JSON.stringify({
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
            console.log('🎉 AUTENTICACIÓN COMPLETA EXITOSA! El usuario debería estar ahora autenticado en la app.');
            
            // Probamos obtener datos del usuario como verificación final
            console.log('🔄 Verificando datos del usuario autenticado...');
            const userData = await getUser();
            console.log('✅ Datos del usuario verificados:', userData.name);
          }
          
        } catch (error) {
          console.error('❌ ERROR EN GOOGLE SIGN-IN:', error);
          
          // Intentar detectar si es un problema de instalación de la biblioteca
          if (error.message && error.message.includes('importar')) {
            console.log('💡 SOLUCIÓN PRINCIPAL: Instala la biblioteca Google Sign-In:');
            console.log('npm install @react-native-google-signin/google-signin');
            console.log('y luego reinicia la aplicación (cerrar completamente y volver a abrir)');
          } 
          // Interpretamos errores específicos de Google Sign-In para mejor diagnóstico
          else if (error.code && typeof statusCodes !== 'undefined') {
            switch (error.code) {
              case statusCodes.SIGN_IN_CANCELLED:
                console.log('💡 El usuario canceló el inicio de sesión');
                break;
              case statusCodes.IN_PROGRESS:
                console.log('💡 Hay una operación de inicio de sesión en progreso');
                break;
              case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                console.log('💡 Google Play Services no está disponible o desactualizado');
                break;
              default:
                console.log('💡 Error con código:', error.code);
            }
          }
          
          // Consejos de solución
          console.log('\n🔧 POSIBLES SOLUCIONES:');
          console.log('1. Verifica que el androidClientId esté configurado correctamente en app.json');
          console.log('2. Asegúrate de que la app esté firmada con el certificado SHA-1 registrado en Google Cloud Console');
          console.log('3. Verifica que @react-native-google-signin/google-signin esté instalado correctamente');
          console.log('   → npm install @react-native-google-signin/google-signin');
          console.log('   → Luego reinicia la app completamente');
          console.log('4. Revisa la configuración en Google Cloud Console (OAuth, APIs habilitadas)');
          console.log('5. Verifica la versión de la biblioteca y su compatibilidad:');
          console.log('   → npx react-native --version');
          console.log('   → npm list @react-native-google-signin/google-signin');
        }
      } else {
        console.log('❌ Este test está diseñado para ejecutarse en dispositivos móviles, no en web');
      }
    } catch (error) {
      console.error('❌ ERROR GENERAL:', error);
    } finally {
      console.log('=== TEST DETALLADO DE GOOGLE AUTH FINALIZADO ===');
    }
  };

  // Test específico para diagnosticar error DEVELOPER_ERROR de Google Sign-In
  const testGoogleDeveloperError = async () => {
    console.log('=== DIAGNÓSTICO DE ERROR DEVELOPER_ERROR EN GOOGLE SIGN-IN ===');
    
    // 1. Verificar la configuración
    const androidClientId = Constants.expoConfig?.extra?.googleAndroidClientId;
    console.log('📱 Android Client ID configurado:', androidClientId);
    
    try {
      // 2. Importamos Google Sign-In
      const { GoogleSignin, statusCodes } = await import('@react-native-google-signin/google-signin');
      
      // 3. Obtenemos información del dispositivo y compilación
      console.log('📱 Plataforma:', Platform.OS);
      console.log('📱 Versión:', Platform.Version);
      console.log('📱 Es emulador:', await isEmulator());
      
      // 4. Verificar SHA-1 en modo de desarrollo (solo informativo)
      console.log('🔑 Nota: En desarrollo, se usa un certificado de depuración con SHA-1 específico');
      console.log('🔑 Este SHA-1 debe estar registrado en Google Cloud Console para este Client ID');
      
      // 5. Configuramos con opciones específicas para diagnóstico
      console.log('⚙️ Configurando GoogleSignin para diagnóstico...');
      GoogleSignin.configure({
        webClientId: androidClientId,
        offlineAccess: false, // Simplificamos para diagnóstico
        forceCodeForRefreshToken: false,
      });
      
      // 6. Verificamos Play Services con más detalle
      try {
        console.log('🔄 Verificando Google Play Services...');
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        console.log('✅ Google Play Services disponibles y actualizados');
      } catch (playError) {
        console.error('❌ Error con Google Play Services:', playError);
        if (playError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log('💡 Google Play Services no disponible en este dispositivo');
        }
      }
      
      // 7. Intentamos iniciar sesión con manejo específico para DEVELOPER_ERROR
      console.log('🔑 Intentando iniciar sesión con Google...');
      try {
        const userInfo = await GoogleSignin.signIn();
        console.log('✅ Login exitoso (inesperado si hay DEVELOPER_ERROR)');
      } catch (signInError) {
        console.error('❌ Error específico:', signInError);
        
        // Diagnóstico detallado para DEVELOPER_ERROR
        if (signInError.code === statusCodes.DEVELOPER_ERROR) {
          console.log('\n🔍 DIAGNÓSTICO DE DEVELOPER_ERROR:');
          console.log('1. Este error indica que el certificado SHA-1 de tu app no coincide');
          console.log('   con el SHA-1 registrado en Google Cloud Console para este Client ID');
          
          console.log('\n📋 SOLUCIÓN PASO A PASO:');
          console.log('1. Obtén el SHA-1 de tu entorno de desarrollo:');
          console.log('   → Para Expo Go: El SHA-1 está gestionado por Expo');
          console.log('   → Para desarrollo con build local:');
          console.log('     • Android Studio: Gradle → Tasks → android → signingReport');
          console.log('     • o ejecuta: cd android && ./gradlew signingReport');
          console.log('2. Ve a Google Cloud Console: https://console.cloud.google.com');
          console.log('3. Selecciona tu proyecto');
          console.log('4. Ve a "Credenciales" → Busca tu ID de cliente de OAuth');
          console.log('5. Edita el ID de cliente y añade el SHA-1 correcto');
          console.log('6. Guarda los cambios y espera unos minutos para que se propaguen');
          console.log('7. Asegúrate de que la API de Google Sign-In está habilitada');
          
          console.log('\n🧪 VERIFICACIÓN:');
          console.log('• Client ID en uso:', androidClientId);
          console.log('• Verifica que este Client ID coincide con el configurado en Google Cloud Console');
          console.log('• Comprueba que has añadido el SHA-1 correcto para este Client ID');
        }
      }
      
    } catch (error) {
      console.error('❌ Error general:', error);
    }
    
    console.log('=== FIN DEL DIAGNÓSTICO DE DEVELOPER_ERROR ===');
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
      
    </View>
  );
};

export default TestApi;