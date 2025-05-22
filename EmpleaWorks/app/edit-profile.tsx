import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, getProfile } from '@/api/axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Cargar datos iniciales incluyendo el perfil completo
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setInitialLoading(true);
        
        // Intentar obtener datos de AsyncStorage primero (más rápido)
        const storedData = await AsyncStorage.getItem('edit_profile_data');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setName(parsedData.name || '');
          setSurname(parsedData.surname || '');
          setEmail(parsedData.email || '');
          setInitialLoading(false);
          return;
        }
        
        // Si no hay datos en AsyncStorage, obtener de la API
        const profileData = await getProfile();
        console.log('Datos de perfil para edición obtenidos:', profileData);
        
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        
        // Obtener el apellido correctamente según la estructura anidada
        const profileSurname = profileData.candidate?.surname || profileData.surname || '';
        setSurname(profileSurname);
        
        console.log('Formulario inicializado con:', {
          name: profileData.name,
          email: profileData.email,
          surname: profileSurname
        });
      } catch (error) {
        console.error('Error cargando datos de perfil:', error);
        // Cargar desde el contexto como fallback si la API falla
        setName(user?.name || '');
        setSurname(user?.candidate?.surname || user?.surname || '');
        setEmail(user?.email || '');
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfileData();
  }, []);

  // Función para depuración
  const logUserData = () => {
    console.log('Datos actuales del usuario:', {
      name: user?.name,
      email: user?.email,
      surname: user?.surname,
      candidateSurname: user?.candidate?.surname
    });
  };

  const handleSave = async () => {
    setLoading(true);
    logUserData(); // Imprimir datos actuales para depuración
    
    try {
      console.log('Enviando actualización de perfil:', { name, surname, email });
      const updated = await updateProfile({ name, surname, email });
      console.log('Respuesta de actualización recibida:', JSON.stringify(updated, null, 2));
      
      // Actualizamos el usuario en el contexto si está disponible
      if (setUser) {
        console.log('Actualizando usuario en el contexto');
        setUser(updated.user || updated);
      }
      
      Alert.alert('Perfil actualizado', 'Tus datos han sido guardados.', [
        {
          text: 'OK',
          onPress: () => {
            // Simplemente regresamos a la pantalla anterior con un solo parámetro
            // para evitar múltiples recargas
            router.replace({
              pathname: '/(tabs)/profile',
              params: { refresh: 'true' }
            });
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error en actualización de perfil:', error);
      Alert.alert('Error', error?.message || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
      
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellidos"
            value={surname}
            onChangeText={setSurname}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar Cambios</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { alignItems: 'center', padding: 12 },
  cancelButtonText: { color: '#007bff', fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    paddingVertical: 50
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555'
  },
});
