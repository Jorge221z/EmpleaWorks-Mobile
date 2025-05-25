import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { getDashboard } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Define interfaces para los tipos de datos
interface Company {
  id: number;
  name: string;
  // Otras propiedades de company si son necesarias
}

interface Offer {
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

interface DashboardData {
  categories: string[];
  contractTypes: string[];
  offers: Offer[];
}

// Constantes de diseño para temas
const getThemeColors = (colorScheme: string) => {
  const isDark = colorScheme === 'dark';
  return {
    primary: '#4A2976',
    primaryLight: isDark ? '#5e3a8a' : '#3d2c52',
    secondary: '#9b6dff',
    accent: '#f6c667',
    background: isDark ? '#121212' : '#f8f9fa',
    white: isDark ? '#1e1e1e' : '#ffffff',
    title: isDark ? '#f0f0f0' : '#f0f0f0', // Texto más oscuro en tema light para mejor contraste
    subtitle: isDark ? '#e0e0e0' : '#e0e0e0', // Texto secundario más oscuro en tema light
    text: isDark ? '#f0f0f0' : '#1a1a1a', // Texto más oscuro en tema light para mejor contraste
    lightText: isDark ? '#bbbbbb' : '#4a4a4a', // Texto secundario más oscuro en tema light
    error: '#e74c3c',
    success: '#2ecc71',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(43, 31, 60, 0.15)',
    card: isDark ? '#2d2d2d' : '#ffffff',
    shadowColor: isDark ? '#000' : '#000',
    debug: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(43, 31, 60, 0.05)',
    golden: '#fac030',
    cardBackground: isDark ? '#2d2d2d' : '#ffffff',
    fieldBackground: isDark ? '#333333' : '#f8f8f8',
    sectionHeaderBg: isDark ? '#242424' : '#f4f4f4',
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
    backgroundColor: 'transparent', // Fondo transparente para consistencia
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.title,
    marginBottom: 8,
    textAlign: 'center',
    backgroundColor: 'transparent', // Fondo transparente para consistencia
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtitle,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent', // Fondo transparente para consistencia
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    marginBottom: 20,
  },
  debugSection: {
    marginBottom: 20,
    backgroundColor: 'transparent', // Fondo transparente para consistencia
  },
  debugButton: {
    backgroundColor: colors.debug,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  debugButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    backgroundColor: colors.debug, // Fondo consistente con el botón
  },
  debugIcon: {
    marginRight: 5,
  },
  statusSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statusText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    backgroundColor: colors.cardBackground, // Fondo consistente con la tarjeta
  },
  countText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    backgroundColor: colors.cardBackground, // Fondo consistente con la tarjeta
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'transparent', // Fondo transparente para consistencia
  },
  loadingText: {
    marginLeft: 10,
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'transparent', // Fondo transparente para consistencia
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: colors.cardBackground, // Usar fondo de tarjeta para consistencia
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
    backgroundColor: colors.cardBackground, // Fondo consistente con el contenedor
  },
  offersSection: {
    flex: 1,
    backgroundColor: 'transparent', // Quitar el fondo para que las tarjetas floten
  },
  offersContainer: {
    paddingBottom: 20,
    backgroundColor: 'transparent', // Quitar el fondo para que las tarjetas floten
  },
  offerCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 6, // Aumentar elevación para más sensación de flotación
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 }, // Aumentar offset para más profundidad
    shadowOpacity: 0.15, // Aumentar opacidad para mejor efecto flotante
    shadowRadius: 12, // Aumentar radio para sombra más suave
    borderWidth: 1,
    borderColor: colors.border,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    backgroundColor: colors.cardBackground, // Asegurar fondo consistente
  },
  offerDetail: {
    fontSize: 14,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground, // Asegurar fondo consistente
  },
  offerDetailLabel: {
    fontWeight: '600',
    color: colors.text,
    marginRight: 4,
    backgroundColor: colors.cardBackground, // Asegurar fondo consistente
  },
  offerDetailValue: {
    color: colors.lightText,
    backgroundColor: colors.cardBackground, // Asegurar fondo consistente
    flex: 1,
  },
  noOffersContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginTop: 20,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noOffersText: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
    marginTop: 10,
    backgroundColor: colors.cardBackground, // Fondo consistente con la tarjeta
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    backgroundColor: 'transparent', // Fondo transparente para consistencia
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutGradient: {
    backgroundColor: colors.error,
  },
  reloadGradient: {
    backgroundColor: colors.primary,
  },
});

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const COLORS = getThemeColors(colorScheme || 'light');
  const styles = createStyles(COLORS);
  
  // Obtenemos la función logout del contexto de autenticación
  const { logout, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Función para manejar el proceso de logout (similar a la de AuthContext)
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

  // Función para obtener datos del dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboard(); //llamamos a la función de axios
      
      setDashboardData(response);
      
      setLoading(false); //dejamos de cargar ya que se ha producido éxito
    } catch (error) {
      console.error("Failed while trying to fetch dashboard data: ", error);
      setError(error instanceof Error ? error.message : String(error)); 
      
      setLoading(false);
    }
  };

  // Función para refrescar los datos
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Redirección si el usuario no está autenticado en el contexto
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);
      

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Ofertas de empleo recientes</Text>
          <Text style={styles.subtitle}>Explora las últimas oportunidades disponibles</Text>
          <View style={{ paddingTop: 15 }} />
        </View>

        {/* Debug Section */}
        <View style={styles.debugSection}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogout}
              disabled={loading}
            >
              <LinearGradient
                colors={['#e74c3c', '#c0392b']}
                style={styles.buttonGradient}
              >
                <FontAwesome 
                  name="sign-out" 
                  size={16} 
                  color="#ffffff" 
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {loading ? "Cerrando..." : "Logout"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={fetchDashboardData}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.buttonGradient}
              >
                <FontAwesome 
                  name="refresh" 
                  size={16} 
                  color="#ffffff" 
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {loading ? "Cargando..." : "Recargar"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Debug Info - Esta parte sirve durante las primeras fases de desarrollo */}
          <TouchableOpacity style={styles.debugButton}>
            <FontAwesome 
              name="info-circle" 
              size={14} 
              color={COLORS.primary} 
              style={styles.debugIcon}
            />
            <Text style={styles.debugButtonText}>
              Debug: {dashboardData ? "Datos cargados" : "Sin datos"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando ofertas...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <FontAwesome name="exclamation-triangle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {/* Status Section */}
        {dashboardData && (
          <View style={styles.statusSection}>
            <Text style={styles.statusText}>
              Estado: {dashboardData ? "✅ Datos cargados" : "❌ Sin datos"}
            </Text>
            <Text style={styles.countText}>
              {dashboardData.offers?.length || 0} ofertas disponibles
            </Text>
          </View>
        )}

        {/* Offers Section */}
        <View style={styles.offersSection}>
          {dashboardData && dashboardData.offers && dashboardData.offers.length > 0 ? (
            <View style={styles.offersContainer}>
              {dashboardData.offers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                  <Text style={styles.offerTitle}>{offer.name}</Text>
                  
                  <View style={styles.offerDetail}>
                    <Text style={styles.offerDetailLabel}>Categoría:</Text>
                    <Text style={styles.offerDetailValue}>{offer.category}</Text>
                  </View>
                  
                  <View style={styles.offerDetail}>
                    <Text style={styles.offerDetailLabel}>Ubicación:</Text>
                    <Text style={styles.offerDetailValue}>{offer.job_location}</Text>
                  </View>
                  
                  <View style={styles.offerDetail}>
                    <Text style={styles.offerDetailLabel}>Tipo de contrato:</Text>
                    <Text style={styles.offerDetailValue}>{offer.contract_type}</Text>
                  </View>
                  
                  <View style={styles.offerDetail}>
                    <Text style={styles.offerDetailLabel}>Titulación:</Text>
                    <Text style={styles.offerDetailValue}>{offer.degree}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : !loading && dashboardData && (
            <View style={styles.noOffersContainer}>
              <FontAwesome name="briefcase" size={40} color={COLORS.lightText} />
              <Text style={styles.noOffersText}>No hay ofertas disponibles</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
