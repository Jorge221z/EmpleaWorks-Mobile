import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView, Linking, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { width } = Dimensions.get('window');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openWebsite = async () => {
    const url = 'https://emplea.works';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const goBack = () => {
    router.back();
  };

  const isDark = colorScheme === 'dark';
  
  const gradientColors = isDark 
    ? ['#1a1a2e', '#16213e', '#0f3460'] as const
    : ['#667eea', '#764ba2', '#f093fb'] as const;
    
  const cardGradient = isDark
    ? ['#2d2d2d', '#1f1f1f'] as const
    : ['#ffffff', '#f8faff'] as const;

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with enhanced gradient */}
          <View style={[styles.header, { backgroundColor: 'transparent' }]}>
            {/* Back button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={goBack}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={isDark ? ['#374151', '#6b7280', '#9ca3af'] : ['#e5e7eb', '#d1d5db', '#9ca3af']}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image 
                  source={require('@/assets/images/icon.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.title, { color: 'white' }]}>EmpleaWorks</Text>
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.8)' }]}>Versión Mobile</Text>
          </View>

          {/* Main Content */}
          <View style={[styles.content, { backgroundColor: 'transparent' }]}>
            {/* Welcome Section */}
            <Animated.View
              style={[
                styles.animatedSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={cardGradient}
                style={[styles.section, styles.gradientSection]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.5 }}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
                  <Ionicons name="phone-portrait" size={24} color={colors.tint} />
                </View>
                <Text style={[styles.sectionTitle, { color: isDark ? 'white' : colors.text }]}>
                  ¡Bienvenido a la App Móvil!
                </Text>
                <Text style={[styles.sectionText, { color: isDark ? 'rgba(255,255,255,0.8)' : colors.text + 'CC' }]}>
                  Esta es la versión móvil oficial de EmpleaWorks, diseñada especialmente para 
                  que puedas buscar y gestionar oportunidades laborales desde cualquier lugar.
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* For Candidates Section */}
            <Animated.View
              style={[
                styles.animatedSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={cardGradient}
                style={[styles.section, styles.gradientSection]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.5 }}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
                  <Ionicons name="person" size={24} color="#4CAF50" />
                </View>
                <Text style={[styles.sectionTitle, { color: isDark ? 'white' : colors.text }]}>
                  Diseñada para Candidatos
                </Text>
                <Text style={[styles.sectionText, { color: isDark ? 'rgba(255,255,255,0.8)' : colors.text + 'CC' }]}>
                  Esta aplicación está optimizada para candidatos que buscan empleo. 
                  Las empresas pueden utilizar la plataforma web completa para publicar ofertas.
                </Text>
                <View style={styles.featuresList}>
                  {[
                    { icon: 'search', text: 'Buscar ofertas de trabajo', color: '#2196F3' },
                    { icon: 'heart', text: 'Guardar ofertas favoritas', color: '#E91E63' },
                    { icon: 'document-text', text: 'Gestionar aplicaciones', color: '#FF9800' },
                    { icon: 'person-circle', text: 'Editar perfil profesional', color: '#4CAF50' }
                  ].map((feature, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.featureItem,
                        {
                          opacity: fadeAnim,
                          transform: [{ translateX: slideAnim }]
                        }
                      ]}
                    >
                      <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '15' }]}>
                        <Ionicons name={feature.icon as any} size={16} color={feature.color} />
                      </View>
                      <Text style={[styles.featureText, { color: isDark ? 'rgba(255,255,255,0.9)' : colors.text }]}>
                        {feature.text}
                      </Text>
                    </Animated.View>
                  ))}
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Platform Info Section */}
            <Animated.View
              style={[
                styles.animatedSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={cardGradient}
                style={[styles.section, styles.gradientSection]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.5 }}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#FF9800' + '20' }]}>
                  <Ionicons name="globe" size={24} color="#FF9800" />
                </View>
                <Text style={[styles.sectionTitle, { color: isDark ? 'white' : colors.text }]}>
                  Plataforma Completa
                </Text>
                <Text style={[styles.sectionText, { color: isDark ? 'rgba(255,255,255,0.8)' : colors.text + 'CC' }]}>
                  EmpleaWorks es una plataforma de empleos que conecta candidatos 
                  con empresas en todo tipo de industrias.
                </Text>
                
                <TouchableOpacity 
                  style={styles.websiteButton}
                  onPress={openWebsite}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#7c28eb', '#9b6dff']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.websiteButtonText}>Visitar EmpleaWorks</Text>
                    <Ionicons name="open" size={18} color="white" style={{ marginLeft: 8 }} />
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>

            {/* Features Section */}
            <Animated.View
              style={[
                styles.animatedSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={cardGradient}
                style={[styles.section, styles.gradientSection]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.5 }}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#2196F3' + '20' }]}>
                  <Ionicons name="star" size={24} color="#2196F3" />
                </View>
                <Text style={[styles.sectionTitle, { color: isDark ? 'white' : colors.text }]}>
                  Características Móviles
                </Text>
                <Text style={[styles.sectionText, { color: isDark ? 'rgba(255,255,255,0.8)' : colors.text + 'CC' }]}>
                  Disfruta de una experiencia optimizada para dispositivos móviles:
                </Text>
                <View style={styles.featuresList}>
                  {[
                    { icon: 'notifications', text: 'Notificaciones en tiempo real', color: '#FF5722' },
                    { icon: 'cloud', text: 'Sincronización automática', color: '#2196F3' },
                    { icon: 'shield-checkmark', text: 'Autenticación segura', color: '#4CAF50' },
                    { icon: 'moon', text: 'Modo oscuro disponible', color: '#9C27B0' }
                  ].map((feature, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.featureItem,
                        {
                          opacity: fadeAnim,
                          transform: [{ translateX: slideAnim }]
                        }
                      ]}
                    >
                      <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '15' }]}>
                        <Ionicons name={feature.icon as any} size={16} color={feature.color} />
                      </View>
                      <Text style={[styles.featureText, { color: isDark ? 'rgba(255,255,255,0.9)' : colors.text }]}>
                        {feature.text}
                      </Text>
                    </Animated.View>
                  ))}
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Footer */}
            <Animated.View
              style={[
                styles.footer,
                { backgroundColor: 'transparent' },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={[styles.footerText, { color: 'rgba(255,255,255,0.7)' }]}>
                © 2025 EmpleaWorks. {'\n'} Conectando talento con oportunidades.
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    paddingHorizontal: 20,
  },
  animatedSection: {
    marginBottom: 20,
  },
  section: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientSection: {
    borderWidth: 0,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  featuresList: {
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
  },
  websiteButton: {
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  websiteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
});
