import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  View as RNView,
  Text as RNText
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import { applyToOffer } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

// Theme colors (similar to other screens)
const getThemeColors = (colorScheme: string) => {
  const isDark = colorScheme === 'dark';
  return {
    primary: '#4A2976',
    primaryLight: '#6B46A3',
    primaryDark: '#3d2c52',
    secondary: '#9b6dff',
    accent: '#f6c667',
    background: isDark ? '#121212' : '#f8f9fa',
    text: isDark ? '#f0f0f0' : '#333',
    textLight: isDark ? '#bbbbbb' : '#666',
    error: '#e74c3c',
    success: '#2ecc71',    white: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(43, 31, 60, 0.2)',
    buttonText: '#ffffff',
    disabledButton: '#a0a0a0',
    shadow: 'rgba(0, 0, 0, 0.15)',
    inputBackground: isDark ? '#1e1e1e' : '#ffffff',
    placeholderText: isDark ? '#888888' : '#999999',
    labelText: isDark ? '#ffffff' : '#000000',
    titleText: isDark ? '#ffffff' : '#ffffff',
    buttonPrimaryText: isDark ? '#ffffff' : '#ffffff',
    iconPrimary: isDark ? '#ffffff' : '#ffffff',
  };
};

interface FormErrors {
  phone: string;
  email: string;
  cl: string;
  general: string;
}

export default function ApplyFormScreen() {
  const colorScheme = useColorScheme();
  const COLORS = getThemeColors(colorScheme || 'light');
  const styles = createStyles(COLORS);
  
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const offerId = params.offerId as string;
  const offerTitle = params.offerTitle as string || 'esta oferta';
  
  // Form states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    phone: '',
    email: '',
    cl: '',
    general: ''
  });
  
  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0));
  const [formOpacity] = useState(new Animated.Value(0));
  const [formTranslateY] = useState(new Animated.Value(30));

  useEffect(() => {
    // Initialize form with user data
    if (user) {
      setEmail(user.email || '');
      // You could add phone from user profile if available
      // setPhone(user.phone || '');
    }

    // Start animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user]);

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {
      phone: '',
      email: '',
      cl: '',
      general: ''
    };

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
      isValid = false;
    } else if (phone.trim().length < 9) {
      newErrors.phone = 'El teléfono debe tener al menos 9 dígitos';
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Por favor ingresa un email válido';
        isValid = false;
      }
    }

    // Cover letter validation
    if (!coverLetter.trim()) {
      newErrors.cl = 'La carta de presentación es obligatoria';
      isValid = false;
    } else if (coverLetter.trim().length < 20) {
      newErrors.cl = 'La carta de presentación debe tener al menos 20 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors(prev => ({ ...prev, general: '' }));

      const applicationData = {
        phone: phone.trim(),
        email: email.trim(),
        cl: coverLetter.trim(),
        offer_id: parseInt(offerId),
      };

      await applyToOffer(applicationData);
      
      Alert.alert(
        'Aplicación enviada',
        `Tu aplicación a "${offerTitle}" ha sido enviada exitosamente`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            }
          }
        ]
      );    } catch (error: any) {
      console.error('Error al aplicar a la oferta:', error);
        // Check if the error is about missing CV
      if (error && typeof error === 'object' && error.error === "Debes subir un CV antes de aplicar.") {
        Alert.alert(
          'CV Requerido',
          'Necesitas subir tu CV antes de aplicar a ofertas. Serás redirigido a tu perfil para que puedas subir tu CV.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push('/(tabs)/profile');
              }
            }
          ]
        );
        return;
      }
      
      // Handle different types of API errors
      if (error && typeof error === 'object') {
        if (error.phone) {
          setErrors(prev => ({
            ...prev,
            phone: Array.isArray(error.phone) ? error.phone[0] : error.phone
          }));
        } else if (error.email) {
          setErrors(prev => ({
            ...prev,
            email: Array.isArray(error.email) ? error.email[0] : error.email
          }));
        } else if (error.cl) {
          setErrors(prev => ({
            ...prev,
            cl: Array.isArray(error.cl) ? error.cl[0] : error.cl
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: error.message || 'Hubo un problema al enviar tu aplicación. Por favor, intenta de nuevo.'
          }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'Hubo un problema al enviar tu aplicación. Por favor, intenta de nuevo.'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <View style={styles.headerGradient} />

      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color={COLORS.iconPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Aplicar a Oferta</Text>
        <Text style={styles.subtitle}>Completa tu información para aplicar</Text>
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
          <View style={styles.offerInfoContainer}>
            <FontAwesome name="briefcase" size={20} color={COLORS.secondary} />
            <Text style={styles.offerTitle} numberOfLines={2}>
              {offerTitle}
            </Text>
          </View>

          {/* Phone input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono *</Text>
            <View style={[styles.inputWrapper, errors.phone ? styles.inputError : null]}>
              <FontAwesome name="phone" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tu número de teléfono"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.placeholderText}
                maxLength={15}
              />
            </View>
            {errors.phone ? (
              <Text style={styles.errorText}>
                <FontAwesome name="exclamation-circle" size={14} color={COLORS.error} /> {errors.phone}
              </Text>
            ) : null}
          </View>

          {/* Email input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
              <FontAwesome name="envelope" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.placeholderText}
              />
            </View>
            {errors.email ? (
              <Text style={styles.errorText}>
                <FontAwesome name="exclamation-circle" size={14} color={COLORS.error} /> {errors.email}
              </Text>
            ) : null}
          </View>

          {/* Cover letter input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Carta de Presentación *</Text>
            <View style={[styles.textAreaWrapper, errors.cl ? styles.inputError : null]}>
              <TextInput
                style={styles.textArea}
                placeholder="Explica por qué eres el candidato ideal para esta posición..."
                value={coverLetter}
                onChangeText={setCoverLetter}
                multiline={true}
                numberOfLines={8}
                textAlignVertical="top"
                placeholderTextColor={COLORS.placeholderText}
                maxLength={500}
              />
            </View>
            <Text style={styles.characterCount}>
              {coverLetter.length}/500 caracteres
            </Text>
            {errors.cl ? (
              <Text style={styles.errorText}>
                <FontAwesome name="exclamation-circle" size={14} color={COLORS.error} /> {errors.cl}
              </Text>
            ) : null}
          </View>

          {/* General error message */}
          {errors.general ? (
            <View style={styles.generalErrorContainer}>
              <FontAwesome name="exclamation-triangle" size={20} color={COLORS.error} />
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* Info note */}
          <View style={styles.noteContainer}>
            <FontAwesome name="info-circle" size={18} color={COLORS.secondary} />
            <Text style={styles.noteText}>
              Asegúrate de que tu información sea correcta. Una vez enviada, no podrás modificar tu aplicación.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <RNView style={styles.buttonContent}>
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.iconPrimary} />                ) : (
                  <>
                    <FontAwesome name="paper-plane" size={18} color={COLORS.iconPrimary} style={styles.buttonIconLeft} />
                    <RNText style={styles.buttonPrimaryText}>Enviar Aplicación</RNText>
                  </>
                )}
              </RNView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => router.back()}
              disabled={loading}
              activeOpacity={0.8}
            >
              <RNView style={styles.buttonContent}>
                <FontAwesome name="times" size={18} color={COLORS.primary} style={styles.buttonIconLeft} />
                <RNText style={styles.buttonSecondaryText}>Cancelar</RNText>
              </RNView>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');

const createStyles = (COLORS: ReturnType<typeof getThemeColors>) => StyleSheet.create({
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 1,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.titleText,
    marginBottom: 5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  offerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(155, 109, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(155, 109, 255, 0.2)',
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },  inputContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: COLORS.white,
  },  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: COLORS.labelText,
    letterSpacing: 0.3,
    backgroundColor: COLORS.white,
  },inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.inputBackground,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 10,
  },  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },textAreaWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.inputBackground,
  },  textArea: {
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 5,
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
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(155, 109, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
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
  },  buttonContainer: {
    width: '100%',
    gap: 12,
    backgroundColor: COLORS.white,
  },
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
  },
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },  buttonPrimaryText: {
    color: COLORS.buttonPrimaryText,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonSecondaryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonIconLeft: {
    marginRight: 8,
  },
});