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
  getOffers,
  getOffer,
  createOffer,
  applyToOffer,
  updateOffer,
  deleteOffer,
  logout,
  getDashboard,
} from '../../api/axios'; // Ajusta la ruta según tu estructura

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
      console.log('Dashboard obtenido (solo test):', dashboardResponse);

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

  useEffect(() => {
  }, []);

  return (
    <View>
      <Text style={{ color: 'white' }}>Probando API... Revisa la consola para los resultados.</Text>
      <Button title="Probar API completa" onPress={testApi} />
      <View style={{ height: 20 }} />
      <Button title="Probar solo Dashboard" onPress={testDashboardOnly} />
      <View style={{ height: 20 }} />
      <Button title="Probar getDashboard" onPress={testGetDashboard} />
    </View>
  );
};

export default TestApi;