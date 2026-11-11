import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Timeline } from '../components/Timeline';
import { computePlan, format12, sleepHoursFromNow } from '../lib/calc';
import { colors } from '../lib/theme';
import { Schedule } from '../lib/types';

export function Home({ schedule, onEdit }: { schedule?: Schedule; onEdit: () => void }) {
  if (!schedule) {
    return <View style={s.empty}><Text style={s.muted}>لا يوجد جدول. أضف جدولاً من تبويب المنبهات.</Text></View>;
  }
  const p = computePlan(schedule);
  const hours = sleepHoursFromNow(new Date(), p.wake);
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={s.head}>
        <Text style={s.dest}>{schedule.icon} {schedule.name}</Text>
        <Pressable onPress={onEdit}><Text style={s.edit}>Edit</Text></Pressable>
      </View>
      <View style={s.hero}>
        <Text style={s.time}>{format12(p.wake)}</Text>
        <Text style={s.muted}>إذا نمت الآن ستحصل على {hours} ساعة نوم</Text>
      </View>
      <Timeline schedule={schedule} onPressBlock={onEdit} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 16 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dest: { color: colors.text, fontSize: 17, fontWeight: '600' },
  edit: { color: colors.amber, fontSize: 15, fontWeight: '600' },
  hero: { backgroundColor: colors.card, borderRadius: 16, padding: 24, alignItems: 'center', gap: 6 },
  time: { color: colors.text, fontSize: 72, fontWeight: '200', fontVariant: ['tabular-nums'] },
  muted: { color: colors.muted, fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
