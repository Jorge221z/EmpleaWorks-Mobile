import { notificationService } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

/**
 * Tipos de notificaciones que la app puede enviar
 */
export enum NotificationType {
  NEW_JOB = 'NEW_JOB',
  APPLICATION_STATUS = 'APPLICATION_STATUS',
  REMINDER = 'REMINDER',
  SYSTEM = 'SYSTEM',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
}

/**
 * Configuraciones predefinidas para diferentes tipos de notificaciones
 */
export const NotificationTemplates = {
  [NotificationType.NEW_JOB]: {
    icon: '💼',
    sound: 'default',
    priority: 'high' as const,
  },
  [NotificationType.APPLICATION_STATUS]: {
    icon: '📋',
    sound: 'default',
    priority: 'high' as const,
  },
  [NotificationType.REMINDER]: {
    icon: '⏰',
    sound: 'default',
    priority: 'normal' as const,
  },
  [NotificationType.SYSTEM]: {
    icon: '🔔',
    sound: 'default',
    priority: 'normal' as const,
  },
  [NotificationType.PROFILE_UPDATE]: {
    icon: '👤',
    sound: 'default',
    priority: 'low' as const,
  },
};

/**
 * Funciones de utilidad para crear notificaciones específicas de EmpleaWorks
 */
export class NotificationUtils {
  
  /**
   * Notificación para nueva oferta de trabajo
   */
  static async newJobOffer(jobTitle: string, company: string, jobId: string) {
    await notificationService.sendLocalNotification({
      title: '💼 Nueva oferta de trabajo',
      body: `${jobTitle} en ${company}`,
      data: {
        type: NotificationType.NEW_JOB,
        screen: '/showOffer',
        offerId: jobId,
      },
    });
  }

  /**
   * Notificación para cambio de estado de aplicación
   */
  static async applicationStatusUpdate(jobTitle: string, status: string, applicationId: string) {
    const statusMessages = {
      'accepted': '✅ Tu aplicación ha sido aceptada',
      'rejected': '❌ Tu aplicación ha sido rechazada',
      'reviewing': '👀 Tu aplicación está siendo revisada',
      'interview': '🎯 Te han invitado a una entrevista',
    };

    const message = statusMessages[status as keyof typeof statusMessages] || 'Tu aplicación ha sido actualizada';

    await notificationService.sendLocalNotification({
      title: message,
      body: `Para la posición de ${jobTitle}`,
      data: {
        type: NotificationType.APPLICATION_STATUS,
        screen: '/my-applications',
        applicationId,
      },
    });
  }

  /**
   * Recordatorio para completar perfil
   */
  static async profileReminder() {
    await notificationService.sendLocalNotification({
      title: '👤 Completa tu perfil',
      body: 'Un perfil completo aumenta tus posibilidades de ser contratado',
      data: {
        type: NotificationType.PROFILE_UPDATE,
        screen: '/edit-profile',
      },
    });
  }

  /**
   * Recordatorio para revisar ofertas guardadas
   */
  static async savedOffersReminder(count: number) {
    await notificationService.sendLocalNotification({
      title: '⭐ Ofertas guardadas',
      body: `Tienes ${count} ofertas guardadas. ¡No olvides aplicar!`,
      data: {
        type: NotificationType.REMINDER,
        screen: '/saved-offers',
      },
    });
  }

  /**
   * Notificación de bienvenida para nuevos usuarios
   */
  static async welcomeNotification(userName: string) {
    await notificationService.sendLocalNotification({
      title: `¡Bienvenido a EmpleaWorks, ${userName}! 🎉`,
      body: 'Encuentra tu trabajo ideal con nosotros',
      data: {
        type: NotificationType.SYSTEM,
        screen: '/(tabs)',
      },
    });
  }

  /**
   * Programar recordatorio diario para buscar trabajos
   */
  static async scheduleDailyJobReminder() {
    // Programar para las 9:00 AM todos los días
    await notificationService.scheduleLocalNotification(
      {
        title: '🔍 ¡Hora de buscar trabajo!',
        body: 'Revisa las nuevas ofertas de trabajo disponibles',
        data: {
          type: NotificationType.REMINDER,
          screen: '/(tabs)',
        },
      },      {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 9,
        minute: 0,
        repeats: true,
      }
    );
  }

  /**
   * Programar recordatorio semanal para actualizar perfil
   */
  static async scheduleWeeklyProfileReminder() {
    // Programar para los lunes a las 10:00 AM
    await notificationService.scheduleLocalNotification(
      {
        title: '👤 Actualiza tu perfil',
        body: 'Mantén tu perfil actualizado para mejores oportunidades',
        data: {
          type: NotificationType.PROFILE_UPDATE,
          screen: '/edit-profile',
        },
      },      {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: 2, // Lunes
        hour: 10,
        minute: 0,
        repeats: true,
      }
    );
  }

  /**
   * Cancelar todos los recordatorios programados
   */
  static async cancelAllReminders() {
    await notificationService.cancelAllNotifications();
  }

  /**
   * Obtener todas las notificaciones programadas
   */
  static async getScheduledReminders() {
    return await notificationService.getScheduledNotifications();
  }
}

export default NotificationUtils;
