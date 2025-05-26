import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, BackHandler } from 'react-native';
import EmailVerificationScreen from './EmailVerificationScreen';
import { useEmailVerificationGuard } from '../hooks/useEmailVerification';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  actionName?: string;
  onVerificationRequired?: (data: any) => void;
  onVerificationComplete?: () => void;
  autoCheck?: boolean;
  showAsModal?: boolean;
}

const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({
  children,
  actionName = 'realizar esta acción',
  onVerificationRequired,
  onVerificationComplete,
  autoCheck = false,
  showAsModal = true
}) => {
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const { verificationState, isChecking, checkBeforeAction, handleApiError } = useEmailVerificationGuard();

  // Auto-check on mount if enabled
  useEffect(() => {
    if (autoCheck) {
      handleCheckVerification();
    }
  }, [autoCheck]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showVerificationScreen) {
        handleCloseVerification();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [showVerificationScreen]);

  const handleCheckVerification = async () => {
    try {
      const result = await checkBeforeAction(actionName);
      
      if (result.needsVerification) {
        setShowVerificationScreen(true);
        onVerificationRequired?.(result.verificationData);
      } else {
        onVerificationComplete?.();
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      const errorResult = handleApiError(error);
      if (errorResult.isEmailVerificationError) {
        setShowVerificationScreen(true);
        onVerificationRequired?.(errorResult);
      }
    }
  };

  const handleCloseVerification = () => {
    setShowVerificationScreen(false);
  };

  const handleVerificationSent = () => {
    // Optionally close the modal after sending verification email
    // setShowVerificationScreen(false);
  };

  // Expose check function to parent components
  const triggerVerificationCheck = () => {
    handleCheckVerification();
  };

  if (showAsModal) {
    return (
      <>
        {children}
        <Modal
          visible={showVerificationScreen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseVerification}
        >
          <EmailVerificationScreen
            email={verificationState?.email}
            onGoBack={handleCloseVerification}
            onVerificationSent={handleVerificationSent}
            showAsModal={true}
          />
        </Modal>
      </>
    );
  }

  // Full screen replacement mode
  if (showVerificationScreen) {
    return (
      <EmailVerificationScreen
        email={verificationState?.email}
        onGoBack={handleCloseVerification}
        onVerificationSent={handleVerificationSent}
        showAsModal={false}
      />
    );
  }

  return <>{children}</>;
};

export default EmailVerificationGuard;

// Helper component for wrapping specific actions
interface VerificationRequiredButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  actionName?: string;
  [key: string]: any;
}

export const VerificationRequiredButton: React.FC<VerificationRequiredButtonProps> = ({
  onPress,
  children,
  actionName = 'realizar esta acción',
  ...buttonProps
}) => {
  const [showVerification, setShowVerification] = useState(false);
  const { checkBeforeAction, verificationState } = useEmailVerificationGuard();

  const handlePress = async () => {
    const result = await checkBeforeAction(actionName);
    
    if (result.canProceed) {
      onPress();
    } else {
      setShowVerification(true);
    }
  };

  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        ...buttonProps,
        onPress: handlePress
      })}
      
      <Modal
        visible={showVerification}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVerification(false)}
      >
        <EmailVerificationScreen
          email={verificationState?.email}
          onGoBack={() => setShowVerification(false)}
          onVerificationSent={() => {
            // Optionally close after sending
            // setShowVerification(false);
          }}
          showAsModal={true}
        />
      </Modal>
    </>
  );
};
