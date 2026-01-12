import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'settings';

export const defaultSettings = {
  sunriseAlertEnabled: true,
  sunsetAlertEnabled: true,
  sunriseOffset: 0,
  sunsetOffset: 0,
  sound: 'default',
  vibration: true,
  location: null, // { latitude, longitude, city }
  isManualLocation: false,
};

/**
 * Saves settings to AsyncStorage.
 * @param {object} settings
 */
export const saveSettings = async (settings) => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

/**
 * Retrieves settings from AsyncStorage.
 * @returns {object} settings
 */
export const getSettings = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultSettings;
  } catch (e) {
    console.error('Error reading settings:', e);
    return defaultSettings;
  }
};

/**
 * Updates a specific setting.
 * @param {string} key
 * @param {any} value
 */
export const updateSetting = async (key, value) => {
  const currentSettings = await getSettings();
  const newSettings = { ...currentSettings, [key]: value };
  await saveSettings(newSettings);
  return newSettings;
};
