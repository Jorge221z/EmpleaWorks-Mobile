import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import Logger from '../utils/logger';

interface GoogleAuthErrorInfoProps {
  error: string;
}

export default function GoogleAuthErrorInfo({ error }: GoogleAuthErrorInfoProps) {
  // Check which type of error we're dealing with
  const isGoogleClientError = error && (
    error.includes("Google_Client") || 
    error.includes("google/apiclient") ||
    error.includes("El servidor no tiene instalada la biblioteca de Google")
  );
  
  const isInvalidTokenError = error && (
    error.includes("Token inválido") ||
    error.includes("Invalid token") ||
    error.includes("token invalid")
  );

  // If not a recognized Google error, don't show anything
  if (!isGoogleClientError && !isInvalidTokenError) {
    return null;
  }

  const openGoogleCloudConsole = () => {
    Linking.openURL('https://console.cloud.google.com/apis/credentials');
  };
  
  const openGoogleDocumentation = () => {
    Linking.openURL('https://github.com/googleapis/google-api-php-client');
  };

  // Get client IDs from app configuration
  const webClientId = Constants.expoConfig?.extra?.googleWebClientId || 'No configurado';
  const androidClientId = Constants.expoConfig?.extra?.googleAndroidClientId || 'No configurado';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isGoogleClientError ? "⚠️ Error en el Servidor" : "⚠️ Error de Autenticación Google"}
      </Text>
      
      {isGoogleClientError && (
        <>
          <Text style={styles.subtitle}>Problema Detectado:</Text>
          <Text style={styles.description}>
            El servidor backend no tiene instalada la biblioteca de Google API Client para PHP.
          </Text>

          <Text style={styles.subtitle}>Detalles Técnicos:</Text>
          <Text style={styles.code}>Class "Google_Client" not found</Text>
          
          <Text style={styles.subtitle}>Solución (para administrador del servidor):</Text>
          <View style={styles.steps}>
            <Text style={styles.step}>1. Accede al servidor</Text>
            <Text style={styles.step}>2. Ejecuta este comando en la raíz del proyecto Laravel:</Text>
            <Text style={styles.code}>composer require google/apiclient:^2.12.1</Text>
            <Text style={styles.step}>3. Reinicia el servidor web (Apache/Nginx)</Text>
          </View>
          
          <TouchableOpacity onPress={openGoogleDocumentation} style={styles.docsButton}>
            <Text style={styles.docsButtonText}>Ver Documentación de Google API Client</Text>
          </TouchableOpacity>
        </>
      )}
      
      {isInvalidTokenError && (
        <>
          <Text style={styles.subtitle}>Problema Detectado:</Text>
          <Text style={styles.description}>
            El servidor está rechazando el token de autenticación de Google como inválido.
            Según el código del servidor, esto ocurre cuando el Client ID configurado en el 
            servidor no coincide con el Client ID usado para obtener el token.
          </Text>

          <Text style={styles.subtitle}>Detalles del Servidor:</Text>
          <Text style={styles.description}>          El controlador GoogleController.php está usando la variable de entorno 
            GOOGLE_CLIENT_ID_MOBILE para verificar el token:
          </Text>
          <Text style={styles.code}>
            {`$client = new Google_Client(['client_id' => env('GOOGLE_CLIENT_ID_MOBILE')]);`}
          </Text>
          
          <Text style={styles.subtitle}>Cliente IDs en la App:</Text>
          <View style={styles.steps}>
            <Text style={styles.step}>• Web Client ID: </Text>
            <Text style={styles.code}>{webClientId}</Text>
            <Text style={styles.step}>• Android Client ID: </Text>
            <Text style={styles.code}>{androidClientId}</Text>
          </View>
          
          <Text style={styles.subtitle}>Solución (para administrador del servidor):</Text>
          <View style={styles.steps}>
            <Text style={styles.step}>1. Verifica que la variable GOOGLE_CLIENT_ID_MOBILE en el archivo .env del servidor tenga el mismo valor que el Web Client ID mostrado arriba.</Text>
            <Text style={styles.step}>2. Alternativa: Si estás usando un OAuth Client configurado específicamente para dispositivos móviles, asegúrate de que ese ID esté configurado en la app en app.json.</Text>
            <Text style={styles.step}>3. Reinicia el servidor web después de hacer cambios en el archivo .env</Text>
          </View>
          
          <TouchableOpacity onPress={openGoogleCloudConsole} style={styles.docsButton}>
            <Text style={styles.docsButtonText}>Abrir Google Cloud Console</Text>
          </TouchableOpacity>
        </>
      )}
      
      <Text style={styles.noteTitle}>Nota Importante:</Text>
      <Text style={styles.note}>
        La autenticación Google está funcionando correctamente en la app móvil.
        El problema está en la verificación del token en el servidor.
        Comparte esta información con el administrador del servidor para resolver el problema.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 10,
    maxHeight: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#dc3545',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#212529',
  },
  description: {
    fontSize: 14,
    color: '#343a40',
    lineHeight: 20,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 4,
    fontSize: 12,
    color: '#dc3545',
    marginVertical: 8,
  },
  steps: {
    marginVertical: 8,
  },
  step: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
    lineHeight: 20,
  },
  docsButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 12,
  },
  docsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#212529',
  },
  note: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});