import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  // Alert, // Alert será reemplazado o usado selectivamente
  ScrollView, 
  Image, 
  Animated,
  Dimensions,
  Platform,
  View as RNView,
  Modal
} from 'react-native';
import { Alert } from 'react-native'; // Mantener Alert para confirmaciones
import { Text } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, getProfile } from '@/api/axios';
import { router } from 'expo-router';
import { useEmailVerificationGuard } from '@/hooks/useEmailVerification';
import EmailVerificationScreen from '@/components/EmailVerificationScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import CustomAlert, { AlertType } from '@/components/CustomAlert'; // Importar CustomAlert

// Constantes de diseño
const getThemeColors = (colorScheme: string) => {
  const isDark = colorScheme === 'dark';
  return {
    primary: '#4A2976',
    primaryLight: isDark ? '#5e3a8a' : '#3d2c52',
    secondary: '#9b6dff',
    accent: '#f6c667',
    background: isDark ? '#121212' : '#f8f9fa',
    white: isDark ? '#1e1e1e' : '#ffffff',    text: isDark ? '#f0f0f0' : '#333',
    lightText: isDark ? '#bbbbbb' : '#666',
    error: '#e74c3c',
    success: '#2ecc71',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(43, 31, 60, 0.15)',
    card: isDark ? '#2d2d2d' : '#ffffff',
    shadowColor: isDark ? '#000' : '#000',
    debug: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(43, 31, 60, 0.05)',
    golden: '#fac030',
    cardBackground: isDark ? '#2d2d2d' : '#ffffff',
    fieldBackground: isDark ? '#333333' : '#f8f8f8',
    sectionHeaderBg: isDark ? '#242424' : '#f4f4f4',
    buttonText: '#ffffff',
    disabledButton: '#a0a0a0',
    inputBackground: isDark ? '#333333' : 'rgba(255, 255, 255, 0.9)',
    // Nuevos colores para los iconos y texto del CV
    iconColor: isDark ? '#b794f6' : '#4A2976', // Más claro en dark theme
    cvText: isDark ? '#ffffff' : '#4A2976', // Blanco en dark, purple en light
    saveButtonText: isDark ? '#ffffff' : '#ffffff', // Siempre blanco
    headerTitleColor: isDark ? '#ffffff' : '#ffffff', // Título siempre blanco
    cancelButtonBg: isDark ? '#4a1e1e' : '#fef2f2', // Fondo rojizo sutil
    cancelButtonText: isDark ? '#fca5a5' : '#dc2626', // Texto rojizo
    cancelButtonBorder: isDark ? '#7f1d1d' : '#f87171', // Borde rojizo
    changeImageText: isDark ? '#ffffff' : '#ffffff', // Siempre blanco en dark y light
  };
};

// Create estilos dinamicos en funcion del tema
const createStyles = (colors: ReturnType<typeof getThemeColors>) => {
  const { width } = Dimensions.get('window');
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 120,
    },
    headerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
      paddingBottom: 20,
      zIndex: 1,
    },    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.headerTitleColor,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    loadingContainer: {
      paddingTop: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loaderCard: {
      backgroundColor: colors.cardBackground,
      padding: 30,
      borderRadius: 15,
      alignItems: 'center',
      elevation: 5,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      width: width - 40,
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: colors.primary,
    },
    formContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 15,
      padding: 20,
      elevation: 3,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      marginTop: 20,
    },
    imageSection: {
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImageWrapper: {
      alignItems: 'center',
    },
    profileImageContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      backgroundColor: colors.cardBackground,
    },
    profileImageTouchable: {
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    changeImageText: {
      color: colors.changeImageText, // Usar el color definido arriba
      marginLeft: 8,
      fontSize: 14,
      fontWeight: 'bold',
    },
    removeImageButton: {
      backgroundColor: colors.error,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
      marginTop: 15,
      elevation: 2,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    removeImageText: {
      color: colors.white,
      fontWeight: 'bold',
      fontSize: 14,
      marginLeft: 5,
    },
    inputGroup: {
      marginBottom: 18,
    },    inputLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
      color: colors.text,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
    },
    inputIcon: {
      marginLeft: 12,
      marginRight: 10,
    },
    input: {
      flex: 1,
      padding: 12,
      fontSize: 16,
      color: colors.text,
    },
    textAreaWrapper: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
    },
    textArea: {
      padding: 12,
      fontSize: 16,
      color: colors.text,
      minHeight: 120,
    },
    cvContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cvButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 10,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      backgroundColor: 'rgba(155, 109, 255, 0.05)',
    },    cvButtonText: {
      color: colors.cvText,
      fontSize: 16,
      flex: 1,
      flexShrink: 1,
      marginLeft: 5,
    },
    cvIcon: {
      marginRight: 10,
      flexShrink: 0,
    },
    removeCvButton: {
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      padding: 12,
      borderRadius: 10,
      marginLeft: 10,
      borderWidth: 1,
      borderColor: 'rgba(231, 76, 60, 0.3)',
      height: 48,
      width: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noteContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(155, 109, 255, 0.1)',
      borderRadius: 10,
      padding: 15,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: 'rgba(155, 109, 255, 0.2)',
      alignItems: 'flex-start',
    },
    noteText: {
      flex: 1,
      marginLeft: 10,
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    buttonDisabled: {
      backgroundColor: colors.disabledButton,
    },
    buttonIcon: {
      marginRight: 8,
    },    saveButtonText: {
      color: colors.saveButtonText,
      fontWeight: 'bold',
      fontSize: 16,
    },    cancelButton: {
      backgroundColor: colors.cancelButtonBg,
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      borderWidth: 1,
      borderColor: colors.cancelButtonBorder,
    },
    cancelButtonText: {
      color: colors.cancelButtonText,
      fontSize: 16,
      fontWeight: '600',
    },
  });
};

// Helper function to format image URLs
const formatImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  
  // Check if it's already a complete URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  } else {
    // Using the same direct format as profile page
    const imageUrl = `https://emplea.works/storage/${imagePath}`;
    console.log('Edit profile - formatted image URL:', imageUrl);
    return imageUrl;
  }
};

// Componente LinearGradient con fallback para evitar errores
const LinearGradient = (props: any) => {
  try {
    return <ExpoLinearGradient {...props} />;
  } catch (error) {
    console.warn('LinearGradient error, using fallback View:', error);
    const { style, children } = props;
    return <RNView style={[style, { backgroundColor: '#4A2976' }]}>{children}</RNView>;
  }
};

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const COLORS = getThemeColors(colorScheme || 'light');
  const styles = createStyles(COLORS);

  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [cv, setCv] = useState<any>(null);
  const [cvName, setCvName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false); 
  const [newCvSelected, setNewCvSelected] = useState(false);
  const [newImageSelected, setNewImageSelected] = useState(false);

  // Estados para CustomAlert
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<AlertType>('info');
  const [customAlertTitle, setCustomAlertTitle] = useState<string | undefined>(undefined);
  const [customAlertOnCloseCallback, setCustomAlertOnCloseCallback] = useState<(() => void) | null>(null);


  // Email verification
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const { verificationState, checkBeforeAction, handleApiError } = useEmailVerificationGuard();

  // Animaciones
  const fadeAnim = useState(new Animated.Value(0))[0];
  const formOpacity = useState(new Animated.Value(0))[0];
  const formTranslateY = useState(new Animated.Value(30))[0];
  
  // Animación para la imagen de perfil
  const imageScale = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    // Animación de entrada
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.spring(imageScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true
        })
      ])
    ]).start();
  }, []);

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
          setDescription(parsedData.description || '');
          setProfileImage(parsedData.profileImage || parsedData.image || null);
          
          if (parsedData.cv) {
            setCv(parsedData.cv);
            setCvName(extractFileName(parsedData.cv.uri || parsedData.cv) || 'CV subido');
          }
          
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
        
        // Obtener la descripción
        const profileDescription = profileData.candidate?.description || profileData.description || '';
        setDescription(profileDescription);

        // Obtener la imagen de perfil - verificar tanto image como profileImage y formatear URL
        const profileImagePath = profileData.image || profileData.candidate?.profileImage || profileData.profileImage || null;
        setProfileImage(profileImagePath ? formatImageUrl(profileImagePath) : null);
        console.log('URL de imagen formateada:', formatImageUrl(profileImagePath));

        // Obtener el CV
        if (profileData.candidate?.cv) {
          setCv(profileData.candidate.cv);
          setCvName(extractFileName(profileData.candidate.cv.uri || profileData.candidate.cv) || 'CV subido');
        }
        
        console.log('Formulario inicializado con datos completos del perfil');
      } catch (error) {
        console.error('Error cargando datos de perfil:', error);
        // Cargar desde el contexto como fallback si la API falla
        setName(user?.name || '');
        setSurname(user?.candidate?.surname || user?.surname || '');
        setEmail(user?.email || '');
        setDescription(user?.candidate?.description || user?.description || '');
        setProfileImage(user?.image || user?.candidate?.profileImage || user?.profileImage || null);
        
        // Formatear URL de imagen desde el contexto si es necesario
        const profileImagePath = user?.image || user?.candidate?.profileImage || user?.profileImage || null;
        setProfileImage(profileImagePath ? formatImageUrl(profileImagePath) : null);
        
        if (user?.candidate?.cv) {
          setCv(user.candidate.cv);
          setCvName(extractFileName(user.candidate.cv.uri || user.candidate.cv) || 'CV subido');
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfileData();
  }, []);

  // Extraer nombre de archivo de una URI
  const extractFileName = (uri: string): string => {
    if (!uri) return '';
    
    // Intentar extraer el nombre del archivo de la URI
    const segments = uri.split('/');
    const fileName = segments[segments.length - 1];
    
    // Si el fileName tiene parámetros de consulta, los removemos
    const cleanName = fileName.split('?')[0];
    
    return cleanName || 'archivo';
  };

  // Funciones para CustomAlert
  const showAppAlert = (type: AlertType, message: string, title?: string, onCloseCallback?: () => void) => {
    setCustomAlertType(type);
    setCustomAlertMessage(message);
    setCustomAlertTitle(title);
    // Directly store the callback, or null if not provided
    setCustomAlertOnCloseCallback(() => onCloseCallback || null);
    setCustomAlertVisible(true);
  };

  const handleCloseCustomAlert = () => {
    const callback = customAlertOnCloseCallback; // Capture the callback

    setCustomAlertVisible(false); // Trigger alert close animation
    setCustomAlertOnCloseCallback(null); // Clear the callback immediately

    if (callback) {
      // Avoid using setTimeout here as it can cause issues
      // Execute the callback directly - CustomAlert will handle its own animations
      callback();
    }
  };

  // Función para seleccionar imagen de la galería
  const pickImage = async () => {
    try {
      setUploadingImage(true);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAppAlert('warning', 'Necesitamos permisos para acceder a tu galería', 'Permiso denegado');
        setUploadingImage(false);
        return;
      }
      
      // Abrir selector de imagen con configuración mejorada
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        setProfileImage(selectedImage.uri);

        const fileExtension = selectedImage.uri.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
          showAppAlert('error', 'Por favor selecciona una imagen en formato JPG, PNG o GIF.', 'Formato no soportado');
          return;
        }
        
        setNewImageSelected(true);
        console.log('Imagen seleccionada:', selectedImage.uri, 'tipo:', selectedImage.type || 'desconocido');
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      showAppAlert('error', 'No se pudo cargar la imagen', 'Error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Función para seleccionar CV
  const pickCV = async () => {
    try {
      setUploadingCV(true);
      
      // Abrir selector de documentos
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        setCv(selectedFile);
        setCvName(selectedFile.name || extractFileName(selectedFile.uri));
        setNewCvSelected(true); 
        console.log('Documento seleccionado:', selectedFile.uri);
      }
    } catch (error) {
      console.error('Error seleccionando CV:', error);
      showAppAlert('error', 'No se pudo cargar el documento', 'Error');
    } finally {
      setUploadingCV(false);
    }
  };

  // Función para quitar el CV seleccionado
  const removeCV = () => {
    setCv(null);
    setCvName('');
    setNewCvSelected(true); // Marcamos que hemos modificado el CV (al quitarlo)
  };

  // Función para depuración
  const logUserData = () => {
    console.log('Datos actuales del usuario:', {
      name: user?.name,
      email: user?.email,
      surname: user?.surname,
      candidateSurname: user?.candidate?.surname,
      description: user?.candidate?.description || user?.description,
      profileImage: user?.candidate?.profileImage || user?.profileImage,
      cv: user?.candidate?.cv || null
    });
  };

  // Función para eliminar la imagen de perfil actual
  const removeProfileImage = () => {
    Alert.alert( // Mantener Alert.alert para confirmación
      'Eliminar imagen de perfil',
      '¿Estás seguro de que quieres eliminar tu foto de perfil actual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => {
            setProfileImage(null);
            setImageRemoved(true); 
            setNewImageSelected(true); 
            console.log('Imagen de perfil eliminada');
          }
        }
      ]
    );
  };
  const handleSave = async () => {
    // 🔒 VERIFICACIÓN DE EMAIL REQUERIDA
    console.log('🔒 Verificando email antes de actualizar perfil');
    
    const verificationResult = await checkBeforeAction('actualizar perfil');
    
    if (verificationResult.needsVerification) {
      console.log('🚫 Email no verificado, mostrando pantalla de verificación');
      setShowEmailVerification(true);
      return;
    }
    
    console.log('✅ Email verificado, procediendo con actualización de perfil');
    
    setLoading(true);
    logUserData(); // Imprimir datos actuales para depuración
    
    try {
      console.log('Preparando datos para actualización de perfil');
      
      const formData = new FormData();
      
      // Añadir campos de texto básicos
      if (name) formData.append('name', name);
      if (surname) formData.append('surname', surname);
      if (email) formData.append('email', email);
      if (description) formData.append('description', description);
      
      // Procesar la imagen si se seleccionó una nueva o se eliminó
      if (newImageSelected) {
        if (imageRemoved || !profileImage) {
          formData.append('delete_image', '1');
          console.log('Solicitando eliminación de imagen de perfil con delete_image=1');
        } else if (profileImage) {
          console.log('Preparando imagen para subir...');
          const uri = profileImage;
          const uriParts = uri.split('.');
          const fileExtension = uriParts[uriParts.length - 1];
          formData.append('image', {
            uri,
            name: `photo.${fileExtension}`,
            type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`
          } as any);
          console.log('Imagen preparada para envío');
        }
      }
      
      // Procesar el CV si se seleccionó uno nuevo o se eliminó
      if (newCvSelected) {
        if (cv && cv.uri) {
          console.log('Preparando CV para subir...');
          formData.append('cv', {
            uri: cv.uri,
            name: cv.name || 'document.pdf',
            type: cv.mimeType || 'application/pdf'
          } as any);
          console.log('CV preparado para envío');
        } else {
          formData.append('delete_cv', '1');
          console.log('Solicitando eliminación de CV con delete_cv=1');
        }
      }
      
      console.log('Enviando datos de actualización con FormData');
      
      const updated = await updateProfile(formData);
      console.log('Perfil actualizado correctamente');
      
      if (setUser) {
        console.log('Actualizando usuario en el contexto');
        setUser(updated.user || updated);
        
        if (imageRemoved) {
          if (updated.user) {
            updated.user.image = null;
            if (updated.user.candidate) {
              updated.user.candidate.profileImage = null;
            }
          } else {
            updated.image = null;
            if (updated.candidate) {
              updated.candidate.profileImage = null;
            }
          }
        }
      }
      
      try {
        await AsyncStorage.removeItem('edit_profile_data');
      } catch (e) {
        console.error('Error limpiando caché:', e);
      }
      
      // Show success alert - REMOVED setTimeout to prevent setState during render
      showAppAlert('success', 'Tus datos han sido guardados.', 'Perfil actualizado', () => {
        // Navigation is now handled directly in the callback
        router.replace({
          pathname: '/(tabs)/profile',
          params: { refresh: 'true', timestamp: Date.now().toString() }
        });
      });

    } catch (error: any) {
      console.error('Error en actualización de perfil:', error);
      let finalErrorMessage = 'No se pudo actualizar el perfil';
      if (error?.errors) {
        finalErrorMessage = Object.entries(error.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
          .join('\n');
      } else if (error?.message) {
        finalErrorMessage = error.message;
      }
      
      // Show error alert - REMOVED setTimeout
      showAppAlert('error', finalErrorMessage, 'Error al guardar');
    } finally {
      // Update loading state - REMOVED setTimeout
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.headerGradient}
      />
      
      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loaderCard}>
              <ActivityIndicator size="large" color={COLORS.secondary} />
              <Text style={styles.loadingText}>Cargando información...</Text>
            </View>
          </View>
        ) : (
          <Animated.View 
            style={[
              styles.formContainer, 
              { 
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }]
              }
            ]}
          >
            {/* Sección de Imagen de Perfil */}
            <View style={styles.imageSection}>
              <Animated.View style={[styles.profileImageWrapper, { transform: [{ scale: imageScale }] }]}>
                <TouchableOpacity onPress={pickImage} style={styles.profileImageTouchable}>
                  <Image 
                    source={profileImage ? { uri: profileImage } : require("@/assets/images/default-avatar.png")} 
                    style={styles.profileImage} 
                  />
                  <View style={styles.imageOverlay}>
                    <FontAwesome name="camera" size={16} color={COLORS.changeImageText} />
                    <Text style={styles.changeImageText}>Cambiar</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
              {profileImage && (
                <TouchableOpacity onPress={removeProfileImage} style={styles.removeImageButton}>
                  <FontAwesome name="trash" size={16} color={COLORS.white} />
                  <Text style={styles.removeImageText}>Eliminar Imagen</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Campos del formulario */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome name="user" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={COLORS.lightText}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Apellidos</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome name="users" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tus apellidos"
                  value={surname}
                  onChangeText={setSurname}
                  placeholderTextColor={COLORS.lightText}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome name="envelope" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.lightText}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción (Opcional)</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Una breve descripción sobre ti..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                  placeholderTextColor={COLORS.lightText}
                />
              </View>
            </View>

            {/* Sección de CV */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Currículum Vitae (PDF, DOC, DOCX)</Text>
              <View style={styles.cvContainer}>
                <TouchableOpacity onPress={pickCV} style={styles.cvButton}>
                  <FontAwesome name="file-text" size={20} color={COLORS.iconColor} style={styles.cvIcon} />
                  <Text style={styles.cvButtonText} numberOfLines={1} ellipsizeMode="middle">
                    {uploadingCV ? 'Subiendo CV...' : (cvName || 'Seleccionar o arrastrar CV')}
                  </Text>
                </TouchableOpacity>
                {cvName && !uploadingCV && (
                  <TouchableOpacity onPress={removeCV} style={styles.removeCvButton}>
                    <FontAwesome name="times" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Nota informativa */}
            <View style={styles.noteContainer}>
              <FontAwesome name="info-circle" size={20} color={COLORS.primary} />
              <Text style={styles.noteText}>
                Asegúrate de que tu información de contacto (email y nombre) esté actualizada. 
                Tu CV y foto de perfil son importantes para los reclutadores.
              </Text>
            </View>

            {/* Botón de Guardar */}
            <TouchableOpacity 
              style={[styles.saveButton, (loading || initialLoading) && styles.buttonDisabled]} 
              onPress={handleSave}
              disabled={loading || initialLoading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.saveButtonText} style={styles.buttonIcon} />
              ) : (
                <FontAwesome name="save" size={18} color={COLORS.saveButtonText} style={styles.buttonIcon} />
              )}
              <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Text>
            </TouchableOpacity>

            {/* Botón de Cancelar */}
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.back()}
              disabled={loading}
            >
              <FontAwesome name="times" size={18} color={COLORS.cancelButtonText} style={styles.buttonIcon} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Pantalla de verificación de email */}
      {showEmailVerification && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showEmailVerification}
          onRequestClose={() => setShowEmailVerification(false)} // Esto es para el comportamiento nativo del modal (ej. botón atrás en Android)
        >
          <EmailVerificationScreen 
            onGoBack={() => setShowEmailVerification(false)} // Cambiado de onClose a onGoBack
            onVerified={() => {
              setShowEmailVerification(false);
              handleSave(); // Reintentar guardar después de verificar
            }}
            email={email} // Pasar el email actual
          />
        </Modal>
      )}

      <CustomAlert
        isVisible={customAlertVisible}
        message={customAlertMessage}
        type={customAlertType}
        onClose={handleCloseCustomAlert}
        title={customAlertTitle}
      />
    </View>
  );
}

// Helper function to extract filename from URI
const extractFileName = (uri: string): string | null => {
  if (!uri) return null;
  const parts = uri.split('/');
  return parts[parts.length - 1] || null;
};
