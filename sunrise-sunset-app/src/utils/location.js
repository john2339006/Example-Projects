import * as Location from 'expo-location';

/**
 * Requests location permissions and returns the current position.
 * @returns {Promise<{status: string, location: object|null}>}
 */
export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { status, location: null };
    }

    const location = await Location.getCurrentPositionAsync({});
    return { status, location };
  } catch (error) {
    console.error("Error getting location:", error);
    return { status: 'error', location: null };
  }
};

/**
 * Returns a list of supported cities for manual selection (mocked).
 */
export const getManualCities = () => {
  return [
    { name: "New York", latitude: 40.7128, longitude: -74.0060, timezone: "America/New_York" },
    { name: "London", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },
    { name: "Tokyo", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo" },
    { name: "Sydney", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
    { name: "Paris", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris" },
    { name: "San Francisco", latitude: 37.7749, longitude: -122.4194, timezone: "America/Los_Angeles" },
  ];
};
