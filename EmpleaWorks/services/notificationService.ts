import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Logger from '../utils/logger';

// Configurar el comportamiento de las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    Logger.log('🔔 Manejando notificación en primer plano:', notification.request.content.title);
    Logger.log('📱 Estado de la app: primer plano');
    Logger.log('🎯 Configuración de notificación:', {
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
      Logger.log('🔧 Inicializando servicio de notificaciones...');

      // Configurar el canal de Android de forma no bloqueante
      if (Platform.OS === 'android') {
        Logger.log('📱 Configurando canal de Android...');
        Notifications.setNotificationChannelAsync('default', {
          name: 'EmpleaWorks Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        }).then(() => {
          Logger.log('✅ Canal de Android configurado');
        }).catch((error) => {
          Logger.error('❌ Error configurando canal Android:', error);
        });
      }

      // Verificar permisos de forma más rápida
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      Logger.log('📋 Estado actual de permisos:', existingStatus);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        Logger.log('🔄 Solicitando permisos de notificación...');
        
        // Hacer la solicitud de permisos de forma no bloqueante
        Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        }).then(({ status }) => {
          finalStatus = status;
          Logger.log('📋 Nuevo estado de permisos:', finalStatus);
          
          if (finalStatus === 'granted') {
            this.expoPushToken = 'local-notifications-enabled';
            Logger.log('✅ Permisos concedidos para notificaciones locales');
          } else {
            Logger.warn('❌ No se pudieron obtener permisos para notificaciones');
            this.expoPushToken = null;
          }
        }).catch((error) => {
          Logger.error('❌ Error solicitando permisos:', error);
          this.expoPushToken = null;
        });
      } else {
        this.expoPushToken = 'local-notifications-enabled';
        Logger.log('✅ Permisos ya concedidos para notificaciones locales');
      }
      
      Logger.log('🎯 Servicio de notificaciones inicializado (modo rápido)');
    } catch (error) {
      Logger.error('💥 Error initializing notification service:', error);
      // Continuamos sin notificaciones si hay error
      this.expoPushToken = null;
    }
  }/**
   * Registrar el dispositivo para recibir notificaciones push (no necesario para locales)
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    Logger.log('ℹ️ Push notifications no configuradas - usando solo notificaciones locales');
    return 'local-notifications-only';
  }

  /**
   * Obtener el token de notificaciones push
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }  /**
   * Enviar una notificación local
   */
  async sendLocalNotification(notificationData: NotificationData): Promise<void> {
    try {
      Logger.log('📤 Enviando notificación local:', notificationData.title);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: 'default',
        },
        trigger: null, // Se envía inmediatamente
      });

      Logger.log('✅ Notificación enviada con ID:', notificationId);
    } catch (error) {
      Logger.error('💥 Error enviando notificación local:', error);
      // No lanzar error para no bloquear el flujo principal
    }
  }  /**
   * Programar una notificación local para un momento específico
   */
  async scheduleLocalNotification(
    notificationData: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      Logger.log('⏰ Programando notificación local:', notificationData.title);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: 'default',
        },
        trigger,
      });

      Logger.log('✅ Notificación programada con ID:', notificationId);
      return notificationId;
    } catch (error) {
      Logger.error('💥 Error programando notificación local:', error);
      // Retornar un ID dummy en lugar de lanzar error
      return 'error-' + Date.now();
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
