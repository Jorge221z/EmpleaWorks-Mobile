import { StyleSheet } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { use, useEffect, useState } from 'react';
import { getDashboard } from '@/api/axios';

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

export default function TabOneScreen() {

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); //lo tipamos por necesidad ya que usamos Typescript

//Aqui haremos la funcion que recupera los datos del dashboard desde axios
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashboard(); //llamamos a la fución de axios
        
        setDashboardData(response);
        
        setLoading(false); //dejamos de cargar ya que se ha producido éxito
      } catch (error) {

        console.error("Failed while trying to fetch dashboard data: ", error);
        setError(error instanceof Error ? error.message : String(error)); 
        
        setLoading(false);
        };
      };
      fetchDashboardData();
    }, []);
      

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ofertas de empleo recientes</Text>
      <Text style={{ marginTop: 4, fontSize: 16 }}>Explora las últimas oportunidades disponibles</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgb(167, 167, 167)" />
      
      {loading && <Text>Cargando ofertas...</Text>}
      {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
      
      {/* Depuración */}
      <Text style={{marginVertical: 10}}>Estado de datos: {dashboardData ? "Datos cargados" : "Sin datos"}</Text>
      {dashboardData && <Text>Hay {dashboardData.offers?.length || 0} ofertas disponibles</Text>}
      
      {dashboardData && dashboardData.offers && dashboardData.offers.length > 0 ? (
        <View style={styles.offerCard}>
          <Text style={styles.offerTitle}>{dashboardData.offers[0].name}</Text>
          <Text style={styles.offerDetail}>Categoría: {dashboardData.offers[0].category}</Text>
          <Text style={styles.offerDetail}>Ubicación: {dashboardData.offers[0].job_location}</Text>
          <Text style={styles.offerDetail}>Tipo de contrato: {dashboardData.offers[0].contract_type}</Text>
          <Text style={styles.offerDetail}>Titulación: {dashboardData.offers[0].degree}</Text>
        </View>
      ) : !loading && (
        <Text style={{marginTop: 20}}>No hay ofertas disponibles</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Cambiado para alinear arriba
    paddingTop: 15, // espacio desde arriba
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginTop: 10,
    marginBottom: 20,
    height: 1,
    width: '80%',
  },
  offerCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 25
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  offerDetail: {
    fontSize: 14,
    marginBottom: 4,
  }
});
