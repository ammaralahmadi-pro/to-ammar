export type DayId = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export const ALL_DAYS: DayId[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export type SoundId = 'default' | 'chime' | 'bell' | 'rise' | 'pulse';
export const SOUNDS: SoundId[] = ['default', 'chime', 'bell', 'rise', 'pulse'];

export interface Schedule {
  id: string;
  name: string;
  icon: string;
  arrivalTime: string; // "HH:mm"
  readyMinutes: number; // 5..120
  driveMinutes: number; // 5..180
  trafficBuffer: boolean; // adds TRAFFIC_EXTRA_MINUTES to drive
  days: DayId[];
  enabled: boolean;
  sound: SoundId;
  vibration: boolean;
}

export interface AppSettings {
  nightReminder: boolean; // 1h before bedtime
  morningReminder: boolean; // at wake time: leave-by
  sleepGoalHours: number;
}

export interface AppData {
  schedules: Schedule[];
  settings: AppSettings;
}

export const LIMITS = {
  ready: { min: 5, max: 120 },
  drive: { min: 5, max: 180 },
  maxSchedules: 3,
};
export const TRAFFIC_EXTRA_MINUTES = 15;
