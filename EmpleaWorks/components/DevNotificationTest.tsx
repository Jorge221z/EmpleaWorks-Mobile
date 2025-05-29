import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AppState, Platform } from 'react-native';
import { useNotificationContext } from '../context/NotificationContext';
import * as Notifications from 'expo-notifications';
import CustomAlert, { AlertType } from './CustomAlert'; // Import CustomAlert

export default function DevNotificationTest() {
  const { sendNotification, scheduleNotification } = useNotificationContext();
  const [appState, setAppState] = useState(AppState.currentState);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Estados para CustomAlert
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<AlertType>('info');
  const [customAlertTitle, setCustomAlertTitle] = useState('');

  // Funciones para manejar CustomAlert
  const showAppAlert = (type: AlertType, message: string, title: string) => {
    setCustomAlertType(type);
    setCustomAlertMessage(message);
    setCustomAlertTitle(title);
    setCustomAlertVisible(true);
  };

  const handleCloseCustomAlert = () => {
    setCustomAlertVisible(false);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
      addTestResult(`📱 Estado de app cambió a: ${nextAppState}`);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const addTestResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${result}`, ...prev.slice(0, 8)]);
  };

  const testBackgroundNotification = async () => {
    try {
      addTestResult('🔄 Preparando test de notificación en background...');
      
      // Programar notificación para 3 segundos
      const trigger: Notifications.TimeIntervalTriggerInput = {
        seconds: 3,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      };

      await scheduleNotification(
        {
          title: '🚀 TEST DEVELOPMENT BUILD',
          body: 'Esta notificación se programó para aparecer en 3 segundos. Pon la app en segundo plano AHORA.',
          data: { 
            test: 'background_dev', 
            timestamp: Date.now(),
            urgent: true 
          },
        },
        trigger
      );

      addTestResult('✅ Notificación programada para 3 segundos');
      addTestResult('⚠️ PON LA APP EN SEGUNDO PLANO AHORA!');
      
      showAppAlert(
        'warning',
        'Notificación programada para 3 segundos.\n\nPon la app en segundo plano AHORA presionando el botón home o cambiando de app para ver la notificación.',
        '⚠️ Instrucción Importante'
      );

    } catch (error) {
      console.error('Error in background test:', error);
      addTestResult('❌ Error en test de background');
      showAppAlert('error', 'Ocurrió un error durante el test de background.', 'Error en Test');
    }
  };

  const testForcedNotification = async () => {
    try {
      addTestResult('🔬 Forzando notificación con API directa...');
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔬 NOTIFICACIÓN FORZADA DEV',
          body: 'Usando API directa de Expo - Development Build',
          data: { 
            forced: true,
            dev: true,
            timestamp: Date.now()
          },
          sound: 'default',
          categoryIdentifier: 'test',
        },
        trigger: null, // Inmediata
      });

      addTestResult(`✅ Notificación forzada enviada: ${notificationId.substring(0, 8)}`);

    } catch (error) {
      console.error('Error in forced notification:', error);
      addTestResult('❌ Error en notificación forzada');
    }
  };

  const testChannelNotification = async () => {
    try {
      addTestResult('📺 Probando notificación con canal específico...');
      
      // Crear canal de alta prioridad para desarrollo
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('dev-test', {
          name: 'Development Test',
          importance: Notifications.AndroidImportance.MAX,
          description: 'Canal para pruebas en desarrollo',
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0000',
          showBadge: true,
        });
        
        addTestResult('✅ Canal de desarrollo creado');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📺 TEST CANAL DESARROLLO',
          body: 'Notificación con canal de máxima prioridad',
          data: { channel: 'dev-test' },
          sound: 'default',
          ...(Platform.OS === 'android' && { channelId: 'dev-test' }),
        },
        trigger: null,
      });

      addTestResult('✅ Notificación con canal enviada');

    } catch (error) {
      console.error('Error in channel notification:', error);
      addTestResult('❌ Error en notificación de canal');
    }
  };

  const checkNotificationSettings = async () => {
    try {
      addTestResult('🔍 Verificando configuración completa...');
      
      const permissions = await Notifications.getPermissionsAsync();
      addTestResult(`📋 Permisos: ${permissions.status} (granted: ${permissions.granted})`);
      
      if (Platform.OS === 'android') {
        addTestResult(`📱 Importancia: ${permissions.android?.importance}`);
      }

      const channels = await Notifications.getNotificationChannelsAsync();
      addTestResult(`📺 Canales: ${channels.length}`);
      
      channels.forEach(channel => {
        addTestResult(`  - ${channel.name}: importancia ${channel.importance}`);
      });

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      addTestResult(`⏰ Programadas: ${scheduled.length}`);

    } catch (error) {
      console.error('Error checking settings:', error);
      addTestResult('❌ Error verificando configuración');
    }
  };

  const clearAll = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setTestResults([]);
      addTestResult('🧹 Todo limpiado');
    } catch (error) {
      addTestResult('❌ Error limpiando');
    }
  };

  return (
    <View style={styles.container}>
      <CustomAlert
        isVisible={customAlertVisible}
        message={customAlertMessage}
        type={customAlertType}
        onClose={handleCloseCustomAlert}
        title={customAlertTitle}
      />
      <Text style={styles.title}>🧪 Test Development Build</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Estado App: {appState}</Text>
        <Text style={styles.statusText}>
          {appState === 'active' ? '✅ Primer plano' : '🔔 Background/Inactive'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backgroundButton} onPress={testBackgroundNotification}>
          <Text style={styles.buttonText}>🔄 Test Background (3s)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forcedButton} onPress={testForcedNotification}>
          <Text style={styles.buttonText}>🔬 Forzar Notificación</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.channelButton} onPress={testChannelNotification}>
          <Text style={styles.buttonText}>📺 Test Canal Dev</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkButton} onPress={checkNotificationSettings}>
          <Text style={styles.buttonText}>🔍 Verificar Config</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
          <Text style={styles.buttonText}>🧹 Limpiar</Text>
        </TouchableOpacity>
      </View>

      {testResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📊 Resultados:</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))}
        </View>
      )}

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📝 Instrucciones para Development:</Text>
        <Text style={styles.instructionText}>
          1. Usa "Test Background" y pon la app en segundo plano inmediatamente
        </Text>
        <Text style={styles.instructionText}>
          2. Las notificaciones pueden no aparecer en primer plano en dev builds
        </Text>
        <Text style={styles.instructionText}>
          3. Revisa el panel de notificaciones del dispositivo
        </Text>
        <Text style={styles.instructionText}>
          4. Para mejores resultados, haz un build de producción
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    margin: 10,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#856404',
  },
  statusContainer: {
    backgroundColor: '#d4edda',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  statusText: {
    fontSize: 14,
    color: '#155724',
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 15,
  },
  backgroundButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  forcedButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  channelButton: {
    backgroundColor: '#6f42c1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',
    maxHeight: 150,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#495057',
  },
  resultText: {
    fontSize: 11,
    color: '#6c757d',
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  instructionsContainer: {
    backgroundColor: '#e2e3e5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d6d8db',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#495057',
  },
  instructionText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
});
