import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';
import { tick } from './haptics';

interface Props { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; }

export function Stepper({ label, value, min, max, step = 5, onChange }: Props) {
  const set = (v: number) => { tick(); onChange(Math.max(min, Math.min(max, v))); };
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <View style={s.ctrl}>
        <Pressable style={s.btn} onPress={() => set(value - step)}><Text style={s.btnT}>−</Text></Pressable>
        <Text style={s.val}>{value} د</Text>
        <Pressable style={s.btn} onPress={() => set(value + step)}><Text style={s.btnT}>+</Text></Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  label: { color: colors.text, fontSize: 15, fontWeight: '600' },
  ctrl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  btnT: { color: colors.text, fontSize: 20, lineHeight: 22 },
  val: { color: colors.amber, fontSize: 15, minWidth: 56, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
