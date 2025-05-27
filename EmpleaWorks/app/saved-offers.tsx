import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View } from '@/components/Themed';
import { getSavedOffers, toggleSavedOffer } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';

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

// Interface para las ofertas guardadas
interface SavedOffer {
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

export default function SavedOffersScreen() {
  const { isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme || 'light');
  
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingOfferId, setRemovingOfferId] = useState<number | null>(null);

  // Función para obtener las ofertas guardadas
  const fetchSavedOffers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      const response = await getSavedOffers();
      
      // Asegurar que la respuesta es un array
      if (Array.isArray(response)) {
        setSavedOffers(response);
      } else if (response && response.savedOffers) {
        setSavedOffers(response.savedOffers);
      } else {
        console.warn("Formato de respuesta inesperado:", response);
        setSavedOffers([]);
      }
      
    } catch (error) {
      console.error("Error al obtener ofertas guardadas:", error);
      setError(error instanceof Error ? error.message : String(error));
      setSavedOffers([]);
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
  const navigateToOffer = (offerId: number) => {
    router.push({
      pathname: '/showOffer',
      params: { id: offerId.toString() }
    });
  };

  // Función para remover oferta de guardados
  const handleRemoveOffer = async (offerId: number, offerName: string) => {
    Alert.alert(
      'Remover de guardados',
      `¿Estás seguro de que quieres remover "${offerName}" de tus ofertas guardadas?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingOfferId(offerId);
              await toggleSavedOffer(offerId);
              
              // Actualizar la lista local removiendo la oferta
              setSavedOffers(prev => prev.filter(offer => offer.id !== offerId));
              
            } catch (error) {
              console.error("Error al remover oferta:", error);
              Alert.alert(
                'Error',
                'No se pudo remover la oferta de guardados. Inténtalo de nuevo.',
                [{ text: 'OK' }]
              );
            } finally {
              setRemovingOfferId(null);
            }
          },
        },
      ]    );
  };

  // Función para aplicar a la oferta
  const handleApplyToOffer = (offer: SavedOffer) => {
    // Navegar al formulario de aplicación con los datos de la oferta
    router.push({
      pathname: '/ApplyForm',
      params: {
        offerId: offer.id.toString(),
        offerTitle: offer.name,
      }
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
      fetchSavedOffers();
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Recargar datos cuando el usuario regrese a esta pantalla
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchSavedOffers();
      }
    }, [isAuthenticated])
  );

  // Función para el refresh pull-to-refresh
  const onRefresh = useCallback(() => {
    fetchSavedOffers(true);
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
          onPress={() => router.back()}
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
          }]}>Ofertas Guardadas</Text>
          <Text style={[styles.subtitle, { 
            color: colorScheme === 'dark' ? 'rgba(240, 240, 240, 0.8)' : 'rgba(51, 51, 51, 0.8)'
          }]}>
            {savedOffers.length} {savedOffers.length === 1 ? 'oferta guardada' : 'ofertas guardadas'}
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
              Cargando ofertas guardadas...
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
              onPress={() => fetchSavedOffers()}
            >
              <Text style={[styles.retryButtonText, { color: colors.primary }]}>
                Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state */}
        {!loading && !error && savedOffers.length === 0 && (
          <View style={[styles.emptyContainer, { backgroundColor: colors.cardBackground }]}>
            <FontAwesome name="bookmark-o" size={48} color={colors.lightText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No tienes ofertas guardadas
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.lightText }]}>
              Guarda ofertas que te interesen para acceder a ellas fácilmente más tarde
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

        {/* Saved offers list */}
        {!loading && !error && savedOffers.length > 0 && (
          <View style={[styles.offersContainer, { backgroundColor: colors.background }]}>
            {savedOffers.map((offer, index) => (
              <TouchableOpacity
                key={offer.id}
                style={[styles.offerCard, { backgroundColor: colors.card }]}
                onPress={() => navigateToOffer(offer.id)}
                activeOpacity={0.7}
                >
                          {/* Card header with saved indicator where chevron was */}
                <View style={[styles.cardHeader, { backgroundColor: colors.card }]}>
                  <LinearGradient
                    colors={[colors.golden, '#e67e22']}
                    style={styles.savedIndicatorInHeader}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <FontAwesome 
                      name="bookmark" 
                      size={10} 
                      color="#ffffff" 
                      style={styles.savedIconSmall}
                    />
                    <Text style={styles.savedTextSmall}>Guardada</Text>
                  </LinearGradient>
                </View>

                {/* Chevron positioned at mid-height on right edge */}
                <View style={styles.chevronRightEdge}>
                  <FontAwesome 
                    name="chevron-right" 
                    size={16} 
                    color={colors.lightText} 
                  />
                </View>

                {/* Job title and company */}
                <View style={[styles.cardContent, { backgroundColor: colors.card }]}>
                  <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={2}>
                    {offer.name}
                  </Text>
                  <Text style={[styles.companyName, { color: colors.primary }]} numberOfLines={1}>
                    {offer.company.name}
                  </Text>
                </View>                {/* Job details */}
                <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
                  <View style={[styles.detailRow, { backgroundColor: colors.card }]}>
                    <FontAwesome 
                      name={getContractTypeIcon(offer.contract_type)} 
                      size={14} 
                      color={getContractTypeColor(offer.contract_type)}
                      style={styles.detailIcon}
                    />
                    <Text style={[styles.detailText, { color: colors.lightText }]}>
                      {offer.contract_type}
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
                      {offer.job_location}
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
                      {offer.category}
                    </Text>
                  </View>
                </View>
                   
                          {/* Dates */}
                <View style={[styles.datesContainer, { backgroundColor: colors.card }]}>
                  <View style={[styles.dateInfo, { backgroundColor: colors.card }]}>
                    <Text style={[styles.dateLabel, { color: colors.lightText }]}>
                      Publicada el:
                    </Text>
                    <Text style={[styles.dateValue, { color: colors.text }]}>
                      {formatDate(offer.created_at)}
                    </Text>
                  </View>
                  
                  <View style={[styles.dateInfo, { backgroundColor: colors.card }]}>
                    <Text style={[styles.dateLabel, { color: colors.lightText }]}>
                      Cierra el:
                    </Text>
                    <Text style={[
                      styles.dateValue, 
                      { color: isOfferClosingSoon(offer.closing_date) ? colors.error : colors.text }
                    ]}>
                      {formatDate(offer.closing_date)}
                    </Text>
                  </View>
                </View>

                {/* Action buttons where status indicator was */}
                <View style={[styles.actionButtonsContainer, { backgroundColor: colors.card }]}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton, { backgroundColor: colors.error }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveOffer(offer.id, offer.name);
                    }}
                    disabled={removingOfferId === offer.id}
                  >
                    {removingOfferId === offer.id ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <FontAwesome 
                          name="trash" 
                          size={14} 
                          color="#ffffff" 
                          style={styles.actionButtonIcon}
                        />
                        <Text style={styles.actionButtonText}>Eliminar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.applyButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleApplyToOffer(offer);
                    }}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.secondary]}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <FontAwesome 
                        name="paper-plane" 
                        size={14} 
                        color="#ffffff" 
                        style={styles.actionButtonIcon}
                      />
                      <Text style={styles.actionButtonText}>Aplicar</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Badges in bottom right corner */}
                {(isOfferNew(offer.created_at) || isOfferClosingSoon(offer.closing_date)) && (
                  <View style={styles.bottomRightBadgesContainer}>
                    {isOfferNew(offer.created_at) && (
                      <View style={[styles.badge, styles.newBadge, styles.bottomBadge]}>
                        <Text style={styles.badgeText}>NUEVO</Text>
                      </View>
                    )}
                    {isOfferClosingSoon(offer.closing_date) && (
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

const  styles = StyleSheet.create({
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
  offersContainer: {
    paddingVertical: 8,
  },  offerCard: {
    borderRadius: 16,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 0,
    paddingBottom: 0,
    paddingTop: 0,
    zIndex: 10,
    position: 'relative',
  },
  cardContent: {
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
  },  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
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
  },
  statusContainer: {
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
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
  },
  bottomRightBadgesContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'column',
    alignItems: 'flex-end',
    zIndex: 5,
  },  bottomBadge: {
    marginBottom: 4,
    marginRight: 0,  },  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 0,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 80,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 80,
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    opacity: 0.9,
  },  applyButton: {
    backgroundColor: 'transparent',
  },
  savedIconSmall: {
    marginRight: 4,
  },  savedTextSmall: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  topLeftSavedContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 15,
  },  topLeftSavedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },  savedIndicatorInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: -4,
    marginTop: -4,
  },  chevronRightEdge: {
    position: 'absolute',
    right: 12,
    top: '25%',
    transform: [{ translateY: -8 }],
    zIndex: 5,
  },
});
