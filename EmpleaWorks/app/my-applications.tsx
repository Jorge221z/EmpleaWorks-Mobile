import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View } from '@/components/Themed';
import { getCandidateDashboard, getOfferDetails } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import Logger from '../utils/logger';

// Interface para la información de la empresa
interface Company {
  id: number;
  name: string;
  email: string;
  description: string | null;
  address: string;
  logo: string | null;
  web_link: string | null;
}

// Interface para las ofertas/solicitudes
interface Application {
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

// Función para obtener colores del tema - similar a two.tsx
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
    warning: '#f39c12',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(43, 31, 60, 0.15)',
    card: isDark ? '#2d2d2d' : '#ffffff',
    shadowColor: isDark ? '#000' : '#000',
    cardBackground: isDark ? '#2d2d2d' : '#ffffff',
    golden: '#fac030',
  };
};

export default function MyApplicationsScreen() {
  const { isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme || 'light');
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las solicitudes del candidato
  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      const response = await getCandidateDashboard();
      
      // Asegurar que la respuesta es un array
      if (Array.isArray(response)) {
        setApplications(response);
      } else if (response && response.applications) {
        setApplications(response.applications);
      } else {
        Logger.warn("Formato de respuesta inesperado:", response);
        setApplications([]);
      }
      
    } catch (error) {
      Logger.error("Error al obtener solicitudes:", error);
      setError(error instanceof Error ? error.message : String(error));
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  // Función para determinar si una oferta es nueva (creada en los últimos 4 días)
  const isOfferNew = (createdAt: string): boolean => {
    const offerDate = new Date(createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference <= 4;
  };

  // Función para determinar si una oferta está próxima a cerrar (menos de 7 días)
  const isOfferClosingSoon = (closingDate: string): boolean => {
    const closing = new Date(closingDate);
    const currentDate = new Date();
    const daysDifference = Math.floor((closing.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference <= 7 && daysDifference >= 0;
  };

  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para navegar a los detalles de la oferta
  const navigateToOffer = (applicationId: number) => {
    router.push({
      pathname: '/showOffer',
      params: { id: applicationId.toString() }
    });
  };
  // Función para obtener el icono según el tipo de contrato
  const getContractTypeIcon = (contractType: string): any => {
    switch (contractType.toLowerCase()) {
      case 'temporal':
        return 'clock-o';
      case 'indefinido':
        return 'check-circle';
      case 'practicas':
        return 'graduation-cap';
      case 'freelance':
        return 'user';
      default:
        return 'briefcase';
    }
  };

  // Función para obtener el color según el tipo de contrato
  const getContractTypeColor = (contractType: string): string => {
    switch (contractType.toLowerCase()) {
      case 'temporal':
        return colors.warning;
      case 'indefinido':
        return colors.success;
      case 'practicas':
        return colors.primary;
      case 'freelance':
        return colors.secondary;
      default:
        return colors.lightText;
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Recargar datos cuando el usuario regrese a esta pantalla
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchApplications();
      }
    }, [isAuthenticated])
  );

  // Función para el refresh pull-to-refresh
  const onRefresh = useCallback(() => {
    fetchApplications(true);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header gradient similar a two.tsx */}
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
      
      {/* Header */}
      <View style={[styles.headerContainer, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.push('/(tabs)/two')}
        >
          <FontAwesome 
            name="arrow-left" 
            size={20} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.title, { 
            color: colorScheme === 'dark' ? '#f0f0f0' : '#333333'
          }]}>Mis Solicitudes</Text>
          <Text style={[styles.subtitle, { 
            color: colorScheme === 'dark' ? 'rgba(240, 240, 240, 0.8)' : 'rgba(51, 51, 51, 0.8)'
          }]}>
            {applications.length} {applications.length === 1 ? 'solicitud activa' : 'solicitudes activas'}
          </Text>
        </View>
      </View>

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
          />
        }
      >
        {/* Loading state */}
        {loading && !refreshing && (
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Cargando solicitudes...
            </Text>
          </View>
        )}

        {/* Error state */}
        {error && !loading && (
          <View style={[styles.errorContainer, { backgroundColor: colors.cardBackground }]}>
            <FontAwesome name="exclamation-triangle" size={24} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { borderColor: colors.primary }]}
              onPress={() => fetchApplications()}
            >
              <Text style={[styles.retryButtonText, { color: colors.primary }]}>
                Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state */}
        {!loading && !error && applications.length === 0 && (
          <View style={[styles.emptyContainer, { backgroundColor: colors.cardBackground }]}>
            <FontAwesome name="inbox" size={48} color={colors.lightText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No tienes solicitudes activas
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.lightText }]}>
              Cuando apliques a ofertas, aparecerán aquí para que puedas hacer seguimiento
            </Text>            
            <TouchableOpacity
              style={[styles.exploreButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)' as any)}
            >
              <FontAwesome name="search" size={16} color="#ffffff" style={styles.exploreIcon} />
              <Text style={styles.exploreButtonText}>
                Explorar ofertas
              </Text>
            </TouchableOpacity>
          </View>
        )}
              
              {/* Applications list */}
        {!loading && !error && applications.length > 0 && (
          <View style={[styles.applicationsContainer, { backgroundColor: 'transparent' }]}>
            {applications.map((application, index) => (
                <TouchableOpacity
                key={application.id}
                style={[styles.applicationCard, { backgroundColor: colors.card }]}
                onPress={() => navigateToOffer(application.id)}
                activeOpacity={0.7}
              >
                {/* Card header with only chevron */}
                <View style={[styles.cardHeader, { backgroundColor: colors.card }]}>
                  <FontAwesome 
                    name="chevron-right" 
                    size={16} 
                    color={colors.lightText} 
                  />
                </View>

                {/* Job title and company */}
                <View style={[styles.cardContent, { backgroundColor: colors.card }]}>
                  <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={2}>
                    {application.name}
                  </Text>
                  <Text style={[styles.companyName, { color: colors.primary }]} numberOfLines={1}>
                    {application.company.name}
                  </Text>
                    </View>
                    
                    {/* Job details */}
                <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
                  <View style={[styles.detailRow, { backgroundColor: colors.card }]}>
                    <FontAwesome 
                      name={getContractTypeIcon(application.contract_type)} 
                      size={14} 
                      color={getContractTypeColor(application.contract_type)}
                      style={styles.detailIcon}
                    />
                    <Text style={[styles.detailText, { color: colors.lightText }]}>
                      {application.contract_type}
                    </Text>
                  </View>
                  
                  <View style={[styles.detailRow, { backgroundColor: colors.card }]}>
                    <FontAwesome 
                      name="map-marker" 
                      size={14} 
                      color={colors.secondary}
                      style={styles.detailIcon}
                    />
                    <Text style={[styles.detailText, { color: colors.lightText }]} numberOfLines={1}>
                      {application.job_location}
                    </Text>
                  </View>
                  
                  <View style={[styles.detailRow, { backgroundColor: colors.card }]}>
                    <FontAwesome 
                      name="tag" 
                      size={14} 
                      color={colors.accent}
                      style={styles.detailIcon}
                    />
                    <Text style={[styles.detailText, { color: colors.lightText }]} numberOfLines={1}>
                      {application.category}
                    </Text>
                  </View>
                </View>
                      {/* Application date and closing date */}
                
                <View style={[styles.datesContainer, { backgroundColor: colors.card }]}>
                  <View style={[styles.dateInfo, { backgroundColor: colors.card }]}>
                    <Text style={[styles.dateLabel, { color: colors.lightText }]}>
                      Publicada el:
                    </Text>
                    <Text style={[styles.dateValue, { color: colors.text }]}>
                      {formatDate(application.created_at)}
                    </Text>
                  </View>
                  
                  <View style={[styles.dateInfo, { backgroundColor: colors.card }]}>
                    <Text style={[styles.dateLabel, { color: colors.lightText }]}>
                      Cierra el:
                    </Text>
                    <Text style={[
                      styles.dateValue, 
                      { color: isOfferClosingSoon(application.closing_date) ? colors.error : colors.text }
                    ]}>
                      {formatDate(application.closing_date)}
                    </Text>
                  </View>
                </View>
                    
                    {/* Status indicator */}
                <View style={[styles.statusContainer, { backgroundColor: colors.card }]}>
                  <LinearGradient
                    colors={[colors.success, '#27ae60']}
                    style={styles.statusIndicator}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <FontAwesome 
                      name="check-circle" 
                      size={12} 
                      color="#ffffff" 
                      style={styles.statusIcon}
                    />
                    <Text style={styles.statusText}>Solicitud enviada</Text>
                  </LinearGradient>
                </View>

                {/* Badges in bottom right corner */}
                {(isOfferNew(application.created_at) || isOfferClosingSoon(application.closing_date)) && (
                  <View style={styles.bottomRightBadgesContainer}>
                    {isOfferNew(application.created_at) && (
                      <View style={[styles.badge, styles.newBadge, styles.bottomBadge]}>
                        <Text style={styles.badgeText}>NUEVO</Text>
                      </View>
                    )}
                    {isOfferClosingSoon(application.closing_date) && (
                      <View style={[styles.badge, styles.urgentBadge, styles.bottomBadge]}>
                        <Text style={styles.badgeText}>CIERRA PRONTO</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
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
  headerContainer: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreIcon: {
    marginRight: 8,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  applicationsContainer: {
    paddingVertical: 8,
  },  applicationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: 0,
    paddingBottom: 0,
    zIndex: 10,
    position: 'relative',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  newBadge: {
    backgroundColor: '#2ecc71',
  },
  urgentBadge: {
    backgroundColor: '#e74c3c',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },  cardContent: {
    marginBottom: 16,
    marginTop: -4,
    paddingTop: 4,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 24,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    width: 20,
    textAlign: 'center',
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
  },  statusContainer: {
    alignItems: 'flex-start',
    paddingBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 6,
  },  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },  bottomRightBadgesContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'column',
    alignItems: 'flex-end',
    zIndex: 5,
  },
  bottomBadge: {
    marginBottom: 4,
    marginRight: 0,
  },
});
