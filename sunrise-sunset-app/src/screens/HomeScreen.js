import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { getSettings } from '../utils/storage';
import { getSunTimes, scheduleSunNotifications } from '../utils/sunScheduler';
import { format } from 'date-fns';

export default function HomeScreen({ navigation }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    const s = await getSettings();
    setSettings(s);
    calculateNextEvent(s);

    // Reschedule notifications to keep the 21-day rolling window fresh
    if (s && s.location) {
      scheduleSunNotifications(
        s.location.latitude,
        s.location.longitude,
        21,
        { sunrise: s.sunriseOffset, sunset: s.sunsetOffset }
      ).catch(err => console.error("Failed to reschedule", err));
    }
  };

  const calculateNextEvent = (settings) => {
    if (!settings || !settings.location) return;

    const now = new Date();
    const { sunrise, sunset } = getSunTimes(now, settings.location.latitude, settings.location.longitude);

    // Determine if it is day or night
    setIsDay(now >= sunrise && now < sunset);

    // Simple logic: if sunrise is past, check sunset. If sunset is past, check tomorrow's sunrise.
    if (now < sunrise) {
      setNextEvent({ type: 'Sunrise', time: sunrise });
    } else if (now < sunset) {
      setNextEvent({ type: 'Sunset', time: sunset });
    } else {
      // Get tomorrow's sunrise
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const { sunrise: nextSunrise } = getSunTimes(tomorrow, settings.location.latitude, settings.location.longitude);
      setNextEvent({ type: 'Sunrise', time: nextSunrise });
    }
  };

  if (!settings) return <View style={styles.container}><Text>Loading...</Text></View>;

  const getBackgroundColor = () => {
    // Simple gradient-like solid colors for v1 day/night cycle
    if (isDay) return '#87CEEB'; // Sky Blue
    return '#2C3E50'; // Dark Blue/Grey
  };

  const getTextColor = () => {
    if (isDay) return '#333';
    return '#FFF';
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <Text style={[styles.time, { color: getTextColor() }]}>{format(currentTime, 'HH:mm:ss')}</Text>
      <Text style={[styles.date, { color: getTextColor() }]}>{format(currentTime, 'EEEE, MMMM do')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Event</Text>
        {nextEvent ? (
          <Text style={styles.eventText}>{nextEvent.type} at {format(nextEvent.time, 'HH:mm')}</Text>
        ) : (
          <Text>Calculating...</Text>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6f7ff',
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40,
    width: '80%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventText: {
    fontSize: 24,
    color: '#f39c12',
  },
  controls: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
