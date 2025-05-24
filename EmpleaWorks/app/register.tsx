import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import GoogleAuthErrorInfo from '@/components/GoogleAuthErrorInfo';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error } = useAuth();
  const { login: googleLogin, isLoading: googleLoading, error: googleError } = useGoogleAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Por favor, completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    const userData = {
      name,
      email,
      password,
      password_confirmation: confirmPassword,
      role: 'candidate', // Siempre será candidato
    };
    
    await register(userData);
  };

  const handleGoogleRegister = async () => {
    try {
      console.log('Iniciando registro/login con Google...');
      await googleLogin(); // Utiliza la misma función que para login
      console.log('Registro/login con Google completado exitosamente');
    } catch (error) {
      console.log('Google auth failed:', error instanceof Error ? error.message : error);
      // El manejo de errores se realiza en el hook
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Crear Cuenta</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          
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
          
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        {googleError && <Text style={styles.errorText}>{googleError}</Text>}
        
        {/* Mostrar información detallada para errores de cliente de Google */}
        {googleError && <GoogleAuthErrorInfo error={googleError} />}
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRegister}
          disabled={isLoading || googleLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarme</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleRegister}
          disabled={isLoading || googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome name="google" size={18} color="white" style={styles.googleIcon} />
              <Text style={styles.buttonText}>Continuar con Google</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
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
    marginTop: 10,
  },
  googleIcon: {
    marginRight: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  linkText: {
    color: '#7c28eb',
    fontWeight: 'bold',
  },
  divider: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#757575',
  },
});