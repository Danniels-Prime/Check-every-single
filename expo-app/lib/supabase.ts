/**
 * Optional Supabase sync for history.
 * Credentials are entered by the user in Settings and stored in AsyncStorage.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { HistoryEntry, SupabaseHistoryRow } from '../types';

let _client: SupabaseClient | null = null;

export function getSupabaseClient(url: string, anonKey: string): SupabaseClient {
  if (!_client || _client.supabaseUrl !== url) {
    _client = createClient(url, anonKey);
  }
  return _client;
}

export async function syncHistoryEntry(
  entry: HistoryEntry,
  url: string,
  anonKey: string
): Promise<void> {
  if (!url || !anonKey) return;

  const client = getSupabaseClient(url, anonKey);
  const row: Omit<SupabaseHistoryRow, 'user_id'> = {
    id: entry.id,
    word: entry.word,
    translation: entry.translation,
    ipa: entry.ipa,
    direction: entry.direction,
    created_at: new Date(entry.timestamp).toISOString(),
  };

  await client.from('history').upsert(row);
}

export async function fetchRemoteHistory(
  url: string,
  anonKey: string
): Promise<HistoryEntry[]> {
  if (!url || !anonKey) return [];

  const client = getSupabaseClient(url, anonKey);
  const { data, error } = await client
    .from('history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error || !data) return [];

  return (data as SupabaseHistoryRow[]).map(
    (row): HistoryEntry => ({
      id: row.id,
      word: row.word,
      translation: row.translation,
      ipa: row.ipa,
      direction: row.direction,
      timestamp: new Date(row.created_at).getTime(),
      synced: true,
    })
  );
}
