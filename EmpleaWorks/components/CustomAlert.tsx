import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
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
    color: '#ffc107',
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
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const [isModalRendered, setIsModalRendered] = React.useState(false);

  // Effect 1: Control presence of Modal in the tree
  React.useEffect(() => {
    if (isVisible) {
      setIsModalRendered(true); // Render the modal
    }
    // For hiding, the animation effect (Effect 2) will set setIsModalRendered to false later
  }, [isVisible]);

  // Effect 2: Control animation
  React.useEffect(() => {
    if (isVisible && isModalRendered) { // Animate in
      slideAnim.setValue(0); // Ensure animation starts from 0
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!isVisible && isModalRendered) { // Animate out
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsModalRendered(false); // Un-render the modal after animation
      });
    }
  }, [isVisible, isModalRendered, slideAnim]);

  if (!isModalRendered) {
    return null; // Don't render Modal if it's not supposed to be in the tree
  }

  const config = alertConfig[type];
  const alertTitle = title || type.charAt(0).toUpperCase() + type.slice(1);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0], // Slide from top
  });

  return (
    <Modal
      transparent
      visible={true} // Modal is always "visible" when rendered; its presence in tree is controlled by isModalRendered
      animationType="none" // We are using Animated API for custom animation
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.alertContainer, { backgroundColor: config.backgroundColor, borderColor: config.borderColor, transform: [{ translateY }] }]}>
          <Ionicons name={config.icon} size={24} color={config.color} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={[styles.titleText, { color: config.color }]}>{alertTitle}</Text>
            <Text style={[styles.messageText, { color: config.color }]}>{message}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-outline" size={24} color={config.color} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50, 
  },
  alertContainer: {
    width: '90%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
  },
  closeButton: {
    padding: 5,
  },
});

export default CustomAlert;
