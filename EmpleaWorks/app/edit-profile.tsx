import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  Image, 
  Animated,
  Dimensions,
  Platform,
  View as RNView
} from 'react-native';
import { Text } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, getProfile } from '@/api/axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { FontAwesome } from '@expo/vector-icons';

// Constantes de diseño
const COLORS = {
  primary: '#4A2976',
  primaryLight: '#3d2c52',
  secondary: '#9b6dff',
  accent: '#f6c667',
  background: '#f8f9fa',
  text: '#333',
  lightText: '#888',
  error: '#e74c3c',
  success: '#2ecc71',
  white: '#ffffff',
  border: 'rgba(43, 31, 60, 0.2)',
  buttonText: '#ffffff',
  disabledButton: '#a0a0a0',
  inputBackground: 'rgba(255, 255, 255, 0.9)'
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
const LinearGradient = (props) => {
  try {
    return <ExpoLinearGradient {...props} />;
  } catch (error) {
    console.warn('LinearGradient error, using fallback View:', error);
    return <RNView style={[props.style, { backgroundColor: COLORS.primary }]}>{props.children}</RNView>;
  }
};

export default function EditProfileScreen() {
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
  const [imageRemoved, setImageRemoved] = useState(false); // Nuevo estado para rastrear si la imagen fue eliminada

  // Añadir estados para rastrear si un campo se ha modificado
  const [newCvSelected, setNewCvSelected] = useState(false);
  const [newImageSelected, setNewImageSelected] = useState(false);

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

  // Función para seleccionar imagen de la galería
  const pickImage = async () => {
    try {
      setUploadingImage(true);
      
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tu galería');
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
        
        // Guardar toda la información de la imagen, no solo la URI
        setProfileImage(selectedImage.uri);

        //
        const fileExtension = selectedImage.uri.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
          Alert.alert(
            'Formato no soportado', 
            'Por favor selecciona una imagen en formato JPG, PNG o GIF.'
          );
          return;
        }
        
        setNewImageSelected(true);
        console.log('Imagen seleccionada:', selectedImage.uri, 'tipo:', selectedImage.type || 'desconocido');
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo cargar la imagen');
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
        setNewCvSelected(true); // Marcamos que se ha seleccionado un nuevo CV
        console.log('Documento seleccionado:', selectedFile.uri);
      }
    } catch (error) {
      console.error('Error seleccionando CV:', error);
      Alert.alert('Error', 'No se pudo cargar el documento');
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
    Alert.alert(
      'Eliminar imagen de perfil',
      '¿Estás seguro de que quieres eliminar tu foto de perfil actual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => {
            setProfileImage(null);
            setImageRemoved(true); // Marcamos que la imagen ha sido eliminada explícitamente
            setNewImageSelected(true); // Marcamos que ha habido un cambio en la imagen
            console.log('Imagen de perfil eliminada');
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    logUserData(); // Imprimir datos actuales para depuración
    
    try {
      console.log('Preparando datos para actualización de perfil');
      
      // Crear un objeto FormData para enviar archivos correctamente
      const formData = new FormData();
      
      // Añadir campos de texto básicos
      if (name) formData.append('name', name);
      if (surname) formData.append('surname', surname);
      if (email) formData.append('email', email);
      if (description) formData.append('description', description);
      
      // Procesar la imagen si se seleccionó una nueva o se eliminó
      if (newImageSelected) {
        if (imageRemoved || !profileImage) {
          // Enfoque corregido: no enviamos 'null' al campo image, sino un campo separado
          // que indique la eliminación
          formData.append('delete_image', '1');
          console.log('Solicitando eliminación de imagen de perfil con delete_image=1');
        } else if (profileImage) {
          console.log('Preparando imagen para subir...');
          
          // Obtenemos datos del archivo
          const uri = profileImage;
          const uriParts = uri.split('.');
          const fileExtension = uriParts[uriParts.length - 1];
          
          // Creamos el objeto para la imagen que el servidor puede procesar
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
          // Si se quitó el CV (está a null), usamos un campo específico para indicar la eliminación
          formData.append('delete_cv', '1');
          console.log('Solicitando eliminación de CV con delete_cv=1');
        }
      }
      
      console.log('Enviando datos de actualización con FormData');
      
      const updated = await updateProfile(formData);
      console.log('Perfil actualizado correctamente');
      
      // Actualizamos el usuario en el contexto si está disponible
      if (setUser) {
        console.log('Actualizando usuario en el contexto');
        setUser(updated.user || updated);
        
        // Forzar limpieza de imágenes en cache si la imagen fue eliminada
        if (imageRemoved) {
          // Intentar limpiar cualquier referencia a la imagen anterior en el contexto
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
      
      // Limpiar cualquier dato en caché del perfil
      try {
        await AsyncStorage.removeItem('edit_profile_data');
        // Opcionalmente, borrar otros datos en caché relacionados con el perfil
      } catch (e) {
        console.error('Error limpiando caché:', e);
      }
      
      Alert.alert('Perfil actualizado', 'Tus datos han sido guardados.', [
        {
          text: 'OK',
          onPress: () => {
            // Forzar una recarga completa al volver a la pantalla de perfil
            router.replace({
              pathname: '/(tabs)/profile',
              params: { refresh: 'true', timestamp: Date.now().toString() }
            });
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error en actualización de perfil:', error);
      
      // Mostrar mensaje de error más detallado si está disponible
      if (error?.errors) {
        const errorMessages = Object.entries(error.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
          .join('\n');
        
        Alert.alert('Error al guardar', errorMessages);
      } else {
        Alert.alert('Error', error?.message || 'No se pudo actualizar el perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerGradient} />
      
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
            {/* Selector de imagen de perfil */}
            <View style={styles.imageSection}>
              <View style={styles.profileImageWrapper}>
                <Animated.View 
                  style={[
                    styles.profileImageContainer,
                    { transform: [{ scale: imageScale }] }
                  ]}
                >
                  <TouchableOpacity 
                    style={styles.profileImageTouchable} 
                    onPress={pickImage}
                    disabled={uploadingImage}
                    activeOpacity={0.8}
                  >
                    {profileImage ? (
                      <Image 
                        source={{ uri: profileImage }} 
                        style={styles.profileImage} 
                        defaultSource={require('@/assets/images/default-avatar.png')}
                        onError={(e) => {
                          console.log('Error loading profile image:', e.nativeEvent.error);
                          setProfileImage(null);
                        }}
                      />
                    ) : (
                      <Image 
                        source={require('@/assets/images/default-avatar.png')} 
                        style={styles.profileImage} 
                      />
                    )}
                    {uploadingImage ? (
                      <View style={styles.imageOverlay}>
                        <ActivityIndicator color="#fff" size="small" />
                      </View>
                    ) : (
                      <View style={styles.imageOverlay}>
                        <FontAwesome name="camera" size={24} color="#fff" />
                        <Text style={styles.changeImageText}>Cambiar</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>

                {/* Botón para eliminar la imagen de perfil */}
                {profileImage && !uploadingImage && (
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={removeProfileImage}
                  >
                    <FontAwesome name="trash" size={16} color="#fff" />
                    <Text style={styles.removeImageText}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

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
                <FontAwesome name="user" size={18} color={COLORS.primary} style={styles.inputIcon} />
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
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome name="envelope" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.lightText}
                />
              </View>
            </View>
            
            {/* Selector de CV */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Curriculum Vitae</Text>
              <View style={styles.cvContainer}>
                <TouchableOpacity 
                  style={styles.cvButton}
                  onPress={pickCV}
                  disabled={uploadingCV}
                >
                  {uploadingCV ? (
                    <ActivityIndicator color={COLORS.secondary} />
                  ) : (
                    <>
                      <FontAwesome name="file-pdf-o" size={24} color={COLORS.primary} style={styles.cvIcon} />
                      <Text 
                        style={styles.cvButtonText}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {cvName ? cvName : "Seleccionar CV"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Botón para quitar el CV si existe uno seleccionado */}
                {cvName ? (
                  <TouchableOpacity 
                    style={styles.removeCvButton}
                    onPress={removeCV}
                    disabled={uploadingCV}
                  >
                    <FontAwesome name="times" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            
            {/* Nota explicativa */}
            <View style={styles.noteContainer}>
              <FontAwesome name="info-circle" size={18} color={COLORS.secondary} />
              <Text style={styles.noteText}>
                Solo los campos que modifiques serán actualizados. Los demás se mantendrán con sus valores actuales.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Cuéntanos sobre ti..."
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={COLORS.lightText}
                />
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.buttonDisabled]} 
              onPress={handleSave} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <FontAwesome name="check" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.push('/profile')} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 0,
    backgroundColor: COLORS.primary,
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
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
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: width - 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.primary,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: COLORS.white,
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
    color: COLORS.white,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  removeImageButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  removeImageText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.inputBackground,
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textAreaWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.inputBackground,
  },
  textArea: {
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
  },
  cvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(155, 109, 255, 0.05)',
  },
  cvButtonText: {
    color: COLORS.primary,
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
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabledButton,
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
