export type Language =
  | 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it'
  | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'auto';

export type ExplanationType =
  | 'idiom' | 'slang' | 'phrase' | 'word' | 'abbreviation' | 'expression';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface TranscriptToken {
  id: string;
  text: string;
  isWord: boolean;
  confidence?: number;
}

export interface TranscriptSegment {
  id: string;
  tokens: TranscriptToken[];
  timestamp: number;
  isFinal: boolean;
}

export interface Session {
  id: string;
  language: Language;
  segments: TranscriptSegment[];
  startedAt: number;
  endedAt: number;
  preview: string;
}

export interface Explanation {
  term: string;
  type: ExplanationType;
  definition: string;
  usage: string;
  examples: string[];
  culturalNote?: string;
  difficulty: Difficulty;
}

export interface AppSettings {
  deepgramApiKey: string;
  claudeApiKey: string;
  defaultLanguage: Language;
  hapticFeedback: boolean;
}
