import { useState, useCallback } from 'react';
import { explain } from '../lib/ai';
import type { Explanation, Language } from '../types';

type State =
  | { phase: 'idle' }
  | { phase: 'loading'; term: string }
  | { phase: 'done'; data: Explanation }
  | { phase: 'error'; message: string };

export function useExplanation() {
  const [state, setState] = useState<State>({ phase: 'idle' });

  const fetch = useCallback(async (term: string, context: string, language: Language, apiKey: string) => {
    if (!apiKey.trim()) { setState({ phase:'error', message:'Add your Claude API key in Settings.' }); return; }
    setState({ phase:'loading', term });
    try {
      const data = await explain(term, context, language, apiKey);
      setState({ phase:'done', data });
    } catch (e) {
      setState({ phase:'error', message: e instanceof Error ? e.message : 'Failed to get explanation.' });
    }
  }, []);

  const reset = useCallback(() => setState({ phase: 'idle' }), []);
  return { state, fetch, reset };
}
