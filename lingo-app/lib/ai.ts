import { getCached, setCache } from './storage';
import type { Explanation, Language } from '../types';

const API = 'https://api.anthropic.com/v1/messages';
const LANG_LABEL: Partial<Record<Language, string>> = {
  en:'American English', es:'Spanish', fr:'French', de:'German',
  pt:'Portuguese', it:'Italian', ru:'Russian', zh:'Mandarin Chinese',
  ja:'Japanese', ko:'Korean', ar:'Arabic', hi:'Hindi',
};

export async function explain(
  term: string, context: string, language: Language, apiKey: string
): Promise<Explanation> {
  const cacheKey = `${term.toLowerCase()}__${language}`;
  const hit = await getCached(cacheKey);
  if (hit) { try { return JSON.parse(hit) as Explanation; } catch {} }

  const lang = LANG_LABEL[language] ?? language.toUpperCase();
  const prompt = `You are an expert in ${lang} for language learners. A student tapped this term:\n\nTERM: "${term}"\nSENTENCE CONTEXT: "${context}"\n\nReturn ONLY a JSON object — no markdown:\n{\n  "term": "${term}",\n  "type": <"idiom"|"slang"|"phrase"|"word"|"abbreviation"|"expression">,\n  "definition": "<one clear sentence>",\n  "usage": "<when/how native speakers use this>",\n  "examples": ["<natural sentence 1>", "<natural sentence 2>"],\n  "culturalNote": "<origin, tone, or nuance — omit key if not useful>",\n  "difficulty": <"beginner"|"intermediate"|"advanced">\n}`;

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
    body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:600, messages:[{role:'user',content:prompt}] }),
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
