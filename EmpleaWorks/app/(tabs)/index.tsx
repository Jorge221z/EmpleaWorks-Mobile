import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Image, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState, useRef } from 'react';
import { getDashboard } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTransition from '@/components/ScreenTransition';
import SmoothPressable from '@/components/SmoothPressable';
import { getScreenTransitionConfig, getUIElementConfig } from '@/constants/TransitionConfig';
import TabContentTransition from '@/components/TabContentTransition';
import { useActiveTab } from '@/hooks/useActiveTab';
import TabScreenWrapper from '@/components/TabScreenWrapper';
import Logger from '../../utils/logger';

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
    sectionHeaderBg: isDark ? '#242424' : '#f4f4f4',    // Colores específicos para el contador de ofertas
    offersCountNumber: isDark ? '#e0e0e0' : '#000000', // Más claro en dark, negro en light
    offersCountIconBg: isDark ? '#333333' : '#e8e8e8', // Mantener en dark, más oscuro en light
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
  },  separator: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    marginBottom: 20,
  },statusSection: {
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
  },  offersCountSection: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  offersCountContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,  },  offersCountIcon: {
    backgroundColor: colors.offersCountIconBg,
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    padding: 8,
  },offersCountContent: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'baseline',
  },  offersCountNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.offersCountNumber,
    backgroundColor: 'transparent',
    marginRight: 8,
  },  offersCountLabel: {
    fontSize: 14,
    color: colors.lightText,
    backgroundColor: 'transparent',
    fontWeight: '500',
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
    backgroundColor: 'transparent',
  },
  offerCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  offerCardHeader: {
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  offerCardBody: {
    padding: 20,
    paddingTop: 15,
    backgroundColor: colors.cardBackground,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    backgroundColor: 'transparent',
    lineHeight: 24,
  },
  offerCompanyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  offerCompany: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
    marginLeft: 6,
    backgroundColor: 'transparent',
  },
  offerDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: 'transparent',
  },
  offerDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fieldBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: '47%',
    flex: 1,
  },
  offerDetailIcon: {
    marginRight: 8,
    width: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  offerDetailContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  offerDetailLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.lightText,
    marginBottom: 2,
    backgroundColor: 'transparent',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  offerDetailValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.sectionHeaderBg,
    marginTop: 15,
  },
  offerDate: {
    fontSize: 12,
    color: colors.lightText,
    backgroundColor: 'transparent',
    marginLeft: 8,
  },
  offerDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  offerActionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  offerBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 0,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 15,
    zIndex: 1,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    letterSpacing: 0.5,
    textAlign: 'left',
    marginLeft: -5,
    marginTop: 3,
  },
  noOffersContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    marginTop: 20,
    elevation: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noOffersIcon: {
    backgroundColor: colors.fieldBackground,
    padding: 20,
    borderRadius: 50,
    marginBottom: 15,
  },
  noOffersText: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontWeight: '500',
  },  noOffersSubText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
    opacity: 0.7,
  },
  // Estilos para el indicador de recarga
  refreshIndicator: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  solidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.cardBackground,
  },
  refreshText: {
    marginLeft: 10,
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const COLORS = getThemeColors(colorScheme || 'light');
  const styles = createStyles(COLORS);
  const { isTabActive } = useActiveTab();
  
  // Obtenemos la función logout del contexto de autenticación
  const { logout, isAuthenticated } = useAuth();const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animación para el indicador de recarga
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Función para determinar si una oferta es nueva (4 días o menos)
  const isOfferNew = (createdAt: string): boolean => {
    const offerDate = new Date(createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference <= 4;
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
      Logger.error("Failed while trying to fetch dashboard data: ", error);
      setError(error instanceof Error ? error.message : String(error)); 
      
      setLoading(false);
    }
  };

  // Función para refrescar los datos
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };  useEffect(() => {
    fetchDashboardData();
      // Redirección si el usuario no está autenticado en el contexto
    if (!isAuthenticated) {
      router.replace('./welcome');
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
    }  }, [refreshing]);
      
  return (
    <TabContentTransition isActive={isTabActive()} animationType="fade">
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
            progressBackgroundColor={COLORS.cardBackground}
          />
        }
          showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Indicador de recarga */}
        {refreshing && (
          <Animated.View
            style={[
              styles.refreshIndicator,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.solidContainer}>
              <ActivityIndicator size="small" color={COLORS.secondary} />
              <Text style={styles.refreshText}>Actualizando ofertas...</Text>
            </View>
          </Animated.View>
        )}

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Ofertas de empleo recientes</Text>
          <Text style={styles.subtitle}>Explora las últimas oportunidades disponibles</Text>
          <View style={{ paddingTop: 15 }} />
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
        
        {/* Offers Count Section */}
        {dashboardData && (
          <View style={styles.offersCountSection}>
            <View style={styles.offersCountContainer}>
              <Image 
                source={require('@/assets/images/logo.png')} 
                style={styles.offersCountIcon}
                resizeMode="contain"
              />
              <View style={styles.offersCountContent}>
                <Text style={styles.offersCountNumber}>
                  {dashboardData.offers?.length || 0}
                </Text>
                <Text style={styles.offersCountLabel}>
                  {dashboardData.offers?.length === 1 ? 'oferta disponible' : 'ofertas disponibles'}
                </Text>
              </View>
            </View>
          </View>
          )}
          
          {/* Offers Section */}
        <View style={styles.offersSection}>
          {dashboardData && dashboardData.offers && dashboardData.offers.length > 0 ? (
            <View style={styles.offersContainer}>
                {dashboardData.offers
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((offer) => (
                  <TouchableOpacity 
                  key={offer.id} 
                  style={styles.offerCard} 
                  activeOpacity={0.9}
                  onPress={() => {
                    router.push({
                      pathname: './showOffer',
                      params: { id: offer.id }
                    });
                  }}
                >
                  {/* Priority Badge - Solo para ofertas nuevas */}
                  {isOfferNew(offer.created_at) && (
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerBadgeText}>NUEVO</Text>
                    </View>
                  )}

                  {/* Card Header */}
                  <View style={styles.offerCardHeader}>
                    <Text style={styles.offerTitle}>{offer.name}</Text>
                    <View style={styles.offerCompanyContainer}>
                      <FontAwesome name="building" size={12} color={COLORS.secondary} />
                      <Text style={styles.offerCompany}>
                        {offer.company?.name || 'Empresa no especificada'}
                      </Text>
                    </View>
                  </View>

                  {/* Card Body */}
                  <View style={styles.offerCardBody}>
                    <View style={styles.offerDetailsGrid}>
                      <View style={styles.offerDetailItem}>
                        <View style={styles.offerDetailIcon}>
                          <FontAwesome name="tag" size={14} color={COLORS.secondary} />
                        </View>
                        <View style={styles.offerDetailContent}>
                          <Text style={styles.offerDetailLabel}>Categoría</Text>
                          <Text style={styles.offerDetailValue}>{offer.category}</Text>
                        </View>
                      </View>

                      <View style={styles.offerDetailItem}>
                        <View style={styles.offerDetailIcon}>
                          <FontAwesome name="map-marker" size={14} color={COLORS.secondary} />
                        </View>
                        <View style={styles.offerDetailContent}>
                          <Text style={styles.offerDetailLabel}>Ubicación</Text>
                          <Text style={styles.offerDetailValue}>{offer.job_location}</Text>
                        </View>
                      </View>

                      <View style={styles.offerDetailItem}>
                        <View style={styles.offerDetailIcon}>
                          <FontAwesome name="file-text" size={14} color={COLORS.secondary} />
                        </View>
                        <View style={styles.offerDetailContent}>
                          <Text style={styles.offerDetailLabel}>Contrato</Text>
                          <Text style={styles.offerDetailValue}>{offer.contract_type}</Text>
                        </View>
                      </View>

                      <View style={styles.offerDetailItem}>
                        <View style={styles.offerDetailIcon}>
                          <FontAwesome name="graduation-cap" size={14} color={COLORS.secondary} />
                        </View>
                        <View style={styles.offerDetailContent}>
                          <Text style={styles.offerDetailLabel}>Titulación</Text>
                          <Text style={styles.offerDetailValue}>{offer.degree}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Card Footer */}
                  <View style={styles.offerFooter}>
                    <View style={{ backgroundColor: 'transparent' }}>
                      <View style={styles.offerDateRow}>
                        <FontAwesome name="calendar-plus-o" size={12} color="#2196F3" />
                        <Text style={styles.offerDate}>
                          Publicado: {new Date(offer.created_at).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                      {offer.closing_date && (
                        <View style={[styles.offerDateRow, { marginTop: 4 }]}>
                          <FontAwesome name="clock-o" size={12} color={COLORS.error} />
                          <Text style={[styles.offerDate, { color: COLORS.error }]}>
                            Cierra: {new Date(offer.closing_date).toLocaleDateString('es-ES')}
                          </Text>
                        </View>
                      )}
                      </View>
                      <TouchableOpacity
                        style={styles.offerActionButton}
                        onPress={() => {
                        router.push({
                          pathname: './showOffer',
                          params: { id: offer.id }
                        });
                      }}
                    >
                      <FontAwesome name="eye" size={12} color="#ffffff" />
                      <Text style={styles.offerActionText}>Ver más</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : !loading && dashboardData && (
            <View style={styles.noOffersContainer}>
              <View style={styles.noOffersIcon}>
                <FontAwesome name="briefcase" size={40} color={COLORS.secondary} />
              </View>
              <Text style={styles.noOffersText}>No hay ofertas disponibles</Text>
              <Text style={styles.noOffersSubText}>
                Revisa más tarde para ver nuevas oportunidades
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
    </TabContentTransition>
  );
}
