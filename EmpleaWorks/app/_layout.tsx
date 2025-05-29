import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure proper initial route handling in production builds
  initialRouteName: 'welcome',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Este componente se encarga de la redirección basada en autenticación
function InitialLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('=== AuthRedirect Debug ===');
    console.log('Auth state:', isAuthenticated ? 'Autenticado' : 'No autenticado');
    console.log('isLoading:', isLoading);
    console.log('Current path segments:', segments);
    console.log('Current route:', segments[0] || 'root/undefined');
    
    // Skip redirections during loading state
    if (isLoading) {
      console.log('⏳ Cargando estado de autenticación...');
      return;
    }

    const inTabsGroup = segments[0] === '(tabs)';
    const currentRoute = segments[0];
    
    // Define screens that authenticated users can access
    const authenticatedScreens = [
      'ApplyForm', 'showOffer', 'saved-offers', 'edit-profile', 
      'change-password', 'my-applications', 'modal'
    ];
    
    console.log('inTabsGroup:', inTabsGroup);
    console.log('Is authenticated screen:', authenticatedScreens.includes(currentRoute || ''));
    console.log('Processing route logic...');
    
    // Use setTimeout to avoid navigation conflicts during component mounting
    const navigationTimeout = setTimeout(() => {
      // If the user is authenticated
      if (isAuthenticated) {
        console.log('✅ Usuario autenticado');
        
        // Allow access to tabs group and authenticated screens
        if (inTabsGroup || authenticatedScreens.includes(currentRoute || '')) {
          console.log('✅ Usuario autenticado en ruta válida:', currentRoute);
          return;
        }
        
        // Only redirect to tabs if user is on an auth screen (welcome, login, register)
        const authOnlyScreens = ['welcome', 'login', 'register'];
        if (!currentRoute || authOnlyScreens.includes(currentRoute)) {
          console.log('🔄 Redirigiendo usuario autenticado a tabs desde:', currentRoute || 'root');
          router.replace('/(tabs)' as any);
        }
      } 
      // If the user is not authenticated
      else {
        console.log('❌ Usuario NO autenticado');
        
        // Only allow access to welcome, login, and register screens
        const allowedRoutes = ['welcome', 'login', 'register'];
        console.log('Rutas permitidas:', allowedRoutes);
        console.log('Ruta actual válida?', currentRoute ? allowedRoutes.includes(currentRoute) : false);
        
        // If user is not on an allowed route OR on root route (no segments), redirect to welcome
        if (!currentRoute || !allowedRoutes.includes(currentRoute)) {
          console.log('🔄 Redirigiendo usuario no autenticado a welcome desde:', currentRoute || 'root');
          router.replace('/welcome' as any);
        } else {
          console.log('✅ Usuario no autenticado ya en ruta permitida:', currentRoute);
        }
      }
      console.log('=== Fin AuthRedirect Debug ===');
    }, 100); // Small delay to ensure navigation is ready

    return () => clearTimeout(navigationTimeout);
  }, [isAuthenticated, segments, isLoading, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Configuración global de transiciones más suaves
        presentation: 'card',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animationDuration: 300,
        // Configuración específica por plataforma
        ...(Platform.OS === 'android' && {
          animationDuration: 250,
        }),
        // Configuración de transiciones
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen 
        name="welcome" 
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="login" 
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="showOffer" 
        options={{
          presentation: 'modal',
          animationDuration: 300,
        }}
      />
      <Stack.Screen 
        name="ApplyForm" 
        options={{
          presentation: 'modal',
          animationDuration: 300,
        }}
      />
      <Stack.Screen 
        name="saved-offers" 
        options={{
          animationDuration: 250,
        }}
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{
          animationDuration: 250,
        }}
      />
      <Stack.Screen 
        name="change-password" 
        options={{
          animationDuration: 250,
        }}
      />
      <Stack.Screen 
        name="my-applications" 
        options={{
          animationDuration: 250,
        }}
      />
      <Stack.Screen 
        name="modal" 
        options={{
          presentation: 'modal',
          animationDuration: 300,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();

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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <NotificationProvider>
          <InitialLayout />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
