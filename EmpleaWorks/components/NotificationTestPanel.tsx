import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useNotificationContext } from '../context/NotificationContext';
import * as Notifications from 'expo-notifications';

export default function NotificationTestPanel() {
  const { expoPushToken, isInitialized, sendNotification, scheduleNotification, cancelNotification, clearBadgeCount, setBadgeCount } = useNotificationContext();
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<string[]>([]);
  useEffect(() => {
    // Listener para notificaciones recibidas
    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
      setLastNotification(notification);
      setNotificationCount(prev => prev + 1);
      addTestResult(`✅ Notificación recibida: ${notification.request.content.title}`);
    });

    // Listener para cuando el usuario toca una notificación
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación tocada:', response);
      addTestResult(`👆 Usuario tocó notificación: ${response.notification.request.content.title}`);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const addTestResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${result}`, ...prev.slice(0, 4)]);
  };
  const testBasicNotification = async () => {
    try {
      addTestResult('🔄 Preparando notificación básica...');
      
      // Verificar permisos primero
      const permissions = await Notifications.getPermissionsAsync();
      addTestResult(`📋 Permisos: ${permissions.status}`);
      
      if (permissions.status !== 'granted') {
        addTestResult('❌ Permisos no concedidos');
        Alert.alert('Error', 'Los permisos de notificación no están concedidos');
        return;
      }

      addTestResult('📤 Enviando notificación...');
      await sendNotification({
        title: '🔔 Notificación de prueba',
        body: 'Esta es una notificación de prueba básica',
        data: { test: true, timestamp: Date.now() },
      });
      
      addTestResult('✅ Notificación enviada correctamente');    } catch (error) {
      console.error('Error sending notification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addTestResult(`❌ Error: ${errorMessage}`);
      Alert.alert('Error', `No se pudo enviar la notificación: ${errorMessage}`);
    }
  };
  const testJobOfferNotification = async () => {
    try {
      addTestResult('🎯 Enviando notificación de oferta de trabajo...');
      await sendNotification({
        title: '🎯 Nueva Oferta de Trabajo',
        body: 'Desarrollador React Native en TechCorp',
        data: { type: 'new_job_offer', offerId: '12345' },
      });
      addTestResult('✅ Notificación de oferta enviada');
    } catch (error) {
      console.error('Error sending notification:', error);
      addTestResult('❌ Error enviando notificación de oferta');
      Alert.alert('Error', 'No se pudo enviar la notificación');
    }
  };

  const testApplicationStatusNotification = async () => {
    try {
      addTestResult('📋 Enviando notificación de estado de aplicación...');
      await sendNotification({
        title: '✅ ¡Tu aplicación fue aceptada!',
        body: 'Para el puesto de Desarrollador Frontend en TechCorp',
        data: { type: 'application_status', applicationId: 'app123', status: 'accepted' },
      });
      addTestResult('✅ Notificación de estado enviada');
    } catch (error) {
      console.error('Error sending notification:', error);
      addTestResult('❌ Error enviando notificación de estado');
      Alert.alert('Error', 'No se pudo enviar la notificación');
    }
  };  const testScheduledNotification = async () => {
    try {
      addTestResult('⏰ Programando notificación para 5 segundos...');
      const trigger: Notifications.TimeIntervalTriggerInput = {
        seconds: 5,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      };
      const notificationId = await scheduleNotification(
        {
          title: '⏰ Notificación Programada',
          body: 'Esta notificación fue programada hace 5 segundos',
          data: { type: 'scheduled', scheduledAt: new Date().toISOString() },
        },
        trigger
      );
      setScheduledNotifications(prev => [...prev, notificationId]);
      addTestResult(`✅ Notificación programada con ID: ${notificationId.substring(0, 8)}...`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      addTestResult('❌ Error programando notificación');
      Alert.alert('Error', 'No se pudo programar la notificación');
    }
  };
  const testMultipleNotifications = async () => {
    try {
      addTestResult('🔄 Enviando múltiples notificaciones...');
      
      const notifications = [
        { title: '1️⃣ Primera notificación', body: 'Mensaje 1' },
        { title: '2️⃣ Segunda notificación', body: 'Mensaje 2' },
        { title: '3️⃣ Tercera notificación', body: 'Mensaje 3' },
      ];

      for (let i = 0; i < notifications.length; i++) {
        await sendNotification({
          ...notifications[i],
          data: { batch: true, index: i + 1 },
        });
        // Pequeña pausa entre notificaciones
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      addTestResult('✅ Múltiples notificaciones enviadas');
    } catch (error) {
      console.error('Error sending multiple notifications:', error);
      addTestResult('❌ Error enviando múltiples notificaciones');
      Alert.alert('Error', 'No se pudieron enviar las notificaciones');
    }
  };

  const testBadgeNotifications = async () => {
    try {
      addTestResult('🔴 Probando badge notifications...');
      
      // Establecer badge a 5
      await setBadgeCount(5);
      addTestResult('✅ Badge establecido a 5');
      
      // Enviar notificación que debería incrementar el badge
      await sendNotification({
        title: '🔴 Notificación con Badge',
        body: 'Esta notificación debería mostrar un badge',
        data: { type: 'badge_test' },
      });
      
      // Esperar un poco y luego limpiar el badge
      setTimeout(async () => {
        await clearBadgeCount();
        addTestResult('✅ Badge limpiado');
      }, 3000);
      
    } catch (error) {
      console.error('Error testing badge notifications:', error);
      addTestResult('❌ Error en test de badge');
    }
  };
  const testNotificationUtils = async () => {
    try {
      addTestResult('🛠️ Probando NotificationUtils...');
      const { NotificationUtils } = await import('../utils/notificationUtils');
      
      // Test nueva oferta de trabajo
      await NotificationUtils.newJobOffer('Desarrollador Frontend', 'TechCorp', 'job123');
      addTestResult('✅ Test nueva oferta enviado');
      
      // Test estado de aplicación
      await NotificationUtils.applicationStatusUpdate('Desarrollador Backend', 'accepted', 'app456');
      addTestResult('✅ Test estado aplicación enviado');
      
      // Test recordatorio de perfil
      await NotificationUtils.profileReminder();
      addTestResult('✅ Test recordatorio perfil enviado');
      
    } catch (error) {
      console.error('Error testing NotificationUtils:', error);
      addTestResult('❌ Error en test de NotificationUtils');
    }
  };

  const testInteractiveNotification = async () => {
    try {
      addTestResult('🎮 Enviando notificación interactiva...');
      await sendNotification({
        title: '🎮 Notificación Interactiva',
        body: 'Toca esta notificación para interactuar',
        data: { 
          type: 'interactive',
          action: 'open_app',
          screen: '/profile'
        },
      });
      addTestResult('✅ Notificación interactiva enviada');
    } catch (error) {
      console.error('Error sending interactive notification:', error);
      addTestResult('❌ Error enviando notificación interactiva');
    }
  };

  const testNotificationPermissions = async () => {
    try {
      addTestResult('🔐 Verificando permisos de notificaciones...');
      
      const settings = await Notifications.getPermissionsAsync();
      const canAskAgain = settings.canAskAgain;
      const granted = settings.granted;
      const status = settings.status;
      
      addTestResult(`📋 Estado actual: ${status}`);
      addTestResult(`✅ Permisos concedidos: ${granted ? 'Sí' : 'No'}`);
      addTestResult(`🔄 Puede preguntar de nuevo: ${canAskAgain ? 'Sí' : 'No'}`);
      
      if (!granted && canAskAgain) {
        addTestResult('🔄 Solicitando permisos...');
        const newSettings = await Notifications.requestPermissionsAsync();
        addTestResult(`📋 Nuevo estado: ${newSettings.status}`);
      }
      
    } catch (error) {
      console.error('Error checking permissions:', error);
      addTestResult('❌ Error verificando permisos');
    }
  };

  const testNotificationChannels = async () => {
    try {
      addTestResult('📺 Probando canales de notificación (Android)...');
      
      if (Platform.OS === 'android') {
        // Get notification channels
        const channels = await Notifications.getNotificationChannelsAsync();
        addTestResult(`📋 Canales encontrados: ${channels.length}`);
        
        channels.forEach((channel, index) => {
          addTestResult(`${index + 1}. ${channel.name} (${channel.importance})`);
        });
        
        // Create a test channel
        await Notifications.setNotificationChannelAsync('test-channel', {
          name: 'Canal de Prueba',
          importance: Notifications.AndroidImportance.HIGH,
          description: 'Canal para pruebas de notificaciones',
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
        });
        
        addTestResult('✅ Canal de prueba creado');
        
        // Send notification to test channel
        await sendNotification({
          title: '📺 Notificación del Canal de Prueba',
          body: 'Esta notificación usa el canal personalizado',
          data: { channel: 'test-channel' },
        });
        
      } else {
        addTestResult('ℹ️ Los canales son específicos de Android');
      }
      
    } catch (error) {
      console.error('Error testing notification channels:', error);
      addTestResult('❌ Error probando canales');
    }
  };

  const runAllTests = async () => {
    if (isRunningTests) return;
    
    setIsRunningTests(true);
    addTestResult('🚀 Iniciando batería completa de tests...');
    
    try {
      await testBasicNotification();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testJobOfferNotification();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testApplicationStatusNotification();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testScheduledNotification();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testBadgeNotifications();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testNotificationUtils();
      
      addTestResult('🎉 Todos los tests completados!');
    } catch (error) {
      addTestResult('❌ Error en batería de tests');
    } finally {
      setIsRunningTests(false);
    }
  };

  const cancelAllScheduled = async () => {
    try {
      const scheduledList = await Notifications.getAllScheduledNotificationsAsync();
      addTestResult(`📋 ${scheduledList.length} notificaciones programadas encontradas`);
      
      if (scheduledList.length > 0) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        setScheduledNotifications([]);
        addTestResult('🗑️ Todas las notificaciones programadas canceladas');
      }
    } catch (error) {
      console.error('Error canceling scheduled notifications:', error);
      addTestResult('❌ Error cancelando notificaciones programadas');
    }
  };

  const showScheduledNotifications = async () => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const count = scheduled.length;
      
      if (count === 0) {
        Alert.alert('Notificaciones Programadas', 'No hay notificaciones programadas');
        return;
      }
      
      const notificationsList = scheduled.map((notif, index) => 
        `${index + 1}. ${notif.content.title} - ${notif.trigger}`
      ).join('\n');
      
      Alert.alert(
        'Notificaciones Programadas',
        `Total: ${count}\n\n${notificationsList}`,
        [{ text: 'OK' }]
      );
      
      addTestResult(`📋 ${count} notificaciones programadas mostradas`);
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      addTestResult('❌ Error obteniendo notificaciones programadas');
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
    setNotificationCount(0);
    addTestResult('🧹 Resultados limpiados');
  };

  const showTokenInfo = () => {
    const tokenText = expoPushToken 
      ? (expoPushToken.length > 50 ? `${expoPushToken.substring(0, 50)}...` : expoPushToken)
      : 'No hay token disponible';
    
    Alert.alert(
      'Token de Push',
      `Token: ${tokenText}`,
      [{ text: 'OK' }]
    );
  };

  const testDirectExpoAPI = async () => {
    try {
      addTestResult('🔬 Probando API directa de Expo...');
      
      // Verificar permisos
      const permissions = await Notifications.getPermissionsAsync();
      addTestResult(`📋 Permisos actuales: ${permissions.status}`);
      
      if (permissions.status !== 'granted') {
        addTestResult('🔄 Solicitando permisos...');
        const newPermissions = await Notifications.requestPermissionsAsync();
        addTestResult(`📋 Nuevos permisos: ${newPermissions.status}`);
        
        if (newPermissions.status !== 'granted') {
          addTestResult('❌ No se obtuvieron permisos');
          Alert.alert('Error', 'No se pudieron obtener permisos de notificación');
          return;
        }
      }

      // Enviar notificación directamente con Expo API
      addTestResult('📤 Enviando notificación directa...');
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔬 Prueba API Directa',
          body: 'Esta notificación usa directamente la API de Expo',
          data: { 
            test: 'direct_expo_api',
            timestamp: Date.now(),
            source: 'direct_test'
          },
          sound: 'default',
        },
        trigger: null,
      });

      addTestResult(`✅ Notificación directa enviada. ID: ${notificationId.substring(0, 8)}...`);
      
      // Verificar si hay notificaciones pendientes
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      addTestResult(`📋 ${scheduled.length} notificaciones programadas en total`);
        } catch (error) {
      console.error('Error in direct Expo API test:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addTestResult(`❌ Error en prueba directa: ${errorMessage}`);
      Alert.alert('Error', `Prueba directa falló: ${errorMessage}`);
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Inicializando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Pruebas de Notificaciones</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Estado: {expoPushToken ? '✅ Configurado' : '❌ No configurado'}
        </Text>
        <TouchableOpacity style={styles.tokenButton} onPress={showTokenInfo}>
          <Text style={styles.buttonText}>Ver Token</Text>
        </TouchableOpacity>
      </View>      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={testBasicNotification}>
          <Text style={styles.buttonText}>🔔 Notificación Básica</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testJobOfferNotification}>
          <Text style={styles.buttonText}>🎯 Nueva Oferta de Trabajo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testApplicationStatusNotification}>
          <Text style={styles.buttonText}>📋 Estado de Aplicación</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testScheduledNotification}>
          <Text style={styles.buttonText}>⏰ Notificación Programada (5s)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testMultipleNotifications}>
          <Text style={styles.buttonText}>🔄 Múltiples Notificaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testBadgeNotifications}>
          <Text style={styles.buttonText}>🔴 Test Badge</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testNotificationUtils}>
          <Text style={styles.buttonText}>🛠️ Test NotificationUtils</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testInteractiveNotification}>
          <Text style={styles.buttonText}>🎮 Notificación Interactiva</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testNotificationPermissions}>
          <Text style={styles.buttonText}>🔐 Verificar Permisos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testNotificationChannels}>
          <Text style={styles.buttonText}>📺 Test Canales (Android)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runAllTests}
          disabled={isRunningTests}
        >
          <Text style={styles.buttonText}>
            {isRunningTests ? '🔄 Ejecutando...' : '🚀 Ejecutar Todos los Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#FF5722' }]} onPress={testDirectExpoAPI}>
          <Text style={styles.buttonText}>🔬 Test API Directa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.utilityButtonsContainer}>
        <TouchableOpacity style={styles.utilityButton} onPress={showScheduledNotifications}>
          <Text style={styles.utilityButtonText}>📋 Ver Programadas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.utilityButton} onPress={cancelAllScheduled}>
          <Text style={styles.utilityButtonText}>🗑️ Cancelar Todas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.utilityButton} onPress={clearTestResults}>
          <Text style={styles.utilityButtonText}>🧹 Limpiar</Text>
        </TouchableOpacity>
      </View>

      {testResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📊 Resultados de Tests:</Text>
          <View style={styles.notificationCounter}>
            <Text style={styles.counterText}>
              📬 Notificaciones recibidas: {notificationCount}
            </Text>
          </View>
          <ScrollView style={styles.resultsScrollView} nestedScrollEnabled={true}>
            {testResults.map((result, index) => (
              <Text key={index} style={styles.resultItem}>{result}</Text>
            ))}
          </ScrollView>
        </View>
      )}

      {lastNotification && (
        <View style={styles.lastNotificationContainer}>
          <Text style={styles.lastNotificationTitle}>📨 Última Notificación:</Text>
          <Text style={styles.lastNotificationText}>
            {lastNotification.request.content.title}
          </Text>
          <Text style={styles.lastNotificationBody}>
            {lastNotification.request.content.body}
          </Text>
        </View>
      )}
      
      <Text style={styles.infoText}>
        💡 Las notificaciones aparecerán en la barra de notificaciones del dispositivo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  tokenButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonsContainer: {
    gap: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  utilsButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleButton: {
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  multipleButton: {
    backgroundColor: '#00BCD4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeButton: {
    backgroundColor: '#E91E63',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  interactiveButton: {
    backgroundColor: '#673AB7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionsButton: {
    backgroundColor: '#795548',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  channelsButton: {
    backgroundColor: '#607D8B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  runAllButton: {
    backgroundColor: '#8BC34A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#FFC107',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  listButton: {
    backgroundColor: '#9E9E9E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonTextSmall: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  notificationContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  notificationContent: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  tokenText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  utilityButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  utilityButton: {
    backgroundColor: '#9E9E9E',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  utilityButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  notificationCounter: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  counterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  resultsScrollView: {
    maxHeight: 150,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    padding: 8,
  },
  lastNotificationContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  lastNotificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E7D32',
  },
  lastNotificationText: {
    fontSize: 13,
    color: '#388E3C',
    fontWeight: '600',
    marginBottom: 4,
  },
  lastNotificationBody: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
