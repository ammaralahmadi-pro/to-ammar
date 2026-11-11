import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Stepper } from '../components/Stepper';
import { tick } from '../components/haptics';
import { format12, parseTime, toHHmm } from '../lib/calc';
import { colors } from '../lib/theme';
import { ALL_DAYS, DayId, LIMITS, Schedule, SOUNDS } from '../lib/types';

const DAY_AR: Record<DayId, string> = { sun: 'أحد', mon: 'اثنين', tue: 'ثلاثاء', wed: 'أربعاء', thu: 'خميس', fri: 'جمعة', sat: 'سبت' };

interface Props { visible: boolean; schedule: Schedule; onChange: (s: Schedule) => void; onClose: () => void; }

export function SettingsSheet({ visible, schedule: sc, onChange, onClose }: Props) {
  const [picker, setPicker] = useState(false);
  const set = (p: Partial<Schedule>) => onChange({ ...sc, ...p });
  const mins = parseTime(sc.arrivalTime);
  const date = new Date(); date.setHours(Math.floor(mins / 60), mins % 60, 0, 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={s.sheet} contentContainerStyle={{ padding: 20 }}>
        <View style={s.head}>
          <Text style={s.h}>الإعدادات</Text>
          <Pressable onPress={onClose}><Text style={s.done}>تم</Text></Pressable>
        </View>

        <Text style={s.lbl}>اسم الوجهة</Text>
        <TextInput style={s.input} value={sc.name} onChangeText={(name) => set({ name })} placeholder="الشغل، الجامعة…" placeholderTextColor={colors.muted} />

        <Text style={s.lbl}>وقت الوصول</Text>
        <Pressable style={s.input} onPress={() => setPicker(true)}><Text style={s.val}>{format12(sc.arrivalTime)}</Text></Pressable>
        {picker && (
          <DateTimePicker value={date} mode="time" display="spinner" themeVariant="dark"
            onChange={(e, d) => { setPicker(false); if (e.type !== 'dismissed' && d) set({ arrivalTime: toHHmm(d.getHours() * 60 + d.getMinutes()) }); }} />
        )}

        <Stepper label="وقت التجهيز" value={sc.readyMinutes} {...LIMITS.ready} onChange={(readyMinutes) => set({ readyMinutes })} />
        <Stepper label="وقت القيادة" value={sc.driveMinutes} {...LIMITS.drive} onChange={(driveMinutes) => set({ driveMinutes })} />

        <Row label="زحمة شديدة (+15 دقيقة)" value={sc.trafficBuffer} onValue={(trafficBuffer) => set({ trafficBuffer })} />
        <Row label="اهتزاز" value={sc.vibration} onValue={(vibration) => set({ vibration })} />

        <Text style={s.lbl}>الأيام</Text>
        <View style={s.chips}>
          {ALL_DAYS.map((d) => {
            const on = sc.days.includes(d);
            return (
              <Pressable key={d} style={[s.chip, on && s.chipOn]}
                onPress={() => { tick(); set({ days: on ? sc.days.filter((x) => x !== d) : [...sc.days, d] }); }}>
                <Text style={[s.chipT, on && { color: '#000' }]}>{DAY_AR[d]}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={s.lbl}>الرنة</Text>
        <View style={s.chips}>
          {SOUNDS.map((x) => (
            <Pressable key={x} style={[s.chip, sc.sound === x && s.chipOn]} onPress={() => set({ sound: x })}>
              <Text style={[s.chipT, sc.sound === x && { color: '#000' }]}>{x}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Modal>
  );
}

export function Row({ label, value, onValue }: { label: string; value: boolean; onValue: (v: boolean) => void }) {
  return (
    <View style={s.row}>
      <Text style={s.rowT}>{label}</Text>
      <Switch value={value} onValueChange={(v) => { tick(); onValue(v); }} trackColor={{ true: colors.amber }} />
    </View>
  );
}

const s = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  h: { color: colors.text, fontSize: 20, fontWeight: '700' },
  done: { color: colors.amber, fontSize: 16, fontWeight: '600' },
  lbl: { color: colors.muted, fontSize: 12, marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: colors.card, borderRadius: 12, padding: 14, color: colors.text, fontSize: 16 },
  val: { color: colors.text, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowT: { color: colors.text, fontSize: 15, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.amber },
  chipT: { color: colors.text, fontSize: 13 },
});
