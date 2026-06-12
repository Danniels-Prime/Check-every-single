// Deepgram Nova-2 — chunked REST transcription
import type { Language, TranscriptToken } from '../types';

interface DGResult {
  transcript: string;
  words: Array<{ word: string; confidence: number }>;
}

export async function transcribeChunk(
  audioUri: string,
  language: Language,
  apiKey: string
): Promise<DGResult | null> {
  try {
    const params = new URLSearchParams({
      model:        'nova-2',
      language:     language === 'auto' ? 'en' : language,
      punctuate:    'true',
      smart_format: 'true',
    });

    const formData = new FormData();
    formData.append('audio', {
      uri:  audioUri,
      type: 'audio/wav',
      name: 'chunk.wav',
    } as unknown as Blob);

    const res = await fetch(
      `https://api.deepgram.com/v1/listen?${params}`,
      {
        method:  'POST',
        headers: { Authorization: `Token ${apiKey}` },
        body:    formData,
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const alt  = data?.results?.channels?.[0]?.alternatives?.[0];
    if (!alt?.transcript?.trim()) return null;

    return {
      transcript: alt.transcript as string,
      words:      (alt.words ?? []) as Array<{ word: string; confidence: number }>,
    };
  } catch {
    return null;
  }
}

let _idCounter = 0;
function uid(): string {
  return `${Date.now()}-${++_idCounter}`;
}

export function tokeniseText(text: string, segId: string): TranscriptToken[] {
  const parts = text.match(/[\w'']+|[^\w\s]/g) ?? [];
  return parts.map((p) => ({
    id:     `${segId}-${uid()}`,
    text:   p,
    isWord: /[\w'']/.test(p),
  }));
}
