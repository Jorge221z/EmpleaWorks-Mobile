import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

import TestApi from '@/components/src/TestApi'; 
import { getCandidateDashboard, getSavedOffers } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';

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
  };
};

export default function TabTwoScreen() {
  const { logout, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme || 'light');
  
  const [dashboardData, setDashboardData] = useState<CandidateData | null>(null);
  const [savedOffersCount, setSavedOffersCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingSavedOffers, setLoadingSavedOffers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar el proceso de logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      // Después de cerrar sesión, redirige al usuario a la página de login
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error("Failed while trying to fetch candidateDashboard data: ", error);
      setError(error instanceof Error ? error.message : String(error)); 
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

  // Cargar datos al montar el componente y verificar autenticación
  useEffect(() => {
    // Solo intentamos cargar datos si el usuario está autenticado
    if (isAuthenticated) {
      fetchDashboardData();
      fetchSavedOffersCount();
    } else {
      // Redirigir al login si no está autenticado
      router.replace('/login');
    }
  }, [isAuthenticated]);

  return (
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
      >
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
              // TODO: Navigate to applications detail view
              console.log('Navigate to applications view');
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
              // TODO: Navigate to saved offers detail view
              console.log('Navigate to saved offers view');
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

        {/* Action Buttons */}
        <View style={[styles.actionsContainer, { backgroundColor: colors.background }]}>
          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={handleLogout}
            disabled={loading}
          >
            <LinearGradient
              colors={['#3498db', '#2980b9']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <FontAwesome 
                name="sign-out" 
                size={16} 
                color="#ffffff" 
                style={styles.actionButtonIcon}
              />
              <Text style={styles.actionButtonText}>
                {loading ? "Cerrando sesión..." : "Logout"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Reload Data Button */}
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => {
              fetchDashboardData();
              fetchSavedOffersCount();
            }}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.golden, '#f39c12']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <FontAwesome 
                name="refresh" 
                size={16} 
                color="#ffffff" 
                style={styles.actionButtonIcon}
              />
              <Text style={styles.actionButtonText}>
                {loading ? "Cargando..." : "Recargar datos"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
    marginBottom: 24,
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
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
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
});
