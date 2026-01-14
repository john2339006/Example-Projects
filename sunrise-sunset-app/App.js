import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getSettings } from './src/utils/storage';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Create notification channels for Android
if (Platform.OS === 'android') {
  // Sunrise notification channel
  Notifications.setNotificationChannelAsync('sunrise-notifications', {
    name: 'Sunrise Notifications',
    description: 'Notifications for sunrise events',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'sunrise.wav',
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
    enableLights: true,
    lightColor: '#FFB347', // Warm orange for sunrise
  });

  // Sunset notification channel
  Notifications.setNotificationChannelAsync('sunset-notifications', {
    name: 'Sunset Notifications',
    description: 'Notifications for sunset events',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'sunset.wav',
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
    enableLights: true,
    lightColor: '#FF6B6B', // Warm red for sunset
  });
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    const settings = await getSettings();
    if (settings && settings.location) {
      setInitialRoute('Home');
    } else {
      setInitialRoute('Onboarding');
    }
  };

  if (!initialRoute) return null; // Or a splash screen

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
