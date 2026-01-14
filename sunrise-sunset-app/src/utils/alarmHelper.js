import { Platform, Linking, Alert } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

/**
 * Adds an alarm to the native clock app.
 * Note: This opens the clock app with pre-filled data - user must manually save the alarm.
 * @param {Date} alarmTime - The time to set the alarm for
 * @param {string} label - Label/title for the alarm
 * @returns {Promise<boolean>} - true if successfully opened, false otherwise
 */
export const addAlarmToNativeClock = async (alarmTime, label = 'Sunrise/Sunset') => {
    try {
        if (Platform.OS === 'ios') {
            return await addAlarmIOS(alarmTime, label);
        } else if (Platform.OS === 'android') {
            return await addAlarmAndroid(alarmTime, label);
        } else {
            console.log('Alarm creation not supported on this platform');
            return false;
        }
    } catch (error) {
        console.error('Error adding alarm to native clock:', error);
        Alert.alert(
            'Unable to Add Alarm',
            'Could not open the Clock app. Please add the alarm manually.',
            [{ text: 'OK' }]
        );
        return false;
    }
};

/**
 * iOS implementation - opens Clock app with URL scheme
 * Note: iOS doesn't support pre-filling alarm data via URL scheme
 * We'll show an alert with the time instead
 */
const addAlarmIOS = async (alarmTime, label) => {
    // Format time for display
    const hours = alarmTime.getHours();
    const minutes = alarmTime.getMinutes();
    const timeString = `${hours}:${minutes.toString().padStart(2, '0')}`;

    // iOS doesn't support adding alarms programmatically
    // We can only open the Clock app
    const clockURL = 'clock-alarm:';

    const canOpen = await Linking.canOpenURL(clockURL);

    if (canOpen) {
        Alert.alert(
            'Add Alarm',
            `Opening Clock app. Please create an alarm for ${timeString} (${label}).`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Clock',
                    onPress: async () => {
                        await Linking.openURL(clockURL);
                    }
                }
            ]
        );
        return true;
    } else {
        // Fallback: Show the time to the user
        Alert.alert(
            'Set Alarm',
            `Please set an alarm for ${timeString} in your Clock app.\n\nEvent: ${label}`,
            [{ text: 'OK' }]
        );
        return false;
    }
};

/**
 * Android implementation - uses Intent to open AlarmClock with pre-filled data
 */
const addAlarmAndroid = async (alarmTime, label) => {
    try {
        const hours = alarmTime.getHours();
        const minutes = alarmTime.getMinutes();

        // Use AlarmClock.ACTION_SET_ALARM intent
        await IntentLauncher.startActivityAsync('android.intent.action.SET_ALARM', {
            extra: {
                'android.intent.extra.alarm.HOUR': hours,
                'android.intent.extra.alarm.MINUTES': minutes,
                'android.intent.extra.alarm.MESSAGE': label,
                'android.intent.extra.alarm.SKIP_UI': false, // Show UI for user to confirm
            },
        });

        return true;
    } catch (error) {
        console.error('Error opening Android alarm:', error);

        // Fallback: Show the time to the user
        const timeString = `${alarmTime.getHours()}:${alarmTime.getMinutes().toString().padStart(2, '0')}`;
        Alert.alert(
            'Set Alarm',
            `Please set an alarm for ${timeString} in your Clock app.\n\nEvent: ${label}`,
            [{ text: 'OK' }]
        );
        return false;
    }
};

/**
 * Batch add multiple alarms (useful for scheduling multiple days)
 * Note: This will open the clock app multiple times on iOS
 * @param {Array<{time: Date, label: string}>} alarms
 */
export const addMultipleAlarms = async (alarms) => {
    if (alarms.length === 0) return;

    // On Android, we can add them sequentially
    // On iOS, we'll just show a message about the first one
    if (Platform.OS === 'android') {
        for (const alarm of alarms) {
            await addAlarmToNativeClock(alarm.time, alarm.label);
            // Add a small delay to avoid overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } else {
        // On iOS, just handle the first alarm and notify about the rest
        if (alarms.length > 0) {
            await addAlarmToNativeClock(alarms[0].time, alarms[0].label);
            if (alarms.length > 1) {
                Alert.alert(
                    'Multiple Alarms',
                    `${alarms.length} alarms need to be set. Please add the remaining alarms manually in the Clock app.`,
                    [{ text: 'OK' }]
                );
            }
        }
    }
};
