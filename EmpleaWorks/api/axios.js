import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuración de la instancia de axios
const api = axios.create({
  baseURL: 'https://emplea.works/api', // Cambia esto por la IP local de tu PC
  timeout: 15000, // 15 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para añadir el token a las solicitudes
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


/* AQUI MANEJAMOS EL LOGIN/REGISTER DE FORMA TRADICIONAL */

export const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    const { token, user } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    return { user, token };
  } catch (error) {
    console.error('Register error:', error?.response?.data || error); // <-- Added for debugging
    throw error.response?.data || { message: 'Error en el registro' };
  }
};

// Función para iniciar sesión
export const login = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    const { token, user } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    return { user, token };
  } catch (error) {
    throw error.response?.data || { message: 'Error en el inicio de sesión' };
  }
};

/* AQUI MANEJAMOS EL LOGIN/REGISTER MEDIANTE GOOGLE */

// Función para procesar el callback de Google con idToken
export const handleGoogleCallback = async (idToken) => {
  try {
    console.log('Enviando idToken al backend (primeros 20 caracteres):', idToken.substring(0, 20) + '...');
    console.log('Longitud del idToken:', idToken.length);
    
    // Add detailed information about the idToken
    try {
      // Decode JWT segments for debugging (without exposing all contents)
      const tokenParts = idToken.split('.');
      if (tokenParts.length === 3) {
        // Look at header only (safe to display)
        const headerJson = atob(tokenParts[0]);
        const header = JSON.parse(headerJson);
        console.log('Token header:', header);
        
        // For payload, just show key names to help debugging without exposing sensitive data
        const payloadJson = atob(tokenParts[1]);
        const payload = JSON.parse(payloadJson);
        console.log('Token payload contains these fields:', Object.keys(payload).join(', '));
        
        // Show critical values for debugging without exposing all data
        console.log('Token info - iss:', payload.iss);
        console.log('Token info - aud:', payload.aud?.substring(0, 10) + '...');
        console.log('Token info - exp:', new Date(payload.exp * 1000).toISOString());
        console.log('Token info - iat:', new Date(payload.iat * 1000).toISOString());
      }
    } catch (decodeError) {
      console.log('No se pudo decodificar el token para debugging:', decodeError);
    }
    
    const response = await api.post('/auth/google/callback', { id_token: idToken });
    
    console.log('Respuesta del backend recibida:', 
      response.status === 200 ? '✅ Éxito (status 200)' : `⚠️ Status: ${response.status}`);
    
    if (!response.data || !response.data.token) {
      console.error('Respuesta sin token:', response.data);
      throw new Error('La respuesta del servidor no incluye un token de autenticación');
    }
    
    const { token: authToken, user } = response.data;
    console.log('Usuario autenticado:', user?.name || 'Desconocido');
    
    await AsyncStorage.setItem('auth_token', authToken);
    return { user, token: authToken };
  } catch (error) {
    console.error('Error detallado en handleGoogleCallback:', 
      error.response?.status || 'Sin status', 
      error.response?.data || error.message || error);
    
    // Si tenemos un error de respuesta HTTP detallado, lo mostramos
    if (error.response?.data) {
      throw error.response.data;
    }
    
    // Si es un error de red o timeout
    if (error.request) {
      console.error('No se recibió respuesta del servidor. Verifica la conectividad.');
      throw { message: 'Error de conexión al servidor. Verifica tu conexión a internet.' };
    }
    
    throw { message: error.message || 'Error en la autenticación con Google' };
  }
};

// Función para obtener la URL de redirección de Google
export const getGoogleRedirectUrl = async () => {
  try {
    const response = await api.get('/auth/google/redirect');
    return response.data.url;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener URL de redirección de Google' };
  }
};

// Función para obtener la configuración de Google para móviles
export const getGoogleMobileConfig = async () => {
  try {
    const response = await api.get('/auth/google/mobile-config');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener configuración de Google para móviles' };
  }
};

// Función para manejar el código de autorización de Google
export const handleGoogleAuthCode = async (code) => {
  try {
    const response = await api.post('/auth/google/code', { code });
    const { token, user } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    return { user, token };
  } catch (error) {
    throw error.response?.data || { message: 'Error al procesar código de autorización de Google' };
  }
};



// Función para obtener datos del usuario autenticado
export const getUser = async () => {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener usuario' };
  }
};

// Función para obtener el perfil del usuario
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    console.log('Respuesta completa de getProfile:', response.data);
    return response.data;
  } catch (error) {
    console.error('getProfile error:', error?.response?.data || error);
    throw error.response?.data || { message: 'Error al obtener perfil' };
  }
};

// Función para actualizar el perfil del usuario
export const updateProfile = async (profileData, isFormData = false) => {
  try {
    const config = {};
    
    // Si estamos enviando FormData, configuramos los headers correctamente
    if (isFormData || profileData instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      };
      console.log('Enviando datos como FormData con headers adecuados');
    }
    
    // Verificamos si estamos enviando una solicitud para eliminar la imagen
    const isRemovingImage = profileData.get && 
      (profileData.get('delete_image') === '1' || profileData.get('remove_image') === 'true');
    
    // Verificamos si estamos enviando una solicitud para eliminar el CV
    const isRemovingCV = profileData.get && profileData.get('delete_cv') === '1';
    
    if (isRemovingImage) {
      console.log('Se ha solicitado eliminar la imagen de perfil');
      
      // IMPORTANTE: NO añadir 'image' si estamos eliminando para evitar errores de validación
      // Si el backend espera un campo específico para eliminar, solo usamos ese
      if (!profileData.get('delete_image')) {
        profileData.append('delete_image', '1');
      }
      
      // Quitamos cualquier valor que podría estar causando problemas
      try {
        if (profileData._parts) {
          // FormData interno puede ser una matriz de pares clave-valor
          profileData._parts = profileData._parts.filter(part => 
            part[0] !== 'image' && part[0] !== 'image[0]' && part[1] !== 'null'
          );
        }
      } catch (e) {
        console.log('No se pudo limpiar _parts:', e);
      }
    }
    
    if (isRemovingCV) {
      console.log('Se ha solicitado eliminar el CV');
      
      // Si el backend espera un campo específico para eliminar, aseguramos que esté presente
      if (!profileData.get('delete_cv')) {
        profileData.append('delete_cv', '1');
      }
      
      // Quitamos cualquier valor que podría estar causando problemas
      try {
        if (profileData._parts) {
          // FormData interno puede ser una matriz de pares clave-valor
          profileData._parts = profileData._parts.filter(part => 
            part[0] !== 'cv' && part[1] !== 'null'
          );
        }
      } catch (e) {
        console.log('No se pudo limpiar _parts para CV:', e);
      }
    }
    
    console.log('Enviando solicitud de actualización de perfil...');
    console.log('FormData contiene estos campos:', 
      profileData._parts ? profileData._parts.map(p => p[0]).join(', ') : 'No disponible');
    
    const response = await api.post('/profile', profileData, config);
    console.log('Respuesta de actualización recibida:', response.status);
    
    // Depurar la respuesta para identificar posibles problemas
    if (isRemovingImage && response.data) {
      console.log('Respuesta al eliminar imagen:', 
        response.data.image ? 'Imagen presente en respuesta' : 'Imagen eliminada correctamente');
    }
    
    if (isRemovingCV && response.data) {
      console.log('Respuesta al eliminar CV:', 
        response.data.candidate?.cv ? 'CV presente en respuesta' : 'CV eliminado correctamente');
    }
    
    return response.data;
  } catch (error) {
    console.error('updateProfile error:', error?.response?.data || error);
    if (error?.response?.data?.errors?.image) {
      console.error('Error específico de imagen:', error.response.data.errors.image);
    }
    throw error.response?.data || { message: 'Error al actualizar perfil' };
  }
};

// Función para eliminar la cuenta del usuario
export const deleteProfile = async (password) => {
  try {
    const response = await api.delete('/profile', { data: { password } });
    await AsyncStorage.removeItem('auth_token');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al eliminar cuenta' };
  }
};

// Función para obtener el dashboard del candidato
export const getCandidateDashboard = async () => {
  try {
    const response = await api.get('/candidate/dashboard');
    // Handle both cases: when data is nested or direct
    return response.data.candidateOffers || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener dashboard' };
  }
};

// Función para obtener detalles de una oferta específica
export const getOfferDetails = async (offerId) => {
  try {
    const response = await api.get(`/candidate/offer/${offerId}`);
    return response.data.offer;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener detalles de la oferta' };
  }
};    

// Función para cerrar sesión (opcional)
export const logout = async () => {
  try {
    // Clear local token
    await AsyncStorage.removeItem('auth_token');
    
    // Also sign out from Google if available
    try {
      if (Platform.OS !== 'web') {
        const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
        if (GoogleSignin) {
          console.log('Cerrando sesión de Google...');
          await GoogleSignin.signOut();
          console.log('Sesión de Google cerrada correctamente');
        }
      }
    } catch (googleError) {
      // Don't fail the main logout if Google sign out fails
      console.warn('Error al cerrar sesión de Google:', googleError);
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

// Listar todas las ofertas
export const getOffers = async () => {
  try {
    const response = await api.get('/offers');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener ofertas' };
  }
};

// Obtener una oferta específica
export const getOffer = async (offerId) => {
  try {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener la oferta' };
  }
};

// Crear una nueva oferta
export const createOffer = async (offerData) => {
  try {
    const response = await api.post('/offers', offerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al crear la oferta' };
  }
};

// Aplicar a una oferta
export const applyToOffer = async (applicationData) => {
  try {
    const response = await api.post(`/offers/${applicationData.offer_id}/apply`, applicationData);
    return response.data;
  } catch (error) {
    console.error('❌ applyToOffer - Error:', error?.response?.data || error);
    
    // Verificar si es un error de verificación de email usando la función helper
    const verificationError = handleEmailVerificationError(error?.response?.data || error);
    if (verificationError.isEmailVerificationError) {
      console.log('🚨 applyToOffer - Error de verificación de email detectado');
      throw {
        ...error?.response?.data,
        isEmailVerificationError: true,
        needsEmailVerification: true,
        ...verificationError
      };
    }
    
    throw error.response?.data || { message: 'Error al aplicar a la oferta' };
  }
};

// Actualizar una oferta
export const updateOffer = async (offerId, offerData) => {
  try {
    const response = await api.put(`/offers/${offerId}`, offerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al actualizar la oferta' };
  }
};

// Eliminar una oferta
export const deleteOffer = async (offerId) => {
  try {
    const response = await api.delete(`/offers/${offerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al eliminar la oferta' };
  }
};

export const getDashboard = async () => {
  try {
    const response = await api.get('/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener el dashboard' };
  }
};


// Obtener configuración de contraseña
export const getPasswordSettings = async () => {
  try {
    const response = await api.get('/password');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener configuración de contraseña' };
  }
};

// Actualizar contraseña
export const updatePassword = async (passwordData) => {
  try {
    const response = await api.post('/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al actualizar la contraseña' };
  }
};

// Función para verificar si el usuario ya aplicó a una oferta específica
export const checkIfUserAppliedToOffer = async (offerId) => {
  try {
    const dashboardData = await getCandidateDashboard();
    
    // Verificar si la respuesta es un array
    const applications = Array.isArray(dashboardData) ? dashboardData : (dashboardData.applications || []);
    
    // Buscar si existe una aplicación para el offerId especificado
    const hasApplied = applications.some(offer => offer.id === parseInt(offerId));
    
    return hasApplied;
  } catch (error) {
    console.error('Error al verificar si el usuario aplicó a la oferta:', error);
    // En caso de error, asumir que no aplicó para no bloquear la funcionalidad
    return false;
  }
};


// Funciones para manejar ofertas guardadas
export const toggleSavedOffer = async (offerId) => {
  try {
    const response = await api.post(`/saved-offers/${offerId}`);
    return response.data;
  } catch (error) {
    console.error('Toggle saved offer error:', error?.response?.data || error);
    throw error.response?.data || { message: 'Error al guardar/eliminar oferta' };
  }
};

export const getSavedOffers = async () => {
  try {
    const response = await api.get('/saved-offers');
    return response.data;
  } catch (error) {
    console.error('Get saved offers error:', error?.response?.data || error);
    throw error.response?.data || { message: 'Error al obtener ofertas guardadas' };
  }
};

export const checkIfOfferIsSaved = async (offerId) => {
  try {
    const response = await getSavedOffers();
    const savedOffers = response.savedOffers || [];
    const isSaved = savedOffers.some(offer => offer.id.toString() === offerId.toString());
    return { isSaved };
  } catch (error) {
    console.error('Check if offer is saved error:', error?.response?.data || error);
    return { isSaved: false }; // Return false by default if error
  }
};

// ============================
// EMAIL VERIFICATION FUNCTIONS
// ============================

// Obtener el estado de verificación del email del usuario
export const getEmailVerificationStatus = async () => {
  try {
    const response = await api.get('/email/verification-status');
    console.log('🔍 getEmailVerificationStatus - Respuesta:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ getEmailVerificationStatus - Error:', error?.response?.data || error);
    throw error.response?.data || { message: 'Error al verificar estado del email' };
  }
};

// Reenviar email de verificación
export const resendEmailVerification = async () => {
  try {
    const response = await api.post('/email/verification-notification');
    console.log('🔍 resendEmailVerification - Respuesta:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ resendEmailVerification - Error:', error?.response?.data || error);
    throw error.response?.data || { message: 'Error al reenviar email de verificación' };
  }
};

// Obtener información de pantalla de verificación
export const getEmailVerificationNotice = async () => {
  try {
    const response = await api.get('/email/verification-notice');
    console.log('🔍 getEmailVerificationNotice - Respuesta:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ getEmailVerificationNotice - Error:', error?.response?.data || error);
    throw error.response?.data || { message: 'Error al obtener información de verificación' };
  }
};

// Verificar si se requiere verificación de email para una acción específica
export const checkEmailVerificationRequired = async () => {
  try {
    const statusResponse = await getEmailVerificationStatus();
    const isVerified = statusResponse.data?.email_verified || false;
    
    console.log('🔍 checkEmailVerificationRequired - Email verificado:', isVerified);
    return {
      isRequired: !isVerified,
      isVerified: isVerified,
      email: statusResponse.data?.email,
      userId: statusResponse.data?.user_id
    };
  } catch (error) {
    console.error('❌ checkEmailVerificationRequired - Error:', error);
    // En caso de error, asumir que se requiere verificación por seguridad
    return {
      isRequired: true,
      isVerified: false,
      error: true
    };
  }
};

// Manejar errores de verificación de email desde respuestas de API
export const handleEmailVerificationError = (error) => {
  // Verificar si el error es relacionado con verificación de email
  if (error?.error === 'email_not_verified' || 
      error?.message?.includes('verificar tu email') ||
      error?.message?.includes('email_verified_at') ||
      error?.action_required === 'email_verification') {
    console.log('🚨 handleEmailVerificationError - Error de verificación de email detectado');
    return {
      isEmailVerificationError: true,
      email: error?.data?.email,
      userId: error?.data?.user_id,
      message: error?.message || 'Necesitas verificar tu email para realizar esta acción.'
    };
  }
  
  // Verificar errores del backend Laravel relacionados con middleware de verificación
  if (error?.message?.includes('Target class [verified') ||
      error?.exception?.includes('BindingResolutionException') ||
      error?.message?.includes('does not exist')) {
    console.log('🚨 handleEmailVerificationError - Error de configuración del servidor detectado');
    return {
      isEmailVerificationError: true,
      isBackendError: true,
      email: error?.data?.email,
      userId: error?.data?.user_id,
      message: 'Hay un problema de configuración en el servidor. Es posible que necesites verificar tu email.'
    };
  }
  
  return {
    isEmailVerificationError: false
  };
};