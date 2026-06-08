import { useState, useEffect, useRef, useCallback } from 'react';
import { VOCAB } from './vocab.js';

const C = {
  void:'#03010a', glass:'#14102a', violet:'#c77dff', cyan:'#00e5ff',
  bio:'#00ff88', gold:'#FFD700', dim:'#44406a', red:'#ff0044',
  silver:'#d0d0e8', ghost:'#140f20', amber:'#ffaa00',
};

const TICK = 50;
const BASE_SPEED = 0.25;
const SPAWN_INTERVAL = 3500;

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function fuzzyMatch(input, target) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const a = norm(input), b = norm(target);
  if (!a) return false;
  if (a === b) return true;
  const maxDist = b.length <= 6 ? 1 : b.length <= 10 ? 2 : 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length] <= maxDist;
}

export default function WordBlast({ onXP, voices = [], themeColor = '#c77dff' }) {
  const [phase, setPhase]   = useState('idle'); // idle | playing | over
  const [words, setWords]   = useState([]);
  const [lives, setLives]   = useState(3);
  const [score, setScore]   = useState(0);
  const [combo, setCombo]   = useState(0);
  const [input, setInput]   = useState('');
  const [blasts, setBlasts] = useState([]);
  const [elapsed, setElapsed] = useState(0);

  const wordsRef   = useRef([]);
  const livesRef   = useRef(3);
  const scoreRef   = useRef(0);
  const comboRef   = useRef(0);
  const idRef      = useRef(0);
  const tickRef    = useRef(null);
  const spawnRef   = useRef(null);
  const elapsedRef = useRef(0);
  const inputRef   = useRef(null);
  const usedRef    = useRef(new Set());

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ru-RU'; utt.rate = 0.9;
    const v = voices.find(v => v.lang === 'ru-RU') || voices.find(v => v.lang.startsWith('ru'));
    if (v) utt.voice = v;
    window.speechSynthesis.speak(utt);
  }, [voices]);

  const pickWord = () => {
    const unused = VOCAB.filter(v => !usedRef.current.has(v.id));
    const pool = unused.length > 0 ? unused : VOCAB;
    const v = pool[randInt(0, pool.length - 1)];
    usedRef.current.add(v.id);
    if (usedRef.current.size > VOCAB.length * 0.6) usedRef.current.clear();
    return v;
  };

  const spawnWord = useCallback(() => {
    const v = pickWord();
    const word = {
      id: idRef.current++,
      vocab: v,
      x: randInt(5, 75),
      y: 0,
      speed: BASE_SPEED + (elapsedRef.current / 120000) * 0.4,
    };
    wordsRef.current = [...wordsRef.current, word];
    setWords([...wordsRef.current]);
    speak(v.ru);
  }, [speak]);

  const endGame = useCallback(() => {
    clearInterval(tickRef.current);
    clearInterval(spawnRef.current);
    setPhase('over');
  }, []);

  const startGame = useCallback(() => {
    wordsRef.current = [];
    livesRef.current = 3;
    scoreRef.current = 0;
    comboRef.current = 0;
    elapsedRef.current = 0;
    idRef.current = 0;
    usedRef.current = new Set();
    setWords([]); setLives(3); setScore(0); setCombo(0);
    setInput(''); setBlasts([]); setElapsed(0);
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);

    spawnWord();
    spawnRef.current = setInterval(spawnWord, SPAWN_INTERVAL);

    tickRef.current = setInterval(() => {
      elapsedRef.current += TICK;
      setElapsed(e => e + TICK);

      wordsRef.current = wordsRef.current.map(w => ({ ...w, y: w.y + w.speed }));
      const hit = wordsRef.current.filter(w => w.y >= 88);
      const alive = wordsRef.current.filter(w => w.y < 88);

      if (hit.length > 0) {
        livesRef.current -= hit.length;
        comboRef.current = 0;
        setCombo(0);
        setLives(livesRef.current);
        wordsRef.current = alive;
        setWords([...alive]);
        if (livesRef.current <= 0) {
          clearInterval(tickRef.current);
          clearInterval(spawnRef.current);
          setPhase('over');
        }
      } else {
        setWords([...wordsRef.current]);
      }
    }, TICK);
  }, [spawnWord]);

  useEffect(() => () => {
    clearInterval(tickRef.current);
    clearInterval(spawnRef.current);
  }, []);

  const handleInput = useCallback((e) => {
    const val = e.target.value;
    if (val.endsWith(' ') || val.endsWith('\n')) {
      tryAnswer(val.trim());
      return;
    }
    setInput(val);
  }, []); // eslint-disable-line

  const tryAnswer = useCallback((ans) => {
    if (!ans) return;
    const hit = wordsRef.current.find(w => fuzzyMatch(ans, w.vocab.en));
    if (hit) {
      comboRef.current += 1;
      const xpGain = 5 + (comboRef.current > 1 ? comboRef.current * 2 : 0);
      scoreRef.current += xpGain;
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      wordsRef.current = wordsRef.current.filter(w => w.id !== hit.id);
      setWords([...wordsRef.current]);
      setBlasts(b => [...b, { id: hit.id, x: hit.x, y: hit.y, combo: comboRef.current }]);
      setTimeout(() => setBlasts(b => b.filter(bl => bl.id !== hit.id)), 800);
      if (onXP) onXP(xpGain);
    } else {
      comboRef.current = 0;
      setCombo(0);
    }
    setInput('');
  }, [onXP]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter') { tryAnswer(input); }
  }, [input, tryAnswer]);

  const tc = themeColor;

  if (phase === 'idle') {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:20, padding:32 }}>
        <div style={{ fontSize:64 }}>💫</div>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:42, color:tc, letterSpacing:4, textAlign:'center', lineHeight:1 }}>
          WORD<br/>BLAST
        </div>
        <div style={{ color:C.dim, fontSize:13, textAlign:'center', lineHeight:1.7, maxWidth:280 }}>
          Russian words fall from the sky.<br/>
          Type the <span style={{ color:tc }}>English translation</span> before they land.<br/>
          3 lives · combo multiplier · words get faster over time.
        </div>
        <button onClick={startGame} style={{
          padding:'16px 40px', borderRadius:16, fontSize:18, fontWeight:800,
          background:`${tc}22`, border:`2px solid ${tc}66`, color:tc,
          cursor:'pointer', fontFamily:"'Outfit',sans-serif",
          boxShadow:`0 0 24px ${tc}33`,
        }}>▶ Launch</button>
      </div>
    );
  }

  if (phase === 'over') {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16, padding:32 }}>
        <div style={{ fontSize:56 }}>💥</div>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:36, color:C.red, letterSpacing:3 }}>GAME OVER</div>
        <div style={{ color:C.silver, fontSize:22, fontWeight:700 }}>Score: {scoreRef.current} XP</div>
        <div style={{ color:C.dim, fontSize:13 }}>Survived: {Math.floor(elapsedRef.current / 1000)}s</div>
        <button onClick={startGame} style={{
          padding:'14px 36px', borderRadius:14, fontSize:16, fontWeight:800,
          background:`${tc}22`, border:`1.5px solid ${tc}66`, color:tc,
          cursor:'pointer', fontFamily:"'Outfit',sans-serif", marginTop:8,
        }}>↺ Play Again</button>
      </div>
    );
  }

  const speed = BASE_SPEED + (elapsed / 120000) * 0.4;
  const level = Math.floor(elapsed / 30000) + 1;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', position:'relative', overflow:'hidden' }}>
      {/* HUD */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px', flexShrink:0, zIndex:10 }}>
        <div style={{ display:'flex', gap:4 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{ fontSize:18, filter: i < lives ? 'none' : 'grayscale(1) opacity(0.3)' }}>❤️</span>
          ))}
        </div>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, color:tc, letterSpacing:2 }}>
          {score} XP
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {combo > 1 && (
            <div style={{ background:`${C.gold}22`, border:`1px solid ${C.gold}66`, borderRadius:8,
              padding:'2px 8px', color:C.gold, fontSize:11, fontWeight:800 }}>
              x{combo} COMBO
            </div>
          )}
          <div style={{ color:C.dim, fontSize:11, fontFamily:"'Space Mono',monospace" }}>Lv.{level}</div>
        </div>
      </div>

      {/* Play field */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        {/* Danger zone line */}
        <div style={{ position:'absolute', bottom:'12%', left:0, right:0, height:1, background:`${C.red}33`, zIndex:1 }}/>

        {words.map(w => (
          <div key={w.id} style={{
            position:'absolute', left:`${w.x}%`, top:`${w.y}%`,
            transform:'translateX(-50%)',
            background:'rgba(14,12,26,0.92)', border:`1px solid ${tc}66`,
            borderRadius:10, padding:'6px 12px', zIndex:5,
            transition:`top ${TICK}ms linear`,
            boxShadow:`0 0 12px ${tc}44`,
          }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:18, color:tc, letterSpacing:1, whiteSpace:'nowrap' }}>
              {w.vocab.ru}
            </div>
            <div style={{ fontSize:9, color:C.dim, textAlign:'center', fontFamily:"'Space Mono',monospace" }}>
              {w.vocab.pr}
            </div>
          </div>
        ))}

        {blasts.map(b => (
          <div key={`blast-${b.id}`} style={{
            position:'absolute', left:`${b.x}%`, top:`${b.y}%`,
            transform:'translateX(-50%) scale(1.5)',
            fontSize:b.combo > 2 ? 32 : 22,
            animation:'blastFade .8s ease-out forwards',
            zIndex:10, pointerEvents:'none',
          }}>
            {b.combo > 2 ? '🔥' : '💥'}
            {b.combo > 1 && (
              <span style={{ fontSize:12, color:C.gold, fontWeight:800, marginLeft:4 }}>+{b.combo * 2}</span>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:'10px 14px 16px', flexShrink:0, zIndex:10 }}>
        <style>{`
          @keyframes blastFade{0%{opacity:1;transform:translateX(-50%) scale(1.5)}100%{opacity:0;transform:translateX(-50%) scale(2.5) translateY(-20px)}}
          .blast-input:focus{border-color:${tc} !important; box-shadow:0 0 0 2px ${tc}33 !important; outline:none}
        `}</style>
        <input
          ref={inputRef}
          className="blast-input"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKey}
          placeholder="type English · press Enter or Space"
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
          style={{
            width:'100%', padding:'14px 16px', borderRadius:14, fontSize:16,
            background:C.ghost, border:`1.5px solid ${tc}55`,
            color:C.silver, fontFamily:"'Outfit',sans-serif", boxSizing:'border-box',
          }}
        />
      </div>
    </div>
  );
}
