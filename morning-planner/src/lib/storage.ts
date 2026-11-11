import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Schedule } from './types';

const KEY = 'morning-planner:v1';

export function newSchedule(over: Partial<Schedule> = {}): Schedule {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: 'الشغل',
    icon: '💼',
    arrivalTime: '09:00',
    readyMinutes: 45,
    driveMinutes: 45,
    trafficBuffer: false,
    days: ['sun', 'mon', 'tue', 'wed', 'thu'],
    enabled: true,
    sound: 'default',
    vibration: true,
    ...over,
  };
}

export const defaultData = (): AppData => ({
  schedules: [newSchedule()],
  settings: { nightReminder: true, morningReminder: true, sleepGoalHours: 8 },
});

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as AppData;
    return { ...defaultData(), ...parsed, settings: { ...defaultData().settings, ...parsed.settings } };
  } catch {
    return defaultData();
  }
}

export async function saveData(d: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}
