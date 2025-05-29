import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('🔔 Manejando notificación en primer plano:', notification.request.content.title);
    console.log('📱 Estado de la app: primer plano');
    console.log('🎯 Configuración de notificación:', {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    });
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;  /**
   * Inicializar el servicio de notificaciones
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔧 Inicializando servicio de notificaciones...');

      // Primero configurar el canal de Android
      if (Platform.OS === 'android') {
        console.log('📱 Configurando canal de Android...');
        await Notifications.setNotificationChannelAsync('default', {
          name: 'EmpleaWorks Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });
        console.log('✅ Canal de Android configurado');
      }

      // Verificar permisos existentes
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('📋 Estado actual de permisos:', existingStatus);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        console.log('🔄 Solicitando permisos de notificación...');        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
        console.log('📋 Nuevo estado de permisos:', finalStatus);
      }
        if (finalStatus === 'granted') {
        console.log('✅ Permisos concedidos para notificaciones locales');
        
        // Solo usar notificaciones locales - no necesitamos token de push
        this.expoPushToken = 'local-notifications-enabled';
        
        console.log('🎯 Servicio de notificaciones locales inicializado correctamente');
        console.log('🔑 Token:', this.expoPushToken);
      } else {
        console.warn('❌ No se pudieron obtener permisos para notificaciones');
        this.expoPushToken = null;
      }
    } catch (error) {
      console.error('💥 Error initializing notification service:', error);
      // Continuamos sin notificaciones si hay error
      this.expoPushToken = null;
    }
  }  /**
   * Registrar el dispositivo para recibir notificaciones push (no necesario para locales)
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    console.log('ℹ️ Push notifications no configuradas - usando solo notificaciones locales');
    return 'local-notifications-only';
  }

  /**
   * Obtener el token de notificaciones push
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
  /**
   * Enviar una notificación local
   */
  async sendLocalNotification(notificationData: NotificationData): Promise<void> {
    try {
      console.log('📤 Enviando notificación local:', {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data
      });      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: 'default',
        },
        trigger: null, // Se envía inmediatamente
      });

      console.log('✅ Notificación enviada con ID:', notificationId);
    } catch (error) {
      console.error('💥 Error enviando notificación local:', error);
      throw error;
    }
  }
  /**
   * Programar una notificación local para un momento específico
   */
  async scheduleLocalNotification(
    notificationData: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      console.log('⏰ Programando notificación local:', {
        title: notificationData.title,
        body: notificationData.body,
        trigger: trigger
      });

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: 'default',
        },
        trigger,
      });

      console.log('✅ Notificación programada con ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('💥 Error programando notificación local:', error);
      throw error;
    }
  }

  /**
   * Cancelar una notificación programada
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancelar todas las notificaciones programadas
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Obtener todas las notificaciones programadas
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Configurar listeners para notificaciones
   */
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
  /**
   * Remover listeners (método deprecado - usar subscription.remove() directamente)
   */
  removeNotificationSubscription(subscription: Notifications.Subscription) {
    subscription.remove();
  }

  /**
   * Limpiar el badge de notificaciones (iOS)
   */
  async clearBadgeCount(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Establecer el badge count (iOS)
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }
}

// Exportar una instancia singleton del servicio
export const notificationService = new NotificationService();
export default NotificationService;
