import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Pressable, SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecording } from '../../hooks/useRecording';
import { useExplanation } from '../../hooks/useExplanation';
import { getSettings } from '../../lib/storage';
import { upsertSession } from '../../lib/storage';
import { MicButton } from '../../components/MicButton';
import { TranscriptView } from '../../components/TranscriptView';
import { ExplanationSheet } from '../../components/ExplanationSheet';
import { C, F, S } from '../../constants/theme';
import type { AppSettings, Language } from '../../types';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'pt', label: 'PT' },
  { code: 'ru', label: 'RU' },
  { code: 'zh', label: 'ZH' },
  { code: 'ja', label: 'JA' },
  { code: 'ar', label: 'AR' },
];

export default function LiveScreen() {
  const insets   = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [settings, setSettings]     = useState<AppSettings | null>(null);
  const [lang, setLang]             = useState<Language>('en');
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [tappedWord, setTappedWord] = useState('');
  const [tappedCtx, setTappedCtx]   = useState('');
  const [sessionId]                 = useState(() => Date.now().toString(36));

  const { status, segments, start, stop } = useRecording(settings?.deepgramApiKey ?? '');
  const explanation = useExplanation();

  // Load settings on mount
  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  // Autosave session when segments update
  useEffect(() => {
    if (segments.length === 0) return;
    const preview = segments
      .flatMap((s) => s.tokens)
      .filter((t) => t.isWord)
      .map((t) => t.text)
      .slice(0, 12)
      .join(' ');
    upsertSession({
      id:        sessionId,
      language:  lang,
      segments,
      startedAt: parseInt(sessionId, 36),
      endedAt:   Date.now(),
      preview,
    });
  }, [segments]);

  const handleMic = useCallback(() => {
    if (status === 'live') {
      stop();
    } else if (status === 'idle' || status === 'error') {
      if (!settings?.deepgramApiKey) {
        // Show hint
        return;
      }
      start(lang);
    }
  }, [status, settings, lang, start, stop]);

  const handleWordPress = useCallback((word: string, context: string) => {
    setTappedWord(word);
    setTappedCtx(context);
    setSheetOpen(true);
    explanation.fetch(word, context, lang, settings?.claudeApiKey ?? '');
  }, [lang, settings, explanation]);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    explanation.reset();
  }, [explanation]);

  const statusLabel =
    status === 'connecting' ? '● CONNECTING…' :
    status === 'live'       ? '● LIVE'         :
    status === 'error'      ? '● ERROR'        : '';

  const statusColor =
    status === 'live'  ? C.error :
    status === 'error' ? C.error : C.textDim;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <Text style={styles.logo}>LINGO</Text>
        {statusLabel ? (
          <Text style={[styles.statusBadge, { color: statusColor }]}>
            {statusLabel}
          </Text>
        ) : null}
      </View>

      {/* Language pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.langScroll}
        contentContainerStyle={styles.langContent}
      >
        {LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.code}
            onPress={() => setLang(l.code)}
            style={[styles.langPill, lang === l.code && styles.langPillActive]}
          >
            <Text style={[styles.langText, lang === l.code && styles.langTextActive]}>
              {l.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transcript */}
      <View style={styles.transcript}>
        <TranscriptView
          segments={segments}
          interimText=""
          onWordPress={handleWordPress}
          scrollRef={scrollRef}
        />
      </View>

      {/* No API key warning */}
      {!settings?.deepgramApiKey && (
        <View style={styles.warn}>
          <Text style={styles.warnText}>
            ⚙️  Add your Deepgram API key in Settings to start
          </Text>
        </View>
      )}

      {/* Bottom bar */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.hint}>
          {status === 'live'
            ? 'Tap any word for an instant explanation'
            : 'Tap the mic to begin transcription'}
        </Text>
        <MicButton status={status} onPress={handleMic} />
      </View>

      {/* Explanation bottom sheet */}
      <ExplanationSheet
        visible={sheetOpen}
        term={tappedWord}
        state={explanation.state as any}
        onClose={handleSheetClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.md,
    paddingBottom:  S.sm,
  },
  logo: {
    fontFamily: F.monoBold,
    fontSize:   22,
    color:      C.accent,
    letterSpacing: 4,
  },
  statusBadge: {
    fontFamily:    F.mono,
    fontSize:      11,
    letterSpacing: 1,
  },

  langScroll:  { maxHeight: 44, flexGrow: 0 },
  langContent: { paddingHorizontal: S.md, gap: 8 },
  langPill: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 99, borderWidth: 1,
    borderColor:  C.border,
  },
  langPillActive: {
    borderColor:     C.accent,
    backgroundColor: C.accentDim,
  },
  langText:       { fontFamily: F.mono, fontSize: 12, color: C.textDim },
  langTextActive: { color: C.accent },

  transcript: { flex: 1 },

  warn: {
    marginHorizontal: S.md,
    marginBottom:     S.sm,
    backgroundColor:  C.bgCard,
    borderRadius:     10,
    padding:          12,
    borderWidth:      1,
    borderColor:      C.border,
  },
  warnText: { fontFamily: F.body, fontSize: 13, color: C.textSub, textAlign: 'center' },

  bar: {
    alignItems:        'center',
    paddingTop:        S.md,
    borderTopWidth:    1,
    borderTopColor:    C.border,
    backgroundColor:   C.bg,
    gap:               S.sm,
  },
  hint: { fontFamily: F.body, fontSize: 13, color: C.textDim },
});
