import { Stack, useRouter, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuthContext } from "@/contexts/authContext";
import { LocationProvider } from "@/contexts/locationContext";
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSessionStore } from "@/stores/sesionStore";
import QueryClientProviderWrapper from '@/components/QueryClientProviderWrapper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

// Prevent splash screen from auto-hiding until we are ready
SplashScreen.preventAutoHideAsync().catch(() => { /* handle error */ });

function RootLayoutNav() {
  useAuthContext();
  const { hydrate, isLoading, isHydrated } = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync().catch(() => { /* handle error */ });
    }
  }, [isHydrated]);

  if (!isHydrated) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProviderWrapper>
        <LocationProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </LocationProvider>
      </QueryClientProviderWrapper>
    </GestureHandlerRootView>
  );
}
