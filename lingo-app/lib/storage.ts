import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, Session } from '../types';

const K = {
  SETTINGS:      '@lingo/settings',
  SESSIONS:      '@lingo/sessions',
  EXPLAIN_CACHE: '@lingo/explain_cache',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  deepgramApiKey:  '',
  claudeApiKey:    '',
  defaultLanguage: 'en',
  hapticFeedback:  true,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(K.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await AsyncStorage.setItem(K.SETTINGS, JSON.stringify({ ...current, ...patch }));
}

export async function getSessions(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(K.SESSIONS);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch { return []; }
}

export async function upsertSession(session: Session): Promise<void> {
  const all = await getSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) all[idx] = session;
  else all.unshift(session);
  await AsyncStorage.setItem(K.SESSIONS, JSON.stringify(all.slice(0, 60)));
}

export async function removeSession(id: string): Promise<void> {
  const all = await getSessions();
  await AsyncStorage.setItem(K.SESSIONS, JSON.stringify(all.filter((s) => s.id !== id)));
}

export async function getCached(key: string): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(K.EXPLAIN_CACHE);
    if (!raw) return null;
    return (JSON.parse(raw) as Record<string, string>)[key.toLowerCase()] ?? null;
  } catch { return null; }
}

export async function setCache(key: string, value: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(K.EXPLAIN_CACHE);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[key.toLowerCase()] = value;
    await AsyncStorage.setItem(K.EXPLAIN_CACHE, JSON.stringify(Object.fromEntries(Object.entries(map).slice(-300))));
  } catch {}
}
