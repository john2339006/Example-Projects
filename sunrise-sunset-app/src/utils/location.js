import * as Location from 'expo-location';
import cities from '../data/cities.json';

/**
 * Reverse geocodes coordinates to get the city name.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} City name or "Unknown Location"
 */
export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (address) {
      return address.city || address.region || address.name || "Unknown Location";
    }
    return "Unknown Location";
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return "Unknown Location";
  }
};

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
 * Returns a list of supported cities for manual selection.
 */
export const getManualCities = () => {
  return cities;
};
