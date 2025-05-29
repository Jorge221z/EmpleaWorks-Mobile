import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationService, NotificationData } from '../services/notificationService';

export interface UseNotificationsReturn {
  expoPushToken: string | null;
  sendLocalNotification: (data: NotificationData) => Promise<void>;
  scheduleNotification: (data: NotificationData, trigger: Notifications.NotificationTriggerInput) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  clearBadgeCount: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Inicializar el servicio de notificaciones
    notificationService.initialize();

    // Configurar listeners para notificaciones recibidas
    notificationListener.current = notificationService.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    // Configurar listener para respuestas a notificaciones (cuando el usuario toca la notificación)
    responseListener.current = notificationService.addNotificationResponseReceivedListener(response => {
      console.log('Respuesta a notificación:', response);
      // Aquí puedes manejar la navegación basada en los datos de la notificación
      handleNotificationResponse(response);
    });    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Aquí puedes agregar lógica de navegación basada en el tipo de notificación
    if (data?.screen) {
      // Ejemplo: navegar a una pantalla específica
      console.log('Navegar a:', data.screen);
      // router.push(data.screen); // Si usas expo-router
    }
    
    if (data?.offerId) {
      // Ejemplo: abrir una oferta específica
      console.log('Abrir oferta:', data.offerId);
      // router.push(`/showOffer?id=${data.offerId}`);
    }
  };

  return {
    expoPushToken: notificationService.getExpoPushToken(),
    sendLocalNotification: notificationService.sendLocalNotification.bind(notificationService),
    scheduleNotification: notificationService.scheduleLocalNotification.bind(notificationService),
    cancelNotification: notificationService.cancelNotification.bind(notificationService),
    cancelAllNotifications: notificationService.cancelAllNotifications.bind(notificationService),
    clearBadgeCount: notificationService.clearBadgeCount.bind(notificationService),
    setBadgeCount: notificationService.setBadgeCount.bind(notificationService),
  };
}
