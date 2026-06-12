import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSettings, saveSettings } from '../../lib/storage';
import { C, F, R, S } from '../../constants/theme';
import type { AppSettings, Language } from '../../types';

const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English (default)' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<AppSettings>({
    deepgramApiKey:  '',
    claudeApiKey:    '',
    defaultLanguage: 'en',
    hapticFeedback:  true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
            <Text style={styles.title}>SETTINGS</Text>
          </View>

          {/* Deepgram */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DEEPGRAM API KEY</Text>
            <Text style={styles.sectionHint}>
              Real-time transcription · Get yours at console.deepgram.com
            </Text>
            <TextInput
              value={settings.deepgramApiKey}
              onChangeText={(v) => setSettings((s) => ({ ...s, deepgramApiKey: v }))}
              placeholder="dg_••••••••••••••••••••••••••••••••"
              placeholderTextColor={C.textDim}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          {/* Claude */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CLAUDE API KEY</Text>
            <Text style={styles.sectionHint}>
              Word explanations · Get yours at console.anthropic.com
            </Text>
            <TextInput
              value={settings.claudeApiKey}
              onChangeText={(v) => setSettings((s) => ({ ...s, claudeApiKey: v }))}
              placeholder="sk-ant-••••••••••••••••••••••••••••••"
              placeholderTextColor={C.textDim}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          {/* Default language */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DEFAULT LANGUAGE</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  style={[
                    styles.langBtn,
                    settings.defaultLanguage === l.code && styles.langBtnActive,
                  ]}
                  onPress={() => setSettings((s) => ({ ...s, defaultLanguage: l.code }))}
                >
                  <Text style={[
                    styles.langBtnText,
                    settings.defaultLanguage === l.code && styles.langBtnTextActive,
                  ]}>
                    {l.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Keys are stored locally */}
          <View style={styles.privacy}>
            <Text style={styles.privacyText}>
              🔒  API keys are stored on-device only — never sent to any server except the respective API.
            </Text>
          </View>

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>
              {saved ? '✓ Saved!' : 'Save Settings'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: S.md, paddingBottom: 40 },

  header: { marginBottom: S.lg },
  title:  { fontFamily: F.monoBold, fontSize: 20, color: C.accent, letterSpacing: 3 },

  section:      { marginBottom: S.xl },
  sectionLabel: {
    fontFamily: F.mono, fontSize: 11, color: C.textDim,
    letterSpacing: 1.5, marginBottom: 6,
  },
  sectionHint: {
    fontFamily: F.body, fontSize: 13, color: C.textDim, marginBottom: 10,
  },
  input: {
    backgroundColor: C.bgCard,
    borderWidth:     1,
    borderColor:     C.border,
    borderRadius:    R.md,
    padding:         14,
    color:           C.text,
    fontFamily:      F.mono,
    fontSize:        14,
  },

  langGrid: { gap: 8 },
  langBtn:  {
    backgroundColor: C.bgCard,
    borderRadius:    R.md,
    padding:         12,
    borderWidth:     1,
    borderColor:     C.border,
  },
  langBtnActive: {
    borderColor:     C.accent,
    backgroundColor: C.accentDim,
  },
  langBtnText:       { fontFamily: F.body, fontSize: 14, color: C.textSub },
  langBtnTextActive: { color: C.accent, fontFamily: F.bodySemi },

  privacy: {
    backgroundColor: C.bgCard,
    borderRadius:    R.md,
    padding:         S.md,
    marginBottom:    S.xl,
    borderWidth:     1,
    borderColor:     C.border,
  },
  privacyText: { fontFamily: F.body, fontSize: 13, color: C.textDim, lineHeight: 18 },

  saveBtn: {
    backgroundColor: C.accent,
    borderRadius:    R.lg,
    paddingVertical: 16,
    alignItems:      'center',
  },
  saveBtnText: {
    fontFamily: F.bodyBold, fontSize: 16,
    color:      C.bg, letterSpacing: 0.5,
  },
});
