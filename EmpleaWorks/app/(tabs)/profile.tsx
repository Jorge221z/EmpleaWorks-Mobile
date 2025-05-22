import { StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser, getProfile } from '@/api/axios';

// Función para obtener los datos completos del usuario (incluyendo candidato)
const getFullUserData = async () => {
  try {
    // Obtener datos básicos del usuario
    const timestamp = new Date().getTime();
    const user = await getUser(`?_t=${timestamp}`);
    
    // Si no tenemos acceso a candidate en la respuesta inicial, intentamos recuperar los datos de localStorage para mejor rendimiento
    if (!user.candidate && localStorage) {
      try {
        const storedCandidate = localStorage.getItem('userCandidate');
        if (storedCandidate) {
          user.candidate = JSON.parse(storedCandidate);
        }
      } catch (e) {
        console.warn('Error al recuperar datos del candidato del almacenamiento local:', e);
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error al obtener datos completos del usuario:', error);
    throw error;
  }
};

export default function ProfileScreen() {
  const { user: contextUser, logout, isAuthenticated, setUser } = useAuth();
  // Estado local para almacenar los datos del candidato
  const [candidateData, setCandidateData] = useState(contextUser?.candidate);
  // Añadir estado local para el usuario
  const [localUser, setLocalUser] = useState(contextUser);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const expoRouter = useRouter();
  
  // Referencia para evitar múltiples cargas
  const lastLoadTime = useRef<number>(0);
  const loadCooldown = 2000; // 2 segundos de cooldown entre cargas
  // Referencia para rastrear si es la primera carga
  const isInitialLoad = useRef<boolean>(true);

  // Combinar usuario local y datos del candidato
  const user = {
    ...localUser,
    candidate: candidateData || localUser?.candidate
  };

  // Actualizar el usuario local cuando cambie el del contexto
  useEffect(() => {
    if (contextUser) {
      setLocalUser(contextUser);
      if (contextUser.candidate) {
        setCandidateData(contextUser.candidate);
        // Almacenar en localStorage para futuras referencias
        try {
          if (localStorage) {
            localStorage.setItem('userCandidate', JSON.stringify(contextUser.candidate));
          }
        } catch (e) {
          console.warn('Error al guardar datos del candidato en localStorage:', e);
        }
      }
    }
  }, [contextUser]);

  // Función para cargar los datos del usuario desde la API con protección de cooldown
  const loadUserData = useCallback(async () => {
    // Verificar si ha pasado suficiente tiempo desde la última carga
    const now = Date.now();
    if (now - lastLoadTime.current < loadCooldown) {
      console.log('Carga ignorada por cooldown, espere por favor...');
      return;
    }
    
    lastLoadTime.current = now;
    
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('Obteniendo datos del perfil...');
      
      // Limpiar cualquier dato en caché antes de cargar
      setLocalUser(null);
      setCandidateData(null);
      
      // Añadir un parámetro aleatorio para evitar caché
      const timestamp = Date.now();
      const profileData = await getProfile(`?_nocache=${timestamp}`);
      console.log('Datos de perfil recibidos, candidate:', 
        profileData?.candidate ? 'presente' : 'ausente');
      
      // Verificar explícitamente si la imagen se ha eliminado
      if (!profileData.image && !profileData?.candidate?.profileImage) {
        console.log('No se encontró imagen de perfil en la respuesta, confirmando eliminación');
        // Asegurar que no haya referencias a imágenes anteriores
        profileData.image = null;
        if (profileData.candidate) {
          profileData.candidate.profileImage = null;
        }
      }
      
      // Actualizar los datos del candidato si existen
      if (profileData?.candidate) {
        setCandidateData(profileData.candidate);
        console.log('Datos del candidato actualizados:', profileData.candidate);
      }
      
      // Actualizar usuario local siempre
      setLocalUser(profileData);
      
      // Intentar actualizar el contexto también (si está disponible)
      if (setUser) {
        setUser(profileData);
      }
    } catch (e) {
      console.error('Error al recargar datos del usuario:', e);
      setError('No se pudieron cargar los datos actualizados');
    } finally {
      setRefreshing(false);
    }
  }, [setUser]);

  // Recargar datos cuando se navega a esta pantalla con el parámetro refresh
  useEffect(() => {
    if (params.refresh) {
      console.log('Forzando recarga completa de datos del perfil debido a parámetro refresh');
      
      // Limpiar la caché de imágenes si hay un timestamp (indica actualización con posible eliminación de imagen)
      if (params.timestamp) {
        console.log('Detectada actualización de perfil con timestamp, limpiando caché de datos');
        // Limpiar cualquier caché de usuario o imagen
        try {
          if (localStorage) {
            localStorage.removeItem('userCandidate');
          }
        } catch (e) {
          console.warn('Error al limpiar localStorage:', e);
        }
        
        // Forzar limpieza de caché de AsyncStorage relacionada con el perfil
        AsyncStorage.removeItem('user_profile_cache').catch(err => 
          console.warn('Error al limpiar caché de perfil:', err)
        );
      }
      
      // Forzar una recarga completa
      loadUserData();
      
      // Elimina el parámetro para evitar recargas futuras
      expoRouter.setParams({ refresh: undefined, timestamp: undefined });
    }
  }, [params.refresh, params.timestamp, loadUserData, expoRouter]);

  // Reemplazamos el efecto anterior con uno que garantice la carga completa inicial
  useEffect(() => {
    // Siempre cargamos los datos completos al iniciar la pantalla
    if (isAuthenticated) {
      // Solo en el montaje inicial o si no hay usuario local
      if (isInitialLoad.current || !localUser) {
        console.log('Realizando carga inicial de datos de perfil...');
        isInitialLoad.current = false;
        loadUserData();
      }
    }
  }, [isAuthenticated, loadUserData, localUser]);

  // Mantener el candidateData actualizado si viene del contexto
  useEffect(() => {
    if (contextUser?.candidate && !candidateData) {
      console.log('Actualizando datos del candidato desde el contexto...');
      setCandidateData(contextUser.candidate);
    }
  }, [contextUser, candidateData]);

  // Función para el Pull-to-refresh manual
  const onRefresh = useCallback(() => {
    loadUserData();
  }, [loadUserData]);

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

  // Función para forzar recarga de datos
  const forceRefresh = useCallback(() => {
    console.log('Forzando recarga manual de datos');
    loadUserData();
  }, [loadUserData]);

  // Función helper para acceder al apellido (con mejor depuración)
  const getSurname = (userData: any) => {
    // Verificar explícitamente cada nivel para evitar errores
    if (userData?.candidate?.surname) {
      return userData.candidate.surname;
    }
    
    // Comprobamos también el estado candidateData si userData no tiene la información
    if (candidateData?.surname) {
      return candidateData.surname;
    }
    
    // Si no hay apellido, mostramos un mensaje de depuración
    if (__DEV__) {
      console.log('Apellido no encontrado. Datos actuales:', {
        userCandidate: userData?.candidate,
        candidateDataState: candidateData
      });
    }
    
    return userData?.surname || '';
  };

  // Función helper para acceder a la descripción del usuario
  const getUserDescription = (userData: any) => {
    if (userData?.candidate?.description) {
      return userData.candidate.description;
    }
    
    if (candidateData?.description) {
      return candidateData.description;
    }
    
    return userData?.description || '';
  };

  // Función helper para obtener la URL de la imagen de perfil
  const getUserProfileImage = (userData: any) => {
    // Si se está refrescando, no mostrar ninguna imagen para evitar caché
    if (refreshing) return null;
    
    let imagePath = null;
    
    // First check the image field at root level
    if (userData?.image) {
      imagePath = userData.image;
    } else if (userData?.candidate?.profileImage) {
      imagePath = userData.candidate.profileImage;
    } else if (candidateData?.profileImage) {
      imagePath = candidateData.profileImage;
    } else {
      imagePath = userData?.profileImage;
    }
    
    // Si no hay ruta de imagen, devolver null explícitamente
    if (!imagePath) {
      console.log('No se encontró ruta de imagen, retornando null');
      return null;
    }
    
    // If we have an image path, ensure it's a complete URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      // Try a simpler direct URL format
      // Don't modify the path that comes from the API
      const imageUrl = `https://emplea.works/storage/${imagePath}`;
      console.log('Constructed image URL:', imageUrl);
      return imageUrl;
    }
  };

  // Función helper para comprobar si el usuario tiene CV
  const hasUserCV = (userData: any) => {
    return !!(userData?.candidate?.cv || candidateData?.cv);
  };

  // Función para obtener la información del CV
  const getUserCV = (userData: any) => {
    if (userData?.candidate?.cv) {
      return userData.candidate.cv;
    }
    
    if (candidateData?.cv) {
      return candidateData.cv;
    }
    
    return null;
  };

  // Función de depuración para mostrar contenido completo en la consola
  const debugUserData = () => {
    console.log('============= DATOS ACTUALES =============');
    console.log('Usuario local:', localUser);
    console.log('Datos de candidato:', candidateData);
    console.log('Usuario combinado:', user);
    console.log('Apellido calculado:', getSurname(user));
    console.log('Descripción:', getUserDescription(user));
    console.log('Imagen de perfil:', getUserProfileImage(user));
    console.log('CV:', getUserCV(user));
    console.log('==========================================');
  };

  // Función para navegar a la pantalla de edición with datos completos
  const navigateToEditProfile = () => {
    const userToEdit = {
      ...user,
      userSurname: getSurname(user) // Aseguramos que el apellido esté disponible
    };
    
    // Guardar temporalmente en AsyncStorage para que esté disponible en la pantalla de edición
    try {
      AsyncStorage.setItem('edit_profile_data', JSON.stringify({
        name: user?.name || '',
        email: user?.email || '',
        surname: getSurname(user) || '',
        description: getUserDescription(user) || '',
        profileImage: getUserProfileImage(user) || '',
        cv: getUserCV(user) || null
      }));
    } catch (e) {
      console.error('Error guardando datos para edición:', e);
    }
    
    router.push('/edit-profile');
  };

  return (
    <ScrollView 
      style={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007bff']}
          tintColor={'#007bff'}
        />
      }
    >
      <View style={styles.container}>
        {/* Indicador de recarga */}
        {refreshing && (
          <View style={styles.refreshIndicator}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={styles.refreshText}>Actualizando perfil...</Text>
          </View>
        )}
        
        {/* Botón para forzar recarga y debug (solo en desarrollo) */}
        <TouchableOpacity 
          style={styles.debugButton} 
          onPress={() => {
            forceRefresh();
            debugUserData();
          }}
        >
          <Text style={styles.debugButtonText}>Debug y Actualizar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {getUserProfileImage(user) ? (
              <Image 
                source={{ uri: getUserProfileImage(user) }}
                style={styles.avatar}
                defaultSource={require('@/assets/images/default-avatar.png')}
                onError={(error) => {
                  console.log('Error cargando imagen de perfil:', error.nativeEvent.error);
                }}
              />
            ) : (
              <Image 
                source={require('@/assets/images/default-avatar.png')}
                style={styles.avatar}
              />
            )}
          </View>
          <Text style={styles.title}>Mi Perfil</Text>
          <Text style={styles.subtitle}>
            {user?.name || 'Usuario'} {getSurname(user)}
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
            <Text style={styles.infoValue}>{getSurname(user) || 'No disponible'}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email || 'No disponible'}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>CV:</Text>
            <Text style={styles.infoValue}>
              {hasUserCV(user) ? 'CV subido ✓' : 'No has subido CV'}
            </Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.infoLabel}>Descripción:</Text>
            <Text style={styles.descriptionText}>
              {getUserDescription(user) || 'No has añadido una descripción todavía'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones</Text>
          <TouchableOpacity style={styles.button} onPress={navigateToEditProfile}>
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
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0f9ff',
    borderRadius: 5,
    marginBottom: 10,
  },
  refreshText: {
    marginLeft: 10,
    color: '#007bff',
    fontSize: 14,
  },
  debugButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  debugButtonText: {
    color: '#333',
    fontSize: 12,
  },
  descriptionContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 5,
    color: '#333',
    fontStyle: 'italic',
  },
});