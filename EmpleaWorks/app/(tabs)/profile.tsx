import { StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, RefreshControl, Dimensions, Animated, View as RNView } from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser, getProfile } from '@/api/axios';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { __DEV__ } from 'react-native';

// Constantes de diseño
const getThemeColors = (colorScheme: string) => {
  const isDark = colorScheme === 'dark';
  return {
    primary: '#4A2976',
    primaryLight: isDark ? '#5e3a8a' : '#3d2c52',
    secondary: '#9b6dff',
    accent: '#f6c667',
    background: isDark ? '#121212' : '#f8f9fa',
    white: isDark ? '#1e1e1e' : '#ffffff',
    text: isDark ? '#f0f0f0' : '#333',
    lightText: isDark ? '#bbbbbb' : '#666',
    error: '#e74c3c',
    success: '#2ecc71',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(43, 31, 60, 0.15)',
    card: isDark ? '#2d2d2d' : '#ffffff',
    shadowColor: isDark ? '#000' : '#000',
    debug: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(43, 31, 60, 0.05)',
    golden: '#fac030',
    cardBackground: isDark ? '#2d2d2d' : '#ffffff',
    // Cambiamos fieldBackground para que sea más sutil en modo oscuro
    fieldBackground: isDark ? '#333333' : '#f8f8f8',
    sectionHeaderBg: isDark ? '#242424' : '#f4f4f4',
  };
};

// Create estilos dinamicos en funcion del tema
const createStyles = (colors: ReturnType<typeof getThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 20,
  },
  refreshText: {
    marginLeft: 10,
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: colors.debug,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  debugButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  debugIcon: {
    marginRight: 5,
  },
  solidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.cardBackground,
  },
  cardSolid: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: colors.cardBackground,
  },
  sectionSolid: {
    flex: 1,
    padding: 20,
    borderRadius: 15,
    backgroundColor: colors.cardBackground,
  },
  userNameContainer: {
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'transparent', // Cambiar de colors.cardBackground a transparent
    borderRadius: 8,
  },
  avatarBorder: {
    width: 124,
    height: 124,
    borderRadius: 62,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },  avatarInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: 'transparent', // Cambiar a transparente para que no interfiera
  },
  iconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIndicator: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileCard: {
    borderRadius: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
  },
  infoSection: {
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
  },
  optionsSection: {
    borderRadius: 15,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  logoutButton: {
    borderRadius: 10,
    marginTop: 8,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  descriptionBox: {
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground, // Agregar esta línea
    overflow: 'hidden',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.2)',
  },  avatarOuterContainer: {
    marginBottom: 15,
    backgroundColor: 'transparent', // Cambiar a transparente
    borderRadius: 62, // Mismo border radius
    alignItems: 'center',
    justifyContent: 'center',
  },avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Cambiar a transparente
    borderRadius: 62, // Mismo border radius que el avatarBorder
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
    textAlign: 'center',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'transparent', // Cambiar de colors.cardBackground a transparent
  },
  emailIcon: {
    marginRight: 8,
  },
  userEmail: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    marginLeft: 8,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'transparent', // Cambiado de colors.cardBackground a transparent
    borderRadius: 8,
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 15,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 24, // Aumentado de 12 a 24 para más espacio entre campos
    alignItems: 'stretch',
    height: 24,
  },
  infoValueContainer: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 0,
    height: 24, // Fijar altura específica
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 6,
    paddingVertical: 0,
    borderRadius: 0,
    height: 24,
    lineHeight: 24,
    flex: 0, // Cambiar de width fijo a flex
    minWidth: 95, // Usar minWidth en lugar de width fijo
  },
  cvStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 0,
    flex: 1,
    height: 24, // Fijar altura específica
  },
  cvIcon: {
    marginRight: 8,
  },
  cvAvailable: {
    color: colors.success,
    fontWeight: '500',
  },
  cvMissing: {
    color: colors.error,
  },
  descriptionContainer: {
    marginTop: 5,
    backgroundColor: colors.cardBackground, // Cambiado de transparent a colors.cardBackground
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  optionButton: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoValue: {
    fontSize: 15,
    flex: 1,
    color: colors.text,
  },
});

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
  const colorScheme = useColorScheme();
  const COLORS = getThemeColors(colorScheme || 'light');
  const styles = createStyles(COLORS);

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

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const headerHeight = useRef(new Animated.Value(180)).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;

  // Combinar usuario local y datos del candidato
  const user = {
    ...localUser,
    candidate: candidateData || localUser?.candidate
  };

  // Animaciones cuando la pantalla se carga
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.spring(avatarScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true
      })
    ]).start();
  }, []);

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

  const { width } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      {/* Enhanced header with gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.secondary]}
            tintColor={COLORS.secondary}
            progressBackgroundColor={COLORS.cardBackground}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Indicador de recarga con fondo sólido en lugar de blur */}
        {refreshing && (
          <Animated.View
            style={[
              styles.refreshIndicator,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.solidContainer}>
              <ActivityIndicator size="small" color={COLORS.secondary} />
              <Text style={styles.refreshText}>Actualizando perfil...</Text>
            </View>
          </Animated.View>
        )}

        {/* Botón para forzar recarga y debug (solo en desarrollo) */}
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => {
            forceRefresh();
            debugUserData();
          }}
        >
          <FontAwesome name="refresh" size={12} color={COLORS.primary} style={styles.debugIcon} />
          <Text style={styles.debugButtonText}>Debug y Actualizar</Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          {/* Solid background for profile card */}
          <View style={styles.cardSolid}>
            <View style={styles.avatarOuterContainer}>
              <Animated.View
                style={[
                  styles.avatarContainer,
                  { transform: [{ scale: avatarScale }] }
                ]}
              >
                {/* Avatar with gradient border */}
                <LinearGradient
                  colors={[COLORS.secondary, COLORS.accent, COLORS.primary]}
                  style={styles.avatarBorder}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.avatarInner}>
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
                </LinearGradient>
              </Animated.View>
            </View>

            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>
                {user?.name || 'Usuario'} {getSurname(user)}
              </Text>
            </View>
            <View style={styles.emailContainer}>
              <FontAwesome name="envelope" size={14} color={COLORS.golden} style={styles.emailIcon} />
              <Text style={styles.userEmail}>{user?.email || 'correo@ejemplo.com'}</Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <FontAwesome name="exclamation-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <View style={styles.sectionSolid}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.iconGradient}
              >
                <FontAwesome name="user" size={18} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Información Personal</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{user?.name || 'No disponible'}</Text>
              </View>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Apellidos:</Text>
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{getSurname(user) || 'No disponible'}</Text>
              </View>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Email:</Text>
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{user?.email || 'No disponible'}</Text>
              </View>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>CV:</Text>
              <View style={styles.cvStatusContainer}>
                {hasUserCV(user) ? (
                  <>
                    <FontAwesome name="check-circle" size={16} color={COLORS.success} style={styles.cvIcon} />
                    <Text style={[styles.infoValue, styles.cvAvailable]}>CV subido</Text>
                  </>
                ) : (
                  <>
                    <FontAwesome name="times-circle" size={16} color={COLORS.error} style={styles.cvIcon} />
                    <Text style={[styles.infoValue, styles.cvMissing]}>No has subido CV</Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Descripción:</Text>
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  {getUserDescription(user) || 'No has añadido una descripción todavía'}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.optionsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <View style={styles.sectionSolid}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.iconGradient}
              >
                <FontAwesome name="cog" size={18} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Opciones</Text>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.optionButton}
              onPress={navigateToEditProfile}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <FontAwesome name="edit" size={18} color={COLORS.white === '#ffffff' ? '#ffffff' : '#f0f0f0'} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Editar Perfil</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => router.push('/change-password')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <FontAwesome name="key" size={18} color={COLORS.white === '#ffffff' ? '#ffffff' : '#f0f0f0'} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Cambiar Contraseña</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={confirmLogout}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.error, '#c0392b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoutGradient}
              >
                {loading ? (
                  <View style={styles.loadingLogout}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.logoutButtonText}>Cerrando sesión...</Text>
                  </View>
                ) : (
                  <>
                    <FontAwesome name="sign-out" size={18} color="#ffffff" style={styles.buttonIcon} />
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}