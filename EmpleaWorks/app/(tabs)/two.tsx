import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Ofertas</Text>
      <Text style={{ marginTop: 0, fontSize: 16 }}>Gestiona tus solicitudes y perfil</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
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
    marginBottom: 20,
    height: 1,
    width: '80%',
  },
});
