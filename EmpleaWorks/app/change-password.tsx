import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  // Alert, // Reemplazado para notificaciones
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Alert } from 'react-native'; // Mantener para confirmaciones
import { Text } from '@/components/Themed';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { updatePassword, getPasswordSettings } from '@/api/axios';
import { useEmailVerificationGuard } from '@/hooks/useEmailVerification';
import EmailVerificationScreen from '@/components/EmailVerificationScreen';
import { useColorScheme } from '@/components/useColorScheme';
import CustomAlert, { AlertType } from '@/components/CustomAlert'; // Importar CustomAlert

// Helper function to get theme-based colors
const getThemeColors = (colorScheme: string | null | undefined) => {
  const isDark = colorScheme === 'dark';
  return {
    primary: '#4A2976',
    primaryLight: isDark ? '#5e3a8a' : '#6B46A3',
    primaryDark: '#3d2c52',
    secondary: '#9b6dff',
    accent: '#f6c667',
    background: isDark ? '#121212' : '#f8f9fa',
    cardBackground: isDark ? '#1e1e1e' : '#ffffff',
    text: isDark ? '#f0f0f0' : '#333',
    lightText: isDark ? '#bbbbbb' : '#666',
    error: '#e74c3c',
    success: '#2ecc71',
    border: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(43, 31, 60, 0.2)',
    buttonText: '#ffffff',
    buttonSecondaryText: isDark ? '#f0f0f0' : '#4A2976',
    disabledButton: '#a0a0a0',
    shadowColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.15)',
    inputBackground: isDark ? '#2d2d2d' : 'rgba(255, 255, 255, 0.8)',
    iconColor: isDark ? '#b794f6' : '#4A2976',
    headerTitleColor: '#ffffff',
    errorBackground: isDark ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)',
    infoBackground: isDark ? 'rgba(155, 109, 255, 0.2)' : 'rgba(155, 109, 255, 0.1)',
    infoBorder: isDark ? 'rgba(155, 109, 255, 0.4)' : 'rgba(155, 109, 255, 0.3)',
    white: isDark ? '#1e1e1e' : '#ffffff',
  };
};

export default function ChangePasswordScreen() {
  const colorScheme = useColorScheme();
  const COLORS = getThemeColors(colorScheme);
  const styles = createStyles(COLORS);

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

  // Funciones para CustomAlert
  const showAppAlert = (type: AlertType, message: string, title?: string, onCloseCallback?: () => void) => {
    setCustomAlertType(type);
    setCustomAlertMessage(message);
    setCustomAlertTitle(title);
    setCustomAlertVisible(true);
    if (onCloseCallback) {
      setCustomAlertOnCloseCallback(() => onCloseCallback); // Asegúrate de que esto envuelva la función
    } else {
      setCustomAlertOnCloseCallback(null);
    }
  };

  const handleCloseCustomAlert = () => {
    setCustomAlertVisible(false);
    if (customAlertOnCloseCallback) {
      const callback = customAlertOnCloseCallback; // Copia el callback antes de limpiarlo
      setCustomAlertOnCloseCallback(null); 
      callback(); // Ejecuta el callback
    }
  };

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
      // Usar CustomAlert para notificar que no se puede cambiar la contraseña para usuarios de Google
      showAppAlert(
        'info',
        'No puedes cambiar la contraseña porque tu cuenta está vinculada a Google. Gestiona tu contraseña a través de tu cuenta de Google.',
        'No permitido'
      );
      return;
    }

    // 🔒 VERIFICACIÓN DE EMAIL REQUERIDA
    console.log('🔒 Verificando email antes de cambiar contraseña...');
    
    const verificationResult = await checkBeforeAction('cambiar contraseña');
    
    if (verificationResult.needsVerification) {
      console.log('🚫 Email no verificado, mostrando pantalla de verificación');
      setShowEmailVerification(true);
      return;
    }
    
    console.log('✅ Email verificado, procediendo con cambio de contraseña');

    if (!validateForm()) {
      // Los errores de validación se muestran en el formulario, no se necesita alerta aquí
      return;
    }

    try {
      setLoading(true);
      await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });

      showAppAlert('success', 'Tu contraseña ha sido actualizada correctamente', 'Éxito', () => {
        router.back();
      });

    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);

      let errorMessage = 'Error al actualizar la contraseña';
      if (error && typeof error === 'object') {
        if (error.current_password) {
          setErrors(prev => ({
            ...prev,
            currentPassword: Array.isArray(error.current_password)
              ? error.current_password[0]
              : 'La contraseña actual es incorrecta'
          }));
          errorMessage = Array.isArray(error.current_password) ? error.current_password[0] : 'La contraseña actual es incorrecta';
        } else if (error.password) {
          setErrors(prev => ({
            ...prev,
            newPassword: Array.isArray(error.password)
              ? error.password[0]
              : 'Error en la nueva contraseña'
          }));
          errorMessage = Array.isArray(error.password) ? error.password[0] : 'Error en la nueva contraseña';
        } else if (error.error && typeof error.error === 'object') {
          const errorMessagesObj: Record<string, string> = {};
          let firstMessage = '';
          Object.keys(error.error).forEach(key => {
            if (key === 'current_password' && Array.isArray(error.error.current_password)) {
              errorMessagesObj.currentPassword = error.error.current_password[0];
              if(!firstMessage) firstMessage = error.error.current_password[0];
            } else if (key === 'password' && Array.isArray(error.error.password)) {
              errorMessagesObj.newPassword = error.error.password[0];
              if(!firstMessage) firstMessage = error.error.password[0];
            }
          });
          setErrors(prev => ({ ...prev, ...errorMessagesObj }));
          errorMessage = firstMessage || 'Error en los datos ingresados.';
        } else if (typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      // Mostrar el error general con CustomAlert si no se manejó específicamente en los campos
      if (!errors.currentPassword && !errors.newPassword) {
         showAppAlert('error', errorMessage, 'Error al Actualizar');
      }
      // Si hay errores específicos de campo, estos se mostrarán en el formulario.
      // Si el error es más genérico (ej. error.message), se muestra con CustomAlert.
      // La lógica actual de setErrors ya actualiza los mensajes junto a los campos.
      // Solo mostramos un CustomAlert genérico si no hay errores específicos de campo que ya se estén mostrando.
      const fieldErrorsPresent = errors.currentPassword || errors.newPassword || errors.confirmPassword;
      if (!fieldErrorsPresent && errorMessage) {
        showAppAlert('error', errorMessage, 'Error al Actualizar');
      } else if (fieldErrorsPresent) {
        // Si hay errores de campo, podemos opcionalmente mostrar una alerta genérica también
        // o confiar en que el usuario vea los errores en los campos.
        // Por ahora, si hay errores de campo, no mostraremos una alerta genérica adicional
        // para evitar redundancia, a menos que el error sea muy general.
        if (errorMessage === 'Error al actualizar la contraseña' || (error && error.message && !error.current_password && !error.password)){
            showAppAlert('error', errorMessage, 'Error');
        }
      }

    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.loaderCard}>
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
                No puedes cambiar la contraseña porque tu cuenta está vinculada a Google.
                Por favor, gestiona tu contraseña a través de tu cuenta de Google.
              </Text>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => router.push('/profile')}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContentSimple}>
                  <Text style={styles.buttonSecondaryText}>Volver al Perfil</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña Actual</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome name="lock" size={20} color={COLORS.iconColor} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tu contraseña actual"
                    placeholderTextColor={COLORS.lightText}
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={(text) => { setCurrentPassword(text); if(errors.currentPassword) setErrors(prev => ({...prev, currentPassword: ''})); if(errors.general) setErrors(prev => ({...prev, general: ''})); }}
                  />
                </View>
                {errors.currentPassword ? <Text style={styles.errorText}>{errors.currentPassword}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nueva Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome name="key" size={20} color={COLORS.iconColor} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor={COLORS.lightText}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={(text) => { setNewPassword(text); if(errors.newPassword) setErrors(prev => ({...prev, newPassword: ''})); if(errors.general) setErrors(prev => ({...prev, general: ''})); }}
                  />
                </View>
                {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome name="key" size={20} color={COLORS.iconColor} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repite la nueva contraseña"
                    placeholderTextColor={COLORS.lightText}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); if(errors.confirmPassword) setErrors(prev => ({...prev, confirmPassword: ''})); if(errors.general) setErrors(prev => ({...prev, general: ''})); }}
                  />
                </View>
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
              </View>

              {errors.general && !errors.currentPassword && !errors.newPassword && !errors.confirmPassword ? (
                <View style={styles.generalErrorContainer}>
                  <FontAwesome name="exclamation-circle" size={20} color={COLORS.error} style={styles.inputIcon} />
                  <Text style={styles.generalErrorText}>{errors.general}</Text>
                </View>
              ) : null}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonContent}>
                    {loading ? (
                      <ActivityIndicator color={COLORS.buttonText} />
                    ) : (
                      <>
                        <FontAwesome name="save" size={18} color={COLORS.buttonText} style={styles.buttonIconLeft} />
                        <Text style={styles.buttonPrimaryText}>Guardar Cambios</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonSecondary}
                  onPress={() => router.back()}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonContentSimple}>
                     <FontAwesome name="times" size={18} color={COLORS.buttonSecondaryText} style={styles.buttonIconLeft} />
                    <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Modal de Verificación de Email */}
      <Modal
        visible={showEmailVerification}
        animationType="slide"
        presentationStyle="pageSheet" // Mantenido como estaba
        onRequestClose={() => setShowEmailVerification(false)} // Acción al cerrar el modal (ej. botón atrás Android)
      >
        <EmailVerificationScreen
          email={verificationState?.email} // Asumiendo que verificationState tiene el email
          onGoBack={() => setShowEmailVerification(false)} // Para el botón de "volver" dentro del componente
          onVerified={() => { // Se llama cuando el usuario cierra el modal, implicando que pudo haber verificado
            setShowEmailVerification(false);
            handleSubmit(); // Reintentar el submit después de que el usuario interactuó con la verificación
          }}
          showAsModal={true}
        />
      </Modal>

      <CustomAlert
        isVisible={customAlertVisible}
        message={customAlertMessage}
        type={customAlertType}
        onClose={handleCloseCustomAlert}
        title={customAlertTitle}
      />
    </KeyboardAvoidingView>
  );
}

// Create styles dynamically based on theme
const createStyles = (COLORS: ReturnType<typeof getThemeColors>) => {
  const { width } = Dimensions.get('window');
  return StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
      backgroundColor: COLORS.background,
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
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 20,
      alignItems: 'center',
      zIndex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loaderCard: {
      backgroundColor: COLORS.cardBackground,
      padding: 25,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
      shadowColor: COLORS.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.headerTitleColor,
      marginBottom: 5,
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    formContainer: {
      backgroundColor: COLORS.cardBackground,
      borderRadius: 15,
      padding: 20,
      marginTop: 15,
      marginBottom: 30,
      elevation: 5,
      shadowColor: COLORS.shadowColor,
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
      backgroundColor: COLORS.inputBackground,
      paddingHorizontal: 12,
    },
    inputIcon: {
      marginRight: 10,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      fontWeight: '600',
      color: COLORS.text,
      letterSpacing: 0.3,
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
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
      backgroundColor: COLORS.errorBackground,
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
    buttonContainer: {
      width: '100%',
      marginTop: 30,
      marginBottom: 10,
      gap: 16,
    },
    buttonPrimary: {
      backgroundColor: COLORS.primary,
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderRadius: 14,
      width: '100%',
      elevation: 4,
      shadowColor: COLORS.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      borderWidth: 0,
    },
    buttonSecondary: {
      backgroundColor: COLORS.cardBackground,
      borderWidth: 2,
      borderColor: COLORS.primary,
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderRadius: 14,
      width: '100%',
      elevation: 2,
      shadowColor: COLORS.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    buttonDisabled: {
      backgroundColor: COLORS.disabledButton,
      elevation: 1,
      shadowOpacity: 0.1,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContentSimple: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPrimaryText: {
      color: COLORS.buttonText,
      fontWeight: '700',
      fontSize: 17,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    buttonSecondaryText: {
      color: COLORS.buttonSecondaryText,
      fontWeight: '700',
      fontSize: 17,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
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
      backgroundColor: COLORS.infoBackground,
      borderRadius: 15,
      padding: 25,
      width: '100%',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.infoBorder,
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
};