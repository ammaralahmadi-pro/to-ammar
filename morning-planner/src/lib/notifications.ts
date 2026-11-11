import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { computePlan, format12 } from './calc';
import { AppData, ALL_DAYS, Schedule } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function ensurePermission(): Promise<boolean> {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true } });
  return req.granted;
}

async function ensureChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('alarm-vib', {
    name: 'Alarm', importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0, 500, 300, 500], sound: 'default',
  });
  await Notifications.setNotificationChannelAsync('alarm-quiet', {
    name: 'Alarm (no vibration)', importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0], sound: 'default',
  });
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders', importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** Weekly repeating trigger on a given weekday (expo: 1 = Sunday … 7 = Saturday). */
async function weekly(
  title: string, body: string, minuteOfDay: number, dayIdx: number, channelId: string,
) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default', data: { open: 'home' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: dayIdx + 1,
      hour: Math.floor(minuteOfDay / 60),
      minute: minuteOfDay % 60,
      channelId,
    },
  });
}

async function scheduleOne(s: Schedule, data: AppData) {
  const p = computePlan(s);
  const goal = data.settings.sleepGoalHours;
  for (const day of s.days) {
    const i = ALL_DAYS.indexOf(day);
    // alarm on the wake-up day (if wake is after midnight arrival wraps; keep same day)
    await weekly(`⏰ ${s.name}`, `اغادر الساعة ${format12(p.leaveBy)} للوصول في الموعد`, p.wake, i, s.vibration ? 'alarm-vib' : 'alarm-quiet');
    if (data.settings.morningReminder) {
      await weekly(`🚗 حان وقت المغادرة`, `${s.name}: اغادر الآن للوصول ${format12(p.arrival)}`, p.leaveBy, i, 'reminders');
    }
    if (data.settings.nightReminder) {
      // reminder = 1h before bedtime; raw < 0 means it falls on an earlier day
      const raw = p.wake - Math.round(goal * 60) - 60;
      const dayShift = Math.floor(raw / 1440); // -1, -2 …
      const target = (((i + dayShift) % 7) + 7) % 7;
      await weekly(`🌙 غداً ستحتاج الاستيقاظ الساعة ${format12(p.wake)}`,
        `${s.name}${s.trafficBuffer ? ' — الزحمة شديدة، ' : ' — '}اغادر الساعة ${format12(p.leaveBy)}.`,
        ((raw % 1440) + 1440) % 1440, target, 'reminders');
    }
  }
}

/** Re-create every local notification from current data. Call after any change. */
export async function rescheduleAll(data: AppData): Promise<void> {
  if (!(await ensurePermission())) return;
  await ensureChannels();
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const s of data.schedules.filter((x) => x.enabled)) await scheduleOne(s, data);
}
