import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        // Personalización mejorada de la barra de tabs inferior
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].tabBarBackground,
          borderTopColor: Colors[colorScheme ?? 'light'].tabBarBorder,
          borderTopWidth: 1,
          height: 60, // Altura un poco mayor para mejor visualización
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarInactiveTintColor: colorScheme === 'dark' ? 'rgba(155, 109, 255, 0.4)' : 'rgba(124, 40, 235, 0.35)', // Versión "fantasma" con opacidad del color activo
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        // Personalización de la barra superior (header)
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].headerBackground,
        },
        headerTitleStyle: {
          color: Colors[colorScheme ?? 'light'].text,
          fontWeight: '600',
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ofertas',
          tabBarIcon: ({ color }) => <TabBarIcon name="th-large" color={color} />, // Icono cambiado a 'th-large'
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Candidaturas',
          tabBarIcon: ({ color }) => <TabBarIcon name="bookmark" color={color} />, // Icono cambiado a 'bookmark'
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mi Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />, // Icono agregado para 'user'
        }}
      />
    </Tabs>
  );
}