import { useState, useCallback } from 'react';
import { checkEmailVerificationRequired, handleEmailVerificationError } from '../api/axios';
import Logger from '../utils/logger';

interface EmailVerificationState {
  isRequired: boolean;
  isVerified: boolean;
  email?: string;
  userId?: string;
  error?: boolean;
}

interface UseEmailVerificationReturn {
  verificationState: EmailVerificationState | null;
  isChecking: boolean;
  checkVerification: () => Promise<boolean>;
  handleApiError: (error: any) => { isEmailVerificationError: boolean; email?: string; message?: string; isCVError?: boolean };
  resetState: () => void;
}

export const useEmailVerification = (): UseEmailVerificationReturn => {
  const [verificationState, setVerificationState] = useState<EmailVerificationState | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkVerification = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const result = await checkEmailVerificationRequired();
      setVerificationState(result);
      Logger.log('🔍 useEmailVerification - Estado verificación:', result);
      return result.isVerified;
    } catch (error) {
      Logger.error('❌ useEmailVerification - Error:', error);
      setVerificationState({
        isRequired: true,
        isVerified: false,
        error: true
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleApiError = useCallback((error: any) => {
    return handleEmailVerificationError(error);
  }, []);

  const resetState = useCallback(() => {
    setVerificationState(null);
  }, []);

  return {
    verificationState,
    isChecking,
    checkVerification,
    handleApiError,
    resetState
  };
};

// Hook para verificar antes de realizar acciones específicas
export const useEmailVerificationGuard = () => {
  const { verificationState, isChecking, checkVerification, handleApiError } = useEmailVerification();

  const checkBeforeAction = useCallback(async (actionName: string = 'esta acción'): Promise<{
    canProceed: boolean;
    needsVerification: boolean;
    verificationData?: EmailVerificationState;
  }> => {
    Logger.log(`🔒 Verificando email antes de: ${actionName}`);
    
    const isVerified = await checkVerification();
    
    if (!isVerified) {
      Logger.log(`🚫 Email no verificado para: ${actionName}`);
      return {
        canProceed: false,
        needsVerification: true,
        verificationData: verificationState || undefined
      };
    }
    
    Logger.log(`✅ Email verificado para: ${actionName}`);
    return {
      canProceed: true,
      needsVerification: false
    };
  }, [checkVerification, verificationState]);

  return {
    verificationState,
    isChecking,
    checkBeforeAction,
    handleApiError
  };
};
