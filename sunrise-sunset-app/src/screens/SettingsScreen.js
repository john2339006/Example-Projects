import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { getCurrentLocation, getManualCities, getCityFromCoordinates } from '../utils/location';
import { getSettings, updateSetting } from '../utils/storage';
import { scheduleSunNotifications } from '../utils/sunScheduler';

export default function SettingsScreen() {
  const [settings, setSettings] = useState(null);
  const [manualStep, setManualStep] = useState(null); // 'country', 'city', null
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);

  // Local state for inputs to allow typing "-" or empty strings
  const [sunriseOffsetStr, setSunriseOffsetStr] = useState("0");
  const [sunsetOffsetStr, setSunsetOffsetStr] = useState("0");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
    if (s) {
      setSunriseOffsetStr(String(s.sunriseOffset || 0));
      setSunsetOffsetStr(String(s.sunsetOffset || 0));
    }
  };

  const handleToggle = async (key, value) => {
    const newSettings = await updateSetting(key, value);
    setSettings(newSettings);
    reschedule(newSettings);
  };

  // Updates local state immediately for responsiveness and to allow "-"
  const handleOffsetLocalChange = (key, value) => {
    // Allow numbers, minus sign at start, or empty string
    if (/^-?\d*$/.test(value)) {
      if (key === 'sunriseOffset') setSunriseOffsetStr(value);
      if (key === 'sunsetOffset') setSunsetOffsetStr(value);
    }
  };

  // Commits the value to settings when the user finishes editing
  const handleOffsetBlur = async (key, valueStr) => {
    let numValue = parseInt(valueStr);
    if (isNaN(numValue)) numValue = 0;

    // Normalize display
    if (key === 'sunriseOffset') setSunriseOffsetStr(String(numValue));
    if (key === 'sunsetOffset') setSunsetOffsetStr(String(numValue));

    const newSettings = await updateSetting(key, numValue);
    setSettings(newSettings);
    reschedule(newSettings);
  };

  const handleChangeLocation = () => {
    Alert.alert(
      "Change Location",
      "Are you sure you want to change your location?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => setManualStep('choice') }
      ]
    );
  };

  const handleGPSLocation = async () => {
    setLoading(true);
    const { status, location } = await getCurrentLocation();

    if (status === 'granted' && location) {
      const city = await getCityFromCoordinates(location.coords.latitude, location.coords.longitude);
      setLoading(false);

      const newSettings = await updateSetting('location', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: city,
        timezone: null, // GPS uses device local time
      });
      setSettings(newSettings);
      reschedule(newSettings);
      setManualStep(null);
      alert(`Location updated to ${city} via GPS!`);
    } else {
      setLoading(false);
      alert("Permission denied or location unavailable.");
    }
  };

  const getUniqueCountries = () => {
    const cities = getManualCities();
    const countries = [...new Set(cities.map(c => c.country))];
    return countries.sort();
  };

  const getCitiesForCountry = (country) => {
    return getManualCities().filter(c => c.country === country).sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleCitySelect = async (city) => {
    const newSettings = await updateSetting('location', {
      latitude: city.latitude,
      longitude: city.longitude,
      city: city.name,
      timezone: city.timezone,
    });
    setSettings(newSettings);
    reschedule(newSettings);
    setManualStep(null);
    alert(`Location updated to ${city.name}!`);
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
            keyboardType="numbers-and-punctuation"
            value={sunriseOffsetStr}
            onChangeText={(val) => handleOffsetLocalChange('sunriseOffset', val)}
            onBlur={() => handleOffsetBlur('sunriseOffset', sunriseOffsetStr)}
          />
        </View>

        <View style={styles.row}>
          <Text>Sunset Offset</Text>
          <TextInput
            style={styles.input}
            keyboardType="numbers-and-punctuation"
            value={sunsetOffsetStr}
            onChangeText={(val) => handleOffsetLocalChange('sunsetOffset', val)}
            onBlur={() => handleOffsetBlur('sunsetOffset', sunsetOffsetStr)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Location</Text>
        <Text>City: {settings.location?.city || "Unknown"}</Text>
        <View style={styles.spacer} />
        {!manualStep && (
          <Button title="Change Location" onPress={() => handleChangeLocation()} />
        )}

        {manualStep === 'choice' && (
          <View style={styles.choiceContainer}>
            <Text style={styles.subHeader}>How do you want to set your location?</Text>
            <Button title="Use GPS" onPress={handleGPSLocation} disabled={loading} />
            <View style={styles.spacer} />
            <Button title="Select Manually" onPress={() => setManualStep('country')} />
            <View style={styles.spacer} />
            <Button title="Cancel" color="red" onPress={() => setManualStep(null)} />
          </View>
        )}

        {manualStep === 'country' && (
          <View>
            <Text style={styles.subHeader}>Select Country</Text>
            {getUniqueCountries().map(country => (
              <TouchableOpacity key={country} style={styles.listItem} onPress={() => {
                setSelectedCountry(country);
                setManualStep('city');
              }}>
                <Text>{country}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Back" onPress={() => setManualStep('choice')} />
          </View>
        )}

        {manualStep === 'city' && (
          <View>
            <Text style={styles.subHeader}>Select City</Text>
            {getCitiesForCountry(selectedCountry).map(city => (
              <TouchableOpacity key={city.name} style={styles.listItem} onPress={() => handleCitySelect(city)}>
                <Text>{city.name}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Back" onPress={() => setManualStep('country')} />
          </View>
        )}
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
  spacer: {
    height: 10,
  },
  choiceContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
