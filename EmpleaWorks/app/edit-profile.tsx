import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/api/axios';
import { router } from 'expo-router';

export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  // Acceder al apellido correctamente desde la estructura anidada
  const [surname, setSurname] = useState(user?.candidate?.surname || user?.surname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

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
});
