import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { transcribeChunk, tokeniseText } from '../lib/transcription';
import type { Language, TranscriptSegment } from '../types';

export type RecStatus = 'idle' | 'connecting' | 'live' | 'error';
const CHUNK_MS = 5000;
function uid(): string { return Math.random().toString(36).slice(2)+Date.now().toString(36); }

export function useRecording(deepgramKey: string) {
  const [status,   setStatus]   = useState<RecStatus>('idle');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const activeRef = useRef(false);
  const langRef   = useRef<Language>('en');
  const recordRef = useRef<Audio.Recording | null>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopChunk = useCallback(async (): Promise<string | null> => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    const rec = recordRef.current;
    if (!rec) return null;
    recordRef.current = null;
    try { await rec.stopAndUnloadAsync(); return rec.getURI() ?? null; } catch { return null; }
  }, []);

  const startChunk = useCallback(async () => {
    if (!activeRef.current) return;
    try {
      const { recording } = await Audio.Recording.createAsync({
        android: { extension:'.wav', outputFormat:Audio.AndroidOutputFormat.DEFAULT, audioEncoder:Audio.AndroidAudioEncoder.DEFAULT, sampleRate:16000, numberOfChannels:1, bitRate:128000 },
        ios:     { extension:'.wav', audioQuality:Audio.IOSAudioQuality.HIGH, sampleRate:16000, numberOfChannels:1, bitRate:128000, linearPCMBitDepth:16, linearPCMIsBigEndian:false, linearPCMIsFloat:false },
        web: {},
      });
      recordRef.current = recording;
      timerRef.current = setTimeout(async () => {
        if (!activeRef.current) return;
        const uri = await stopChunk();
        if (uri) {
          const result = await transcribeChunk(uri, langRef.current, deepgramKey);
          if (result?.transcript) {
            const segId = uid();
            setSegments((prev) => [...prev, { id:segId, tokens:tokeniseText(result.transcript, segId), timestamp:Date.now(), isFinal:true }]);
          }
        }
        if (activeRef.current) await startChunk();
      }, CHUNK_MS);
    } catch { if (activeRef.current) setStatus('error'); }
  }, [deepgramKey, stopChunk]);

  const start = useCallback(async (language: Language = 'en') => {
    if (activeRef.current) return;
    langRef.current = language;
    setSegments([]);
    setStatus('connecting');
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) { setStatus('error'); return; }
    await Audio.setAudioModeAsync({ allowsRecordingIOS:true, playsInSilentModeIOS:true });
    activeRef.current = true;
    setStatus('live');
    await startChunk();
  }, [startChunk]);

  const stop = useCallback(async () => {
    activeRef.current = false;
    await stopChunk();
    setStatus('idle');
  }, [stopChunk]);

  useEffect(() => () => {
    activeRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    recordRef.current?.stopAndUnloadAsync().catch(() => {});
  }, []);

  return { status, segments, start, stop };
}
