import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computePlan, format12, sleepHoursFromNow, toHHmm } from './calc';
import { Schedule } from './types';

const base: Schedule = {
  id: '1', name: 'Work', icon: '💼', arrivalTime: '09:00', readyMinutes: 45, driveMinutes: 45,
  trafficBuffer: false, days: ['sun'], enabled: true, sound: 'default', vibration: true,
};

test('spec example: 9:00 - 45 - 45 = 7:30', () => {
  assert.equal(toHHmm(computePlan(base).wake), '07:30');
});
test('heavy traffic adds 15 minutes', () => {
  const p = computePlan({ ...base, trafficBuffer: true });
  assert.equal(toHHmm(p.wake), '07:15');
  assert.equal(toHHmm(p.leaveBy), '08:00');
});
test('scenario: 8:00 - 55 - 30 = 6:35, then 40 -> 6:50', () => {
  const s = { ...base, arrivalTime: '08:00', readyMinutes: 30 };
  assert.equal(toHHmm(computePlan({ ...s, driveMinutes: 55 }).wake), '06:35');
  assert.equal(toHHmm(computePlan({ ...s, driveMinutes: 40 }).wake), '06:50');
});
test('wraps across midnight', () => {
  assert.equal(toHHmm(computePlan({ ...base, arrivalTime: '00:30' }).wake), '23:00');
});
test('format12', () => {
  assert.equal(format12('07:30'), '7:30 AM');
  assert.equal(format12('00:05'), '12:05 AM');
  assert.equal(format12('13:00'), '1:00 PM');
});
test('sleep hours', () => {
  assert.equal(sleepHoursFromNow(new Date(2026, 0, 1, 23, 0), 450), 8.5);
});
