import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, useColorScheme, Dimensions, StatusBar, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import GoogleAuthErrorInfo from '@/components/GoogleAuthErrorInfo';

// Constantes de diseño para temas
const getThemeColors = (colorScheme: string) => {
  const isDark = colorScheme === 'dark';
  return {
    primary: '#4A2976',
    primaryLight: isDark ? '#5e3a8a' : '#3d2c52',
    secondary: '#9b6dff',
    accent: '#f6c667',
    background: isDark ? '#121212' : '#f8f9fa',
    white: isDark ? '#1e1e1e' : '#ffffff',
    title: isDark ? '#f0f0f0' : '#1a1a1a',
    subtitle: isDark ? '#e0e0e0' : '#4a4a4a',
    text: isDark ? '#f0f0f0' : '#1a1a1a',
    lightText: isDark ? '#bbbbbb' : '#4a4a4a',
    error: '#e74c3c',
    success: '#2ecc71',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(43, 31, 60, 0.15)',
    card: isDark ? '#2d2d2d' : '#ffffff',
    shadowColor: isDark ? '#000' : '#000',
    debug: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(43, 31, 60, 0.05)',
    golden: '#fac030',    cardBackground: isDark ? '#2d2d2d' : '#ffffff',    fieldBackground: isDark ? '#333333' : '#f8f8f8',
    inputBackground: isDark ? '#333333' : '#ffffff',
    placeholderText: isDark ? '#888888' : '#999999',    googleButtonBg: isDark ? '#3d3d3d' : '#f5f5f5',
    googleButtonText: isDark ? '#ffffff' : '#333333',
    googleLoadingText: isDark ? '#ffffff' : '#4a4a4a',
    buttonText: '#ffffff',
  };
};

// Crear estilos dinámicos en función del tema
const createStyles = (colors: ReturnType<typeof getThemeColors>) => {
  const { width } = Dimensions.get('window');
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backButton: {
      position: 'absolute' as const,
      top: 50,
      left: 20,
      zIndex: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.cardBackground,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      elevation: 4,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 25,
      paddingBottom: 40,
      minHeight: Dimensions.get('window').height - 100,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
      backgroundColor: 'transparent',
    },
    logoIcon: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      elevation: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      padding: 10,
    },
    logoImage: {
      width: 80,
      height: 80,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.title,
      marginBottom: 8,
      textAlign: 'center',
      backgroundColor: 'transparent',
    },
    subtitle: {
      fontSize: 16,
      color: colors.subtitle,
      textAlign: 'center',
      marginBottom: 10,
      backgroundColor: 'transparent',
    },
    formCard: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 24,
      elevation: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      marginBottom: 20,
    },
    inputContainer: {
      width: '100%',
      marginBottom: 20,
      backgroundColor: 'transparent',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      marginBottom: 16,
      paddingHorizontal: 16,
      height: 56,
      elevation: 2,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    inputWrapperFocused: {
      borderColor: colors.secondary,
      borderWidth: 2,
      elevation: 4,
      shadowOpacity: 0.2,
    },    inputIcon: {
      marginRight: 12,
    },
    eyeIcon: {
      marginLeft: 12,
      padding: 4,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    button: {
      borderRadius: 12,
      marginBottom: 16,
      elevation: 4,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      overflow: 'hidden',
    },
    buttonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 24,
    },
    buttonText: {
      color: colors.buttonText,
      fontWeight: 'bold',
      fontSize: 16,
      backgroundColor: 'transparent',
    },
    googleButton: {
      backgroundColor: colors.googleButtonBg,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 24,
      marginBottom: 16,
      elevation: 4,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    googleIcon: {
      marginRight: 8,
      marginLeft: 2,
      height: 24,
      width: 72,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.error,
      elevation: 2,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    errorText: {
      color: colors.error,
      marginLeft: 8,
      fontSize: 14,
      flex: 1,
      backgroundColor: 'transparent',
    },
    divider: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      backgroundColor: 'transparent',
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      paddingHorizontal: 16,
      color: colors.lightText,
      fontSize: 14,
      fontWeight: '500',
      backgroundColor: 'transparent',
    },
    registerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      backgroundColor: 'transparent',
    },
    registerText: {
      color: colors.lightText,
      fontSize: 16,
      backgroundColor: 'transparent',
    },
    linkText: {
      color: colors.secondary,
      fontWeight: 'bold',
      fontSize: 16,
      backgroundColor: 'transparent',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    loadingText: {
      color: colors.buttonText,
      fontWeight: 'bold',
      fontSize: 16,
      marginLeft: 8,
      backgroundColor: 'transparent',
    },
    googleLoadingText: {
      color: colors.googleLoadingText,
      fontWeight: 'bold',
      fontSize: 16,
      marginLeft: 8,
      backgroundColor: 'transparent',
    },
  });
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();
  const { login: googleLogin, isLoading: googleLoading, error: googleError } = useGoogleAuth();
  
  const colorScheme = useColorScheme();
  const COLORS = getThemeColors(colorScheme || 'light');
  const styles = createStyles(COLORS);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, introduce email y contraseña');
      return;
    }
    
    await login(email, password);
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('Iniciando proceso de login con Google...');
      await googleLogin();
      console.log('Login con Google completado exitosamente');
    } catch (error) {
      console.log('Google login failed:', error instanceof Error ? error.message : error);
      // Error handling is done in the hook
    }
  };  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Botón de volver a Welcome */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/welcome')}
        activeOpacity={0.7}
      >
        <FontAwesome name="arrow-left" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo and Title Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesión en EmpleaWorks</Text>
        </View>
        
        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <View style={[
              styles.inputWrapper,
              emailFocused && styles.inputWrapperFocused
            ]}>
              <FontAwesome 
                name="envelope" 
                size={18} 
                color={emailFocused ? COLORS.secondary : COLORS.lightText} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.placeholderText}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
              <View style={[
              styles.inputWrapper,
              passwordFocused && styles.inputWrapperFocused
            ]}>
              <FontAwesome 
                name="lock" 
                size={20} 
                color={passwordFocused ? COLORS.secondary : COLORS.lightText} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={COLORS.placeholderText}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"}
                  size={18}
                  color={COLORS.lightText}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Error Messages */}
          {error && (
            <View style={styles.errorContainer}>
              <FontAwesome name="exclamation-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {googleError && (
            <View style={styles.errorContainer}>
              <FontAwesome name="exclamation-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{googleError}</Text>
            </View>
          )}
          
          {/* Show detailed info for Google client error */}
          {googleError && <GoogleAuthErrorInfo error={googleError} />}
          
          {/* Login Button */}
          <TouchableOpacity 
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading || googleLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={COLORS.buttonText} size="small" />
                  <Text style={styles.loadingText}>Iniciando...</Text>
                </View>
              ) : (
                <>
                  <FontAwesome name="sign-in" size={18} color={COLORS.buttonText} style={{ marginRight: 10 }} />
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={isLoading || googleLoading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.googleButtonText} size="small" />
                <Text style={styles.googleLoadingText}>Conectando...</Text>
              </View>)
              : (
              <>
                <Text style={[styles.buttonText, { color: COLORS.googleButtonText }]}>Continuar con </Text>
                <Image
                  source={require('@/assets/images/google-logo.png')}
                  style={styles.googleIcon}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      
      {/* Register Link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
          <Text style={styles.linkText}>Regístrate</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 80 }} />
    </ScrollView>
  </View>
  );
};