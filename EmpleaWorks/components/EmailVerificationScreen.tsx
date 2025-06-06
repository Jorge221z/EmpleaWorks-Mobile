import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Alert } from 'react-native'; // Mantener para confirmaciones
import { Ionicons } from '@expo/vector-icons';
import { resendEmailVerification } from '../api/axios';
import CustomAlert, { AlertType } from './CustomAlert'; // Importar CustomAlert
import Logger from '../utils/logger';

interface EmailVerificationScreenProps {
  email?: string;
  onGoBack: () => void; // Esta es la prop que se usa para cerrar/volver
  onVerificationSent?: () => void;
  showAsModal?: boolean;
  // Se añade onVerified para ser llamada cuando el usuario indica que ya verificó (ej. al cerrar el modal)
  onVerified?: () => void; 
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  onGoBack, // Usar esta para la acción principal de "volver" o "cerrar"
  onVerificationSent,
  showAsModal = false,
  onVerified, // Nueva prop
}) => {
  const [isResending, setIsResending] = useState(false);
  // Estados para CustomAlert
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<AlertType>('info');
  const [customAlertTitle, setCustomAlertTitle] = useState<string | undefined>(undefined);

  const showAppAlert = (type: AlertType, message: string, title?: string) => {
    setCustomAlertType(type);
    setCustomAlertMessage(message);
    setCustomAlertTitle(title);
    setCustomAlertVisible(true);
  };

  const handleCloseCustomAlert = () => {
    setCustomAlertVisible(false);
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const response = await resendEmailVerification();
      showAppAlert('success', 'Se ha enviado un nuevo email de verificación. Por favor revisa tu bandeja de entrada y spam.', 'Email Enviado');
      onVerificationSent?.();
    } catch (error) {
      Logger.error('Error al reenviar email:', error);
      const errorMessage = (error instanceof Error && error.message) ? error.message : 'No se pudo enviar el email de verificación. Inténtalo de nuevo.';
      showAppAlert('error', errorMessage, 'Error');
    } finally {
      setIsResending(false);
    }
  };

  // Esta función se llamará cuando el usuario cierre el modal, 
  // implicando que podría haber verificado su email.
  const handleModalClose = () => {
    onVerified?.(); // Llama a onVerified si está definida
    onGoBack(); // Llama a la función original para cerrar/volver
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleModalClose} // Usar handleModalClose aquí
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificación de Email</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content with ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail-unread" size={80} color="#4A90E2" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verifica tu Email</Text>

        {/* Description */}
        <Text style={styles.description}>
          Para continuar, necesitas verificar tu dirección de email.
        </Text>

        {email && (
          <Text style={styles.emailText}>
            Email: <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>¿Qué hacer ahora?</Text>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              Revisa tu bandeja de entrada y carpeta de spam
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Haz clic en el enlace del email de verificación
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Regresa a la app e intenta nuevamente
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.resendButton]}
            onPress={handleResendEmail}
            disabled={isResending}
            testID="resend-button"
          >
            {isResending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="mail" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.resendButtonText}>Reenviar Email</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.backButtonBottom]}
            onPress={handleModalClose} // Usar handleModalClose también para el botón de "Volver"
            testID="go-back-button"
          >
            <Ionicons name="arrow-back" size={20} color="#4A90E2" style={styles.buttonIcon} />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomAlert
        isVisible={customAlertVisible}
        message={customAlertMessage}
        type={customAlertType}
        onClose={handleCloseCustomAlert}
        title={customAlertTitle}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },  iconContainer: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#4A90E2',
  },  instructionsContainer: {
    width: '100%',
    marginBottom: 35,
    paddingHorizontal: 10,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginRight: 10,
    width: 20,
  },
  instructionText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    lineHeight: 22,
  },  buttonsContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    minHeight: 50,
  },
  resendButton: {
    backgroundColor: '#4A90E2',
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonBottom: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  backButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default EmailVerificationScreen;
