import { ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Alata_400Regular as Alata } from '@expo-google-fonts/alata';
import Poetsen from '@assets/fonts/PoetsenOne-Regular.ttf';
import { g } from '@styles';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@services/push_notifications';
import { useEffect } from 'react';

const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const s = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Alata,
    Poetsen,
  });
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  if (!fontsLoaded) return <ActivityIndicator style={s.loading} size="large" color={g.white} />;
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="pdf-modal" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
