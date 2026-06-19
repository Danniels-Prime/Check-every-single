import { useState, useRef, useEffect, useCallback } from 'react';
import { VOCAB } from './vocab.js';

const C = {
  void:'#03010a', card:'#0e0c1a', glass:'#14102a',
  violet:'#c77dff', cyan:'#00e5ff', bio:'#00ff88',
  gold:'#FFD700', dim:'#44406a', ghost:'#140f20',
  red:'#ff0044', silver:'#d0d0e8',
};

const CATS = ['All', ...[...new Set(VOCAB.map(v => v.cat))]];

function getDueQueue(srs, cat = 'All') {
  const pool = cat === 'All' ? VOCAB : VOCAB.filter(v => v.cat === cat);
  const now = Date.now();
  const due = pool.filter(v => { const s = srs[v.id]; return !s || now >= s.nextReview; });
  return due.length > 0 ? due.slice(0, 20) : pool.slice(0, 20);
}

function fuzzyMatch(input, answer) {
  const clean = s => s.toLowerCase().trim().replace(/[^a-z0-9 ']/g, '').replace(/\s+/g, ' ');
  const a = clean(input), b = clean(answer);
  if (!a) return false;
  if (a === b) return true;
  const maxDist = b.length <= 6 ? 1 : b.length <= 12 ? 2 : 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length] <= maxDist;
}

export default function QuizView({ srs = {}, onRate, themeColor = '#c77dff', voices = [] }) {
  const [selectedCat, setCat] = useState('All');
  const [queue, setQueue]     = useState(() => getDueQueue(srs));
  const [idx, setIdx]         = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionEasy, setEasy] = useState(0);
  const [sessionAgain, setAgain] = useState(0);
  const [anim, setAnim]       = useState('');
  const [typeMode, setTypeMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ae_quiz_typemode') ?? 'false'); } catch { return false; }
  });
  const [typeInput, setTypeInput]   = useState('');
  const [typeResult, setTypeResult] = useState(null);
  const cardRef  = useRef(null);
  const inputRef = useRef(null);

  const card   = queue[idx];
  const isDone = !card && (sessionEasy + sessionAgain > 0);

  const speak = useCallback((text, example) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const voice = voices.find(v => v.lang === 'ru-RU') || voices.find(v => v.lang.startsWith('ru'));
    const mkUtt = (t, rate) => {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'ru-RU'; u.rate = rate;
      if (voice) u.voice = voice;
      return u;
    };
    const wordUtt = mkUtt(text, 0.82);
    window.speechSynthesis.speak(wordUtt);
    if (example) {
      const delay = Math.max(700, Math.round(text.length * 90 / 0.82)) + 350;
      const exUtt = mkUtt(example, 0.78);
      let fired = false;
      const fire = () => { if (!fired) { fired = true; window.speechSynthesis.speak(exUtt); } };
      wordUtt.onend = () => setTimeout(fire, 350);
      setTimeout(fire, delay);
    }
  }, [voices]);

  useEffect(() => {
    if (!card && sessionEasy + sessionAgain === 0) {
      setQueue(getDueQueue(srs, selectedCat));
      setIdx(0);
    }
  }, [srs, card, sessionEasy, sessionAgain, selectedCat]);

  useEffect(() => { setTypeInput(''); setTypeResult(null); }, [idx]);

  useEffect(() => {
    if (typeMode && inputRef.current) inputRef.current.focus();
  }, [idx, typeMode]);

  useEffect(() => {
    if (card && !typeMode) {
      const t = setTimeout(() => speak(card.ru, card.ex_ru), 350);
      return () => clearTimeout(t);
    }
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = useCallback((type) => {
    if (!card) return;
    const yes = type === 'easy';
    setAnim(yes ? 'easy' : 'again');
    setTimeout(() => setAnim(''), 600);
    onRate(card.id, yes);
    if (yes) setEasy(e => e + 1);
    else { setAgain(a => a + 1); setQueue(prev => [...prev, card]); }
    setTimeout(() => { setFlipped(false); setIdx(i => i + 1); }, 280);
  }, [card, onRate]);

  const submitAnswer = useCallback(() => {
    if (!typeInput.trim() || typeResult) return;
    const correct = fuzzyMatch(typeInput, card?.en ?? '');
    setTypeResult(correct ? 'correct' : 'wrong');
    if (correct) { speak(card.ru); setTimeout(() => answer('easy'), 700); }
    else { setTimeout(() => answer('again'), 1600); }
  }, [typeInput, typeResult, card, answer, speak]);

  const handleReveal = () => {
    if (!flipped && !typeMode) { setFlipped(true); speak(card.ru); }
  };

  const handleCatChange = (cat) => {
    setCat(cat);
    setQueue(getDueQueue(srs, cat));
    setIdx(0); setEasy(0); setAgain(0);
    setFlipped(false); setTypeInput(''); setTypeResult(null);
  };

  const restart = () => {
    setQueue(getDueQueue(srs, selectedCat));
    setIdx(0); setEasy(0); setAgain(0);
    setFlipped(false); setTypeInput(''); setTypeResult(null);
  };

  const toggleType = () => {
    const next = !typeMode;
    localStorage.setItem('ae_quiz_typemode', JSON.stringify(next));
    setTypeMode(next);
  };

  if (isDone || !card) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:32, gap:20 }}>
        <div style={{ fontSize:60 }}>🌟</div>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:36, color:C.bio, letterSpacing:3, textAlign:'center' }}>ALL CAUGHT UP!</div>
        <div style={{ color:C.dim, fontSize:14, textAlign:'center', fontFamily:"'Space Mono',monospace" }}>
          ✓ Easy: {sessionEasy} &nbsp;·&nbsp; ✗ Again: {sessionAgain}
        </div>
        <button onClick={restart} style={{
          padding:'14px 32px', borderRadius:14, fontSize:16, fontWeight:700,
          background:`${themeColor}22`, border:`1.5px solid ${themeColor}66`, color:themeColor,
          cursor:'pointer', fontFamily:"'Outfit',sans-serif", marginTop:8,
        }}>↺ Restart Session</button>
      </div>
    );
  }

  const total    = queue.length;
  const progress = total > 0 ? Math.round((idx / total) * 100) : 0;
  const tc       = themeColor;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'8px 14px 4px' }}>
      <style>{`
        @keyframes easyFloatQ{0%{transform:translateY(0) scale(1)}40%{transform:translateY(-10px) scale(1.03);filter:brightness(1.5)}100%{transform:translateY(0) scale(1)}}
        @keyframes shakeCardQ{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-7px)}80%{transform:translateX(7px)}}
        @keyframes revealInQ{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes correctPopQ{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        .cat-row-ae::-webkit-scrollbar{display:none}
        .qti:focus{border-color:${tc} !important;box-shadow:0 0 0 2px ${tc}33 !important;outline:none}
      `}</style>

      {/* Category filter */}
      <div className="cat-row-ae" style={{
        display:'flex', overflowX:'auto', gap:6, paddingBottom:8, marginBottom:4,
        scrollbarWidth:'none', WebkitOverflowScrolling:'touch', flexShrink:0,
      }}>
        {CATS.map(cat => {
          const active = selectedCat === cat;
          return (
            <button key={cat} onClick={() => handleCatChange(cat)} style={{
              flexShrink:0, padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:700,
              background: active ? `${tc}22` : 'rgba(255,255,255,0.04)',
              border:`1px solid ${active ? tc : C.dim}55`,
              color: active ? tc : C.dim,
              cursor:'pointer', fontFamily:"'Space Mono',monospace", whiteSpace:'nowrap',
            }}>{cat}</button>
          );
        })}
      </div>

      {/* Progress + type toggle */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexShrink:0 }}>
        <div style={{ flex:1, height:4, background:C.ghost, borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${tc},${C.cyan})`, transition:'width .4s', borderRadius:2 }}/>
        </div>
        <span style={{ color:C.dim, fontSize:11, minWidth:36, textAlign:'right', fontFamily:"'Space Mono',monospace" }}>{idx+1}/{total}</span>
        <button onClick={toggleType} title={typeMode?'Reveal mode':'Type mode'} style={{
          padding:'4px 10px', borderRadius:8, fontSize:12, fontWeight:800,
          background: typeMode ? `${tc}22` : 'rgba(255,255,255,0.04)',
          border:`1px solid ${typeMode ? tc : C.dim}55`,
          color: typeMode ? tc : C.dim, cursor:'pointer', fontFamily:"'Outfit',sans-serif",
        }}>⌨️</button>
      </div>

      {/* Card */}
      <div ref={cardRef} onClick={!typeMode ? handleReveal : undefined} style={{
        flex:1, overflowY:'auto',
        background:`linear-gradient(145deg,${C.card},${C.glass})`,
        border:`1.5px solid ${tc}${flipped||typeResult?'aa':'33'}`,
        borderRadius:24, padding:'24px 20px',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        cursor: (!typeMode && !flipped) ? 'pointer' : 'default', userSelect:'none',
        boxShadow:(flipped||typeResult)?`0 0 28px ${tc}33,inset 0 0 40px ${tc}11`:`0 0 16px ${tc}18`,
        transition:'border-color .3s, box-shadow .3s', minHeight:200,
        animation: anim==='easy' ? 'easyFloatQ .55s ease-out' : anim==='again' ? 'shakeCardQ .5s ease-out' : 'none',
      }}>
        <div style={{ fontSize:10, color:C.dim, letterSpacing:3, marginBottom:12, fontFamily:"'Space Mono',monospace" }}>
          {card.cat}
        </div>

        {/* Russian word (front) */}
        <div style={{
          fontFamily:"'Bebas Neue'", fontSize: card.ru.length > 20 ? 44 : card.ru.length > 12 ? 56 : 68,
          color:tc, letterSpacing:2, textAlign:'center', lineHeight:1.1,
          textShadow:`0 0 20px ${tc}55`,
        }}>{card.ru}</div>

        {/* Pronunciation */}
        <div style={{ color:'#6a6890', fontSize:16, fontStyle:'italic', fontFamily:"'Space Mono',monospace", marginTop:6, textAlign:'center' }}>
          {card.pr}
        </div>

        {!typeMode && !flipped && (
          <div style={{ marginTop:20, color:C.dim, fontSize:12, letterSpacing:2, fontFamily:"'Space Mono',monospace" }}>
            TAP TO REVEAL
          </div>
        )}

        {!typeMode && flipped && (
          <div style={{ marginTop:20, width:'100%', borderTop:`1px solid ${C.dim}33`, paddingTop:18, textAlign:'center', animation:'revealInQ .3s ease' }}>
            <div style={{ fontSize:22, color:C.silver, fontWeight:700, marginBottom:8 }}>
              🇬🇧 {card.en}
            </div>
            {card.ex_ru && (
              <div style={{ marginTop:10, textAlign:'left', borderTop:`1px solid ${C.dim}22`, paddingTop:10 }}>
                <div style={{ fontSize:14, color:'#8a88a8', lineHeight:1.5, fontStyle:'italic', marginBottom:4 }}>
                  🇷🇺 "{card.ex_ru}"
                </div>
                <div style={{ fontSize:13, color:C.dim, lineHeight:1.4, fontStyle:'italic' }}>
                  🇬🇧 "{card.ex_en}"
                </div>
              </div>
            )}
          </div>
        )}

        {typeMode && !typeResult && (
          <div style={{ marginTop:20, width:'100%' }} onClick={e => e.stopPropagation()}>
            <input ref={inputRef} className="qti" value={typeInput}
              onChange={e => setTypeInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && submitAnswer()}
              placeholder="type English translation…"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              style={{ width:'100%', padding:'14px 16px', borderRadius:14, fontSize:16,
                background:C.ghost, border:`1.5px solid ${C.dim}55`,
                color:C.silver, fontFamily:"'Outfit',sans-serif", boxSizing:'border-box' }}/>
            <button onClick={e => { e.stopPropagation(); submitAnswer(); }} style={{
              width:'100%', marginTop:10, padding:'14px 0', borderRadius:14,
              background:`${tc}18`, border:`1.5px solid ${tc}55`, color:tc,
              fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:"'Outfit',sans-serif",
            }}>Check →</button>
          </div>
        )}

        {typeMode && typeResult === 'correct' && (
          <div style={{ marginTop:20, textAlign:'center', animation:'correctPopQ .4s ease' }}>
            <div style={{ color:C.bio, fontSize:28, fontWeight:900, marginBottom:6 }}>✓ Correct!</div>
            <div style={{ color:`${C.silver}99`, fontSize:16 }}>🇬🇧 {card.en}</div>
          </div>
        )}
        {typeMode && typeResult === 'wrong' && (
          <div style={{ marginTop:20, textAlign:'center' }}>
            <div style={{ color:C.red, fontSize:15, fontWeight:800, marginBottom:8 }}>✗ The answer was:</div>
            <div style={{ color:C.silver, fontSize:24, fontWeight:700 }}>🇬🇧 {card.en}</div>
            <div style={{ color:C.dim, fontSize:12, marginTop:6, fontStyle:'italic' }}>{card.pr}</div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ padding:'12px 0 4px', flexShrink:0 }}>
        {typeMode ? (
          <div style={{ textAlign:'center', color:C.dim, fontSize:12, padding:'8px 0', fontFamily:"'Space Mono',monospace" }}>
            {typeResult ? (typeResult==='correct' ? '✓ Moving on…' : '✗ Try again next round…') : 'Type · Enter to check'}
          </div>
        ) : flipped ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <button onClick={() => answer('again')} style={{
              padding:'18px 0', borderRadius:16, fontSize:17, fontWeight:800,
              background:'rgba(255,0,68,0.12)', border:`1.5px solid ${C.red}66`, color:C.red,
              cursor:'pointer', fontFamily:"'Outfit',sans-serif",
            }}>✗ AGAIN</button>
            <button onClick={() => answer('easy')} style={{
              padding:'18px 0', borderRadius:16, fontSize:17, fontWeight:800,
              background:`${C.bio}12`, border:`1.5px solid ${C.bio}66`, color:C.bio,
              cursor:'pointer', fontFamily:"'Outfit',sans-serif",
            }}>✓ EASY</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <button onClick={() => answer('again')} style={{
              padding:'16px 0', borderRadius:16, fontSize:14, fontWeight:700,
              background:'rgba(255,0,68,0.07)', border:`1px solid ${C.red}44`, color:`${C.red}aa`,
              cursor:'pointer', fontFamily:"'Outfit',sans-serif",
            }}>✗ Again (3m)</button>
            <button onClick={handleReveal} style={{
              padding:'16px 0', borderRadius:16, fontSize:15, fontWeight:800,
              background:`${C.bio}12`, border:`1.5px solid ${C.bio}55`, color:C.bio,
              cursor:'pointer', fontFamily:"'Outfit',sans-serif",
            }}>Reveal →</button>
          </div>
        )}
      </div>

      <div style={{ display:'flex', justifyContent:'center', gap:24, paddingBottom:6, flexShrink:0 }}>
        <span style={{ color:C.bio, fontSize:12, fontFamily:"'Space Mono',monospace" }}>✓ {sessionEasy}</span>
        <span style={{ color:C.red, fontSize:12, fontFamily:"'Space Mono',monospace" }}>✗ {sessionAgain}</span>
        <span style={{ color:C.dim, fontSize:12, fontFamily:"'Space Mono',monospace" }}>+2 XP</span>
      </div>
    </div>
  );
}
