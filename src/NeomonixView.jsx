// NEOMONIX — Memory Palace method: vivid mnemonic hooks for every word
import { useState, useEffect, useCallback, useMemo } from 'react';
import { VOCAB } from './vocab.js';

const C = {
  void:'#03010a', card:'#0e0c1a', glass:'#14102a',
  violet:'#c77dff', ultra:'#9b30ff', cyan:'#00e5ff', bio:'#00ff88',
  acid:'#aaff00', gold:'#FFD700', rose:'#ff006b', silver:'#d0d0e8',
  dim:'#44406a', ghost:'#140f20', red:'#ff0044', amber:'#ffaa00',
};

// Vivid mnemonic hooks — sound-alike stories that burn into memory
const HOOKS = {
  v1:  { story: "A PRIVATE detective tips his fedora: 'PRIVet — hello, pal!'", em: '🕵️' },
  v2:  { story: "DOBBY the elf brews your morning coffee — Dobroye UTRO!", em: '🧝' },
  v3:  { story: "DOBBY's DEN is where you say good afternoon — DOBRY den'!", em: '☀️' },
  v4:  { story: "DOBBY VECHERS in his den all evening long — good evening!", em: '🌆' },
  v5:  { story: "DO SEE VANIA again someday! Do svidaniya = Goodbye!", em: '👋' },
  v6:  { story: "POKE a sleeping bear then RUN! Poka — see ya later!", em: '🐻' },
  v7:  { story: "A SPACE BUS (spa-SI-bo) blasts off — THANK you for the ride!", em: '🚀' },
  v8:  { story: "PULL YOUR SOFA closer, please! Po-ZHAL-uysta = please!", em: '🛋️' },
  v9:  { story: "Same word: PULL YOUR SOFA again — po-ZHAL-uysta = you're welcome!", em: '🙏' },
  v10: { story: "EEZ-VEE-NIGHT: calling so late? SORRY about that! Izvinite!", em: '🌙' },
  v11: { story: "YA! NO PONY MY WAY — I DON'T UNDERSTAND horses. Ya ne ponimayu!", em: '🐴' },
  v12: { story: "Vy GOVORite = you SPEAK — does the GOAT or you speak English?", em: '🐐' },
  v13: { story: "YA CHOOSE RUSSIAN! Ya uchu russkiy = I'm learning Russian!", em: '🇷🇺' },
  v14: { story: "CACKLE at the VAST ZOO — Kak VAS ZOVut = What's your name?", em: '🦁' },
  v15: { story: "MENYA ZOVut: MY NAME IS... the ZOO calls me!", em: '🎪' },
  v16: { story: "PRE-YACHT-NO! A YACHT! So NICE to meet you on it!", em: '⛵' },
  v17: { story: "CACKLE at the LAW — Kak DELA? How ARE you doing?", em: '⚖️' },
  v18: { story: "HER SHOW is SO GOOD — khoROSHo = good / fine!", em: '🎪' },
  v19: { story: "DA! A mafia boss pumps his fist: YES!", em: '👊' },
  v20: { story: "NET zero, NET gain — NET = NO. Nothing!", em: '🚫' },
  v21: { story: "VODKA is just dressed-up WATER in Russia — voda = water!", em: '💧' },
  v22: { story: "COFFEE is KO-FE everywhere on Earth — same vibes!", em: '☕' },
  v23: { story: "CHAI tea is literally TEA-TEA — chay = tea!", em: '🍵' },
  v24: { story: "KLEB-er BREAD rises — khleb = bread!", em: '🍞' },
  v25: { story: "VKUS! Sounds like WHOAH COOSNO — SO DELICIOUS!", em: '😋' },
  v26: { story: "YA GOLD digger but HUNGRY for treasure — ya golodnyy!", em: '💰' },
  v27: { story: "RESTO-RAN? Almost the SAME word — restoran = restaurant!", em: '🍽️' },
  v28: { story: "ODIN the Norse god stands completely ALONE — odin = ONE!", em: '⚡' },
  v29: { story: "DVA = TWO-VA! Two vodkas please — dva = two!", em: '2️⃣' },
  v30: { story: "TRI-cycle has THREE wheels — tri = three!", em: '🚲' },
  v31: { story: "DAYS-YAT! Ten DAYS yet to go — desyat = ten!", em: '📅' },
  v32: { story: "STO-p! A HUNDRED soldiers march — sto = hundred!", em: '💯' },
  v33: { story: "SAY GOOD-NYA! Today GOD says: do it NOW — segodnya = today!", em: '✨' },
  v34: { story: "ZAP-TRA! You'll get ZAPPED tomorrow — zavtra = tomorrow!", em: '⚡' },
  v35: { story: "V-CHAIR-A! Yesterday you sat in the weird V-chair — vchera!", em: '🪑' },
  v36: { story: "SAY-CHASE! Do it NOW before the chase starts — seychas = now!", em: '🏃' },
  v37: { story: "INTRO to the day! Utro = morning — the intro track!", em: '🌅' },
  v38: { story: "VOUCHER for tonight: vecher = evening — evening voucher!", em: '🌆' },
  v39: { story: "SPOKEN NOCHI — Good night, speak NO-CHI more!", em: '🌙' },
  v40: { story: "NO DEAL YA! A whole WEEK of negotiations — nedelya = week!", em: '🤝' },
  v41: { story: "ROBOTS work nonstop! rabota = WORK — robot-A!", em: '🤖' },
  v42: { story: "DANDY GUY (den'gi) always has MONEY!", em: '💰' },
  v43: { story: "SCENE-A with a price tag — tsena = PRICE!", em: '🏷️' },
  v44: { story: "DO the LOGO design? Too EXPENSIVE — dorogo!", em: '💸' },
  v45: { story: "JO-SHOW-VO? That's CHEAP entertainment — dyoshevo!", em: '🎯' },
  v46: { story: "DOM-estic bliss at HOME — dom = home. DOM-ain!", em: '🏠' },
  v47: { story: "QUARTER here! My APARTMENT costs a quarter million — kvartira!", em: '🏢' },
  v48: { story: "COMMA-NAT! The ROOM gives you a coma — komnata = room!", em: '😴' },
  v49: { story: "MAMA is UNIVERSAL in every language — mama = mother!", em: '❤️' },
  v50: { story: "PAPA works hard in every language — papa = father!", em: '👔' },
  v51: { story: "DRUG dealer? NO — just my best FRIEND! drug = friend!", em: '🤝' },
  v52: { story: "BRAT of a BROTHER always acts spoiled — brat = brother!", em: '👦' },
  v53: { story: "ORCHESTRA-A has a SISTER playing violin — sestra = sister!", em: '🎻' },
  v54: { story: "G'DAY! WHERE in Australia? GDE = WHERE!", em: '🦘' },
  v55: { story: "SCHOOL-KO? HOW MUCH does school cost? skolko = how much!", em: '🏫' },
  v56: { story: "GHOST INN haunts my HOTEL room — gostinitsa = hotel!", em: '👻' },
  v57: { story: "POW! MOGUL IT! HELP me like a mogul! Pomogite = help!", em: '💥' },
  v58: { story: "YA! I got BLOOD-GEON'd and I'm LOST! — zabludilsya!", em: '🗺️' },
  v59: { story: "VRACH sounds like REACH — reach for the DOCTOR! vrach!", em: '🏥' },
  v60: { story: "ME PLONK-O! I feel SICK from that plonk! mne plokho!", em: '🤢' },
  v61: { story: "BOL' = BOWL of PAIN — bol' = pain!", em: '😣' },
  v63: { story: "YA DOOM-you? I THINK so — ya dumayu = I think!", em: '🤔' },
  v64: { story: "YACHT HO-CHOO! I WANT that yacht! — ya khochu = I want!", em: '⛵' },
  v65: { story: "MO-JET BY-T? MAYBE the jet flies today!", em: '✈️' },
  v66: { story: "KO-NECK-NO! Of COURSE! Who needs a neck? Konechno!", em: '😄' },
};

const BLITZ_KEY = 'neo_blitz_v1';
const DAILY_KEY = 'neo_daily_v1';

function loadDaily() {
  try {
    const d = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}');
    const today = new Date().toDateString();
    if (d.date !== today) return { date: today, committed: [] };
    return d;
  } catch { return { date: new Date().toDateString(), committed: [] }; }
}
function saveDaily(d) { try { localStorage.setItem(DAILY_KEY, JSON.stringify(d)); } catch {} }

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
      color, fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1,
      transition: 'all .2s', ...style,
    }}>{children}</button>
  );
}

// Stars background
function MiniStars() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 2 + 0.5, dur: 2 + Math.random() * 3, del: Math.random() * 4,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s, borderRadius: '50%', background: C.violet,
          animation: `starPulse ${s.dur}s ${s.del}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

export default function NeomonixView({ onXP, nav, speak }) {
  const [daily, setDailyRaw] = useState(loadDaily);
  const [mode, setMode] = useState('menu'); // menu | explore | blitz
  const [idx, setIdx] = useState(0);
  const [pool, setPool] = useState([]);
  const [blitzPool, setBlitzPool] = useState([]);
  const [blitzIdx, setBlitzIdx] = useState(0);
  const [blitzTimer, setBlitzTimer] = useState(6);
  const [blitzDone, setBlitzDone] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [justCommitted, setJustCommitted] = useState(false);

  const committedCount = daily.committed.length;
  const targetWords = 50;

  const setDaily = (d) => { setDailyRaw(d); saveDaily(d); };

  const commit = (id) => {
    if (daily.committed.includes(id)) return;
    const d = { ...daily, committed: [...daily.committed, id] };
    setDaily(d);
    if (onXP) onXP(15);
    setJustCommitted(true);
    setTimeout(() => setJustCommitted(false), 900);
  };

  // Build explore pool (words with hooks first, then rest)
  useEffect(() => {
    const withHooks = VOCAB.filter(v => HOOKS[v.id]);
    const rest = VOCAB.filter(v => !HOOKS[v.id]);
    setPool([...withHooks, ...rest]);
  }, []);

  // Blitz: 50 random words
  const startBlitz = () => {
    const shuffled = [...VOCAB].sort(() => Math.random() - 0.5).slice(0, 50);
    setBlitzPool(shuffled);
    setBlitzIdx(0);
    setBlitzTimer(6);
    setBlitzDone(false);
    setMode('blitz');
  };

  // Blitz auto-advance timer
  useEffect(() => {
    if (mode !== 'blitz' || blitzDone) return;
    const iv = setInterval(() => {
      setBlitzTimer(t => {
        if (t <= 1) {
          setBlitzIdx(i => {
            const next = i + 1;
            if (next >= blitzPool.length) { setBlitzDone(true); return i; }
            if (speak && blitzPool[next]) speak(blitzPool[next].ru, null);
            return next;
          });
          return 6;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [mode, blitzDone, blitzPool, speak]);

  // Speak current word on explore mode
  useEffect(() => {
    if (mode !== 'explore' || !pool[idx]) return;
    setFlipped(false);
    setTimeout(() => { if (speak) speak(pool[idx].ru, null); }, 200);
  }, [idx, mode]); // eslint-disable-line

  // Speak blitz word on change
  useEffect(() => {
    if (mode !== 'blitz' || !blitzPool[blitzIdx]) return;
    if (speak) speak(blitzPool[blitzIdx].ru, null);
  }, [blitzIdx]); // eslint-disable-line

  const card = pool[idx] || VOCAB[0];
  const hook = HOOKS[card?.id];
  const isCommitted = daily.committed.includes(card?.id);
  const blitzCard = blitzPool[blitzIdx];
  const blitzHook = blitzCard ? HOOKS[blitzCard.id] : null;

  // ── MENU ─────────────────────────────────────────────────────────────────
  if (mode === 'menu') {
    const pct = Math.min(100, Math.round((committedCount / targetWords) * 100));
    return (
      <div style={{ padding: '0 16px 90px', paddingTop: 56, position: 'relative', zIndex: 1 }}>
        <MiniStars />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => nav('cosmos')} style={{ background: 'none', border: 'none', color: C.dim, fontSize: 20, cursor: 'pointer' }}>←</button>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',display", fontSize: 32, color: C.gold, letterSpacing: 4, lineHeight: 1 }}>NEOMONIX</div>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, fontFamily: "'Space Mono',monospace" }}>MEMORY PALACE METHOD</div>
          </div>
        </div>

        {/* Daily progress */}
        <Glass style={{ padding: 20, marginBottom: 20, borderColor: `${C.gold}44` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: C.gold, fontWeight: 700, fontSize: 15 }}>Today's Blitz</span>
            <span style={{ color: committedCount >= targetWords ? C.bio : C.amber, fontWeight: 700, fontSize: 22, fontFamily: "'Bebas Neue'" }}>
              {committedCount} / {targetWords}
            </span>
          </div>
          <div style={{ height: 8, background: C.ghost, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${C.gold},${C.amber})`, borderRadius: 4, transition: 'width .5s ease' }} />
          </div>
          {committedCount >= targetWords
            ? <div style={{ color: C.bio, fontWeight: 700, textAlign: 'center', fontSize: 13 }}>🔥 50 WORDS CONQUERED TODAY!</div>
            : <div style={{ color: C.dim, fontSize: 12 }}>{targetWords - committedCount} words to lock in today's goal</div>
          }
        </Glass>

        {/* What is Neomonix */}
        <Glass style={{ padding: 16, marginBottom: 16, borderColor: `${C.violet}33` }}>
          <div style={{ color: C.violet, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🧠 The Neomonix Method</div>
          <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.7 }}>
            Each word gets a <span style={{ color: C.cyan }}>vivid, ridiculous story</span> that ties the Russian sound to the English meaning. Your brain can't forget it — that's the point.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            {[
              ['🎯', 'Hear the sound'],
              ['🎭', 'See the story'],
              ['🧠', 'Commit it'],
              ['🔥', '50 words/day'],
            ].map(([e, l]) => (
              <div key={l} style={{ background: `${C.ultra}11`, borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{e}</span>
                <span style={{ color: C.silver, fontSize: 12 }}>{l}</span>
              </div>
            ))}
          </div>
        </Glass>

        {/* Mode buttons */}
        <div style={{ display: 'grid', gap: 12 }}>
          <Btn onClick={() => { setIdx(0); setMode('explore'); }} color={C.violet}
            style={{ width: '100%', padding: '18px 0', fontSize: 17 }}>
            🔮 Explore Memory Palace
          </Btn>
          <Btn onClick={startBlitz} color={C.gold}
            style={{ width: '100%', padding: '18px 0', fontSize: 17 }}>
            ⚡ 50-WORD BLITZ CHALLENGE
          </Btn>
        </div>

        <div style={{ textAlign: 'center', color: C.dim, fontSize: 11, marginTop: 20, fontFamily: "'Space Mono',monospace" }}>
          {VOCAB.length} total words · {Object.keys(HOOKS).length} mnemonic hooks loaded
        </div>
      </div>
    );
  }

  // ── EXPLORE MODE ──────────────────────────────────────────────────────────
  if (mode === 'explore') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0 16px', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <MiniStars />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, paddingBottom: 8 }}>
          <button onClick={() => setMode('menu')} style={{ background: 'none', border: 'none', color: C.dim, fontSize: 20, cursor: 'pointer' }}>←</button>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: C.gold, letterSpacing: 2 }}>MEMORY PALACE</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: committedCount >= 50 ? C.bio : C.amber, fontSize: 13, fontWeight: 700 }}>🧠 {committedCount}/50</div>
            <div style={{ color: C.dim, fontSize: 11, fontFamily: "'Space Mono',monospace" }}>{idx + 1}/{pool.length}</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
          {/* Main word card */}
          <Glass onClick={() => { setFlipped(f => !f); if (!flipped && speak) speak(card.ru, card.ex_ru); }}
            style={{ padding: '28px 20px', textAlign: 'center', cursor: 'pointer', borderColor: `${C.gold}55`, position: 'relative' }}>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, fontFamily: "'Space Mono',monospace", marginBottom: 8 }}>{card.cat}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: card.ru.length > 20 ? 28 : card.ru.length > 12 ? 38 : 52, color: C.gold, letterSpacing: 2, lineHeight: 1.1, marginBottom: 6, textShadow: `0 0 30px ${C.gold}66` }}>
              {card.ru}
            </div>
            <div style={{ color: '#6a6890', fontSize: 15, fontStyle: 'italic', fontFamily: "'Space Mono',monospace", marginBottom: flipped ? 12 : 4 }}>{card.pr}</div>
            {!flipped && (
              <div style={{ fontSize: 11, color: `${C.dim}88`, marginTop: 4 }}>tap to reveal English</div>
            )}
            {flipped && (
              <>
                <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0 10px' }} />
                <div style={{ fontSize: card.en.length > 25 ? 18 : 26, fontWeight: 800, color: C.violet, lineHeight: 1.2, textShadow: `0 0 20px ${C.violet}66` }}>
                  {card.en}
                </div>
                {card.ex_ru && (
                  <div style={{ marginTop: 10, background: `${C.ultra}11`, borderRadius: 10, padding: '8px 12px', textAlign: 'left' }}>
                    <div style={{ fontSize: 13, color: C.silver, marginBottom: 3 }}>{card.ex_ru}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{card.ex_en}</div>
                  </div>
                )}
                {isCommitted && <div style={{ marginTop: 8, color: C.bio, fontSize: 12, fontWeight: 700 }}>✓ Committed to memory!</div>}
              </>
            )}
          </Glass>

          {/* Mnemonic hook */}
          {hook && (
            <Glass style={{ padding: '16px 18px', borderColor: `${C.cyan}33`, background: 'rgba(0,229,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{hook.em}</div>
                <div>
                  <div style={{ fontSize: 11, color: C.cyan, fontWeight: 700, letterSpacing: 2, marginBottom: 6, fontFamily: "'Space Mono',monospace" }}>NEOMONIX HOOK</div>
                  <div style={{ fontSize: 15, color: C.silver, lineHeight: 1.6 }}>{hook.story}</div>
                </div>
              </div>
            </Glass>
          )}

          {!hook && (
            <Glass style={{ padding: '14px 18px', borderColor: `${C.dim}33` }}>
              <div style={{ fontSize: 11, color: C.dim, textAlign: 'center', lineHeight: 1.6 }}>
                No mnemonic hook yet — create your own crazy story!<br />
                <span style={{ color: C.violet, fontSize: 12 }}>Tip: connect "{card.pr}" sound to "{card.en}"</span>
              </div>
            </Glass>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 0 32px' }}>
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} style={{
            background: C.glass, border: `1px solid ${C.dim}44`, borderRadius: 12,
            color: idx === 0 ? `${C.dim}55` : '#fff', cursor: idx === 0 ? 'default' : 'pointer',
            padding: '12px 18px', fontSize: 14, fontFamily: "'Outfit',sans-serif",
          }}>← Back</button>

          <button onClick={() => { commit(card.id); setTimeout(() => setIdx(i => i + 1), 400); }}
            disabled={isCommitted}
            className={justCommitted ? 'easy' : ''}
            style={{
              flex: 1, background: isCommitted ? `${C.bio}22` : `linear-gradient(135deg,${C.gold}33,${C.amber}22)`,
              border: `1.5px solid ${isCommitted ? C.bio : C.gold}88`, borderRadius: 12,
              color: isCommitted ? C.bio : C.gold, cursor: isCommitted ? 'default' : 'pointer',
              padding: '12px 0', fontSize: 14, fontWeight: 700, fontFamily: "'Outfit',sans-serif",
            }}>
            {isCommitted ? '✓ Committed!' : '🧠 Commit to Memory'}
          </button>

          <button onClick={() => setIdx(i => i + 1)} style={{
            background: C.glass, border: `1px solid ${C.dim}44`, borderRadius: 12,
            color: '#fff', cursor: 'pointer', padding: '12px 18px', fontSize: 14,
            fontFamily: "'Outfit',sans-serif",
          }}>Skip →</button>
        </div>
      </div>
    );
  }

  // ── BLITZ MODE ────────────────────────────────────────────────────────────
  if (mode === 'blitz') {
    if (blitzDone) {
      const blitzCommitted = blitzPool.filter(v => daily.committed.includes(v.id)).length;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 32, gap: 20, position: 'relative', zIndex: 1 }}>
          <MiniStars />
          <div style={{ fontSize: 64 }}>🔥</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 44, color: C.gold, letterSpacing: 4, textAlign: 'center', lineHeight: 1 }}>BLITZ<br />COMPLETE</div>
          <div style={{ color: C.silver, fontSize: 20, fontWeight: 700 }}>{blitzCommitted} / 50 committed</div>
          <div style={{ color: C.dim, fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
            Total today: <span style={{ color: C.gold, fontWeight: 700 }}>{committedCount}</span> / {targetWords} words
          </div>
          <Glass style={{ padding: '14px 24px', borderColor: `${C.bio}44`, textAlign: 'center' }}>
            <div style={{ color: C.bio, fontWeight: 700, marginBottom: 4 }}>🧠 Neomonix Science</div>
            <div style={{ color: C.dim, fontSize: 12, lineHeight: 1.6 }}>Your brain formed <span style={{ color: C.cyan }}>{blitzCommitted} new neural pathways</span>. Review again in 15 minutes to lock them in.</div>
          </Glass>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn onClick={startBlitz} color={C.gold} style={{ padding: '14px 24px' }}>⚡ Again</Btn>
            <Btn onClick={() => setMode('menu')} color={C.violet} style={{ padding: '14px 24px' }}>← Menu</Btn>
          </div>
        </div>
      );
    }

    if (!blitzCard) return null;
    const blitzPct = Math.round((blitzIdx / blitzPool.length) * 100);
    const timerPct = Math.round((blitzTimer / 6) * 100);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0 16px', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <MiniStars />
        {/* HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, paddingBottom: 8 }}>
          <button onClick={() => setMode('menu')} style={{ background: 'none', border: 'none', color: C.dim, fontSize: 20, cursor: 'pointer' }}>✕</button>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: C.gold, letterSpacing: 2 }}>50-WORD BLITZ</div>
          <div style={{ marginLeft: 'auto', color: C.amber, fontSize: 14, fontWeight: 700, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>
            {blitzIdx + 1} / {blitzPool.length}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: C.ghost, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ height: '100%', width: `${blitzPct}%`, background: `linear-gradient(90deg,${C.gold},${C.amber})`, transition: 'width .4s ease' }} />
        </div>

        {/* Timer bar */}
        <div style={{ height: 3, background: C.ghost, borderRadius: 2, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', width: `${timerPct}%`, background: blitzTimer <= 2 ? C.red : C.cyan, transition: 'width .9s linear', borderRadius: 2 }} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
          {/* Word card */}
          <Glass style={{ padding: '28px 20px', textAlign: 'center', borderColor: `${C.gold}55` }}>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, fontFamily: "'Space Mono',monospace", marginBottom: 8 }}>{blitzCard.cat}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: blitzCard.ru.length > 20 ? 28 : blitzCard.ru.length > 12 ? 40 : 56, color: C.gold, letterSpacing: 2, lineHeight: 1.1, textShadow: `0 0 30px ${C.gold}55` }}>
              {blitzCard.ru}
            </div>
            <div style={{ color: '#6a6890', fontSize: 14, fontStyle: 'italic', fontFamily: "'Space Mono',monospace", margin: '6px 0' }}>{blitzCard.pr}</div>
            <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
            <div style={{ fontSize: blitzCard.en.length > 25 ? 18 : 24, fontWeight: 800, color: C.violet, lineHeight: 1.2 }}>{blitzCard.en}</div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <div style={{ color: blitzTimer <= 2 ? C.red : C.cyan, fontSize: 28, fontWeight: 700, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>{blitzTimer}</div>
              <div style={{ color: C.dim, fontSize: 11 }}>sec</div>
            </div>
          </Glass>

          {/* Hook */}
          {blitzHook && (
            <Glass style={{ padding: '12px 16px', borderColor: `${C.cyan}33`, background: 'rgba(0,229,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{blitzHook.em}</div>
                <div style={{ fontSize: 13, color: C.silver, lineHeight: 1.5 }}>{blitzHook.story}</div>
              </div>
            </Glass>
          )}
        </div>

        {/* Blitz actions */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 0 32px' }}>
          <button onClick={() => setBlitzIdx(i => Math.max(0, i - 1))} style={{
            background: C.glass, border: `1px solid ${C.dim}44`, borderRadius: 12,
            color: '#fff', cursor: 'pointer', padding: '12px 16px', fontSize: 14, fontFamily: "'Outfit',sans-serif",
          }}>←</button>
          <button
            onClick={() => { commit(blitzCard.id); setBlitzTimer(6); setBlitzIdx(i => { const n = i + 1; if (n >= blitzPool.length) { setBlitzDone(true); return i; } return n; }); }}
            style={{
              flex: 1, background: `linear-gradient(135deg,${C.gold}44,${C.amber}22)`,
              border: `2px solid ${C.gold}88`, borderRadius: 12, color: C.gold,
              cursor: 'pointer', padding: '14px 0', fontSize: 15, fontWeight: 800,
              fontFamily: "'Outfit',sans-serif",
            }}>
            {daily.committed.includes(blitzCard.id) ? '✓ Got it!' : '🧠 BURNED IN → Next'}
          </button>
          <button onClick={() => { setBlitzTimer(6); setBlitzIdx(i => { const n = i + 1; if (n >= blitzPool.length) { setBlitzDone(true); return i; } return n; }); }} style={{
            background: C.glass, border: `1px solid ${C.dim}44`, borderRadius: 12,
            color: C.dim, cursor: 'pointer', padding: '12px 16px', fontSize: 14, fontFamily: "'Outfit',sans-serif",
          }}>→</button>
        </div>
      </div>
    );
  }

  return null;
}
