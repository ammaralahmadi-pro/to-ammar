import React, { useEffect } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { computePlan, format12 } from '../lib/calc';
import { colors, gap, radius } from '../lib/theme';
import { Schedule } from '../lib/types';
import { Pulse } from './Pulse';

export function Timeline({ schedule, onPressBlock }: { schedule: Schedule; onPressBlock: () => void }) {
  const p = computePlan(schedule);
  useEffect(() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.spring); }, [schedule]);
  const heavy = schedule.trafficBuffer;

  return (
    <View style={{ gap }}>
      <Block bg={colors.sleep} onPress={onPressBlock} title="🌙 نوم" sub={`حتى ${format12(p.wake)}`} />
      <Block bg={colors.ready} onPress={onPressBlock} title="💧 تجهيز"
        right={<Text style={[s.big, { color: colors.amber }]}>{p.ready} دقيقة</Text>}
        sub={`Leave by ${format12(p.leaveBy)}`} />
      <Block bg={colors.drive} onPress={onPressBlock} title="🚗 قيادة"
        right={<Text style={[s.big, heavy && { color: colors.danger }]}>{p.drive} دقيقة</Text>}
        sub={`${format12(p.leaveBy)} → ${format12(p.arrival)}`}
        badge={heavy ? <Pulse style={s.badge}><Text style={s.badgeT}>Heavy traffic</Text></Pulse> : undefined} />
      <Block bg={colors.arrive} onPress={onPressBlock} title="💼 وصول"
        right={<Text style={[s.big, { color: colors.green }]}>On time ✓</Text>} sub={format12(p.arrival)} />
    </View>
  );
}

function Block(props: { bg: string; title: string; sub?: string; right?: React.ReactNode; badge?: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={[s.block, { backgroundColor: props.bg }]}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{props.title}</Text>
        {props.sub ? <Text style={s.sub}>{props.sub}</Text> : null}
        {props.badge}
      </View>
      {props.right}
    </Pressable>
  );
}

const s = StyleSheet.create({
  block: { borderRadius: radius, padding: 16, flexDirection: 'row', alignItems: 'center', minHeight: 76 },
  title: { color: colors.text, fontSize: 15, fontWeight: '600' },
  sub: { color: colors.muted, fontSize: 12, marginTop: 3 },
  big: { color: colors.text, fontSize: 18, fontWeight: '600' },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.danger, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 6 },
  badgeT: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
