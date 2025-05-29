import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, Linking } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState, useCallback } from 'react';
import { getOfferDetails, applyToOffer, checkIfUserAppliedToOffer, toggleSavedOffer, checkIfOfferIsSaved } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEmailVerificationGuard } from '@/hooks/useEmailVerification';
import EmailVerificationScreen from '@/components/EmailVerificationScreen';
import CustomAlert, { AlertType } from '@/components/CustomAlert'; // Import CustomAlert
import { useNotificationContext } from '@/context/NotificationContext'; // Added import
import * as Notifications from 'expo-notifications'; // Added import

// Define interfaces para los tipos de datos
interface Company {
  id: number;
  name: string;
  email: string;
  description: string | null;
  address: string;
  logo: string | null;
  web_link: string | null;
}

interface OfferDetails {
  id: number;
  name: string;
  category: string;
  closing_date: string;
  company: Company;
  company_id: number;
  contract_type: string;
  created_at: string;
  degree: string;
  description: string;
  email: string;
  job_location: string;
  updated_at: string;
  user_id: number;
}

// Custom Icon Component to ensure proper text rendering
const Icon = ({ name, size, color, style }: { name: any; size: number; color: string; style?: any }) => {
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }, style]}>
      <FontAwesome name={name} size={size} color={color} />
    </View>
  );
}

// Constantes de diseño para temas (copiadas de index.tsx)
const getThemeColors = (colorScheme: string) => {
  const isDark = colorScheme === 'dark';
  return {
    primary: '#4A2976',
    primaryLight: isDark ? '#5e3a8a' : '#3d2c52',
    secondary: '#9b6dff',
    accent: '#f6c667',
    background: isDark ? '#121212' : '#f8f9fa',
    white: isDark ? '#1e1e1e' : '#ffffff',
    title: isDark ? '#f0f0f0' : '#f0f0f0',
    subtitle: isDark ? '#e0e0e0' : '#e0e0e0',
    text: isDark ? '#f0f0f0' : '#1a1a1a',
    lightText: isDark ? '#bbbbbb' : '#4a4a4a',
    error: '#e74c3c',
    success: '#2ecc71',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(43, 31, 60, 0.15)',
    card: isDark ? '#2d2d2d' : '#ffffff',
    shadowColor: isDark ? '#000' : '#000',
    golden: '#ffd700', // Bright gold color
    goldenAlt: '#ffb700', // Alternative gold for effects
    cardBackground: isDark ? '#2d2d2d' : '#ffffff',
    fieldBackground: isDark ? '#333333' : '#f8f8f8',
    sectionHeaderBg: isDark ? '#242424' : '#f4f4f4',
    saveButtonBackground: '#ffffff',
    saveButtonText: '#000000',
    saveButtonBorder: '#e0e0e0',
    saveButtonIcon: '#9b6dff',
    sectionIcon: isDark ? '#ffffff' : '#000000',
    buttonSecondary: isDark ? '#3a3a3a' : '#ffffff',
    buttonSecondaryText: isDark ? '#f0f0f0' : '#4A2976',
    buttonSecondaryBorder: isDark ? '#555555' : '#e9ecef',
    infoBoxBackground: isDark ? 'rgba(155, 109, 255, 0.1)' : 'rgba(74, 41, 118, 0.05)',
    infoBoxBorder: isDark ? 'rgba(155, 109, 255, 0.3)' : 'rgba(74, 41, 118, 0.15)',
  };
};

// Crear estilos dinámicos en función del tema
const createStyles = (colors: ReturnType<typeof getThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },  backButton: {
    position: 'absolute',
    left: -10,
    top: 0,
    backgroundColor: colors.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.title,
    marginBottom: 8,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtitle,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginLeft: 10,
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.error,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  errorText: {
    color: colors.error,
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
    backgroundColor: colors.cardBackground,
  },
  offerCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },  offerHeader: {
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBackground,
  },  offerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    backgroundColor: 'transparent',
    lineHeight: 28,
  },companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  companyName: {
    fontSize: 18,
    color: colors.sectionIcon,
    fontWeight: '700',
    marginLeft: 10,
    backgroundColor: 'transparent',
    flex: 1,
  },
  emailSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  emailText: {
    fontSize: 14,
    color: colors.lightText,
    marginLeft: 10,
    backgroundColor: 'transparent',
    fontWeight: '500',
    flex: 1,
  },  datesHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: 'transparent',
    gap: 12,
  },
  dateItem: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: colors.fieldBackground,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    flex: 1,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  dateLabel: {
    fontSize: 11,
    color: colors.lightText,
    backgroundColor: 'transparent',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },  dateValue: {
    fontSize: 14,
    color: colors.text,
    backgroundColor: 'transparent',
    fontWeight: 'normal',
    textAlign: 'center',
    lineHeight: 18,
  },
  companyContactSection: {
    marginTop: 8,
    backgroundColor: colors.fieldBackground,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
    paddingVertical: 2,
  },
  contactText: {
    fontSize: 13,
    color: colors.text,
    marginLeft: 10,
    backgroundColor: 'transparent',
    flex: 1,
    fontWeight: '500',
  },  descriptionSection: {
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: 'transparent',
    flex: 1,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    backgroundColor: 'transparent',
  },
  detailsSection: {
    padding: 20,
    paddingTop: 15,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },detailsGrid: {
    backgroundColor: 'transparent',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fieldBackground,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 15,
    marginBottom: 10,
    width: '100%',
  },
  detailIcon: {
    marginRight: 10,
    width: 18,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  detailContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.lightText,
    marginBottom: 3,
    backgroundColor: 'transparent',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    backgroundColor: 'transparent',
  },  actionButtonsContainer: {
    paddingHorizontal: 12, // Reduced from 20 to 12 to allow more width for buttons
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8, // Reduced from 12 to 8 to allow more width for buttons
    backgroundColor: 'transparent',
  },  actionButton: {
    flex: 1,
    borderRadius: 15,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: 'hidden',
    minHeight: 54,
    // Removed maxWidth to allow buttons to take more space
  },buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18, // Increased from 16 to 18 to match save button height
    paddingHorizontal: 8, // Reducir padding horizontal para mejor ajuste
    minHeight: 54,
    width: '100%',
  },simpleButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 54,
    width: '100%',
    backgroundColor: colors.saveButtonBackground,
    borderWidth: 2,
    borderColor: colors.saveButtonBorder,
    borderRadius: 15,
  },
  savedButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 54,
    width: '100%',
    backgroundColor: colors.saveButtonBackground,
    borderWidth: 2,
    borderColor: colors.golden,
    borderRadius: 15,
  },
  disabledButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 54,
    width: '100%',
    backgroundColor: colors.fieldBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 15,
  },
  buttonIcon: {
    marginRight: 6,
    width: 16,
    backgroundColor: 'transparent',
  },
  savedButtonIcon: {
    marginRight: 6,
    width: 20, // Slightly larger
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 17, // Increased from 14 to 17
    textAlign: 'center',
    flex: 1,
  },  simpleButtonText: {
    color: colors.saveButtonText,
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
    flex: 1,
  },
  savedButtonText: {
    color: colors.golden,
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
    flex: 1,
  },
  disabledButtonText: {
    color: colors.lightText,
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  appliedButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 54,
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: 15,
  },
  appliedButtonText: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
    flex: 1,
  },
  applyButton: {
    // Estilo específico para el botón de aplicar si es necesario
  },
  saveButton: {
    // Estilo específico para el botón de guardar si es necesario
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 15,
    zIndex: 1,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    letterSpacing: 0.5,
  },
});

export default function ShowOfferScreen() {
  const colorScheme = useColorScheme();
  const COLORS = getThemeColors(colorScheme || 'light');  const styles = createStyles(COLORS);
  
  const { isAuthenticated, logout } = useAuth();
  const { scheduleNotification } = useNotificationContext(); // Get scheduleNotification
  const params = useLocalSearchParams();
  const offerId = params.id as string;  
  const [offer, setOffer] = useState<OfferDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingOffer, setSavingOffer] = useState(false);
  const [isProfileNotFound, setIsProfileNotFound] = useState(false);

  // Email verification
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const { verificationState, checkBeforeAction, handleApiError } = useEmailVerificationGuard();

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

  // Funciones para manejar ProfileNotFoundScreen
  const handleProfileNotFoundTryAgain = async () => {
    setIsProfileNotFound(false);
    await fetchOfferDetails();
  };

  const handleProfileNotFoundGoBack = () => {
    setIsProfileNotFound(false);
    router.back();
  };
  const handleProfileNotFoundLogout = async () => {
    try {
      await logout(); // Llamar a la función de logout del contexto
      setIsProfileNotFound(false);
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así navegar al login en caso de error
      setIsProfileNotFound(false);
      router.replace('/login');
    }
  };

  // Función para determinar si una oferta es nueva (4 días o menos)
  const isOfferNew = (createdAt: string): boolean => {
    const offerDate = new Date(createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference <= 4;
  };  // Función para verificar si la oferta está guardada
  const checkSavedStatus = async () => {
    if (!offerId) return;
    
    try {
      const result = await checkIfOfferIsSaved(offerId);
      console.log("Is saved result:", result); // Debug log
      setIsSaved(result.isSaved || false);
    } catch (error) {
      console.error("Error al verificar estado de oferta guardada:", error);
      setIsSaved(false);
    }
  };

  // Función para verificar si el usuario ya aplicó a esta oferta
  const checkApplicationStatus = async () => {
    if (!offerId) return;
    
    try {
      setCheckingApplication(true);
      const applied = await checkIfUserAppliedToOffer(offerId);
      setHasApplied(applied);
    } catch (error) {
      console.error("Error al verificar estado de aplicación:", error);
      // En caso de error, asumir que no aplicó
      setHasApplied(false);
    } finally {
      setCheckingApplication(false);
    }
  };

  // Función para obtener los detalles de la oferta
  const fetchOfferDetails = async () => {
    if (!offerId) {
      setError('ID de oferta no válido');
      return;
    }    try {
      setLoading(true);
      setError(null);
      setIsProfileNotFound(false); // Reset profile not found state
      const response = await getOfferDetails(offerId);
      setOffer(response);
      
      // Verificar si el usuario ya aplicó después de obtener los detalles
      await checkApplicationStatus();
      
      // Verificar si la oferta está guardada
      await checkSavedStatus();
    } catch (error: any) {
      console.error("Error al obtener detalles de la oferta:", error);
      
      // Check for specific "Perfil de candidato no encontrado" error
      const errorMessage = error?.error || error?.message || String(error);
      if (errorMessage.includes("Perfil de candidato no encontrado")) {
        setIsProfileNotFound(true);
        setError(null); // Clear generic error since we're showing specific screen
      } else {
        setError(error instanceof Error ? error.message : String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar a la oferta
  const handleApplyToOffer = async () => {
    if (!offer) return;
    
    // Si el usuario ya aplicó, mostrar mensaje informativo
    if (hasApplied) {
      showAppAlert(
        'info',
        'Ya has enviado tu aplicación a esta oferta. Puedes revisar el estado en la sección "Mis Solicitudes".',
        'Ya aplicaste'
      );
      return;
    }

    // Navegar al formulario de aplicación con los datos de la oferta
    router.push({
      pathname: '/ApplyForm' as any,
      params: {
        offerId: offer.id.toString(),
        offerTitle: offer.name,
      }
    });
  };  // Función para guardar/eliminar la oferta
  const handleSaveOffer = async () => {
    if (!offer || !offerId) return;
    
    if (hasApplied) {
      showAppAlert(
        'warning',
        'No puedes guardar ofertas a las que ya has aplicado.',
        'Acción no disponible'
      );
      return;
    }

    const verificationResult = await checkBeforeAction('guardar esta oferta');
    if (verificationResult.needsVerification) {
      setShowEmailVerification(true);
      return;
    }
    
    try {
      setSavingOffer(true);
      const response = await toggleSavedOffer(offerId);
      const newSavedState = response.message.includes("guardada correctamente");
      setIsSaved(newSavedState);

      const offerName = offer?.name || "la oferta seleccionada";

      if (newSavedState) {
        // Offer was SAVED - schedule a reminder
        const triggerInSeconds = 3 * 24 * 60 * 60; // 3 days
        
        scheduleNotification(
          {
            title: "🔔 ¡Es hora de aplicar!",
            body: `¿Listo para dar el siguiente paso? No olvides aplicar a "${offerName}".`,
            data: { offerId: offer.id, screen: 'showOffer', offerName: offerName, offerDetails: offer } // Pass offerId and name
          },
          { 
            seconds: triggerInSeconds, 
            repeats: false, 
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
          } 
        ).then(notificationId => {
          if (notificationId && !notificationId.startsWith('error-')) {
            const scheduledDate = new Date(Date.now() + triggerInSeconds * 1000);
            console.log(`⏰ Notificación de recordatorio de aplicación programada (ID: ${notificationId}) para "${offerName}" para: ${scheduledDate.toLocaleString()}`);
          } else {
            console.warn(`Falló al programar la notificación de recordatorio para "${offerName}". Estado desde el contexto: ${notificationId}`);
            // Optionally, inform the user that reminder scheduling failed, though the main save action succeeded.
            // For now, console warning is sufficient as the main feedback is about saving the offer.
          }
        }).catch(scheduleError => {
          console.error(`Error durante la promesa scheduleNotification en showOffer para "${offerName}":`, scheduleError);
        });

        showAppAlert(
          'success',
          `"${offerName}" ha sido guardada. Te enviaremos un recordatorio en 3 días para que no te olvides de aplicar.`,
          'Oferta Guardada 📌'
        );

      } else {
        // Offer was UNSAVED
        // Optionally, attempt to cancel any existing reminder for this offer if you store notification IDs.
        // For now, just confirm un-saving.
        showAppAlert(
          'info',
          `"${offerName}" ha sido eliminada de tus guardados.`,
          'Oferta Eliminada 🗑️'
        );
      }
      
    } catch (error: any) {
      console.error("Error al guardar/eliminar oferta:", error);
      const emailVerificationError = handleApiError(error);
      if (emailVerificationError.isEmailVerificationError) {
        setShowEmailVerification(true);
        return;
      }
      
      let errorMessage = 'Error al procesar la solicitud';
      if (error.error) {
        errorMessage = error.error;
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAppAlert(
        'error',
        errorMessage,
        'Error al Guardar'
      );
    } finally {
      setSavingOffer(false);
    }
  };

  useEffect(() => {
    fetchOfferDetails();
    
    // Redirección si el usuario no está autenticado
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, offerId]);
  // Recargar el estado de aplicación y guardado cuando el usuario regrese a esta pantalla
  useFocusEffect(
    useCallback(() => {
      // Solo verificar si ya tenemos los datos de la oferta
      if (offer && offerId) {
        checkApplicationStatus();
        checkSavedStatus();
      }
    }, [offer, offerId])
  );

  // Helper component for save button - COMPLETELY NEW APPROACH
const SaveButton = ({ isSaved, isLoading, onPress }: { isSaved: boolean; isLoading: boolean; onPress: () => void }) => {
  const colorScheme = useColorScheme();
  const COLORS = getThemeColors(colorScheme || 'light');
  
  // Common button styles for both saved and unsaved states
  const buttonContainerStyle = {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden' as 'hidden',
    minHeight: 54,
    elevation: 3,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  };
  
  const buttonContentStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 54,
    width: '100%' as unknown as number, // Fix: cast to number to satisfy ViewStyle, or remove this line if not strictly needed
    backgroundColor: COLORS.saveButtonBackground,
    borderWidth: 2,
    borderColor: COLORS.saveButtonBorder,  // Same border color for both states
    borderRadius: 15,
  };
  
  const buttonTextStyle = {
    color: COLORS.saveButtonText,  // Same text color for both states
    fontWeight: 'bold' as const,
    fontSize: 17,
    textAlign: 'center' as const,
    flex: 1,
  };
  
  return (
    <TouchableOpacity 
      style={buttonContainerStyle}
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={buttonContentStyle}>
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={COLORS.saveButtonIcon} 
            style={{ marginRight: 8 }} 
          />
        ) : (
          isSaved ? (
            <FontAwesome
              name="bookmark"
              size={22}
              color={COLORS.golden}
              style={{ marginRight: 8 }}
            />
          ) : (
            <FontAwesome
              name="bookmark-o"
              size={16}
              color={COLORS.saveButtonIcon}
              style={{ marginRight: 8 }}
            />
          )
        )}
        <Text 
          style={buttonTextStyle} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {isSaved ? 'Guardada' : 'Guardar'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ProfileNotFoundScreen Component - Fixed version
const ProfileNotFoundScreen = ({ colors, onTryAgain, onGoBack, onLogout }: { 
  colors: ReturnType<typeof getThemeColors>; 
  onTryAgain: () => void; 
  onGoBack: () => void; 
  onLogout: () => void; 
}) => {
  const handleContactSupport = async () => {
    const url = 'https://emplea.works/contact';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir el enlace de contacto');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el enlace de contacto');
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
      paddingTop: 40,
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      padding: 32,
      elevation: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.infoBoxBackground,
      borderWidth: 2,
      borderColor: colors.infoBoxBorder,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 34,
    },
    description: {
      fontSize: 16,
      color: colors.lightText,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 28,
    },
    infoBox: {
      backgroundColor: colors.infoBoxBackground,
      borderWidth: 1,
      borderColor: colors.infoBoxBorder,
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
      width: '100%',
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    infoText: {
      fontSize: 14,
      color: colors.lightText,
      textAlign: 'center',
      lineHeight: 20,
    },
    linkText: {
      fontSize: 14,
      color: colors.secondary,
      textAlign: 'center',
      lineHeight: 20,
      textDecorationLine: 'underline',
      fontWeight: '500',
    },
    buttonContainer: {
      width: '100%',
      backgroundColor: 'transparent', // Changed from cardBackground to transparent
    },
    buttonMargin: {
      marginBottom: 12, // Use marginBottom instead of gap for better compatibility
    },
    primaryButton: {
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      marginBottom: 12, // Added explicit margin
    },
    primaryButtonGradient: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    primaryButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    secondaryButton: {
      backgroundColor: colors.buttonSecondary,
      borderWidth: 2,
      borderColor: colors.buttonSecondaryBorder,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginBottom: 12, // Added explicit margin
    },
    secondaryButtonText: {
      color: colors.buttonSecondaryText,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    logoutButton: {
      backgroundColor: 'transparent', // Changed from cardBackground to transparent
      borderWidth: 2,
      borderColor: colors.error,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    logoutButtonText: {
      color: colors.error,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    bottomSpace: {
      height: 50,
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <FontAwesome name="user-times" size={32} color={colors.secondary} />
            </View>
            
            <Text style={styles.title}>
              Perfil de candidato no encontrado
            </Text>
            
            <Text style={styles.description}>
              Sospechamos que estás usando una cuenta de empresa o que ha habido un problema al crear tu perfil. Por favor, verifica tu cuenta o contacta al soporte si crees que esto es un error.
            </Text>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>¿Qué puedes hacer?</Text>
              <Text style={styles.infoText}>
                • Registrarte como candidato{'\n'}
                • Verifica tu información personal{'\n'}
                • Intenta nuevamente más tarde{'\n'}{'\n'}
                Si el problema persiste, contacta con el soporte técnico:
              </Text>
              <TouchableOpacity onPress={handleContactSupport}>
                <Text style={styles.linkText}>
                  https://emplea.works/contact
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={onTryAgain}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <FontAwesome name="refresh" size={16} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>Intentar de Nuevo</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={onGoBack}
              >
                <FontAwesome name="arrow-left" size={16} color={colors.buttonSecondaryText} />
                <Text style={styles.secondaryButtonText}>Volver Atrás</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={onLogout}
              >
                <FontAwesome name="sign-out" size={16} color={colors.error} />
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

  return (
    <View style={styles.container}>
      {/* Mostrar ProfileNotFoundScreen si el estado isProfileNotFound es true */}
      {isProfileNotFound && (
        <ProfileNotFoundScreen
          colors={COLORS}
          onTryAgain={handleProfileNotFoundTryAgain}
          onGoBack={handleProfileNotFoundGoBack}
          onLogout={handleProfileNotFoundLogout}
        />
      )}
      
      {!isProfileNotFound && (
        <>
          <CustomAlert
            isVisible={customAlertVisible}
            message={customAlertMessage}
            type={customAlertType}
            onClose={handleCloseCustomAlert}
            title={customAlertTitle}
          />
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          />
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={[styles.headerSection, { paddingTop: 20 }]} />

            {/* Header Section */}
            <View style={styles.headerSection}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Icon name="arrow-left" size={20} color="#ffffff" />
              </TouchableOpacity>
              
              <Text style={styles.title}>Detalles de la oferta</Text>
              <Text style={styles.subtitle}>Información completa de la posición</Text>
            </View>

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando detalles...</Text>
              </View>
            )}
            
            {/* Checking Application Status */}
            {!loading && offer && (checkingApplication || savingOffer) && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
                <Text style={styles.loadingText}>
                  {checkingApplication ? 'Verificando estado...' : 'Procesando...'}
                </Text>
              </View>
            )}
            
            {/* Error State */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="exclamation-triangle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>Error: {error}</Text>
              </View>
            )}

            {/* Offer Details */}
            {offer && (
              <View style={styles.offerCard}>

                {/* Header de la oferta */}
                <View style={styles.offerHeader}>
                  <Text style={styles.offerTitle}>{offer.name}</Text>
                  
                  {/* Información de la empresa */}
                  <View style={styles.companySection}>
                    <Icon name="building" size={16} color={COLORS.sectionIcon} />
                    <Text style={styles.companyName}>{offer.company?.name || 'Empresa no especificada'}</Text>
                  </View>
                  
                  {/* Email de contacto */}
                  <View style={styles.emailSection}>
                    <Icon name="envelope" size={14} color={COLORS.sectionIcon} />
                    <Text style={styles.emailText}>{offer.email}</Text>
                  </View>
                  
                  {/* Información de fechas organizadas */}
                  <View style={styles.datesHeaderContainer}>
                    <View style={styles.dateItem}>
                      <View style={styles.dateLabelContainer}>
                        <Icon name="calendar-plus-o" size={12} color="#2196F3" />
                        <Text style={styles.dateLabel}>Publicada</Text>
                      </View>
                      <Text style={styles.dateValue}>
                        {new Date(offer.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                    
                    {offer.closing_date && (
                      <View style={styles.dateItem}>
                        <View style={styles.dateLabelContainer}>
                          <Icon name="clock-o" size={12} color={COLORS.error} />
                          <Text style={styles.dateLabel}>Cierra</Text>
                        </View>
                        <Text style={styles.dateValue}>
                          {new Date(offer.closing_date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Información adicional de la empresa (solo si hay datos adicionales) */}
                  {offer.company && (offer.company.address || offer.company.web_link) && (
                    <View style={styles.companyContactSection}>
                      {offer.company.address && (
                        <View style={styles.contactItem}>
                          <Icon name="map-marker" size={14} color={COLORS.secondary} />
                          <Text style={styles.contactText}>{offer.company.address}</Text>
                        </View>
                      )}
                      {offer.company.web_link && (
                        <View style={[styles.contactItem, { marginBottom: 0 }]}>
                          <Icon name="globe" size={14} color={COLORS.secondary} />
                          <Text style={styles.contactText}>{offer.company.web_link}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Descripción */}
                <View style={styles.descriptionSection}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: 'transparent' }}>
                    <Icon name="file-text-o" size={18} color={COLORS.sectionIcon} style={{ marginRight: 8 }} />
                    <Text style={styles.sectionTitle}>Descripción del puesto</Text>
                  </View>
                  <Text style={styles.description}>{offer.description}</Text>
                </View>

                {/* Detalles técnicos */}
                <View style={styles.detailsSection}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: 'transparent' }}>
                    <Icon name="list-ul" size={18} color={COLORS.sectionIcon} style={{ marginRight: 8 }} />
                    <Text style={styles.sectionTitle}>Detalles de la posición</Text>
                  </View>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <View style={styles.detailIcon}>
                        <Icon name="tag" size={16} color={COLORS.secondary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Categoría</Text>
                        <Text style={styles.detailValue}>{offer.category}</Text>
                      </View>
                    </View>

                    <View style={styles.detailItem}>
                      <View style={styles.detailIcon}>
                        <Icon name="map-marker" size={16} color={COLORS.secondary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Ubicación</Text>
                        <Text style={styles.detailValue}>{offer.job_location}</Text>
                      </View>
                    </View>

                    <View style={styles.detailItem}>
                      <View style={styles.detailIcon}>
                        <Icon name="file-text" size={16} color={COLORS.secondary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Tipo de contrato</Text>
                        <Text style={styles.detailValue}>{offer.contract_type}</Text>
                      </View>
                    </View>

                    <View style={styles.detailItem}>
                      <View style={styles.detailIcon}>
                        <Icon name="graduation-cap" size={16} color={COLORS.secondary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Titulación requerida</Text>
                        <Text style={styles.detailValue}>{offer.degree}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Botones de acción */}
            {offer && (
              <View style={styles.actionButtonsContainer}>
                <View style={styles.actionButtonsRow}>
                  {hasApplied ? (
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.saveButton]}
                      disabled={true}
                    >
                      <View style={styles.disabledButtonContainer}>
                        <Icon 
                          name="bookmark-o" 
                          size={16} 
                          color={COLORS.lightText}
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.disabledButtonText} numberOfLines={1} ellipsizeMode="tail">
                          No disponible
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    // Completely new save button implementation
                    <SaveButton 
                      isSaved={isSaved} 
                      isLoading={savingOffer} 
                      onPress={handleSaveOffer} 
                    />
                  )}

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.applyButton]}
                    onPress={handleApplyToOffer}
                    disabled={checkingApplication}
                  >
                    {hasApplied ? (
                      // Botón para usuarios que ya aplicaron
                      <View style={styles.appliedButtonContainer}>
                        <Icon 
                          name="check-circle" 
                          size={16} 
                          color={COLORS.success} 
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.appliedButtonText} numberOfLines={1} ellipsizeMode="tail">
                          Inscrito
                        </Text>
                      </View>
                    ) : (
                      // Botón normal para aplicar
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Icon name="paper-plane" size={16} color="#ffffff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
                          Inscribirse
                        </Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={[styles.container, { height: 50 }]} />
          </ScrollView>
          
          {/* Email Verification Modal */}
          <Modal
            visible={showEmailVerification}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <EmailVerificationScreen 
              onGoBack={() => setShowEmailVerification(false)}
            />
          </Modal>
        </>
      )}
    </View>
  );
}