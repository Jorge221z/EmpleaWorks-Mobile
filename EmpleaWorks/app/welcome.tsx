import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';

const { width, height } = Dimensions.get('window');

// Función para obtener los colores del tema
const getThemeColors = (colorScheme: 'light' | 'dark') => {
  return {
    background: colorScheme === 'dark' ? '#000000' : '#ffffff',
    text: colorScheme === 'dark' ? '#ffffff' : '#000000',
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#06D6A0',    gradient: colorScheme === 'dark' 
      ? ['#1a1a2e', '#16213e', '#0f1419'] as const
      : ['#667eea', '#764ba2', '#fdcb6e'] as const,
    cardBackground: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9ff',
    textSecondary: colorScheme === 'dark' ? '#a0a0a0' : '#6b7280',
    buttonShadow: colorScheme === 'dark' ? '#000000' : '#0000002a',
  };
};

const createStyles = (colors: ReturnType<typeof getThemeColors>) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  gradientBackground: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center' as const,
    marginTop: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 30,
    shadowColor: colors.buttonShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  titleSection: {
    alignItems: 'center' as const,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center' as const,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
    lineHeight: 26,
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  featuresSection: {
    alignItems: 'center' as const,
    marginBottom: 50,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },  buttonsSection: {
    width: '100%' as const,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginBottom: 16,
    borderRadius: 15,
    overflow: 'hidden' as const,
    shadowColor: colors.buttonShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
  },  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginLeft: 10,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center' as const,
    marginTop: 30,
    lineHeight: 20,
  },
  decorativeElement: {
    position: 'absolute' as const,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  decorativeElement1: {
    top: -100,
    right: -100,
  },
  decorativeElement2: {
    bottom: -100,
    left: -100,
  },
});

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme || 'light');
  const styles = createStyles(colors);
  const router = useRouter();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Inicializar las animaciones
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    { icon: 'search', text: 'Explora miles de ofertas de trabajo' },
    { icon: 'bookmark', text: 'Guarda las ofertas que te interesan' },
    { icon: 'user', text: 'Crea tu perfil profesional' },
    { icon: 'paper-plane', text: 'Aplica a empleos con un click' },
  ];

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Fondo con gradiente */}
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Elementos decorativos */}
      <View style={[styles.decorativeElement, styles.decorativeElement1]} />
      <View style={[styles.decorativeElement, styles.decorativeElement2]} />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Sección del Logo */}
          <View style={styles.logoSection}>
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Image 
                source={require('@/assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
                      
            <View style={styles.titleSection}>
              <Text style={styles.title}>EmpleaWorks</Text>
              <Text style={styles.subtitle}>
                Tu plataforma ideal para encontrar{'\n'}trabajo en la zona de Yecla y alrededores
              </Text>
            </View>
          </View>

          {/* Sección de características */}
          <View style={styles.featuresSection}>
            {features.map((feature, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.featureItem,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: Animated.add(
                          slideAnim,
                          new Animated.Value(index * 10)
                        ),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.featureIcon}>
                  <FontAwesome 
                    name={feature.icon as any} 
                    size={12} 
                    color="rgba(255, 255, 255, 0.9)" 
                  />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </Animated.View>
            ))}
          </View>

          {/* Sección de botones */}
          <View style={styles.buttonsSection}>
            {/* Botón de Registro (Primario) */}
            <TouchableOpacity 
              style={styles.buttonContainer}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                <FontAwesome name="user-plus" size={18} color="#ffffff" />
                <Text style={styles.buttonText}>Crear cuenta</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Botón de Login (Secundario) */}
            <TouchableOpacity 
              style={styles.buttonContainer}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <View style={styles.secondaryButton}>
                <FontAwesome name="sign-in" size={18} color="#ffffff" />
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Únete a miles de profesionales que ya encontraron su empleo ideal
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
