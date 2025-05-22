import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

import TestApi from '@/components/src/TestApi'; 
import { getCandidateDashboard } from '@/api/axios';
import { useAuth } from '@/context/AuthContext'; // Añadimos useAuth
import { router } from 'expo-router'; // Añadimos router para redirección

// Define interfaces for the candidate dashboard data
interface Company {
  id: number;
  name: string;
}

interface Offer {
  id: number;
  name: string;
  category: string;
  contract_type: string;
  job_location: string;
  degree: string;
  created_at: string;
  company?: Company;
}

interface Application {
  id: number;
  offer: Offer;
  status: string;
  created_at: string;
}

interface CandidateData {
  applications: Application[];
}

export default function TabTwoScreen() {
  const { logout, isAuthenticated } = useAuth(); // Obtenemos logout e isAuthenticated
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
      const response = await getCandidateDashboard(); //llamamos a la fución de axios
      
      setDashboardData(response);
      
      setLoading(false); //dejamos de cargar ya que se ha producido éxito
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
      {dashboardData && dashboardData.applications && (
        <Text>Hay {dashboardData.applications.length || 0} solicitudes realizadas</Text>
      )}
      
      {/* Lista de aplicaciones */}
      {dashboardData && dashboardData.applications && dashboardData.applications.length > 0 ? (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.applicationsContainer}>
          {dashboardData.applications.map((application) => (
            <View key={application.id} style={styles.applicationCard}>
              <Text style={styles.applicationTitle}>{application.offer.name}</Text>
              <Text style={styles.applicationDetail}>Categoría: {application.offer.category}</Text>
              <Text style={styles.applicationDetail}>Ubicación: {application.offer.job_location}</Text>
              <Text style={styles.applicationDetail}>Tipo de contrato: {application.offer.contract_type}</Text>
              <Text style={styles.applicationDetail}>Titulación: {application.offer.degree}</Text>
              <Text style={styles.applicationStatus}>
                Estado: <Text style={{fontWeight: 'bold'}}>{application.status}</Text>
              </Text>
              <Text style={styles.applicationDate}>
                Aplicación enviada: {new Date(application.created_at).toLocaleDateString()}
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
