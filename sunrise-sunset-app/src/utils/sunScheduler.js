import SunCalc from 'suncalc';
import * as Notifications from 'expo-notifications';
import { addDays } from 'date-fns';

/**
 * Calculates sunrise and sunset times for a given location and date.
 * @param {Date} date
 * @param {number} latitude
 * @param {number} longitude
 * @returns {{sunrise: Date, sunset: Date}}
 */
export const getSunTimes = (date, latitude, longitude) => {
  const times = SunCalc.getTimes(date, latitude, longitude);
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
  };
};

/**
 * Schedules notifications for sunrise and sunset for the next N days.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} daysToSchedule - Number of days to schedule ahead (default 21)
 * @param {object} offsets - { sunrise: number, sunset: number } in minutes
 */
export const scheduleSunNotifications = async (latitude, longitude, daysToSchedule = 21, offsets = { sunrise: 0, sunset: 0 }) => {
  // Cancel all existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const today = new Date();

  for (let i = 0; i < daysToSchedule; i++) {
    const date = addDays(today, i);
    const { sunrise, sunset } = getSunTimes(date, latitude, longitude);

    // Schedule Sunrise
    if (sunrise) {
      const sunriseTime = new Date(sunrise.getTime() + (offsets.sunrise || 0) * 60000);
      if (sunriseTime > new Date()) { // Only schedule if in future
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Sunrise",
            body: "The sun is rising!",
            sound: true,
            android: {
              channelId: 'sun-events',
            },
            ios: {
              sound: true,
            },
          },
          trigger: {
            type: 'calendar',
            year: sunriseTime.getFullYear(),
            month: sunriseTime.getMonth() + 1,
            day: sunriseTime.getDate(),
            hour: sunriseTime.getHours(),
            minute: sunriseTime.getMinutes(),
            repeats: false,
          },
        });
      }
    }

    // Schedule Sunset
    if (sunset) {
      const sunsetTime = new Date(sunset.getTime() + (offsets.sunset || 0) * 60000);
      if (sunsetTime > new Date()) { // Only schedule if in future
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Sunset",
            body: "The sun is setting.",
            sound: true,
            android: {
              channelId: 'sun-events',
            },
            ios: {
              sound: true,
            },
          },
          trigger: {
            type: 'calendar',
            year: sunsetTime.getFullYear(),
            month: sunsetTime.getMonth() + 1,
            day: sunsetTime.getDate(),
            hour: sunsetTime.getHours(),
            minute: sunsetTime.getMinutes(),
            repeats: false,
          },
        });
      }
    }
  }
};
