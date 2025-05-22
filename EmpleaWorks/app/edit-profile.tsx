import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { Text } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, getProfile } from '@/api/axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { FontAwesome } from '@expo/vector-icons';

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

  // Añadir estados para rastrear si un campo se ha modificado
  const [newCvSelected, setNewCvSelected] = useState(false);
  const [newImageSelected, setNewImageSelected] = useState(false);

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
      
      // Procesar la imagen si se seleccionó una nueva
      if (newImageSelected && profileImage) {
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
          // Si se quitó el CV (está a null), enviamos null explícitamente
          formData.append('cv', 'null');
          console.log('Solicitando eliminación de CV');
        }
      }
      
      console.log('Enviando datos de actualización con FormData');
      
      const updated = await updateProfile(formData);
      console.log('Perfil actualizado correctamente');
      
      // Actualizamos el usuario en el contexto si está disponible
      if (setUser) {
        console.log('Actualizando usuario en el contexto');
        setUser(updated.user || updated);
      }
      
      Alert.alert('Perfil actualizado', 'Tus datos han sido guardados.', [
        {
          text: 'OK',
          onPress: () => {
            router.replace({
              pathname: '/(tabs)/profile',
              params: { refresh: 'true' }
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
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Editar Perfil</Text>
        
        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Cargando información...</Text>
          </View>
        ) : (
          <>
            {/* Selector de imagen de perfil */}
            <View style={styles.imageSection}>
              <TouchableOpacity 
                style={styles.profileImageContainer} 
                onPress={pickImage}
                disabled={uploadingImage}
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
                    <ActivityIndicator color="#fff" />
                  </View>
                ) : (
                  <View style={styles.imageOverlay}>
                    <FontAwesome name="camera" size={24} color="#fff" />
                    <Text style={styles.changeImageText}>Cambiar</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

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
            
            {/* Selector de CV */}
            <Text style={styles.inputLabel}>Curriculum Vitae</Text>
            <View style={styles.cvContainer}>
              <TouchableOpacity 
                style={styles.cvButton}
                onPress={pickCV}
                disabled={uploadingCV}
              >
                {uploadingCV ? (
                  <ActivityIndicator color="#007bff" />
                ) : (
                  <>
                    <FontAwesome name="file-pdf-o" size={24} color="#007bff" style={styles.cvIcon} />
                    <Text style={styles.cvButtonText}>
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
                  <FontAwesome name="times" size={20} color="#dc3545" />
                </TouchableOpacity>
              ) : null}
            </View>
            
            {/* Nota explicativa */}
            <Text style={styles.noteText}>
              Nota: Solo los campos que modifiques serán actualizados. Los demás se mantendrán con sus valores actuales.
            </Text>

            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Cuéntanos sobre ti..."
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#E1E1E1',
    position: 'relative',
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
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16, 
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    height: 120,
  },
  cvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cvButton: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cvButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  cvIcon: {
    marginRight: 10, // Add space between the icon and text
  },
  removeCvButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  noteText: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 12,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  cancelButton: { 
    alignItems: 'center', 
    padding: 12 
  },
  cancelButtonText: { 
    color: '#007bff', 
    fontSize: 16 
  },
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
