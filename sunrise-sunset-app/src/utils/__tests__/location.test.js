import { getCurrentLocation, getManualCities } from '../location';
import * as Location from 'expo-location';

jest.mock('expo-location');

describe('location utils', () => {
  describe('getCurrentLocation', () => {
    it('should return location if permission granted', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      const mockLocation = { coords: { latitude: 10, longitude: 20 } };
      Location.getCurrentPositionAsync.mockResolvedValue(mockLocation);

      const result = await getCurrentLocation();
      expect(result.status).toBe('granted');
      expect(result.location).toBe(mockLocation);
    });

    it('should return null location if permission denied', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const result = await getCurrentLocation();
      expect(result.status).toBe('denied');
      expect(result.location).toBeNull();
    });
  });

  describe('getManualCities', () => {
    it('should return a list of cities', () => {
      const cities = getManualCities();
      expect(Array.isArray(cities)).toBe(true);
      expect(cities.length).toBeGreaterThan(0);
      expect(cities[0]).toHaveProperty('name');
      expect(cities[0]).toHaveProperty('latitude');
      expect(cities[0]).toHaveProperty('longitude');
    });
  });
});
