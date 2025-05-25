import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { getOfferDetails, applyToOffer } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Define interfaces para los tipos de datos
interface Company {
  id: number;
  name: string;
  email: string;
  description: string | null;
  address: string;
  logo: string | null;
  web_link: string | null;
}

interface OfferDetails {
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

// Constantes de diseño para temas (copiadas de index.tsx)
const getThemeColors = (colorScheme: string) => {
  const isDark = colorScheme === 'dark';
  return {
    primary: '#4A2976',
    primaryLight: isDark ? '#5e3a8a' : '#3d2c52',
    secondary: '#9b6dff',
    accent: '#f6c667',
    background: isDark ? '#121212' : '#f8f9fa',
    white: isDark ? '#1e1e1e' : '#ffffff',
    title: isDark ? '#f0f0f0' : '#f0f0f0',
    subtitle: isDark ? '#e0e0e0' : '#e0e0e0',
    text: isDark ? '#f0f0f0' : '#1a1a1a',
    lightText: isDark ? '#bbbbbb' : '#4a4a4a',
    error: '#e74c3c',
    success: '#2ecc71',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(43, 31, 60, 0.15)',
    card: isDark ? '#2d2d2d' : '#ffffff',
    shadowColor: isDark ? '#000' : '#000',
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
    backgroundColor: 'transparent',
  },  backButton: {
    position: 'absolute',
    left: -10,
    top: 0,
    backgroundColor: colors.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.title,
    marginBottom: 8,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtitle,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginLeft: 10,
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: colors.cardBackground,
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
    backgroundColor: colors.cardBackground,
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
  offerHeader: {
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  offerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    backgroundColor: 'transparent',
    lineHeight: 28,
  },  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  companyName: {
    fontSize: 18,
    color: colors.secondary,
    fontWeight: '700',
    marginLeft: 10,
    backgroundColor: 'transparent',
    flex: 1,
  },
  companyDetails: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },  companyInfo: {
    fontSize: 14,
    color: colors.lightText,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },  datesHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'transparent',
    gap: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fieldBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    elevation: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateHeaderText: {
    fontSize: 12,
    color: colors.lightText,
    marginLeft: 8,
    backgroundColor: 'transparent',
    fontWeight: '600',
    flex: 1,
  },  companyContactSection: {
    marginTop: 16,
    backgroundColor: colors.fieldBackground,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
    paddingVertical: 2,
  },
  contactText: {
    fontSize: 13,
    color: colors.text,
    marginLeft: 10,
    backgroundColor: 'transparent',
    flex: 1,
    fontWeight: '500',
  },  descriptionSection: {
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: 'transparent',
    flex: 1,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    backgroundColor: 'transparent',
  },
  detailsSection: {
    padding: 20,
    paddingTop: 15,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },detailsGrid: {
    backgroundColor: 'transparent',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fieldBackground,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 15,
    marginBottom: 10,
    width: '100%',
  },
  detailIcon: {
    marginRight: 10,
    width: 18,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  detailContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.lightText,
    marginBottom: 3,
    backgroundColor: 'transparent',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    backgroundColor: 'transparent',
  },  actionButtonsContainer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: 'hidden',
    minHeight: 54,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    minHeight: 54,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    flex: 1,
  },
  applyButton: {
    // Estilo específico para el botón de aplicar si es necesario
  },
  saveButton: {
    // Estilo específico para el botón de guardar si es necesario
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 15,
    zIndex: 1,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    letterSpacing: 0.5,
  },
});

export default function ShowOfferScreen() {
  const colorScheme = useColorScheme();
  const COLORS = getThemeColors(colorScheme || 'light');
  const styles = createStyles(COLORS);
  
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams();
  const offerId = params.id as string;
  
  const [offer, setOffer] = useState<OfferDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  // Función para determinar si una oferta es nueva (4 días o menos)
  const isOfferNew = (createdAt: string): boolean => {
    const offerDate = new Date(createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference <= 4;
  };

  // Función para obtener los detalles de la oferta
  const fetchOfferDetails = async () => {
    if (!offerId) {
      setError('ID de oferta no válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getOfferDetails(offerId);
      setOffer(response);
    } catch (error) {
      console.error("Error al obtener detalles de la oferta:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar a la oferta
  const handleApplyToOffer = async () => {
    if (!offer) return;

    try {
      setApplying(true);
      
      // Datos básicos de la aplicación (puedes expandir esto según tu API)
      const applicationData = {
        phone: '', // Podrías obtener esto del perfil del usuario
        email: '', // También del perfil del usuario
        cl: 'Interesado en esta posición', // Carta de presentación básica
        offer_id: offer.id,
      };

      await applyToOffer(applicationData);
      
      Alert.alert(
        'Aplicación enviada',
        'Tu aplicación ha sido enviada exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error al aplicar a la oferta:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al enviar tu aplicación. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setApplying(false);
    }
  };

  // Función para guardar la oferta (placeholder - implementar según tu lógica)
  const handleSaveOffer = async () => {
    Alert.alert(
      'Funcionalidad pendiente',
      'La función de guardar ofertas será implementada próximamente.',
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    fetchOfferDetails();
    
    // Redirección si el usuario no está autenticado
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, offerId]);

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
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Detalles de la oferta</Text>
          <Text style={styles.subtitle}>Información completa de la posición</Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando detalles...</Text>
          </View>
        )}        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <FontAwesome name="exclamation-triangle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {/* Offer Details */}
        {offer && (
          <View style={styles.offerCard}>
            {/* Header de la oferta */}
            <View style={styles.offerHeader}>
              <Text style={styles.offerTitle}>{offer.name}</Text>
              
              {/* Información de la empresa */}
              <View style={styles.companySection}>
                <FontAwesome name="building" size={16} color={COLORS.secondary} />
                <Text style={styles.companyName}>{offer.company?.name || 'Empresa no especificada'}</Text>
              </View>
              
              {/* Información de fechas en el header */}
              <View style={styles.datesHeaderContainer}>
                <View style={styles.dateItem}>
                  <FontAwesome name="calendar" size={14} color={COLORS.secondary} />
                  <Text style={styles.dateHeaderText}>
                    {new Date(offer.created_at).toLocaleDateString('es-ES')}
                  </Text>
                </View>                {offer.closing_date && (
                  <View style={styles.dateItem}>
                    <FontAwesome name="clock-o" size={14} color={COLORS.error} />
                    <Text style={[styles.dateHeaderText, { color: COLORS.error }]}>
                      {new Date(offer.closing_date).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Información adicional de la empresa */}
              {offer.company && (
                <View style={styles.companyContactSection}>
                  <View style={styles.contactItem}>
                    <FontAwesome name="envelope" size={14} color={COLORS.secondary} />
                    <Text style={styles.contactText}>{offer.email}</Text>
                  </View>
                  {offer.company.address && (
                    <View style={styles.contactItem}>
                      <FontAwesome name="map-marker" size={14} color={COLORS.secondary} />
                      <Text style={styles.contactText}>{offer.company.address}</Text>
                    </View>
                  )}
                  {offer.company.web_link && (
                    <View style={[styles.contactItem, { marginBottom: 0 }]}>
                      <FontAwesome name="globe" size={14} color={COLORS.secondary} />
                      <Text style={styles.contactText}>{offer.company.web_link}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Descripción */}
            <View style={styles.descriptionSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: 'transparent' }}>
                <FontAwesome name="file-text-o" size={18} color={COLORS.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Descripción del puesto</Text>
              </View>
              <Text style={styles.description}>{offer.description}</Text>
            </View>

            {/* Detalles técnicos */}
            <View style={styles.detailsSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: 'transparent' }}>
                <FontAwesome name="list-ul" size={18} color={COLORS.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Detalles de la posición</Text>
              </View>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <FontAwesome name="tag" size={16} color={COLORS.secondary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Categoría</Text>
                    <Text style={styles.detailValue}>{offer.category}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <FontAwesome name="map-marker" size={16} color={COLORS.secondary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Ubicación</Text>
                    <Text style={styles.detailValue}>{offer.job_location}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <FontAwesome name="file-text" size={16} color={COLORS.secondary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Tipo de contrato</Text>
                    <Text style={styles.detailValue}>{offer.contract_type}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <FontAwesome name="graduation-cap" size={16} color={COLORS.secondary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Titulación requerida</Text>
                    <Text style={styles.detailValue}>{offer.degree}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Botones de acción */}
        {offer && (
          <View style={styles.actionButtonsContainer}>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveOffer}
              >
                <LinearGradient
                  colors={[COLORS.secondary, COLORS.accent]}
                  style={styles.buttonGradient}
                >
                  <FontAwesome 
                    name="bookmark" 
                    size={16} 
                    color="#ffffff" 
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Guardar oferta</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.applyButton]}
                onPress={handleApplyToOffer}
                disabled={applying}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryLight]}
                  style={styles.buttonGradient}
                >
                  <FontAwesome 
                    name={applying ? "spinner" : "paper-plane"} 
                    size={16} 
                    color="#ffffff" 
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>
                    {applying ? "Aplicando..." : "Aplicar a la oferta"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}