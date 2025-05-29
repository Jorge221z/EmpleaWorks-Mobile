import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configurar el handler de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function SimpleNotificationTest() {
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [lastNotification, setLastNotification] = useState<string>('');

  useEffect(() => {
    checkPermissions();
    setupListeners();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      console.log('📋 Estado de permisos:', status);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionStatus('error');
    }
  };

  const setupListeners = () => {
    // Listener para notificaciones recibidas
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificación recibida:', notification);
      setLastNotification(`Recibida: ${notification.request.content.title}`);
    });

    // Listener para respuestas a notificaciones
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notificación tocada:', response);
      setLastNotification(`Tocada: ${response.notification.request.content.title}`);
    });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  };

  const requestPermissions = async () => {
    try {
      console.log('🔄 Solicitando permisos...');
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      setPermissionStatus(status);
      console.log('📋 Nuevos permisos:', status);
      
      if (status === 'granted') {
        Alert.alert('Éxito', 'Permisos concedidos');
      } else {
        Alert.alert('Error', 'Permisos denegados');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'No se pudieron solicitar permisos');
    }
  };

  const setupAndroidChannel = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('📱 Configurando canal de Android...');
        await Notifications.setNotificationChannelAsync('test-channel', {
          name: 'Canal de Prueba',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });
        console.log('✅ Canal configurado');
        Alert.alert('Éxito', 'Canal de Android configurado');
      } catch (error) {
        console.error('Error setting up Android channel:', error);
        Alert.alert('Error', 'No se pudo configurar el canal');
      }
    } else {
      Alert.alert('Info', 'Los canales son específicos de Android');
    }
  };

  const sendSimpleNotification = async () => {
    try {
      if (permissionStatus !== 'granted') {
        Alert.alert('Error', 'Los permisos no están concedidos');
        return;
      }

      console.log('📤 Enviando notificación simple...');
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Prueba Simple',
          body: `Notificación enviada a las ${new Date().toLocaleTimeString()}`,
          data: { 
            test: true,
            timestamp: Date.now()
          },
          sound: 'default',
        },
        trigger: null, // Inmediata
      });

      console.log('✅ Notificación enviada, ID:', notificationId);
      setLastNotification(`Enviada: ${notificationId.substring(0, 8)}...`);
      
    } catch (error) {
      console.error('Error sending notification:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudo enviar: ${errorMsg}`);
    }
  };

  const sendScheduledNotification = async () => {
    try {
      if (permissionStatus !== 'granted') {
        Alert.alert('Error', 'Los permisos no están concedidos');
        return;
      }

      console.log('⏰ Programando notificación para 3 segundos...');
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Notificación Programada',
          body: 'Esta notificación fue programada hace 3 segundos',
          data: { 
            scheduled: true,
            timestamp: Date.now()
          },
          sound: 'default',
        },        trigger: {
          seconds: 3,
        } as Notifications.TimeIntervalTriggerInput,
      });

      console.log('✅ Notificación programada, ID:', notificationId);
      Alert.alert('Programada', 'Notificación programada para 3 segundos');
      
    } catch (error) {
      console.error('Error scheduling notification:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudo programar: ${errorMsg}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔬 Test Simple de Notificaciones</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Permisos: {permissionStatus === 'granted' ? '✅' : '❌'} {permissionStatus}
        </Text>
      </View>

      {lastNotification ? (
        <View style={styles.lastNotificationContainer}>
          <Text style={styles.lastNotificationText}>Última actividad:</Text>
          <Text style={styles.lastNotificationBody}>{lastNotification}</Text>
        </View>
      ) : null}

      <View style={styles.buttonsContainer}>
        {permissionStatus !== 'granted' && (
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={requestPermissions}>
            <Text style={styles.buttonText}>🔐 Solicitar Permisos</Text>
          </TouchableOpacity>
        )}

        {Platform.OS === 'android' && (
          <TouchableOpacity style={[styles.button, styles.androidButton]} onPress={setupAndroidChannel}>
            <Text style={styles.buttonText}>📱 Configurar Canal Android</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.button, permissionStatus !== 'granted' && styles.disabledButton]} 
          onPress={sendSimpleNotification}
          disabled={permissionStatus !== 'granted'}
        >
          <Text style={styles.buttonText}>🔔 Notificación Inmediata</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.scheduleButton, permissionStatus !== 'granted' && styles.disabledButton]} 
          onPress={sendScheduledNotification}
          disabled={permissionStatus !== 'granted'}
        >
          <Text style={styles.buttonText}>⏰ Notificación en 3s</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 Si no ves notificaciones, verifica:
        </Text>
        <Text style={styles.infoText}>• Permisos del sistema</Text>
        <Text style={styles.infoText}>• Configuración "No molestar"</Text>
        <Text style={styles.infoText}>• Consola para logs de debug</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lastNotificationContainer: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  lastNotificationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  lastNotificationBody: {
    fontSize: 12,
    color: '#388E3C',
  },
  buttonsContainer: {
    gap: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  androidButton: {
    backgroundColor: '#FF9800',
  },
  scheduleButton: {
    backgroundColor: '#9C27B0',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  infoText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 2,
  },
});
