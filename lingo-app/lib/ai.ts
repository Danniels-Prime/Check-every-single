// Claude Haiku — explains idioms, slang, phrases
import { getCached, setCache } from './storage';
import type { Explanation, Language } from '../types';

const API = 'https://api.anthropic.com/v1/messages';

const LANG_LABEL: Partial<Record<Language, string>> = {
  en: 'American English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
  ru: 'Russian',
  zh: 'Mandarin Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
};

export async function explain(
  term: string,
  context: string,
  language: Language,
  apiKey: string
): Promise<Explanation> {
  const cacheKey = `${term.toLowerCase()}__${language}`;
  const hit = await getCached(cacheKey);
  if (hit) {
    try { return JSON.parse(hit) as Explanation; } catch {}
  }

  const lang = LANG_LABEL[language] ?? language.toUpperCase();

  const prompt = `You are an expert in ${lang} for language learners. A student tapped this term while listening to speech:

TERM: "${term}"
SENTENCE CONTEXT: "${context}"

Return ONLY a JSON object — no markdown, no explanation around it:
{
  "term": "${term}",
  "type": <"idiom"|"slang"|"phrase"|"word"|"abbreviation"|"expression">,
  "definition": "<one clear sentence>",
  "usage": "<when/how native speakers use this>",
  "examples": ["<natural sentence 1>", "<natural sentence 2>"],
  "culturalNote": "<origin, tone, or cultural nuance — omit key if not useful>",
  "difficulty": <"beginner"|"intermediate"|"advanced">
}`;

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API ${res.status}`);

  const data  = await res.json();
  const text: string = data?.content?.[0]?.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Unexpected response');

  const result = JSON.parse(match[0]) as Explanation;
  await setCache(cacheKey, JSON.stringify(result));
  return result;
}
