import { getSunTimes, scheduleSunNotifications } from '../sunScheduler';
import * as Notifications from 'expo-notifications';
import SunCalc from 'suncalc';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

describe('sunScheduler', () => {
  const latitude = 34.0522; // Los Angeles
  const longitude = -118.2437;
  const testDate = new Date('2023-01-01T12:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSunTimes', () => {
    it('should return valid sunrise and sunset dates', () => {
      const times = getSunTimes(testDate, latitude, longitude);
      expect(times.sunrise).toBeInstanceOf(Date);
      expect(times.sunset).toBeInstanceOf(Date);
      // Basic sanity check: Sunrise should be before sunset on the same day usually
      expect(times.sunrise.getTime()).toBeLessThan(times.sunset.getTime());
    });
  });

  describe('scheduleSunNotifications', () => {
    it('should cancel existing notifications first', async () => {
      await scheduleSunNotifications(latitude, longitude, 1);
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should schedule notifications for sunrise and sunset', async () => {
      // Mock SunCalc to return fixed times relative to "now"
      // But for simplicity, we rely on the fact that if we pass a date, SunCalc returns a time.
      // We just need to check if scheduleNotificationAsync is called.

      await scheduleSunNotifications(latitude, longitude, 1);

      // We expect 2 calls (1 sunrise, 1 sunset) per day if they are in the future.
      // Since we can't easily control "now" inside the function without dependency injection or system time mocking,
      // we might see variable results if we run this at night vs day.
      // However, for N=1 (today), if we run this test, at least one might be in the past.
      // Let's force N=2 to ensure we hit tomorrow's future times.

      await scheduleSunNotifications(latitude, longitude, 2);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      // At least 2 notifications (for tomorrow) should be scheduled
      expect(Notifications.scheduleNotificationAsync.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('should apply offsets correctly', async () => {
      const offset = 10; // 10 minutes
      // We need to spy on the dates passed.
      // This is tricky without mocking date or SunCalc return values.
      // Let's assume the function logic is: time + offset * 60000.

      // Let's mock SunCalc.getTimes to return a known fixed time for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const fixedSunrise = new Date(tomorrow);
      fixedSunrise.setHours(6, 0, 0, 0);
      const fixedSunset = new Date(tomorrow);
      fixedSunset.setHours(18, 0, 0, 0);

      const spy = jest.spyOn(SunCalc, 'getTimes').mockReturnValue({
        sunrise: fixedSunrise,
        sunset: fixedSunset,
      });

      await scheduleSunNotifications(latitude, longitude, 1, { sunrise: offset, sunset: 0 });

      // Check the first call argument
      const calls = Notifications.scheduleNotificationAsync.mock.calls;

      // Expected: fixedSunrise + 10 mins
      const expectedDate = new Date(fixedSunrise.getTime() + offset * 60000);

      // Depending on call order (sunrise first?), find the one with title "Sunrise"
      const sunriseCall = calls.find(c => c[0].content.title === "Sunrise");

      expect(sunriseCall).toBeDefined();

      // The trigger uses calendar format, not date format
      const trigger = sunriseCall[0].trigger;
      expect(trigger.type).toBe('calendar');
      expect(trigger.year).toBe(expectedDate.getFullYear());
      expect(trigger.month).toBe(expectedDate.getMonth() + 1);
      expect(trigger.day).toBe(expectedDate.getDate());
      expect(trigger.hour).toBe(expectedDate.getHours());
      expect(trigger.minute).toBe(expectedDate.getMinutes());

      spy.mockRestore();
    });

    it('should use separate channels and sounds for sunrise and sunset', async () => {
      // Mock SunCalc to return fixed times in the future
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const fixedSunrise = new Date(tomorrow);
      fixedSunrise.setHours(6, 0, 0, 0);
      const fixedSunset = new Date(tomorrow);
      fixedSunset.setHours(18, 0, 0, 0);

      const spy = jest.spyOn(SunCalc, 'getTimes').mockReturnValue({
        sunrise: fixedSunrise,
        sunset: fixedSunset,
      });

      await scheduleSunNotifications(latitude, longitude, 1);

      const calls = Notifications.scheduleNotificationAsync.mock.calls;

      // Find sunrise and sunset notifications
      const sunriseCall = calls.find(c => c[0].content.title === "Sunrise");
      const sunsetCall = calls.find(c => c[0].content.title === "Sunset");

      // Verify sunrise notification
      expect(sunriseCall).toBeDefined();
      expect(sunriseCall[0].content.android.channelId).toBe('sunrise-notifications');
      expect(sunriseCall[0].content.sound).toBe('sunrise.wav'); // Android uses full filename
      expect(sunriseCall[0].content.ios.sound).toBe('sunrise'); // iOS without extension

      // Verify sunset notification
      expect(sunsetCall).toBeDefined();
      expect(sunsetCall[0].content.android.channelId).toBe('sunset-notifications');
      expect(sunsetCall[0].content.sound).toBe('sunset.wav'); // Android uses full filename
      expect(sunsetCall[0].content.ios.sound).toBe('sunset'); // iOS without extension

      spy.mockRestore();
    });
  });
});
