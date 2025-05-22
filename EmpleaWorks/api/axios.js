import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la instancia de axios
const api = axios.create({
  baseURL: 'https://emplea.works/api', // Cambia esto por la IP local de tu PC
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

// Función para registrar un nuevo usuario
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
    
    console.log('Enviando solicitud de actualización de perfil...');
    const response = await api.post('/profile', profileData, config);
    console.log('Respuesta de actualización recibida:', response.status);
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
    await AsyncStorage.removeItem('auth_token');
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

