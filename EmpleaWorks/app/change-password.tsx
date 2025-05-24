import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { getPasswordSettings, updatePassword } from '@/api/axios';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  });

  // Cargar la configuración de contraseña
  useEffect(() => {
    const loadPasswordSettings = async () => {
      try {
        setInitialLoading(true);
        const settings = await getPasswordSettings();
        setIsGoogleUser(settings.isGoogleUser || false);
        
        // Eliminamos el Alert redundante - el mensaje ya se muestra en la interfaz
      } catch (error) {
        console.error('Error al cargar configuración de contraseña:', error);
        setErrors(prev => ({
          ...prev,
          general: 'No se pudo cargar la configuración de contraseña'
        }));
      } finally {
        setInitialLoading(false);
      }
    };

    loadPasswordSettings();
  }, []);

  // Validar el formulario antes de enviar
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    };

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria';
      isValid = false;
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
      isValid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Manejar el envío del formulario
  const handleSubmit = async () => {
    if (isGoogleUser) {
      Alert.alert(
        'No permitido',
        'No puedes cambiar la contraseña porque tu cuenta está vinculada a Google.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });

      Alert.alert(
        'Éxito',
        'Tu contraseña ha sido actualizada correctamente',
        [{ text: 'Aceptar', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);

      // Manejar diferentes tipos de errores de la API
      if (error.current_password) {
        setErrors(prev => ({
          ...prev,
          currentPassword: error.current_password[0] || 'La contraseña actual es incorrecta'
        }));
      } else if (error.password) {
        setErrors(prev => ({
          ...prev,
          newPassword: error.password[0] || 'Error en la nueva contraseña'
        }));
      } else if (error.error && typeof error.error === 'object') {
        // Manejar estructuras de error anidadas
        const errorMessages = {};
        Object.keys(error.error).forEach(key => {
          if (key === 'current_password') {
            errorMessages.currentPassword = error.error[key][0];
          } else if (key === 'password') {
            errorMessages.newPassword = error.error[key][0];
          }
        });
        setErrors(prev => ({ ...prev, ...errorMessages }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: typeof error === 'string' 
            ? error 
            : error.message || 'Error al actualizar la contraseña'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Cambiar Contraseña</Text>
          
          {isGoogleUser ? (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                No puedes cambiar la contraseña porque tu cuenta está vinculada a Google.{"\n"}
                Por favor, gestiona tu contraseña a través de tu cuenta de Google.
              </Text>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => router.push('/profile')}
              >
                <Text style={styles.buttonSecondaryText}>Volver al Perfil</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña Actual</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Ingresa tu contraseña actual"
                />
                {errors.currentPassword ? (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nueva Contraseña</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Ingresa tu nueva contraseña"
                />
                {errors.newPassword ? (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirma tu nueva contraseña"
                />
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              {errors.general ? (
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              ) : null}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.buttonSecondary}
                  onPress={() => router.back()}
                  disabled={loading}
                >
                  <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Guardar Cambios</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    width: '100%',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 5,
  },
  generalErrorText: {
    color: '#dc3545',
    fontSize: 16,
    marginVertical: 15,
    textAlign: 'center',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSecondary: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  buttonSecondaryText: {
    color: '#6c757d',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    color: '#555',
  },
});
