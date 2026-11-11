import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { rescheduleAll } from './src/lib/notifications';
import { defaultData, loadData, newSchedule, saveData } from './src/lib/storage';
import { colors } from './src/lib/theme';
import { AppData, Schedule } from './src/lib/types';
import { Alarms } from './src/screens/Alarms';
import { Home } from './src/screens/Home';
import { Row, SettingsSheet } from './src/screens/SettingsSheet';

type Tab = 'home' | 'alarms' | 'prefs';

export default function App() {
  const [data, setData] = useState<AppData>(defaultData());
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [selectedId, setSelectedId] = useState<string>();
  const [sheet, setSheet] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { loadData().then((d) => { setData(d); setSelectedId(d.schedules[0]?.id); setReady(true); }); }, []);

  // notification tap -> open home
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => setTab('home'));
    return () => sub.remove();
  }, []);

  // persist + recompute alarms on any change (debounced)
  useEffect(() => {
    if (!ready) return;
    saveData(data);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { rescheduleAll(data).catch(() => {}); }, 400);
  }, [data, ready]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData(fn), []);
  const selected = data.schedules.find((x) => x.id === selectedId) ?? data.schedules[0];
  const putSchedule = (s: Schedule) => update((d) => ({ ...d, schedules: d.schedules.map((x) => (x.id === s.id ? s : x)) }));

  if (!ready) return <View style={s.root} />;

  return (
    <GestureHandlerRootView style={s.root}>
      <SafeAreaView style={s.root}>
        <StatusBar style="light" />
        <View style={{ flex: 1 }}>
          {tab === 'home' && <Home schedule={selected} onEdit={() => selected && setSheet(true)} />}
          {tab === 'alarms' && (
            <Alarms
              schedules={data.schedules} selectedId={selected?.id}
              onSelect={(id) => { setSelectedId(id); setTab('home'); }}
              onToggle={(id, enabled) => update((d) => ({ ...d, schedules: d.schedules.map((x) => (x.id === id ? { ...x, enabled } : x)) }))}
              onDelete={(id) => update((d) => ({ ...d, schedules: d.schedules.filter((x) => x.id !== id) }))}
              onAdd={() => { const n = newSchedule({ name: 'جدول جديد' }); update((d) => ({ ...d, schedules: [...d.schedules, n] })); setSelectedId(n.id); setSheet(true); }}
            />
          )}
          {tab === 'prefs' && (
            <View style={{ padding: 20 }}>
              <Row label="إشعار ليلي قبل النوم بساعة" value={data.settings.nightReminder}
                onValue={(v) => update((d) => ({ ...d, settings: { ...d.settings, nightReminder: v } }))} />
              <Row label="إشعار وقت المغادرة" value={data.settings.morningReminder}
                onValue={(v) => update((d) => ({ ...d, settings: { ...d.settings, morningReminder: v } }))} />
            </View>
          )}
        </View>
        <View style={s.tabs}>
          {([['home', 'الرئيسية'], ['alarms', 'المنبهات'], ['prefs', 'الإشعارات']] as [Tab, string][]).map(([k, l]) => (
            <Pressable key={k} style={s.tab} onPress={() => setTab(k)}>
              <Text style={[s.tabT, tab === k && { color: colors.amber }]}>{l}</Text>
            </Pressable>
          ))}
        </View>
        {selected && <SettingsSheet visible={sheet} schedule={selected} onChange={putSchedule} onClose={() => setSheet(false)} />}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabT: { color: colors.muted, fontSize: 13, fontWeight: '600' },
});
