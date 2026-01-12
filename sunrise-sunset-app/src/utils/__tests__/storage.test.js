import { saveSettings, getSettings, updateSetting, defaultSettings } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('storage utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveSettings', () => {
    it('should save settings to AsyncStorage', async () => {
      const settings = { ...defaultSettings, sunriseAlertEnabled: false };
      await saveSettings(settings);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('settings', JSON.stringify(settings));
    });
  });

  describe('getSettings', () => {
    it('should return default settings if no settings found', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      const settings = await getSettings();
      expect(settings).toEqual(defaultSettings);
    });

    it('should return saved settings', async () => {
      const savedSettings = { ...defaultSettings, sunriseAlertEnabled: false };
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(savedSettings));
      const settings = await getSettings();
      expect(settings).toEqual(savedSettings);
    });
  });

  describe('updateSetting', () => {
    it('should update a specific setting and save', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(defaultSettings));

      await updateSetting('sunriseOffset', 15);

      const expectedSettings = { ...defaultSettings, sunriseOffset: 15 };
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('settings', JSON.stringify(expectedSettings));
    });
  });
});
