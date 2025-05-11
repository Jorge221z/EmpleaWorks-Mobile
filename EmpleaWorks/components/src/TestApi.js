import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import {
  register,
  login,
  getUser,
  getProfile,
  updateProfile,
  deleteProfile,
  getCandidateDashboard,
  getOfferDetails,
  logout,
} from '../../api/axios'; // Ajusta la ruta según tu estructura

// Mueve testApi fuera del useEffect
const testApi = async () => {
  try {
    console.log('=== Iniciando pruebas de API ===');

    // 1. Registro
    console.log('Probando register...');
    const registerData = {
      name: `TestUser${Date.now()}`, // Nombre único
      email: `test${Date.now()}@example.com`, // Email único
      role: 'candidate',
      password: 'password123-Jj',
      password_confirmation: 'password123-Jj',
    };
    const registerResponse = await register(registerData);
    console.log('Registro exitoso:', registerResponse);

    // 2. Login
    console.log('Probando login...');
    const loginResponse = await login({
      email: registerData.email,
      password: 'password123-Jj',
    });
    console.log('Login exitoso:', loginResponse);

    // 3. Obtener usuario
    console.log('Probando getUser...');
    const userResponse = await getUser();
    console.log('Usuario obtenido:', userResponse);

    // 4. Obtener perfil
    console.log('Probando getProfile...');
    const profileResponse = await getProfile();
    console.log('Perfil obtenido:', profileResponse);

    // 5. Actualizar perfil
    console.log('Probando updateProfile...');
    const updateData = {
      name: 'Test User Updated',
      surname: 'Updated',
      description: 'Perfil actualizado',
    };
    const updateResponse = await updateProfile(updateData);
    console.log('Perfil actualizado:', updateResponse);

    // 6. Obtener dashboard del candidato
    console.log('Probando getCandidateDashboard...');
    const dashboardResponse = await getCandidateDashboard();
    console.log('Dashboard obtenido:', dashboardResponse);

    // 7. Obtener detalles de una oferta (usa un ID válido)
    console.log('Probando getOfferDetails...');
    const offerResponse = await getOfferDetails(1); // Reemplaza '1' con un ID de oferta válido
    console.log('Detalles de oferta obtenidos:', offerResponse);

    // 8. Eliminar cuenta
    console.log('Probando deleteProfile...');
    const deleteResponse = await deleteProfile('password123-Jj');
    console.log('Cuenta eliminada:', deleteResponse);

    // 9. Cerrar sesión
    console.log('Probando logout...');
    await logout();
    console.log('Sesión cerrada');

    console.log('=== Pruebas de API completadas ===');
  } catch (error) {
    console.error('Error en las pruebas:', error);
  }
};

const TestApi = () => {
  useEffect(() => {
    testApi();
  }, []);

  return (
    <View>
      <Text>Probando API... Revisa la consola para los resultados.</Text>
      <Button title="Volver a probar" onPress={() => testApi()} />
    </View>
  );
};

export default TestApi;