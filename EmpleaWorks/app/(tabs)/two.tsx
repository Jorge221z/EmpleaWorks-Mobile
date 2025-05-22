import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

import TestApi from '@/components/src/TestApi'; 
import { getCandidateDashboard } from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

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

// The API returns an array of offers directly
type CandidateData = Offer[];

export default function TabTwoScreen() {
  const { logout, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(false);
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
        // Si la respuesta no tiene la estructura esperada
        console.error("Unexpected API response format:", response);
        setError("Formato de respuesta inesperado");
        setDashboardData(null);
      }
      
      console.log("Dashboard data received:", response);
      setLoading(false);
    } catch (error) {
      console.error("Failed while trying to fetch candidateDashboard data: ", error);
      setError(error instanceof Error ? error.message : String(error)); 
      setLoading(false);
    }
  };

  // Cargar datos al iniciar el componente y verificar autenticación
  useEffect(() => {
    // Solo intentamos cargar datos si el usuario está autenticado
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      // Redirigir al login si no está autenticado
      router.replace('/login');
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Solicitudes</Text>
      <Text style={{ marginTop: 0, fontSize: 16 }}>Gestiona tus solicitudes y perfil</Text>
      <View style={styles.separator} lightColor="#999797" darkColor="rgba(255, 255, 255, 0.66)" />
      
      {/* Botón de logout - igual que en index.tsx */}
      <TouchableOpacity
        style={[styles.reloadButton, { backgroundColor: '#007bff' }]}
        onPress={handleLogout}
        disabled={loading}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          {loading ? "Cerrando sesión" : "Logout"}
        </Text>
      </TouchableOpacity>
      
      {/* TestApi sigue disponible para desarrollo */}
      <TestApi />
      <View style={styles.separator} lightColor="#999797" darkColor="rgba(255, 255, 255, 0.66)" />

      {loading && <Text>Cargando datos...</Text>}
      {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}

      {/* Sección de información de aplicaciones */}
      <Text style={{marginVertical: 10}}>Estado de datos: {dashboardData ? "Datos cargados" : "Sin datos"}</Text>
      {dashboardData && (
        <Text>Hay {dashboardData.length || 0} solicitudes realizadas</Text>
      )}
      
      {/* Lista de aplicaciones - actualizada para el nuevo formato */}
      {dashboardData && dashboardData.length > 0 ? (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.applicationsContainer}>
          {dashboardData.map((offer) => (
            <View key={offer.id} style={styles.applicationCard}>
              <Text style={styles.applicationTitle}>{offer.name}</Text>
              <Text style={styles.applicationDetail}>Categoría: {offer.category}</Text>
              <Text style={styles.applicationDetail}>Ubicación: {offer.job_location}</Text>
              <Text style={styles.applicationDetail}>Tipo de contrato: {offer.contract_type}</Text>
              <Text style={styles.applicationDetail}>Titulación: {offer.degree}</Text>
              <Text style={styles.applicationDetail}>Empresa: {offer.company?.name || 'No disponible'}</Text>
              <Text style={styles.applicationDate}>
                Fecha límite: {new Date(offer.closing_date).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No has realizado solicitudes todavía</Text>
          <Text style={styles.emptySubText}>Busca ofertas y aplica para verlas aquí</Text>
        </View>
      )}

      {/* Botón de recarga de API para desarrollo */}
      <TouchableOpacity 
        style={styles.reloadButton} 
        onPress={fetchDashboardData}
        disabled={loading}
      >        
        <Text style={styles.reloadButtonText}>
          {loading ? "Cargando..." : "Recargar API"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginTop: 10,
    marginBottom: 0,
    height: 1,
    width: '80%',
  },
  scrollContainer: {
    width: '100%', 
    paddingHorizontal: 16,
  },
  applicationsContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  applicationCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 15
  },
  applicationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  applicationDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  applicationStatus: {
    fontSize: 14,
    marginTop: 8,
    color: '#444',
  },
  applicationDate: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
    fontStyle: 'italic',
  },
  reloadButton: {
    backgroundColor: '#fff600',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 20,
  },
  reloadButtonText: {
    color: '#010101',
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 30,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
  },
});
