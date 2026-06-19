import { useState, useEffect, useCallback, useRef } from 'react';
import { PHRASES, CATEGORIES } from './phrases.js';

const C = {
  bg:     '#050510',
  card:   '#0b0b1e',
  glass:  '#0f0f28',
  border: '#1a1a3e',
  teal:   '#00e5ff',
  blue:   '#0088ff',
  gold:   '#ffd700',
  green:  '#00ff88',
  red:    '#ff3355',
  silver: '#d0d0f0',
  dim:    '#4a4a7a',
  ghost:  '#080818',
};

const HISTORY_KEY = 'overlaylang_history_v1';
const FAV_KEY     = 'overlaylang_favs_v1';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 50))); } catch {}
}
function loadFavs() {
  try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); } catch { return new Set(); }
}
function saveFavs(s) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify([...s])); } catch {}
}

function speak(text, lang = 'en-US') {
  const s = window.speechSynthesis;
  if (!s || !text) return;
  s.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.9;
  s.speak(utt);
}

// ─── CARD ────────────────────────────────────────────────────────────────────
function PhraseCard({ phrase, favs, onFav, accent }) {
  const [flipped, setFlipped] = useState(false);
  const isFav = favs.has(phrase.id);

  return (
    <div style={{
      background: C.card, border: `1px solid ${flipped ? accent + '88' : C.border}`,
      borderRadius: 16, padding: '16px 16px 12px', cursor: 'pointer',
      boxShadow: flipped ? `0 0 24px ${accent}22` : 'none',
      transition: 'border-color .2s, box-shadow .2s',
    }} onClick={() => setFlipped(f => !f)}>
      {/* EN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>🇺🇸 EN</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.silver, lineHeight: 1.3 }}>{phrase.en}</div>
          <div style={{ fontSize: 10, color: C.dim, fontFamily: 'monospace', marginTop: 3 }}>/{phrase.ipa}/</div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
          <button onClick={e => { e.stopPropagation(); speak(phrase.en, 'en-US'); }} style={{
            background: `${C.teal}18`, border: `1px solid ${C.teal}44`, borderRadius: 8,
            color: C.teal, fontSize: 13, cursor: 'pointer', padding: '4px 8px',
          }}>🔊</button>
          <button onClick={e => { e.stopPropagation(); onFav(phrase.id); }} style={{
            background: isFav ? `${C.gold}22` : `${C.dim}18`, border: `1px solid ${isFav ? C.gold : C.border}`,
            borderRadius: 8, color: isFav ? C.gold : C.dim, fontSize: 13, cursor: 'pointer', padding: '4px 8px',
          }}>{isFav ? '★' : '☆'}</button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `${C.border}`, margin: '10px 0' }} />

      {/* ES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>🇪🇸 ES</div>
          <div style={{
            fontSize: 20, fontWeight: 800, color: flipped ? C.gold : `${C.dim}88`,
            lineHeight: 1.2, filter: flipped ? 'none' : 'blur(5px)',
            transition: 'filter .25s, color .25s', userSelect: flipped ? 'auto' : 'none',
          }}>{phrase.es}</div>
        </div>
        {flipped && (
          <button onClick={e => { e.stopPropagation(); speak(phrase.es, 'es-ES'); }} style={{
            background: `${C.gold}18`, border: `1px solid ${C.gold}44`, borderRadius: 8,
            color: C.gold, fontSize: 13, cursor: 'pointer', padding: '4px 8px', marginLeft: 10,
          }}>🔊</button>
        )}
      </div>
      {!flipped && (
        <div style={{ fontSize: 10, color: `${C.dim}66`, marginTop: 6, textAlign: 'center' }}>tap to reveal Spanish</div>
      )}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]       = useState('browse');   // browse | search | favs | translate
  const [cat, setCat]       = useState('All');
  const [search, setSearch] = useState('');
  const [favs, setFavs]     = useState(loadFavs);
  const [history, setHistory] = useState(loadHistory);
  const [input, setInput]   = useState('');
  const [direction, setDir] = useState('en-es');    // en-es | es-en
  const [voices, setVoices] = useState([]);
  const inputRef = useRef(null);

  const accent = C.teal;

  useEffect(() => {
    const s = window.speechSynthesis;
    if (!s) return;
    const load = () => setVoices(s.getVoices());
    load(); s.addEventListener('voiceschanged', load);
    return () => s.removeEventListener('voiceschanged', load);
  }, []);

  const toggleFav = useCallback((id) => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveFavs(next);
      return next;
    });
  }, []);

  // Filter phrases
  const filtered = PHRASES.filter(p => {
    if (cat !== 'All' && p.cat !== cat) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.en.toLowerCase().includes(q) || p.es.toLowerCase().includes(q);
  });

  const favPhrases = PHRASES.filter(p => favs.has(p.id));

  const handleTranslate = useCallback(() => {
    if (!input.trim()) return;
    const q = input.trim().toLowerCase();
    const results = PHRASES.filter(p => {
      if (direction === 'en-es') return p.en.toLowerCase().includes(q);
      return p.es.toLowerCase().includes(q);
    });
    const entry = { id: Date.now(), q: input.trim(), direction, results: results.map(r => r.id) };
    setHistory(h => {
      const next = [entry, ...h.filter(x => x.q !== input.trim())].slice(0, 50);
      saveHistory(next);
      return next;
    });
  }, [input, direction]);

  const handleKey = (e) => { if (e.key === 'Enter') handleTranslate(); };

  const translateResults = history[0]?.q === input.trim()
    ? PHRASES.filter(p => history[0].results.includes(p.id))
    : [];

  const tabs = [
    { id: 'browse',    icon: '🌐', label: 'Browse' },
    { id: 'search',    icon: '🔍', label: 'Search' },
    { id: 'translate', icon: '⇄',  label: 'Translate' },
    { id: 'favs',      icon: '★',  label: 'Saved' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      fontFamily: "'Outfit', 'Segoe UI', sans-serif", color: C.silver,
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Space+Mono&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a1a3e; border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp .25s ease; }
        input::placeholder { color: #4a4a7a; }
        input:focus { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: `${C.bg}ee`, backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '14px 20px 12px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div>
          <div style={{
            fontWeight: 800, fontSize: 22, letterSpacing: 1,
            background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>OverlayLang</div>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 3, marginTop: -1 }}>EN ↔ ES · OFFLINE</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <div style={{ background: `${C.green}18`, border: `1px solid ${C.green}33`, borderRadius: 20,
            padding: '3px 10px', fontSize: 10, color: C.green }}>
            {PHRASES.length} phrases
          </div>
          <div style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}33`, borderRadius: 20,
            padding: '3px 10px', fontSize: 10, color: C.gold }}>
            {favs.size} saved
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

        {/* BROWSE TAB */}
        {tab === 'browse' && (
          <div className="fade-up" style={{ padding: '16px 16px 0' }}>
            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 4 }}>
              {['All', ...CATEGORIES].map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  flexShrink: 0, background: cat === c ? `${accent}22` : C.glass,
                  border: `1px solid ${cat === c ? accent : C.border}`, borderRadius: 20,
                  padding: '5px 14px', fontSize: 12, color: cat === c ? accent : C.dim,
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: cat === c ? 700 : 400,
                }}>{c}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>
              {filtered.length} phrase{filtered.length !== 1 ? 's' : ''} · tap card to reveal Spanish
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {filtered.map(p => (
                <PhraseCard key={p.id} phrase={p} favs={favs} onFav={toggleFav} accent={accent} />
              ))}
            </div>
          </div>
        )}

        {/* SEARCH TAB */}
        {tab === 'search' && (
          <div className="fade-up" style={{ padding: '16px' }}>
            <div style={{
              background: C.glass, border: `1px solid ${C.border}`, borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 16,
            }}>
              <span style={{ color: C.dim, fontSize: 18 }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search in English or Spanish..."
                autoFocus
                style={{
                  flex: 1, background: 'none', border: 'none', color: C.silver,
                  fontSize: 15, fontFamily: 'inherit',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{
                  background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 18,
                }}>✕</button>
              )}
            </div>
            {search ? (
              <div>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {filtered.map(p => (
                    <PhraseCard key={p.id} phrase={p} favs={favs} onFav={toggleFav} accent={accent} />
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', color: C.dim, padding: 40, fontSize: 14 }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>🔎</div>
                      No phrases found for "{search}"
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.dim, padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
                <div style={{ fontSize: 14 }}>Type in English or Spanish to search {PHRASES.length} phrases</div>
              </div>
            )}
          </div>
        )}

        {/* TRANSLATE TAB */}
        {tab === 'translate' && (
          <div className="fade-up" style={{ padding: '16px' }}>
            {/* Direction toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, marginBottom: 16,
            }}>
              {[['en-es', '🇺🇸 EN → 🇪🇸 ES'], ['es-en', '🇪🇸 ES → 🇺🇸 EN']].map(([d, l]) => (
                <button key={d} onClick={() => setDir(d)} style={{
                  background: direction === d ? `${accent}22` : C.glass,
                  border: `1px solid ${direction === d ? accent : C.border}`,
                  borderRadius: 20, padding: '6px 16px', fontSize: 12,
                  color: direction === d ? accent : C.dim, cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: direction === d ? 700 : 400,
                }}>{l}</button>
              ))}
            </div>

            {/* Input */}
            <div style={{
              background: C.glass, border: `1px solid ${C.border}`, borderRadius: 16,
              padding: '14px 16px', marginBottom: 12,
            }}>
              <div style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
                {direction === 'en-es' ? '🇺🇸 TYPE IN ENGLISH' : '🇪🇸 TYPE IN SPANISH'}
              </div>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={direction === 'en-es' ? 'e.g. hello, good morning...' : 'e.g. hola, buenos días...'}
                autoFocus
                style={{
                  width: '100%', background: 'none', border: 'none', color: C.silver,
                  fontSize: 16, fontFamily: 'inherit', fontWeight: 600,
                }}
              />
            </div>
            <button onClick={handleTranslate} style={{
              width: '100%', padding: '13px', borderRadius: 14, fontSize: 15, fontWeight: 800,
              background: `${accent}22`, border: `1.5px solid ${accent}66`, color: accent,
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20,
            }}>⇄ Find in Phrasebook</button>

            {/* Results */}
            {translateResults.length > 0 ? (
              <div>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>
                  {translateResults.length} match{translateResults.length !== 1 ? 'es' : ''} for "{history[0]?.q}"
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {translateResults.map(p => (
                    <PhraseCard key={p.id} phrase={p} favs={favs} onFav={toggleFav} accent={accent} />
                  ))}
                </div>
              </div>
            ) : input.trim() ? (
              <div style={{ textAlign: 'center', color: C.dim, padding: 30 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🌐</div>
                <div style={{ fontSize: 13 }}>Press the button to search</div>
              </div>
            ) : null}

            {/* Recent searches */}
            {history.length > 0 && !input.trim() && (
              <div>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 10, letterSpacing: 1 }}>RECENT</div>
                {history.slice(0, 8).map(h => (
                  <div key={h.id} onClick={() => setInput(h.q)} style={{
                    background: C.glass, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: '10px 14px', marginBottom: 6, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 12 }}>🕐</span>
                    <span style={{ flex: 1, color: C.silver, fontSize: 14 }}>{h.q}</span>
                    <span style={{ fontSize: 10, color: C.dim }}>
                      {h.direction === 'en-es' ? '🇺🇸→🇪🇸' : '🇪🇸→🇺🇸'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAVS TAB */}
        {tab === 'favs' && (
          <div className="fade-up" style={{ padding: '16px' }}>
            {favPhrases.length > 0 ? (
              <>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>
                  {favPhrases.length} saved phrase{favPhrases.length !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {favPhrases.map(p => (
                    <PhraseCard key={p.id} phrase={p} favs={favs} onFav={toggleFav} accent={accent} />
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: C.dim }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>★</div>
                <div style={{ fontSize: 14, marginBottom: 6, color: C.silver }}>No saved phrases yet</div>
                <div style={{ fontSize: 12 }}>Tap ☆ on any phrase to save it here</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
        background: `${C.bg}f0`, backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
          }}>
            <span style={{ fontSize: 20, filter: tab === t.id ? 'none' : 'grayscale(1) opacity(.5)' }}>{t.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, fontFamily: 'inherit',
              color: tab === t.id ? accent : C.dim,
            }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
