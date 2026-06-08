import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { VOCAB } from './vocab.js';

const C = {
  void:'#03010a', violet:'#c77dff', cyan:'#00e5ff', bio:'#00ff88',
  gold:'#FFD700', dim:'#44406a', silver:'#d0d0e8', ghost:'#140f20', ultra:'#9b30ff',
};

const DRIFT_COLORS = ['#c77dff','#00e5ff','#00ff88','#FFD700','#ff9500','#00ccaa','#ff006b','#aaff00'];
const FREQS_MAP = {174:'#8800ff',285:'#00cc88',396:'#cc0044',432:'#0088cc',528:'#00cc44',639:'#88cc00',741:'#00cccc',852:'#cc0088',963:'#cccc00'};

function rand(a, b) { return a + Math.random() * (b - a); }

function buildPool(srs) {
  const now = Date.now();
  const due = VOCAB.filter(v => { const s = srs[v.id]; return !s || now >= s.nextReview; });
  const base = due.length >= 5 ? due : VOCAB;
  return [...base].sort(() => Math.random() - 0.5);
}

export default function DriftMode({ srs = {}, onXP, voices = [], hz, onExit }) {
  const [words, setWords]       = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [elapsed, setElapsed]   = useState(0);
  const [sessionXP, setSessionXP] = useState(0);

  const nextId   = useRef(0);
  const pool     = useRef([]);
  const poolIdx  = useRef(0);
  const timers   = useRef([]);

  const stars = useMemo(() => Array.from({ length: 90 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.4 + 0.4,
    dur: 2 + Math.random() * 3, delay: Math.random() * 5,
  })), []);

  useEffect(() => {
    pool.current = buildPool(srs);
    poolIdx.current = 0;
  }, []); // eslint-disable-line

  const speak = useCallback((text) => {
    const s = window.speechSynthesis;
    if (!s || !text) return;
    s.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ru-RU'; utt.rate = 0.8;
    const v = voices.find(v => v.lang === 'ru-RU') || voices.find(v => v.lang.startsWith('ru'));
    if (v) utt.voice = v;
    s.speak(utt);
  }, [voices]);

  const pickVocab = () => {
    if (!pool.current.length) return VOCAB[0];
    const v = pool.current[poolIdx.current % pool.current.length];
    poolIdx.current++;
    if (poolIdx.current >= pool.current.length) {
      pool.current = [...pool.current].sort(() => Math.random() - 0.5);
      poolIdx.current = 0;
    }
    return v;
  };

  const spawnWord = useCallback(() => {
    const vocab = pickVocab();
    const id = nextId.current++;
    const y = rand(8, 78);
    const dur = rand(20, 34);
    const color = DRIFT_COLORS[id % DRIFT_COLORS.length];
    const tilt = ((id * 13) % 15) - 7;

    setWords(prev => [...prev, { id, vocab, y, dur, color, tilt }]);

    const ttsTimer  = setTimeout(() => speak(vocab.ru), dur * 0.40 * 1000);
    const killTimer = setTimeout(() => setWords(prev => prev.filter(w => w.id !== id)), (dur + 0.5) * 1000);
    timers.current.push(ttsTimer, killTimer);
  }, [speak]);

  useEffect(() => {
    spawnWord();
    const iv = setInterval(spawnWord, 4800);
    timers.current.push(iv);
    return () => {
      timers.current.forEach(t => { clearTimeout(t); clearInterval(t); });
      timers.current = [];
      window.speechSynthesis?.cancel();
    };
  }, [spawnWord]);

  useEffect(() => {
    const iv = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next % 120 === 0) {
          setSessionXP(x => x + 1);
          if (onXP) onXP(1);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [onXP]);

  const hzColor = hz ? (FREQS_MAP[hz] || C.violet) : C.violet;
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const tapWord = (word) => {
    if (expanded?.id === word.id) { setExpanded(null); return; }
    setExpanded(word);
    speak(word.vocab.ru);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, overflow:'hidden',
      background:`radial-gradient(ellipse at 30% 20%,${hzColor}18 0%,transparent 55%),
                  radial-gradient(ellipse at 75% 80%,#00e5ff0d 0%,transparent 55%),
                  #03010a`,
    }}>
      <style>{`
        @keyframes driftAcross {
          from { transform: translateX(110vw) rotate(var(--tilt)); }
          to   { transform: translateX(-460px) rotate(var(--tilt)); }
        }
        @keyframes cardOpen {
          from { opacity:0; transform:scale(.88) translateY(12px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes starGlow {
          0%,100%{opacity:.1} 50%{opacity:.85}
        }
      `}</style>

      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} style={{
          position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
          width:s.size, height:s.size, borderRadius:'50%',
          background: hzColor,
          animation:`starGlow ${s.dur}s ${s.delay}s ease-in-out infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {/* Drifting words */}
      {words.map(word => expanded?.id === word.id ? null : (
        <div key={word.id} onClick={() => tapWord(word)} style={{
          position:'absolute', top:`${word.y}%`, left:0,
          '--tilt': `${word.tilt}deg`,
          animation:`driftAcross ${word.dur}s linear forwards`,
          background:'rgba(14,12,26,0.84)', backdropFilter:'blur(14px)',
          border:`1px solid ${word.color}55`, borderRadius:16,
          padding:'9px 18px', cursor:'pointer', userSelect:'none',
          boxShadow:`0 0 20px ${word.color}2a`, whiteSpace:'nowrap',
        }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:26, color:word.color, letterSpacing:1, lineHeight:1.1 }}>
            {word.vocab.ru}
          </div>
          <div style={{ fontSize:10, color:C.dim, fontStyle:'italic', fontFamily:"'Space Mono',monospace" }}>
            {word.vocab.pr}
          </div>
          <div style={{ fontSize:11, color:`${C.silver}88` }}>
            {word.vocab.en}
          </div>
        </div>
      ))}

      {/* Expanded card overlay */}
      {expanded && (
        <div onClick={() => setExpanded(null)} style={{
          position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(3,1,10,0.65)', backdropFilter:'blur(10px)', zIndex:10,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:'rgba(14,12,26,0.97)',
            border:`1.5px solid ${expanded.color}88`,
            borderRadius:24, padding:'32px 28px', maxWidth:300, width:'85%',
            textAlign:'center', animation:'cardOpen .3s ease',
            boxShadow:`0 0 56px ${expanded.color}44,inset 0 0 40px ${expanded.color}0d`,
          }}>
            <div style={{ fontSize:10, color:C.dim, letterSpacing:3, marginBottom:12, fontFamily:"'Space Mono',monospace" }}>
              {expanded.vocab.cat}
            </div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:50, color:expanded.color, letterSpacing:2, lineHeight:1, marginBottom:6,
              textShadow:`0 0 24px ${expanded.color}88` }}>
              {expanded.vocab.ru}
            </div>
            <div style={{ color:C.dim, fontSize:13, fontStyle:'italic', fontFamily:"'Space Mono',monospace", marginBottom:16 }}>
              {expanded.vocab.pr}
            </div>
            <div style={{ color:C.silver, fontSize:22, fontWeight:700, marginBottom:14 }}>
              {expanded.vocab.en}
            </div>
            {expanded.vocab.ex_ru && (
              <div style={{ background:`${expanded.color}11`, borderRadius:12, padding:'10px 14px', fontSize:12, textAlign:'left' }}>
                <div style={{ color:C.silver, marginBottom:4 }}>{expanded.vocab.ex_ru}</div>
                <div style={{ color:C.dim }}>{expanded.vocab.ex_en}</div>
              </div>
            )}
            <button onClick={() => speak(expanded.vocab.ru)} style={{
              marginTop:16, background:`${expanded.color}22`, border:`1px solid ${expanded.color}55`,
              borderRadius:10, padding:'8px 20px', color:expanded.color,
              fontSize:14, cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontWeight:600,
            }}>🔊 Hear again</button>
            <div style={{ marginTop:10, color:`${C.dim}88`, fontSize:10 }}>tap outside to release</div>
          </div>
        </div>
      )}

      {/* Top-left: exit */}
      <button onClick={onExit} style={{
        position:'absolute', top:16, left:16, zIndex:20,
        background:'rgba(14,12,26,0.75)', backdropFilter:'blur(12px)',
        border:`1px solid ${C.dim}44`, borderRadius:12,
        color:C.dim, fontSize:18, cursor:'pointer',
        width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center',
        transition:'color .2s, border-color .2s',
      }}>✕</button>

      {/* Top-right: HUD */}
      <div style={{
        position:'absolute', top:16, right:16, zIndex:5,
        background:'rgba(14,12,26,0.75)', backdropFilter:'blur(12px)',
        border:`1px solid ${C.dim}44`, borderRadius:12, padding:'8px 14px', textAlign:'right',
      }}>
        <div style={{ color:C.violet, fontSize:14, fontWeight:700 }}>+{sessionXP} XP</div>
        <div style={{ color:C.dim, fontSize:11, fontFamily:"'Space Mono',monospace" }}>{fmt(elapsed)}</div>
      </div>

      {/* Hz badge */}
      {hz && (
        <div style={{
          position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:5,
          background:'rgba(14,12,26,0.75)', border:`1px solid ${hzColor}55`,
          borderRadius:20, padding:'6px 18px', fontSize:12, color:hzColor,
          fontFamily:"'Space Mono',monospace", letterSpacing:1,
        }}>{hz}Hz · drifting</div>
      )}

      {/* Footer hint */}
      <div style={{
        position:'absolute', bottom:hz?60:28, left:0, right:0, textAlign:'center',
        color:`${C.dim}77`, fontSize:10, fontFamily:"'Space Mono',monospace", pointerEvents:'none',
        letterSpacing:1,
      }}>tap a word to expand · +1 XP every 2 min</div>
    </div>
  );
}
