import { Schedule, TRAFFIC_EXTRA_MINUTES } from './types';

const DAY = 1440;
const mod = (n: number) => ((n % DAY) + DAY) % DAY;

export function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function toHHmm(minutes: number): string {
  const m = mod(minutes);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** 24h "HH:mm" or minutes-of-day -> "7:30 AM" */
export function format12(input: string | number): string {
  const m = mod(typeof input === 'string' ? parseTime(input) : input);
  const h = Math.floor(m / 60);
  const min = String(m % 60).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${min} ${h < 12 ? 'AM' : 'PM'}`;
}

export function effectiveDrive(s: Pick<Schedule, 'driveMinutes' | 'trafficBuffer'>): number {
  return s.driveMinutes + (s.trafficBuffer ? TRAFFIC_EXTRA_MINUTES : 0);
}

export interface Plan {
  wake: number; // minutes of day
  readyEnd: number; // = leave-by
  leaveBy: number;
  arrival: number;
  drive: number;
  ready: number;
}

/** wake = arrival - drive - ready (wraps across midnight). */
export function computePlan(s: Schedule): Plan {
  const arrival = parseTime(s.arrivalTime);
  const drive = effectiveDrive(s);
  const leaveBy = mod(arrival - drive);
  const wake = mod(leaveBy - s.readyMinutes);
  return { wake, readyEnd: leaveBy, leaveBy, arrival, drive, ready: s.readyMinutes };
}

/** Hours of sleep if going to bed at `now` and waking at `wake` (next occurrence). */
export function sleepHoursFromNow(now: Date, wake: number): number {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let diff = wake - nowMin;
  if (diff <= 0) diff += DAY;
  return Math.round((diff / 60) * 10) / 10;
}

export function bedtime(wake: number, sleepGoalHours: number): number {
  return mod(wake - Math.round(sleepGoalHours * 60));
}
