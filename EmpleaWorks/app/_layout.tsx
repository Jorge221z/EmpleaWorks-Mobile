import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Platform } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Redirección según autenticación
function AuthChecker({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      // Si no está autenticado y trata de acceder a una ruta protegida
      router.replace('/login');
    } else if (isAuthenticated && (segments[0] === 'login' || segments[0] === 'register')) {
      // Si está autenticado y trata de acceder a la pantalla de login o registro
      router.replace('/');
    }
  }, [isAuthenticated, segments, isLoading, router]);

  return <>{children}</>;
}

// Este componente se encarga de la redirección basada en autenticación
function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('AuthRedirect check - Auth state:', isAuthenticated ? 'Autenticado' : 'No autenticado');
    console.log('Current path segments:', segments.join('/'));
    
    // Skip redirections during loading state
    if (isLoading) {
      console.log('Cargando estado de autenticación...');
      return;
    }

    // const inAuthGroup = segments[0] === '(auth)'; // Removed because '(auth)' is not a valid segment
    const inTabsGroup = segments[0] === '(tabs)';
    
    // If the user is authenticated but they're on a non-protected route,
    // redirect them to the home page
    if (
      isAuthenticated &&
      ((!segments[0]) ||
        segments[0] === 'login' ||
        segments[0] === 'register')
    ) {
      console.log('Usuario autenticado redirigiendo a tabs...');
      router.replace('/(tabs)');
    } 
    // If the user is not authenticated and they're on a protected route,
    // redirect them to the login page
    else if (!isAuthenticated && segments.length > 0 && segments[0] === '(tabs)') {
      console.log('Usuario no autenticado redirigiendo a login...');
      router.replace('/login');
    }
  }, [isAuthenticated, segments, isLoading]);

  return <Slot />;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthRedirect />
    </AuthProvider>
  );
}
