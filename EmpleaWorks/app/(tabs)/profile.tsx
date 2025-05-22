import { StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { getUser } from '@/api/axios';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const expoRouter = useRouter();

  // Recargar datos del usuario solo si se pasa el parámetro refresh
  useEffect(() => {
    if (params.refresh) {
      const fetchUser = async () => {
        try {
          const freshUser = await getUser();
          setUser && setUser(freshUser);
        } catch (e) {
          // Opcional: manejar error de recarga
        }
      };
      fetchUser();
      // Elimina el parámetro para evitar recargas futuras
      expoRouter.setParams({ refresh: undefined });
    }
  }, [params.refresh, setUser, expoRouter]);

  // Función para manejar el proceso de logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      // Después de cerrar sesión, redirige al usuario a la página de login
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para mostrar el popup de confirmación
  const confirmLogout = () => {
    Alert.alert(
      'Confirmar cierre de sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: handleLogout }
      ]
    );
  };

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('@/assets/images/default-avatar.png')}
              style={styles.avatar}
              defaultSource={require('@/assets/images/default-avatar.png')} 
            />
          </View>
          <Text style={styles.title}>Mi Perfil</Text>
          <Text style={styles.subtitle}>
            {user?.name || 'Usuario'} {user?.surname || ''}
          </Text>
          <Text style={styles.email}>{user?.email || 'correo@ejemplo.com'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{user?.name || 'No disponible'}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Apellidos:</Text>
            <Text style={styles.infoValue}>{user?.surname || 'No disponible'}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email || 'No disponible'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/edit-profile')}>
            <Text style={styles.buttonText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => console.log('Cambiar contraseña')}>
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={confirmLogout}
            disabled={loading}
          >
            <Text style={styles.logoutButtonText}>{loading ? "Cerrando sesión..." : "Cerrar Sesión"}</Text>
          </TouchableOpacity>
        </View>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingBottom: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 10,
  },
});