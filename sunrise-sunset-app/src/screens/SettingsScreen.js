import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TextInput, Button } from 'react-native';
import { getSettings, updateSetting } from '../utils/storage';
import { scheduleSunNotifications } from '../utils/sunScheduler';

export default function SettingsScreen() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };

  const handleToggle = async (key, value) => {
    const newSettings = await updateSetting(key, value);
    setSettings(newSettings);
    reschedule(newSettings);
  };

  const handleOffsetChange = async (key, value) => {
    const numValue = parseInt(value) || 0;
    const newSettings = await updateSetting(key, numValue);
    setSettings(newSettings);
    reschedule(newSettings);
  };

  const reschedule = async (newSettings) => {
    if (newSettings.location) {
      await scheduleSunNotifications(
        newSettings.location.latitude,
        newSettings.location.longitude,
        21, // 21 days
        { sunrise: newSettings.sunriseOffset, sunset: newSettings.sunsetOffset }
      );
    }
  };

  if (!settings) return <View><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.header}>Alerts</Text>

        <View style={styles.row}>
          <Text>Sunrise Alert</Text>
          <Switch
            value={settings.sunriseAlertEnabled}
            onValueChange={(val) => handleToggle('sunriseAlertEnabled', val)}
          />
        </View>

        <View style={styles.row}>
          <Text>Sunset Alert</Text>
          <Switch
            value={settings.sunsetAlertEnabled}
            onValueChange={(val) => handleToggle('sunsetAlertEnabled', val)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Offsets (minutes)</Text>
        <Text style={styles.hint}>Negative for before, positive for after.</Text>

        <View style={styles.row}>
          <Text>Sunrise Offset</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(settings.sunriseOffset)}
            onChangeText={(val) => handleOffsetChange('sunriseOffset', val)}
          />
        </View>

        <View style={styles.row}>
          <Text>Sunset Offset</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(settings.sunsetOffset)}
            onChangeText={(val) => handleOffsetChange('sunsetOffset', val)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Location</Text>
        <Text>City: {settings.location?.city || "Unknown"}</Text>
        {/* Re-enter onboarding logic could go here */}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 30,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    width: 60,
    textAlign: 'center',
    borderRadius: 5,
  },
  hint: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
  },
});
