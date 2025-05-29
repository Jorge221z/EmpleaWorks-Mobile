import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import CustomAlert, { AlertType } from './CustomAlert'; // Import CustomAlert

export default function NotificationDebugger() {
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [appState, setAppState] = useState(AppState.currentState);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastError, setLastError] = useState<string>('');

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
    checkEverything();
    setupAppStateListener();
    setupNotificationListeners();
  }, []);

  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('📱 App state changed:', nextAppState);
      setAppState(nextAppState);
    });

    return () => subscription?.remove();
  };

  const setupNotificationListeners = () => {
    // Listener para notificaciones recibidas
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 NOTIFICACIÓN RECIBIDA:', notification);
      setNotificationCount(prev => prev + 1);
      
      // Mostrar alert si la app está en primer plano
      if (appState === 'active') {
        showAppAlert(
          'info',
          `${notification.request.content.title}\n${notification.request.content.body}`,
          '🔔 Notificación Recibida'
        );
      }
    });

    // Listener para respuestas a notificaciones
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 NOTIFICACIÓN TOCADA:', response);
      showAppAlert(
        'info',
        `${response.notification.request.content.title}`,
        '👆 Notificación Tocada'
      );
    });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  };

  const checkEverything = async () => {
    try {
      // Verificar permisos
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      console.log('📋 Permisos:', status);

      // Verificar configuración del canal en Android
      if (Platform.OS === 'android') {
        const channels = await Notifications.getNotificationChannelsAsync();
        console.log('📺 Canales disponibles:', channels.length);
        channels.forEach(channel => {
          console.log(`   - ${channel.name}: ${channel.importance}`);
        });
      }

      // Verificar notificaciones programadas
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('⏰ Notificaciones programadas:', scheduled.length);    } catch (error) {
      console.error('Error checking everything:', error);
      setLastError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };
  const testImmediateNotification = async () => {
    try {
      setLastError('');
      console.log('🚀 Enviando notificación inmediata...');

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚀 Test Inmediato',
          body: `Enviada a las ${new Date().toLocaleTimeString()} (App: ${appState})`,
          data: { 
            test: 'immediate',
            timestamp: Date.now(),
            appState: appState
          },
          sound: 'default',
        },
        trigger: null,
      });

      console.log('✅ Notificación enviada, ID:', notificationId);
      
    } catch (error) {
      console.error('❌ Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setLastError(errorMsg);
      showAppAlert('error', errorMsg, 'Error');
    }
  };
  const testScheduledNotification = async () => {
    try {
      setLastError('');
      console.log('⏰ Programando notificación para 5 segundos...');

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Test Programado',
          body: `Programada desde ${appState} state`,
          data: { 
            test: 'scheduled',
            timestamp: Date.now()
          },
          sound: 'default',
        },
        trigger: {
          seconds: 5,
        } as Notifications.TimeIntervalTriggerInput,
      });

      console.log('✅ Notificación programada, ID:', notificationId);
      showAppAlert('success', 'Notificación en 5 segundos\nPrueba minimizando la app', '✅ Programada');
      
    } catch (error) {
      console.error('❌ Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setLastError(errorMsg);
      showAppAlert('error', errorMsg, 'Error');
    }
  };
  const testWithAppBackground = async () => {
    try {
      setLastError('');
      
      // Programar notificación para 3 segundos
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📱 Test Background',
          body: 'Esta notificación fue programada antes de minimizar',
          sound: 'default',
        },
        trigger: {
          seconds: 3,
        } as Notifications.TimeIntervalTriggerInput,
      });

      showAppAlert(
        'info',
        'Notificación programada para 3 segundos\n\n¡MINIMIZA LA APP AHORA!',
        '📱 Test Background'
      );
      
    } catch (error) {
      console.error('❌ Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setLastError(errorMsg);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync();
      setNotificationCount(0);
      showAppAlert('success', 'Todas las notificaciones canceladas', '✅ Limpiado');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      showAppAlert('error', 'No se pudieron limpiar las notificaciones', 'Error');
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
      <Text style={styles.title}>🔬 Debugger de Notificaciones</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>📋 Permisos: {permissionStatus}</Text>
        <Text style={styles.infoText}>📱 App State: {appState}</Text>
        <Text style={styles.infoText}>🔔 Notificaciones: {notificationCount}</Text>
        {lastError ? (
          <Text style={styles.errorText}>❌ Error: {lastError}</Text>
        ) : null}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.immediateButton]} onPress={testImmediateNotification}>
          <Text style={styles.buttonText}>🚀 Test Inmediato</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.scheduledButton]} onPress={testScheduledNotification}>
          <Text style={styles.buttonText}>⏰ Test 5 Segundos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.backgroundButton]} onPress={testWithAppBackground}>
          <Text style={styles.buttonText}>📱 Test Background</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearAllNotifications}>
          <Text style={styles.buttonText}>🧹 Limpiar Todo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.checkButton]} onPress={checkEverything}>
          <Text style={styles.buttonText}>🔍 Verificar Estado</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instructions}>
        📝 Instrucciones:{'\n'}
        1. Test Inmediato: debería mostrar alert{'\n'}
        2. Test 5 Segundos: espera 5 segundos{'\n'}
        3. Test Background: minimiza después de tocar{'\n'}
        4. Revisa los logs en la consola
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    margin: 10,
    borderWidth: 2,
    borderColor: '#4169e1',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4169e1',
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: '#e6f3ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    fontStyle: 'italic',
  },
  buttonsContainer: {
    gap: 10,
    marginBottom: 15,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  immediateButton: {
    backgroundColor: '#ff6b6b',
  },
  scheduledButton: {
    backgroundColor: '#4ecdc4',
  },
  backgroundButton: {
    backgroundColor: '#45b7d1',
  },
  clearButton: {
    backgroundColor: '#96ceb4',
  },
  checkButton: {
    backgroundColor: '#ffeaa7',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructions: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
  },
});
