import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import GoogleAuthErrorInfo from '@/components/GoogleAuthErrorInfo';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const { login: googleLogin, isLoading: googleLoading, error: googleError } = useGoogleAuth();

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
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {googleError && <Text style={styles.errorText}>{googleError}</Text>}
      
      {/* Show detailed info for Google client error */}
      {googleError && <GoogleAuthErrorInfo error={googleError} />}
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading || googleLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={handleGoogleLogin}
        disabled={isLoading || googleLoading}
      >
        {googleLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <FontAwesome name="google" size={18} color="white" style={styles.googleIcon} />
            <Text style={styles.buttonText}>Iniciar Sesión con Google</Text>
          </>
        )}
      </TouchableOpacity>
      
      <View style={styles.registerContainer}>
        <Text>¿No tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.linkText}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    width: '100%',
  },
  button: {
    backgroundColor: '#7c28eb',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    marginTop: 15,
  },
  googleIcon: {
    marginRight: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  linkText: {
    color: '#7c28eb',
    fontWeight: 'bold',
  },
});