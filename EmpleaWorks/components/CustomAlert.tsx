import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  isVisible: boolean;
  message: string;
  type: AlertType;
  onClose: () => void;
  title?: string;
}

const alertConfig = {
  success: {
    icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
    color: '#28a745',
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  error: {
    icon: 'close-circle-outline' as keyof typeof Ionicons.glyphMap,
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  warning: {
    icon: 'warning-outline' as keyof typeof Ionicons.glyphMap,
    color: '#ffc107', // Amarillo más oscuro para mejor contraste
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
  },
  info: {
    icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
    color: '#17a2b8',
    backgroundColor: '#d1ecf1',
    borderColor: '#bee5eb',
  },
};

const CustomAlert: React.FC<CustomAlertProps> = ({ isVisible, message, type, onClose, title }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [isModalActuallyVisible, setIsModalActuallyVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const callbackExecuted = useRef(false); // Add this to track if callback was executed

  const handleClose = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null; // Clear ref after timeout
    }
    
    // Start exit animation
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // After animation completes, actually hide the modal
      setIsModalActuallyVisible(false);
      
      // Only execute callback if it hasn't been executed yet
      if (!callbackExecuted.current) {
        callbackExecuted.current = true;
        onClose();
      }
    });
  }, [onClose, anim]); // Dependencies: onClose prop and anim

  // Reset the callback executed flag when visibility changes
  useEffect(() => {
    if (isVisible) {
      callbackExecuted.current = false;
    }
  }, [isVisible]);

  // Effect to handle showing the modal, starting entry animation, and managing autoclose timer
  useEffect(() => {
    if (isVisible) {
      anim.setValue(0); // Reset animation value to ensure it starts from 0
      setIsModalActuallyVisible(true); // Make the modal structure visible

      // Defer animation start to the next frame
      // This allows React to process the state update and modal mounting first
      requestAnimationFrame(() => {
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 100,
          useNativeDriver: true,
        }).start();
      });

      // Autoclose timer
      if (timerRef.current) { // Clear any existing timer before setting a new one
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        handleClose();
      }, 4000) as unknown as number;

    } else {
      // If isVisible becomes false (e.g., parent component initiated close, not via autoclose/button)
      // Clear the timer and handle the close properly
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      if (isModalActuallyVisible) {
        handleClose();
      }
    }

    // Cleanup timer on unmount or if dependencies change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isVisible, anim, handleClose, isModalActuallyVisible]);

  if (!isModalActuallyVisible) {
    return null;
  }

  const config = alertConfig[type];
  const alertTitle = title || type.charAt(0).toUpperCase() + type.slice(1);

  const animatedStyle = {
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1], // Scale from 0.9 to 1
        }),
      },
    ],
  };

  return (
    <Modal
      transparent
      visible={isModalActuallyVisible}
      animationType="none"
      onRequestClose={handleClose} // For Android back button
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            {/* This inner TouchableWithoutFeedback prevents the modal from closing when clicking inside the alert box */}
            <Animated.View style={[styles.alertContainer, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }, animatedStyle]}>
              <Ionicons name={config.icon} size={28} color={config.color} style={styles.icon} />
              <View style={styles.textContainer}>
                <Text style={[styles.titleText, { color: config.color }]}>{alertTitle}</Text>
                <Text style={[styles.messageText, { color: config.color }]}>{message}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close-outline" size={28} color={config.color} />
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
    justifyContent: 'center', // Center vertically
    alignItems: 'center',    // Center horizontally
    paddingHorizontal: 20, // Add some padding so alert is not edge-to-edge
  },
  alertContainer: {
    width: '100%', // Take available width within padding
    maxWidth: 400, // Max width for larger screens
    padding: 20,
    borderRadius: 15, // More rounded corners
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4, // Increased shadow
    },
    shadowOpacity: 0.30, // Increased shadow opacity
    shadowRadius: 4.65,  // Increased shadow radius
    elevation: 8,        // Increased elevation for Android
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleText: {
    fontSize: 17, // Slightly larger title
    fontWeight: 'bold',
    marginBottom: 5, // More space below title
  },
  messageText: {
    fontSize: 15, // Slightly larger message
    lineHeight: 20, // Improved line height
  },
  closeButton: {
    padding: 8, // Larger touch area for close button
    marginLeft: 5,
    alignSelf: 'flex-start', // Align to top of text container
  },
});

export default CustomAlert;
