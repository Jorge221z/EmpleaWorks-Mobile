import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la instancia de axios
const api = axios.create({
  baseURL: 'https://104.248.140.183/api', // Reemplaza con la URL de tu backend
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// funcion para recoger datos de la API laravel//
export const fetchData = async () => {
  try {
    const response = await api.get('/data'); // Reemplaza con tu endpoint
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};