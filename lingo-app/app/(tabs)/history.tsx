import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { getSessions, removeSession } from '../../lib/storage';
import { C, F, R, S } from '../../constants/theme';
import type { Session } from '../../types';

const LANG_FLAG: Partial<Record<string, string>> = {
  en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪',
  pt: '🇧🇷', ru: '🇷🇺', zh: '🇨🇳', ja: '🇯🇵',
  ar: '🇸🇦', hi: '🇮🇳', ko: '🇰🇷', it: '🇮🇹',
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    + '  '
    + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<Session[]>([]);

  const load = async () => {
    const all = await getSessions();
    setSessions(all);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Delete session?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await removeSession(id);
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <Text style={styles.title}>HISTORY</Text>
        <Text style={styles.count}>{sessions.length} sessions</Text>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🕐</Text>
          <Text style={styles.emptyText}>No sessions yet.{'\n'}Start transcribing to save history.</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: S.md, gap: S.sm }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onLongPress={() => handleDelete(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTop}>
                <Text style={styles.flag}>
                  {LANG_FLAG[item.language] ?? '🌐'}
                </Text>
                <Text style={styles.date}>{formatDate(item.startedAt)}</Text>
                <Text style={styles.words}>
                  {item.segments.flatMap((s) => s.tokens).filter((t) => t.isWord).length} words
                </Text>
              </View>
              <Text style={styles.preview} numberOfLines={2}>
                {item.preview || 'Empty session'}
              </Text>
              <Text style={styles.deleteHint}>Hold to delete</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.md, paddingBottom: S.sm,
  },
  title: { fontFamily: F.monoBold, fontSize: 20, color: C.accent, letterSpacing: 3 },
  count: { fontFamily: F.mono, fontSize: 12, color: C.textDim },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: {
    fontFamily: F.body, fontSize: 15, color: C.textDim,
    textAlign: 'center', lineHeight: 22,
  },

  card: {
    backgroundColor: C.bgCard,
    borderRadius:    R.lg,
    padding:         S.md,
    borderWidth:     1,
    borderColor:     C.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  flag:    { fontSize: 18 },
  date:    { flex: 1, fontFamily: F.mono, fontSize: 11, color: C.textDim },
  words:   { fontFamily: F.mono, fontSize: 11, color: C.textDim },
  preview: { fontFamily: F.body, fontSize: 14, color: C.textSub, lineHeight: 20 },
  deleteHint: {
    fontFamily: F.mono, fontSize: 10, color: C.textDim,
    marginTop: 6, letterSpacing: 0.5,
  },
});
