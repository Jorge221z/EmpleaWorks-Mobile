import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

import TestApi from '@/components/src/TestApi'; 
import { getCandidateDashboard, getSavedOffers } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import TabContentTransition from '@/components/TabContentTransition';
import { useActiveTab } from '@/hooks/useActiveTab';
import ScreenTransition from '@/components/ScreenTransition';
import SmoothPressable from '@/components/SmoothPressable';

// Updated interfaces based on the actual API response
interface Company {
  id: number;
  name: string;
  email: string;
  description: string | null;
  address: string;
  logo: string | null;
  web_link: string | null;
}

interface Offer {
  id: number;
  name: string;
  category: string;
  contract_type: string;
  job_location: string;
  degree: string;
  description: string;
  closing_date: string;
  created_at: string;
  company: Company;
}

// Creamos un array porque es lo que devuelve la API
type CandidateData = Offer[];

// Función para obtener colores del tema
const getThemeColors = (colorScheme: string) => {
  const isDark = colorScheme === 'dark';
  return {
    primary: isDark ? '#8b5fc8' : '#4A2976',
    primaryLight: isDark ? '#5e3a8a' : '#3d2c52',
    secondary: '#9b6dff',
    accent: '#f6c667',
    background: isDark ? '#121212' : '#f8f9fa',
    white: isDark ? '#1e1e1e' : '#ffffff',
    text: isDark ? '#f0f0f0' : '#333',
    lightText: isDark ? '#bbbbbb' : '#666',
    error: '#e74c3c',
    success: '#2ecc71',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(43, 31, 60, 0.15)',
    card: isDark ? '#2d2d2d' : '#ffffff',
    shadowColor: isDark ? '#000' : '#000',
    cardBackground: isDark ? '#2d2d2d' : '#ffffff',
    golden: '#fac030',
    // Colores mejorados para el tema dark
    buttonSecondary: isDark ? '#3a3a3a' : '#f5f5f5',
    buttonSecondaryText: isDark ? '#e0e0e0' : '#666666',
    buttonSecondaryBorder: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(43, 31, 60, 0.15)',
    infoBoxBackground: isDark ? 'rgba(139, 95, 200, 0.15)' : 'rgba(74, 41, 118, 0.05)',
    infoBoxBorder: isDark ? 'rgba(139, 95, 200, 0.4)' : 'rgba(74, 41, 118, 0.3)',
  };
};

export default function TabTwoScreen() {
  const { logout, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme || 'light');
  const { isTabActive } = useActiveTab();
  
  const [dashboardData, setDashboardData] = useState<CandidateData | null>(null);
  const [savedOffersCount, setSavedOffersCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingSavedOffers, setLoadingSavedOffers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isNotCandidate, setIsNotCandidate] = useState(false);

  // Animación para el indicador de recarga
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Función para obtener datos del candidateDashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getCandidateDashboard();
      
      // Asegurar que la respuesta es un array
      if (Array.isArray(response)) {
        setDashboardData(response);
      } else if (response && response.applications) {
        // Si la API cambia y devuelve el formato esperado originalmente
        setDashboardData(response.applications);
      } else {
        // Si la respuesta no tiene la estructura esperada por fallos del backend
        console.error("Unexpected API response format:", response);
        setError("Formato de respuesta inesperado");
        setDashboardData(null);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error("Failed while trying to fetch candidateDashboard data: ", error);
      
      // Verificar si el error es específicamente que el usuario no es candidato
      const errorMessage = error?.error || error?.message || (error instanceof Error ? error.message : String(error));
      if (errorMessage === "Usuario no es candidato." || errorMessage.includes("no es candidato")) {
        setIsNotCandidate(true);
      } else {
        setError(errorMessage);
      }
      
      setLoading(false);
    }
  };

  // Función para obtener el número de ofertas guardadas
  const fetchSavedOffersCount = async () => {
    try {
      setLoadingSavedOffers(true);
      const response = await getSavedOffers();
      const savedOffers = response.savedOffers || response || [];
      setSavedOffersCount(Array.isArray(savedOffers) ? savedOffers.length : 0);
    } catch (error) {
      console.error("Error al obtener ofertas guardadas:", error);
      setSavedOffersCount(0);
    } finally {
      setLoadingSavedOffers(false);
    }
  };

  // Función para refrescar los datos
  const onRefresh = async () => {
    setRefreshing(true);
    setIsNotCandidate(false); // Reiniciar el estado de "no candidato"
    setError(null); // Limpiar errores anteriores
    await Promise.all([
      fetchDashboardData(),
      fetchSavedOffersCount()
    ]);
    setRefreshing(false);
  };

  // Cargar datos al montar el componente y verificar autenticación
  useEffect(() => {
    // Solo intentamos cargar datos si el usuario está autenticado
    if (isAuthenticated) {
      fetchDashboardData();
      fetchSavedOffersCount();
    } else {
      // Redirigir al welcome si no está autenticado
      router.replace('/welcome');
    }
  }, [isAuthenticated]);

  // Efecto para animar el indicador de recarga
  useEffect(() => {
    if (refreshing) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [refreshing]);

  // Componente para mostrar cuando el usuario no es candidato
  const NotCandidateScreen = () => (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header gradient */}
      <LinearGradient
        colors={
          colorScheme === 'dark' 
            ? ['#2a2a2a', '#1e1e1e', '#151515'] 
            : ['#f8f9fa', '#e9ecef', '#dee2e6']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />
      
      <ScrollView 
        style={styles.notCandidateScrollView}
        contentContainerStyle={styles.notCandidateContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={[styles.notCandidateCard, { backgroundColor: colors.card }]}>
          {/* Icono principal */}
          <View style={[styles.notCandidateIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <FontAwesome 
              name="user-times" 
              size={48} 
              color={colors.primary} 
            />
          </View>
          
          {/* Título principal */}
          <Text style={[styles.notCandidateTitle, { color: colors.text }]}>
            Acceso Restringido
          </Text>
          
          {/* Descripción */}
          <Text style={[styles.notCandidateDescription, { color: colors.lightText }]}>
            Esta sección está disponible únicamente para candidatos que buscan empleo.
          </Text>
          
          {/* Mensaje adicional */}
          <View style={[styles.notCandidateInfoBox, { 
            backgroundColor: colors.infoBoxBackground, 
            borderColor: colors.infoBoxBorder 
          }]}>
            <FontAwesome 
              name="info-circle" 
              size={16} 
              color={colors.primary} 
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.notCandidateInfoText, { color: colors.primary }]}>
              La App de EmpleaWorks esta diseñada unicamente para candidatos que buscan empleo. Si eres una empresa o reclutador, por favor accede desde la web de EmpleaWorks.
            </Text>
          </View>
          
          {/* Botones de acción */}
          <View style={styles.notCandidateButtonsContainer}>
            <TouchableOpacity 
              style={[
                styles.notCandidateButton, 
                styles.secondaryButton, 
                { 
                  borderColor: colors.buttonSecondaryBorder,
                  backgroundColor: colors.buttonSecondary
                }
              ]}
              onPress={() => {
                setIsNotCandidate(false);
                setError(null);
                fetchDashboardData();
              }}
              activeOpacity={0.7}
            >
              <FontAwesome name="refresh" size={16} color={colors.buttonSecondaryText} style={{ marginRight: 8 }} />
              <Text style={[styles.notCandidateButtonText, { color: colors.buttonSecondaryText }]}>
                Intentar de Nuevo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.notCandidateButton, 
                styles.secondaryButton, 
                { 
                  borderColor: colors.buttonSecondaryBorder,
                  backgroundColor: colors.buttonSecondary
                }
              ]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <FontAwesome name="arrow-left" size={16} color={colors.buttonSecondaryText} style={{ marginRight: 8 }} />
              <Text style={[styles.notCandidateButtonText, { color: colors.buttonSecondaryText }]}>
                Volver Atrás
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.notCandidateButton, styles.primaryButton]}
              onPress={logout}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <FontAwesome name="sign-out" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={[styles.notCandidateButtonText, { color: '#ffffff' }]}>
                  Cerrar Sesión
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // Si el usuario no es candidato, mostrar la pantalla especial
  if (isNotCandidate) {
    return (
      <TabContentTransition isActive={isTabActive()}>
        <NotCandidateScreen />
      </TabContentTransition>
    );
  }

  return (
    <TabContentTransition isActive={isTabActive()}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Full-width header gradient like profile - neutral colors */}
        <LinearGradient
          colors={
            colorScheme === 'dark' 
              ? ['#2a2a2a', '#1e1e1e', '#151515'] 
              : ['#f8f9fa', '#e9ecef', '#dee2e6']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.cardBackground}
            />
          }
          bounces={true}
        >
        {/* Indicador de recarga */}
        {refreshing && (
          <Animated.View
            style={[
              styles.refreshIndicator,
              { 
                opacity: fadeAnim,
                borderColor: colors.border
              }
            ]}
          >
            <View style={[styles.solidContainer, { backgroundColor: colors.cardBackground }]}>
              <ActivityIndicator size="small" color={colors.secondary} />
              <Text style={[styles.refreshText, { color: colors.secondary }]}>Actualizando solicitudes...</Text>
            </View>
          </Animated.View>
        )}

        {/* Header */}
        <View style={[styles.headerContainer, { backgroundColor: 'transparent' }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { 
              color: colorScheme === 'dark' ? '#f0f0f0' : '#333333'
            }]}>Mis Solicitudes</Text>
            <Text style={[styles.subtitle, { 
              color: colorScheme === 'dark' ? 'rgba(240, 240, 240, 0.8)' : 'rgba(51, 51, 51, 0.8)'
            }]}>
              Gestiona tus solicitudes e intereses
            </Text>
          </View>
        </View>

        {/* Main Cards Section */}
        <View style={[styles.cardsContainer, { backgroundColor: colors.background }]}>
          
          {/* Applications Card */}
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => {
              router.push('/my-applications');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.cardLayout}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome 
                  name="briefcase" 
                  size={32} 
                  color="#ffffff" 
                />
              </LinearGradient>
              
              <View style={[styles.cardContent, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Mis Solicitudes
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.lightText }]}>
                  Ofertas aplicadas
                </Text>
                
                <View style={[styles.cardStatsContainer, { backgroundColor: colors.card }]}>
                  <Text style={[styles.cardNumber, { color: colors.primary }]}>
                    {loading ? '...' : (dashboardData?.length || 0)}
                  </Text>
                  <Text style={[styles.cardUnit, { color: colors.lightText }]}>
                    {(dashboardData?.length || 0) === 1 ? 'solicitud' : 'solicitudes'}
                  </Text>
                </View>
                
                <View style={[styles.cardArrow, { backgroundColor: colors.card }]}>
                  <FontAwesome 
                    name="chevron-right" 
                    size={16} 
                    color={colors.lightText} 
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Saved Offers Card */}
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => {
              router.push('/saved-offers');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.cardLayout}>
              <LinearGradient
                colors={[colors.golden, '#f39c12']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome 
                  name="bookmark" 
                  size={32} 
                  color="#ffffff" 
                />
              </LinearGradient>
              
              <View style={[styles.cardContent, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Ofertas Guardadas
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.lightText }]}>
                  Ofertas de interés
                </Text>
                
                <View style={[styles.cardStatsContainer, { backgroundColor: colors.card }]}>
                  <Text style={[styles.cardNumber, { color: colors.golden }]}>
                    {loadingSavedOffers ? '...' : savedOffersCount}
                  </Text>
                  <Text style={[styles.cardUnit, { color: colors.lightText }]}>
                    {savedOffersCount === 1 ? 'oferta' : 'ofertas'}
                  </Text>
                </View>
                
                <View style={[styles.cardArrow, { backgroundColor: colors.card }]}>
                  <FontAwesome 
                    name="chevron-right" 
                    size={16} 
                    color={colors.lightText} 
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={[styles.tipsSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            💡 Tip del día
          </Text>
          
          <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[
                colorScheme === 'dark' ? 'rgba(139, 95, 200, 0.1)' : 'rgba(74, 41, 118, 0.05)',
                colorScheme === 'dark' ? 'rgba(155, 109, 255, 0.1)' : 'rgba(155, 109, 255, 0.05)'
              ]}
              style={styles.tipGradient}
            >
              <FontAwesome 
                name="lightbulb-o" 
                size={24} 
                color={colors.primary} 
                style={styles.tipIcon}
              />
              <Text style={[styles.tipText, { color: colors.text }]}>
                Personaliza tu perfil para aumentar tus posibilidades. Los reclutadores valoran perfiles completos y actualizados.
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              Error: {error}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
    </TabContentTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 16,
    paddingBottom: 30,
    paddingTop: 20,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 45,
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  separator: {
    height: 1,
    width: '80%',
    marginVertical: 8,
  },
  cardsContainer: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    marginBottom: 40,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
    minHeight: 160,
  },
  cardLayout: {
    flexDirection: 'row',
    height: 160,
  },
  cardGradient: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    position: 'relative',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardStatsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  cardUnit: {
    fontSize: 16,
  },
  cardArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -8,
  },
  // New sections styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
  },
  tipsSection: {
    marginBottom: 24,
    marginTop: 0,
  },
  tipCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tipGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Estilos para el indicador de recarga
  refreshIndicator: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
  },
  solidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
  },
  refreshText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  // Estilos para la pantalla "No es candidato"
  notCandidateScrollView: {
    flex: 1,
  },
  notCandidateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
    minHeight: '100%',
  },
  notCandidateCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginVertical: 20,
  },
  notCandidateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  notCandidateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  notCandidateDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  notCandidateInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
    width: '100%',
  },
  notCandidateInfoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  notCandidateButtonsContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: 12,
  },
  notCandidateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 50,
  },
  secondaryButton: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  primaryButton: {
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minHeight: 50,
  },
  notCandidateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
