import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la instancia de axios
const api = axios.create({
  baseURL: 'http://emplea.works/api', // URL de tu backend
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
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener perfil' };
  }
};

// Función para actualizar el perfil del usuario
export const updateProfile = async (profileData) => {
  try {
    const response = await api.post('/profile', profileData);
    return response.data;
  } catch (error) {
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
    return response.data.candidateOffers;
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