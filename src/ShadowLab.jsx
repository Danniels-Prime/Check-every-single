// SHADOW LAB — Shadowing technique + Language Resource Vault
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { VOCAB } from './vocab.js';

const C = {
  void: '#03010a', card: '#0e0c1a', glass: '#14102a',
  violet: '#c77dff', ultra: '#9b30ff', cyan: '#00e5ff', bio: '#00ff88',
  acid: '#aaff00', gold: '#FFD700', rose: '#ff006b', silver: '#d0d0e8',
  dim: '#44406a', ghost: '#140f20', red: '#ff0044', amber: '#ffaa00', teal: '#00ccaa',
};

const VAULT_KEY = 'shadow_vault_v1';
const SHADOW_KEY = 'shadow_reps_v1';

const TAGS = [
  { id: 'video',     label: '📹 Video',     color: C.rose },
  { id: 'grammar',   label: '📖 Grammar',   color: C.violet },
  { id: 'listening', label: '🎧 Listening',  color: C.cyan },
  { id: 'phrases',   label: '💬 Phrases',   color: C.bio },
  { id: 'mindset',   label: '🧠 Mindset',   color: C.gold },
  { id: 'culture',   label: '🌍 Culture',   color: C.teal },
  { id: 'note',      label: '📝 Note',      color: C.amber },
];

// Build shadow phrase pool from VOCAB (prefer items with example sentences)
function buildShadowPool() {
  const withEx = VOCAB.filter(v => v.ex_ru && v.ex_en);
  const pool = withEx.length > 10 ? withEx : VOCAB;
  return [...pool].sort((a, b) => a.cat.localeCompare(b.cat));
}

function loadVault() {
  try { return JSON.parse(localStorage.getItem(VAULT_KEY) || '[]'); } catch { return []; }
}
function saveVault(v) { try { localStorage.setItem(VAULT_KEY, JSON.stringify(v)); } catch {} }

function loadReps() {
  try { return JSON.parse(localStorage.getItem(SHADOW_KEY) || '{}'); } catch { return {}; }
}
function saveReps(r) { try { localStorage.setItem(SHADOW_KEY, JSON.stringify(r)); } catch {} }

function Glass({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'rgba(14,12,26,0.8)', backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(199,125,255,0.18)',
      borderRadius: 16, ...style,
    }}>{children}</div>
  );
}

function Btn({ children, onClick, color = C.violet, style = {}, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: `linear-gradient(135deg,${color}22,${color}11)`,
      border: `1px solid ${color}66`, borderRadius: 12, padding: '12px 20px',
      color, fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1,
      transition: 'all .2s', ...style,
    }}>{children}</button>
  );
}

// ── SHADOW DRILL ────────────────────────────────────────────────────────────
const REPS_GOAL = 5;

function ShadowDrill({ speak, voices }) {
  const [pool] = useState(buildShadowPool);
  const [idx, setIdx] = useState(0);
  const [reps, setRepsRaw] = useState(loadReps);
  const [flash, setFlash] = useState(false);
  const [showTrans, setShowTrans] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const cats = useMemo(() => ['ALL', ...new Set(pool.map(v => v.cat))], [pool]);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return pool;
    return pool.filter(v => v.cat === filter);
  }, [pool, filter]);

  const card = filtered[idx % Math.max(1, filtered.length)];
  const cardReps = card ? (reps[card.id] || 0) : 0;
  const totalDone = Object.values(reps).filter(r => r >= REPS_GOAL).length;

  const setReps = (r) => { setRepsRaw(r); saveReps(r); };

  const doSpeak = useCallback(() => {
    if (!card || !speak) return;
    speak(card.ru, card.ex_ru);
  }, [card, speak]);

  useEffect(() => {
    setShowTrans(false);
    const t = setTimeout(doSpeak, 300);
    return () => clearTimeout(t);
  }, [idx, filter]); // eslint-disable-line

  const shadow = () => {
    if (!card) return;
    const newR = { ...reps, [card.id]: (reps[card.id] || 0) + 1 };
    setReps(newR);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    if ((newR[card.id] || 0) >= REPS_GOAL) {
      setTimeout(() => setIdx(i => i + 1), 500);
    }
  };

  if (!card) return <div style={{ color: C.dim, textAlign: 'center', padding: 40 }}>No phrases available</div>;

  const repPct = Math.min(100, Math.round((cardReps / REPS_GOAL) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Glass style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ color: C.bio, fontSize: 20, fontWeight: 700, fontFamily: "'Bebas Neue'" }}>{totalDone}</div>
          <div style={{ color: C.dim, fontSize: 10 }}>Mastered (5x)</div>
        </Glass>
        <Glass style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ color: C.cyan, fontSize: 20, fontWeight: 700, fontFamily: "'Bebas Neue'" }}>{filtered.length}</div>
          <div style={{ color: C.dim, fontSize: 10 }}>In queue</div>
        </Glass>
        <Glass style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ color: C.gold, fontSize: 20, fontWeight: 700, fontFamily: "'Bebas Neue'" }}>{cardReps}</div>
          <div style={{ color: C.dim, fontSize: 10 }}>This phrase</div>
        </Glass>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {cats.slice(0, 8).map(c => (
          <button key={c} onClick={() => { setFilter(c); setIdx(0); }} style={{
            flexShrink: 0, background: filter === c ? `${C.cyan}33` : C.glass,
            border: `1px solid ${filter === c ? C.cyan : C.dim}44`,
            borderRadius: 20, padding: '4px 10px', fontSize: 10,
            color: filter === c ? C.cyan : C.dim, cursor: 'pointer',
            fontFamily: "'Outfit',sans-serif",
          }}>{c.replace(/[^\w\s]/g, '').trim() || c}</button>
        ))}
      </div>

      {/* Phrase card */}
      <Glass style={{
        padding: '24px 20px', textAlign: 'center',
        borderColor: flash ? `${C.bio}88` : `${C.cyan}33`,
        boxShadow: flash ? `0 0 32px ${C.bio}44` : 'none',
        transition: 'all .3s',
      }}>
        <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, fontFamily: "'Space Mono',monospace", marginBottom: 10 }}>{card.cat}</div>

        {/* Russian phrase BIG */}
        <div style={{
          fontFamily: "'Bebas Neue',display", fontSize: card.ex_ru ? (card.ex_ru.length > 30 ? 20 : card.ex_ru.length > 20 ? 26 : 32) : 38,
          color: C.gold, letterSpacing: 1, lineHeight: 1.3, marginBottom: 6,
          textShadow: `0 0 20px ${C.gold}44`,
        }}>
          {card.ex_ru || card.ru}
        </div>

        <div style={{ color: '#6a6890', fontSize: 13, fontStyle: 'italic', fontFamily: "'Space Mono',monospace", marginBottom: 8 }}>
          {card.pr}
        </div>

        {/* Toggle translation */}
        <button onClick={() => setShowTrans(t => !t)} style={{
          background: 'none', border: `1px solid ${C.dim}44`, borderRadius: 20,
          padding: '3px 12px', color: C.dim, fontSize: 11, cursor: 'pointer', marginBottom: 8,
        }}>{showTrans ? '🙈 Hide' : '👁 Show English'}</button>

        {showTrans && (
          <div style={{ color: C.silver, fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginTop: 4 }}>
            {card.ex_en || card.en}
          </div>
        )}

        {/* Rep progress bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: C.dim, fontFamily: "'Space Mono',monospace" }}>SHADOW REPS</span>
            <span style={{ fontSize: 11, color: cardReps >= REPS_GOAL ? C.bio : C.cyan, fontWeight: 700 }}>{cardReps}/{REPS_GOAL}</span>
          </div>
          <div style={{ height: 6, background: C.ghost, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${repPct}%`,
              background: cardReps >= REPS_GOAL
                ? `linear-gradient(90deg,${C.bio},${C.acid})`
                : `linear-gradient(90deg,${C.cyan},${C.violet})`,
              borderRadius: 3, transition: 'width .4s ease',
            }} />
          </div>
          {cardReps >= REPS_GOAL && (
            <div style={{ color: C.bio, fontSize: 11, fontWeight: 700, marginTop: 5, textAlign: 'center' }}>
              ✓ PHRASE MASTERED — auto-advancing!
            </div>
          )}
        </div>
      </Glass>

      {/* Hear it */}
      <button onClick={doSpeak} style={{
        width: '100%', padding: '12px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
        background: `${C.cyan}22`, border: `1.5px solid ${C.cyan}66`, color: C.cyan,
        cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
      }}>🔊 Hear it (TTS)</button>

      {/* Shadow button */}
      <button onClick={shadow} style={{
        width: '100%', padding: '18px 0', borderRadius: 14, fontSize: 18, fontWeight: 800,
        background: `linear-gradient(135deg,${C.bio}33,${C.bio}11)`,
        border: `2px solid ${C.bio}77`, color: C.bio,
        cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
        boxShadow: flash ? `0 0 32px ${C.bio}66` : 'none',
        transform: flash ? 'scale(0.97)' : 'scale(1)',
        transition: 'all .25s',
      }}>
        🎙 Shadowed! (say it out loud, then tap)
      </button>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} style={{
          background: C.glass, border: `1px solid ${C.dim}44`, borderRadius: 10,
          color: idx === 0 ? `${C.dim}55` : '#fff', cursor: idx === 0 ? 'default' : 'pointer',
          padding: '10px 18px', fontSize: 13, fontFamily: "'Outfit',sans-serif",
        }}>← Prev</button>
        <div style={{ color: C.dim, fontSize: 11, fontFamily: "'Space Mono',monospace" }}>
          {(idx % filtered.length) + 1} / {filtered.length}
        </div>
        <button onClick={() => setIdx(i => i + 1)} style={{
          background: `${C.violet}22`, border: `1px solid ${C.violet}66`, borderRadius: 10,
          color: C.violet, cursor: 'pointer', padding: '10px 18px', fontSize: 13, fontWeight: 700,
          fontFamily: "'Outfit',sans-serif",
        }}>Next →</button>
      </div>

      {/* Shadowing guide */}
      <Glass style={{ padding: '12px 16px', borderColor: `${C.dim}22`, marginTop: 4 }}>
        <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.7 }}>
          <span style={{ color: C.cyan, fontWeight: 700 }}>How to shadow:</span> Listen → immediately repeat out loud, mimicking the exact sounds, rhythm and intonation. Don't translate — shadow the sound. 5 reps per phrase = mastered.
        </div>
      </Glass>
    </div>
  );
}

// ── VAULT ───────────────────────────────────────────────────────────────────
function Vault() {
  const [items, setItemsRaw] = useState(loadVault);
  const [form, setForm] = useState({ url: '', title: '', tag: 'video' });
  const [todayDone, setTodayDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vault_today') || '[]'); } catch { return []; }
  });
  const [filter, setFilter] = useState('ALL');

  const setItems = (v) => { setItemsRaw(v); saveVault(v); };
  const saveTodayDone = (d) => { setTodayDone(d); try { localStorage.setItem('vault_today', JSON.stringify(d)); } catch {} };

  const addItem = () => {
    if (!form.url.trim() && !form.title.trim()) return;
    const item = {
      id: `vault_${Date.now()}`,
      url: form.url.trim(),
      title: form.title.trim() || form.url.trim(),
      tag: form.tag,
      addedAt: Date.now(),
    };
    setItems([item, ...items]);
    setForm({ url: '', title: '', tag: form.tag });
  };

  const deleteItem = (id) => {
    setItems(items.filter(i => i.id !== id));
    saveTodayDone(todayDone.filter(x => x !== id));
  };

  const toggleDone = (id) => {
    saveTodayDone(todayDone.includes(id) ? todayDone.filter(x => x !== id) : [...todayDone, id]);
  };

  const tagMeta = (id) => TAGS.find(t => t.id === id) || TAGS[0];
  const filtered = filter === 'ALL' ? items : items.filter(i => i.tag === filter);
  const doneTodayCount = filtered.filter(i => todayDone.includes(i.id)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Progress */}
      {filtered.length > 0 && (
        <Glass style={{ padding: '12px 16px', borderColor: `${C.bio}33` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: C.bio, fontSize: 13, fontWeight: 700 }}>Today's Routine</span>
            <span style={{ color: C.bio, fontWeight: 700 }}>{doneTodayCount}/{filtered.length} done</span>
          </div>
          <div style={{ height: 5, background: C.ghost, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${filtered.length ? Math.round((doneTodayCount / filtered.length) * 100) : 0}%`,
              background: `linear-gradient(90deg,${C.bio},${C.cyan})`, borderRadius: 3, transition: 'width .4s',
            }} />
          </div>
        </Glass>
      )}

      {/* Add form */}
      <Glass style={{ padding: '14px 16px', borderColor: `${C.violet}33` }}>
        <div style={{ color: C.violet, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>+ ADD RESOURCE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title / description..."
            style={{
              background: C.ghost, border: `1px solid ${C.dim}44`, borderRadius: 8,
              padding: '9px 12px', color: C.silver, fontSize: 14, outline: 'none',
              fontFamily: "'Outfit',sans-serif",
            }}
          />
          <input
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            placeholder="URL (optional): https://youtube.com/..."
            style={{
              background: C.ghost, border: `1px solid ${C.dim}44`, borderRadius: 8,
              padding: '9px 12px', color: C.silver, fontSize: 13, outline: 'none',
              fontFamily: "'Outfit',sans-serif",
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={form.tag}
              onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
              style={{
                flex: 1, background: C.glass, border: `1px solid ${C.dim}44`, borderRadius: 8,
                padding: '8px 10px', color: C.silver, fontSize: 13, outline: 'none',
                fontFamily: "'Outfit',sans-serif",
              }}>
              {TAGS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <button onClick={addItem} style={{
              background: `${C.violet}33`, border: `1px solid ${C.violet}66`,
              borderRadius: 10, padding: '8px 20px', color: C.violet,
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
            }}>+ Save</button>
          </div>
        </div>
      </Glass>

      {/* Tag filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        <button key="ALL" onClick={() => setFilter('ALL')} style={{
          flexShrink: 0, background: filter === 'ALL' ? `${C.violet}33` : C.glass,
          border: `1px solid ${filter === 'ALL' ? C.violet : C.dim}44`,
          borderRadius: 20, padding: '4px 12px', fontSize: 11,
          color: filter === 'ALL' ? C.violet : C.dim, cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
        }}>ALL</button>
        {TAGS.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)} style={{
            flexShrink: 0, background: filter === t.id ? `${t.color}22` : C.glass,
            border: `1px solid ${filter === t.id ? t.color : C.dim}44`,
            borderRadius: 20, padding: '4px 10px', fontSize: 10,
            color: filter === t.id ? t.color : C.dim, cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Items list */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.dim }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 13, lineHeight: 1.7 }}>
            Your vault is empty.<br />
            Add YouTube links, grammar sites, podcast URLs, notes — anything you use to learn.
          </div>
        </div>
      )}

      {filtered.map(item => {
        const tag = tagMeta(item.tag);
        const done = todayDone.includes(item.id);
        return (
          <Glass key={item.id} style={{
            padding: '14px 16px',
            borderColor: done ? `${C.bio}55` : `${tag.color}33`,
            opacity: done ? 0.75 : 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    background: `${tag.color}22`, border: `1px solid ${tag.color}44`,
                    borderRadius: 20, padding: '2px 8px', fontSize: 10, color: tag.color,
                    flexShrink: 0,
                  }}>{tag.label}</div>
                  {done && <div style={{ fontSize: 10, color: C.bio, fontWeight: 700 }}>✓ Done today</div>}
                </div>
                <div style={{ color: done ? C.dim : C.silver, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  {item.title || item.url}
                </div>
                {item.url && item.url !== item.title && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
                    color: C.cyan, fontSize: 12, textDecoration: 'none',
                    display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{item.url}</a>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleDone(item.id)} style={{
                  background: done ? `${C.bio}22` : `${C.dim}22`,
                  border: `1px solid ${done ? C.bio : C.dim}44`,
                  borderRadius: 8, padding: '5px 10px', fontSize: 11,
                  color: done ? C.bio : C.dim, cursor: 'pointer', fontWeight: 700,
                  fontFamily: "'Outfit',sans-serif",
                }}>{done ? '✓' : '○'}</button>
                <button onClick={() => deleteItem(item.id)} style={{
                  background: 'none', border: `1px solid ${C.red}33`,
                  borderRadius: 8, padding: '5px 8px', color: `${C.red}88`,
                  cursor: 'pointer', fontSize: 13,
                }}>🗑</button>
              </div>
            </div>
          </Glass>
        );
      })}
    </div>
  );
}

// ── PHRASE BATTLE ───────────────────────────────────────────────────────────
const BATTLE_PHRASES = [
  { ru: 'Привет! Как дела?', pr: 'Privet! Kak dela?', en: 'Hey! How are you?' },
  { ru: 'Всё хорошо, спасибо!', pr: 'Vsyo khorosho, spasibo!', en: 'All good, thanks!' },
  { ru: 'Откуда ты?', pr: 'Otkuda ty?', en: 'Where are you from?' },
  { ru: 'Я из Америки.', pr: 'Ya iz Ameriki.', en: "I'm from America." },
  { ru: 'Давно изучаешь русский?', pr: 'Davno izuchaesh russkiy?', en: 'Have you been learning Russian long?' },
  { ru: 'Нет, только начал.', pr: 'Net, tolko nachal.', en: 'No, just started.' },
  { ru: 'Повтори, пожалуйста.', pr: 'Povtori, pozhaluysta.', en: 'Repeat that, please.' },
  { ru: 'Ты хорошо говоришь!', pr: 'Ty khorosho govorish!', en: 'You speak well!' },
  { ru: 'Спасибо, стараюсь!', pr: 'Spasibo, starayus!', en: 'Thanks, I try!' },
  { ru: 'Что это значит?', pr: 'Chto eto znachit?', en: 'What does this mean?' },
  { ru: 'Как это по-русски?', pr: 'Kak eto po-russki?', en: 'How do you say this in Russian?' },
  { ru: 'Я не понял.', pr: 'Ya ne ponyal.', en: "I didn't understand." },
  { ru: 'Говорите медленнее.', pr: 'Govorite medlennee.', en: 'Speak slower.' },
  { ru: 'Запишите, пожалуйста.', pr: 'Zapishite, pozhaluysta.', en: 'Write it down, please.' },
  { ru: 'До встречи!', pr: 'Do vstrechi!', en: 'See you!' },
  { ru: 'Хорошего дня!', pr: 'Khoroshego dnya!', en: 'Have a good day!' },
  { ru: 'Мне нравится Россия.', pr: 'Mne nravitsya Rossiya.', en: 'I like Russia.' },
  { ru: 'Ты мне нравишься.', pr: 'Ty mne nravishsya.', en: 'I like you.' },
  { ru: 'Позвони мне!', pr: 'Pozvoni mne!', en: 'Call me!' },
  { ru: 'Увидимся завтра!', pr: 'Uvidemsia zavtra!', en: "See you tomorrow!" },
];

function PhraseBattle({ speak }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState('ruToEn'); // ruToEn | enToRu
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [shuffled] = useState(() => [...BATTLE_PHRASES].sort(() => Math.random() - 0.5));

  const card = shuffled[idx % shuffled.length];

  useEffect(() => {
    setRevealed(false);
    if (dir === 'ruToEn' && speak) setTimeout(() => speak(card.ru, null), 200);
  }, [idx, dir]); // eslint-disable-line

  const rate = (correct) => {
    setScore(s => ({ right: s.right + (correct ? 1 : 0), total: s.total + 1 }));
    setTimeout(() => setIdx(i => i + 1), 300);
  };

  const pct = score.total > 0 ? Math.round((score.right / score.total) * 100) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Glass style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ color: C.bio, fontSize: 18, fontWeight: 700, fontFamily: "'Bebas Neue'" }}>{score.right}</div>
          <div style={{ color: C.dim, fontSize: 10 }}>Correct</div>
        </Glass>
        <Glass style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ color: C.violet, fontSize: 18, fontWeight: 700, fontFamily: "'Bebas Neue'" }}>{score.total}</div>
          <div style={{ color: C.dim, fontSize: 10 }}>Total</div>
        </Glass>
        <Glass style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ color: pct !== null ? (pct >= 80 ? C.bio : pct >= 50 ? C.amber : C.red) : C.dim, fontSize: 18, fontWeight: 700, fontFamily: "'Bebas Neue'" }}>{pct !== null ? `${pct}%` : '—'}</div>
          <div style={{ color: C.dim, fontSize: 10 }}>Accuracy</div>
        </Glass>
      </div>

      {/* Direction toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { id: 'ruToEn', label: '🇷🇺 → 🇬🇧' },
          { id: 'enToRu', label: '🇬🇧 → 🇷🇺' },
        ].map(d => (
          <button key={d.id} onClick={() => { setDir(d.id); setIdx(0); setRevealed(false); }} style={{
            flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: dir === d.id ? `${C.violet}33` : C.glass,
            border: `1px solid ${dir === d.id ? C.violet : C.dim}44`,
            color: dir === d.id ? C.violet : C.dim, cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
          }}>{d.label}</button>
        ))}
      </div>

      {/* Phrase card */}
      <Glass style={{ padding: '28px 20px', textAlign: 'center', borderColor: `${C.rose}33`, minHeight: 180 }}>
        <div style={{ fontSize: 11, color: C.rose, letterSpacing: 3, fontFamily: "'Space Mono',monospace", marginBottom: 12 }}>
          {dir === 'ruToEn' ? '— RUSSIAN (say the English!) —' : '— ENGLISH (say the Russian!) —'}
        </div>

        <div style={{
          fontSize: dir === 'ruToEn' ? (card.ru.length > 25 ? 20 : card.ru.length > 15 ? 26 : 34) : (card.en.length > 30 ? 18 : card.en.length > 20 ? 22 : 28),
          fontWeight: 800, lineHeight: 1.3,
          color: dir === 'ruToEn' ? C.gold : C.silver,
          marginBottom: 8,
          textShadow: `0 0 20px ${dir === 'ruToEn' ? C.gold : C.silver}44`,
        }}>
          {dir === 'ruToEn' ? card.ru : card.en}
        </div>

        {dir === 'ruToEn' && (
          <div style={{ color: '#6a6890', fontSize: 13, fontStyle: 'italic', fontFamily: "'Space Mono',monospace", marginBottom: 12 }}>{card.pr}</div>
        )}

        {!revealed ? (
          <button onClick={() => { setRevealed(true); if (dir === 'ruToEn' && speak) speak(card.ru, null); }} style={{
            background: `${C.rose}22`, border: `1px solid ${C.rose}55`,
            borderRadius: 10, padding: '8px 20px', color: C.rose,
            fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 600,
          }}>Reveal answer</button>
        ) : (
          <div style={{ animation: 'fadeIn .25s' }}>
            <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0 12px' }} />
            <div style={{
              fontSize: dir === 'enToRu' ? (card.ru.length > 20 ? 22 : 30) : (card.en.length > 30 ? 16 : 22),
              fontWeight: 700,
              color: dir === 'enToRu' ? C.gold : C.violet,
            }}>
              {dir === 'ruToEn' ? card.en : card.ru}
            </div>
            {dir === 'enToRu' && <div style={{ color: '#6a6890', fontSize: 13, fontStyle: 'italic', fontFamily: "'Space Mono',monospace", marginTop: 4 }}>{card.pr}</div>}
          </div>
        )}
      </Glass>

      {/* Rate buttons (after reveal) */}
      {revealed && (
        <div style={{ display: 'flex', gap: 10, animation: 'slideUp .25s' }}>
          <button onClick={() => rate(false)} style={{
            flex: 1, padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: `${C.red}22`, border: `1.5px solid ${C.red}66`,
            color: C.red, cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
          }}>✗ Missed it</button>
          <button onClick={() => rate(true)} style={{
            flex: 1, padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: `${C.bio}22`, border: `1.5px solid ${C.bio}66`,
            color: C.bio, cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
          }}>✓ Got it!</button>
        </div>
      )}

      {!revealed && (
        <button onClick={() => speak && speak(card.ru, null)} style={{
          padding: '10px 0', borderRadius: 10, fontSize: 13,
          background: `${C.cyan}22`, border: `1px solid ${C.cyan}44`,
          color: C.cyan, cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
        }}>🔊 Hear Russian</button>
      )}
    </div>
  );
}

// ── MAIN SHADOW LAB ─────────────────────────────────────────────────────────
export default function ShadowLab({ nav, speak, voices }) {
  const [tab, setTab] = useState('shadow');

  const tabs = [
    { id: 'shadow', label: '🎙 Shadow', color: C.bio },
    { id: 'battle', label: '⚔️ Battle', color: C.rose },
    { id: 'vault',  label: '🗄 Vault',  color: C.gold },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 0', background: C.void, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={() => nav('cosmos')} style={{ background: 'none', border: 'none', color: C.dim, fontSize: 20, cursor: 'pointer' }}>←</button>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',display", fontSize: 28, color: C.bio, letterSpacing: 3, lineHeight: 1 }}>SHADOW LAB</div>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, fontFamily: "'Space Mono',monospace" }}>SHADOW · BATTLE · VAULT</div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.dim}33` }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 700,
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t.id ? t.color : C.dim,
              borderBottom: tab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
              fontFamily: "'Outfit',sans-serif", transition: 'all .2s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 90px' }}>
        {tab === 'shadow' && <ShadowDrill speak={speak} voices={voices} />}
        {tab === 'battle' && <PhraseBattle speak={speak} />}
        {tab === 'vault' && <Vault />}
      </div>
    </div>
  );
}
