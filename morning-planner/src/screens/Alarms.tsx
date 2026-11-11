import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { computePlan, format12 } from '../lib/calc';
import { colors } from '../lib/theme';
import { LIMITS, Schedule } from '../lib/types';

interface Props {
  schedules: Schedule[]; selectedId?: string;
  onSelect: (id: string) => void; onToggle: (id: string, v: boolean) => void;
  onDelete: (id: string) => void; onAdd: () => void;
}

export function Alarms({ schedules, selectedId, onSelect, onToggle, onDelete, onAdd }: Props) {
  const full = schedules.length >= LIMITS.maxSchedules;
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={schedules}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => (
            <Pressable style={s.del} onPress={() => onDelete(item.id)}><Text style={s.delT}>حذف</Text></Pressable>
          )}>
            <Pressable style={[s.card, item.id === selectedId && s.sel]} onPress={() => onSelect(item.id)}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.icon} {item.name}</Text>
                <Text style={s.time}>{format12(computePlan(item).wake)}</Text>
              </View>
              <Switch value={item.enabled} onValueChange={(v) => onToggle(item.id, v)} trackColor={{ true: colors.amber }} />
            </Pressable>
          </Swipeable>
        )}
      />
      <Pressable
        style={[s.fab, full && { opacity: 0.4 }]}
        onPress={() => full ? Alert.alert('الحد الأقصى', `يمكنك إنشاء ${LIMITS.maxSchedules} جداول فقط في هذا الإصدار.`) : onAdd()}>
        <Text style={s.fabT}>+</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  sel: { borderColor: colors.amber },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  time: { color: colors.text, fontSize: 32, fontWeight: '200', marginTop: 4 },
  del: { backgroundColor: colors.danger, borderRadius: 16, justifyContent: 'center', paddingHorizontal: 24, marginLeft: 8 },
  delT: { color: '#fff', fontWeight: '700' },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
  fabT: { color: '#000', fontSize: 28, lineHeight: 30 },
});
