import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { getCurrentLocation, getManualCities } from '../utils/location';
import { saveSettings, getSettings, defaultSettings } from '../utils/storage';
import { scheduleSunNotifications } from '../utils/sunScheduler';
import * as Notifications from 'expo-notifications';

export default function OnboardingScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    if (status !== 'granted') {
      alert('Notification permissions are required for alarms to work.');
    }
    return status === 'granted';
  };

  const handleGPSLocation = async () => {
    const permGranted = await requestNotificationPermissions();
    if (!permGranted) return;

    setLoading(true);
    const { status, location } = await getCurrentLocation();
    setLoading(false);

    if (status === 'granted' && location) {
      const newSettings = {
        ...defaultSettings,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          city: "Current Location", // In a real app, reverse geocode this
        },
        isManualLocation: false,
      };
      await saveAndNavigate(newSettings);
    } else {
      alert("Permission denied or location unavailable. Please select manually.");
    }
  };

  const handleManualSelection = async () => {
    const permGranted = await requestNotificationPermissions();
    if (!permGranted) return;

    // For v1, just pick the first city (New York) or show a simple list logic
    // To keep it simple here, we'll just set New York as default if manual is chosen,
    // or better, navigate to a selection modal.
    // Here we'll simulate picking New York.
    const cities = getManualCities();
    const city = cities[0]; // New York

    const newSettings = {
      ...defaultSettings,
      location: {
        latitude: city.latitude,
        longitude: city.longitude,
        city: city.name,
      },
      isManualLocation: true,
    };
    await saveAndNavigate(newSettings);
  };

  const saveAndNavigate = async (settings) => {
    await saveSettings(settings);
    // Schedule initial notifications
    await scheduleSunNotifications(settings.location.latitude, settings.location.longitude);
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Sun Health</Text>
      <Text style={styles.text}>
        Align your circadian rhythm with the sun. We need your location to calculate sunrise and sunset times.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Button title="Use GPS Location" onPress={handleGPSLocation} />
          <View style={styles.spacer} />
          <Button title="Select City Manually" onPress={handleManualSelection} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: '#555',
  },
  spacer: {
    height: 20,
  },
});
