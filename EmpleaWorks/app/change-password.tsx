import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  View as RNView,
  Text as RNText
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { getPasswordSettings, updatePassword } from '@/api/axios';
import { FontAwesome } from '@expo/vector-icons';

// Enhanced design constants
const COLORS = {
  primary: '#4A2976',
  primaryLight: '#6B46A3',
  primaryDark: '#3d2c52',
  secondary: '#9b6dff',
  accent: '#f6c667',
  background: '#f8f9fa',
  text: '#333',
  textLight: '#666',
  error: '#e74c3c',
  success: '#2ecc71',
  white: '#ffffff',
  border: 'rgba(43, 31, 60, 0.2)',
  buttonText: '#ffffff',
  buttonSecondaryText: '#4A2976',
  disabledButton: '#a0a0a0',
  shadow: 'rgba(0, 0, 0, 0.15)'
};

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

  // Animaciones
  const fadeAnim = useState(new Animated.Value(0))[0];
  const formOpacity = useState(new Animated.Value(0))[0];
  const formTranslateY = useState(new Animated.Value(50))[0];

  useEffect(() => {
    // Animación de entrada
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ]).start();
  }, []);

  // Cargar la configuración de contraseña
  useEffect(() => {
    const loadPasswordSettings = async () => {
      try {
        setInitialLoading(true);
        const settings = await getPasswordSettings();
        setIsGoogleUser(settings.isGoogleUser || false);
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
    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);

      // Manejar diferentes tipos de errores de la API
      if (error && typeof error === 'object') {
        if (error.current_password) {
          setErrors(prev => ({
            ...prev,
            currentPassword: Array.isArray(error.current_password)
              ? error.current_password[0]
              : 'La contraseña actual es incorrecta'
          }));
        } else if (error.password) {
          setErrors(prev => ({
            ...prev,
            newPassword: Array.isArray(error.password)
              ? error.password[0]
              : 'Error en la nueva contraseña'
          }));
        } else if (error.error && typeof error.error === 'object') {
          // Manejar estructuras de error anidadas
          const errorMessages: Record<string, string> = {};
          Object.keys(error.error).forEach(key => {
            if (key === 'current_password' && Array.isArray(error.error.current_password)) {
              errorMessages.currentPassword = error.error.current_password[0];
            } else if (key === 'password' && Array.isArray(error.error.password)) {
              errorMessages.newPassword = error.error.password[0];
            }
          });
          setErrors(prev => ({ ...prev, ...errorMessages }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: typeof error.message === 'string'
              ? error.message
              : 'Error al actualizar la contraseña'
          }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'Error al actualizar la contraseña'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Cargando configuración...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <View style={styles.headerGradient} />

      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Cambiar Contraseña</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }]
            }
          ]}
        >
          {isGoogleUser ? (
            <View style={styles.infoContainer}>
              <FontAwesome name="google" size={40} color={COLORS.secondary} style={styles.googleIcon} />
              <Text style={styles.infoText}>
                No puedes cambiar la contraseña porque tu cuenta está vinculada a Google.{"\n"}
                Por favor, gestiona tu contraseña a través de tu cuenta de Google.
              </Text>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => router.push('/profile')}
                activeOpacity={0.8}
              >
                <RNView style={styles.buttonContentSimple}>
                  <FontAwesome name="arrow-left" size={18} color={COLORS.buttonSecondaryText} style={styles.buttonIconLeft} />
                  <RNText style={styles.buttonSecondaryText}>Volver al Perfil</RNText>
                </RNView>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña Actual</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome name="lock" size={18} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Ingresa tu contraseña actual"
                    placeholderTextColor="#999"
                  />
                </View>
                {errors.currentPassword ? (
                  <Text style={styles.errorText}>
                    <FontAwesome name="exclamation-circle" size={14} color={COLORS.error} /> {errors.currentPassword}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nueva Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome name="key" size={18} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Ingresa tu nueva contraseña"
                    placeholderTextColor="#999"
                  />
                </View>
                {errors.newPassword ? (
                  <Text style={styles.errorText}>
                    <FontAwesome name="exclamation-circle" size={14} color={COLORS.error} /> {errors.newPassword}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome name="key" size={18} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirma tu nueva contraseña"
                    placeholderTextColor="#999"
                  />
                </View>
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>
                    <FontAwesome name="exclamation-circle" size={14} color={COLORS.error} /> {errors.confirmPassword}
                  </Text>
                ) : null}
              </View>

              {errors.general ? (
                <View style={styles.generalErrorContainer}>
                  <FontAwesome name="exclamation-triangle" size={20} color={COLORS.error} />
                  <Text style={styles.generalErrorText}>{errors.general}</Text>
                </View>
              ) : null}

              {/* Enhanced Vertical Button Layout */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <RNView style={styles.buttonContent}>
                    {loading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <>
                        <FontAwesome name="check" size={18} color={COLORS.white} style={styles.buttonIconLeft} />
                        <RNText style={styles.buttonPrimaryText}>Guardar Cambios</RNText>
                      </>
                    )}
                  </RNView>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonSecondary}
                  onPress={() => router.push('/profile')}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <RNView style={styles.buttonContent}>
                    <FontAwesome name="arrow-left" size={18} color={COLORS.buttonSecondaryText} style={styles.buttonIconLeft} />
                    <RNText style={styles.buttonSecondaryText}>Cancelar</RNText>
                  </RNView>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 0,
    backgroundColor: COLORS.primary,
  },
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 5,
    fontWeight: '500',
  },
  generalErrorContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  generalErrorText: {
    color: COLORS.error,
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },

  // Enhanced Vertical Button Layout
  buttonContainer: {
    width: '100%',
    marginTop: 30,
    marginBottom: 10,
    gap: 16, // Space between buttons
  },

  // Primary Button (Save Changes)
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 0,
  },

  // Secondary Button (Cancel)
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  buttonDisabled: {
    backgroundColor: COLORS.disabledButton,
    elevation: 1,
    shadowOpacity: 0.1,
  },

  // Button Content Container
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  buttonContentSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  // Button Text Styles
  buttonPrimaryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },

  buttonSecondaryText: {
    color: COLORS.buttonSecondaryText,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },

  // Icon Positioning
  buttonIconLeft: {
    marginRight: 10,
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: 'rgba(155, 109, 255, 0.1)',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 109, 255, 0.3)',
  },
  googleIcon: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
    color: COLORS.text,
    fontWeight: '500',
  },
});