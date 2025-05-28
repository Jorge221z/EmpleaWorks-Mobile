import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useEffect } from 'react';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';

export default function NotFoundScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect during loading
    if (isLoading) return;

    // Auto-redirect to appropriate screen after a short delay
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/welcome');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);

  const redirectTarget = isAuthenticated ? '/(tabs)' : '/welcome';

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href={redirectTarget} style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
