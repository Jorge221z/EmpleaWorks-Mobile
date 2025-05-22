import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

import TestApi from '@/components/src/TestApi'; 
import { getCandidateDashboard } from '@/api/axios';

export default function TabTwoScreen() {

  const [dashboardData, setDashboardData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Ofertas</Text>
      <Text style={{ marginTop: 0, fontSize: 16 }}>Gestiona tus solicitudes y perfil</Text>
      <View style={styles.separator} lightColor="#999797" darkColor="rgba(255, 255, 255, 0.66)" />
      
      <TestApi />
      <View style={styles.separator} lightColor="#999797" darkColor="rgba(255, 255, 255, 0.66)" />

      {loading && <Text>Cargando datos...</Text>}
      {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}

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
    justifyContent: 'flex-start', // Cambiado para alinear arriba
    paddingTop: 10, // espacio desde arriba
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
  reloadButton: {
    backgroundColor: '#fff600',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  reloadButtonText: {
    color: '#010101',
    fontWeight: 'bold',
  },
});
