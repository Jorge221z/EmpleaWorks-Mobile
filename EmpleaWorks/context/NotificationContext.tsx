import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { notificationService, NotificationData } from '../services/notificationService';
import * as Notifications from 'expo-notifications';
import Logger from '../utils/logger';

interface NotificationContextType {
  expoPushToken: string | null;
  isInitialized: boolean;
  sendNotification: (data: NotificationData) => Promise<void>;
  scheduleNotification: (data: NotificationData, trigger: Notifications.NotificationTriggerInput) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
  clearBadgeCount: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
      const token = notificationService.getExpoPushToken();
      setExpoPushToken(token);
      setIsInitialized(true);
      
      // Si hay un token, enviarlo al backend
      if (token) {
        await sendTokenToBackend(token);
      }
    } catch (error) {
      Logger.error('Error initializing notifications:', error);
      setIsInitialized(true); // Marcar como inicializado incluso si hay error
    }
  };
  const sendTokenToBackend = async (token: string) => {
    try {
      // Aquí deberías enviar el token a tu backend
      // Ejemplo:
      // await axios.post('/api/notifications/register-token', { token });
      Logger.log('Token to send to backend:', token);
      
      // Por ahora solo registramos que tenemos un token válido
      if (token && (token === 'local-notifications-only' || token === 'development-mode' || token.startsWith('ExponentPushToken'))) {
        Logger.log('Token registrado exitosamente:', token.substring(0, 20) + '...');
      }
    } catch (error) {
      Logger.error('Error sending token to backend:', error);
    }
  };
  const sendNotification = async (data: NotificationData) => {
    try {
      await notificationService.sendLocalNotification(data);
    } catch (error) {
      Logger.error('Error sending notification:', error);
      // No lanzar error para no bloquear el flujo principal
    }
  };

  const scheduleNotification = async (
    data: NotificationData, 
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> => {
    try {
      return await notificationService.scheduleLocalNotification(data, trigger);
    } catch (error) {
      Logger.error('Error scheduling notification:', error);
      // Retornar un ID dummy en lugar de lanzar error
      return 'error-' + Date.now();
    }
  };

  const cancelNotification = async (id: string) => {
    try {
      await notificationService.cancelNotification(id);
    } catch (error) {
      Logger.error('Error canceling notification:', error);
    }
  };

  const clearBadgeCount = async () => {
    try {
      await notificationService.clearBadgeCount();
    } catch (error) {
      Logger.error('Error clearing badge count:', error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      await notificationService.setBadgeCount(count);
    } catch (error) {
      Logger.error('Error setting badge count:', error);
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    isInitialized,
    sendNotification,
    scheduleNotification,
    cancelNotification,
    clearBadgeCount,
    setBadgeCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
