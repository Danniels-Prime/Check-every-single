import { useState, useCallback } from 'react';

const WORD_EMOJI = {
  'water':'💧','coffee':'☕','milk':'🥛','juice':'🧃','bread':'🍞',
  'meat':'🥩','chicken':'🍗','fish':'🐟','tea':'🍵','apple':'🍎',
  'beer':'🍺','wine':'🍷','phone':'📱','book':'📚','car':'🚗',
  'house':'🏠','dog':'🐕','cat':'🐈','sun':'☀️','moon':'🌙',
  'star':'⭐','money':'💰','music':'🎵','computer':'💻','bus':'🚌',
  'train':'🚂','plane':'✈️','clock':'⏰','key':'🔑','tree':'🌳',
  'flower':'🌸','rain':'🌧️','snow':'❄️','egg':'🥚','rice':'🍚',
  'pizza':'🍕','soup':'🍲','shirt':'👕','shoes':'👟',
};

function getEmoji(en) {
  return WORD_EMOJI[en?.toLowerCase().trim()] || null;
}

function fuzzyMatch(input, target) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const inp = norm(input);
  return target.split(/[/,]/).map(t => norm(t.trim())).some(t => t === inp);
}

export default function LangCard({
  item, themeColor = '#c77dff', isFlipped, onFlip, onSpeak,
  isPlaying, rateStatus, onRate, studyMode = 'flip_ru_en', cardFontSize = 'medium',
}) {
  const [typeInput, setTypeInput]     = useState('');
  const [typeResult, setTypeResult]   = useState(null);
  const [showInput, setShowInput]     = useState(false);
  const [listenPhase, setListenPhase] = useState('idle');

  const cc = themeColor;
  const scale = cardFontSize === 'large' ? 1.2 : cardFontSize === 'small' ? 0.82 : 1;
  const fs_ru = Math.round((item.ru.length > 26 ? 14 : item.ru.length > 18 ? 17 : item.ru.length > 12 ? 20 : 24) * scale);
  const fs_en = Math.round((item.en.length > 30 ? 17 : item.en.length > 20 ? 20 : item.en.length > 12 ? 23 : 27) * scale);

  const isReversed = studyMode === 'flip_en_ru' ||
    (studyMode === 'flip_random' && item.id.charCodeAt(item.id.length - 1) % 2 === 1);

  const frontText  = isReversed ? item.en : item.ru;
  const frontLang  = isReversed ? '🇬🇧 EN' : '🇷🇺 RU';
  const frontColor = isReversed ? cc : '#FFD700';
  const frontSize  = isReversed ? fs_en : fs_ru;
  const backText   = isReversed ? item.ru : item.en;
  const backLang   = isReversed ? '🇷🇺 RU' : '🇬🇧 EN';
  const backColor  = isReversed ? '#FFD700' : cc;
  const backSize   = isReversed ? fs_ru : fs_en;

  const checkType = useCallback(() => {
    if (!typeInput.trim()) return;
    const ok = fuzzyMatch(typeInput, item.en);
    setTypeResult(ok ? 'correct' : 'wrong');
    onRate(ok);
  }, [typeInput, item.en, onRate]);

  const reset = () => { setTypeInput(''); setTypeResult(null); setShowInput(false); setListenPhase('idle'); };

  const base = {
    position: 'relative',
    background: 'linear-gradient(145deg,#0e0c1a,#14102a)',
    border: `1.5px solid ${cc}${isFlipped ? 'aa' : '33'}`,
    borderRadius: 20, padding: '16px 14px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: 190, cursor: 'pointer', userSelect: 'none',
    transition: 'border-color .3s, box-shadow .3s', gap: 5,
    boxShadow: isFlipped ? `0 0 24px ${cc}33,inset 0 0 30px ${cc}11` : `0 0 12px ${cc}18`,
  };

  const ActionRow = () => (
    <div style={{ display:'flex', gap:6, marginTop:8, width:'100%', justifyContent:'center' }} onClick={e => e.stopPropagation()}>
      <button onClick={onSpeak} style={{
        background:`${cc}22`, border:`1px solid ${cc}55`, borderRadius:8,
        padding:'5px 10px', color:cc, fontSize:13, cursor:'pointer', fontFamily:'inherit',
      }}>{isPlaying ? '▶▶' : '🔊'}</button>
      <button onClick={() => { onRate(true); reset(); }} style={{
        background: rateStatus==='yes' ? '#00ff8833' : 'rgba(255,255,255,0.04)',
        border:`1px solid ${rateStatus==='yes' ? '#00ff88' : '#44406a'}55`,
        borderRadius:8, padding:'5px 12px', color:rateStatus==='yes'?'#00ff88':'#44406a',
        fontSize:12, cursor:'pointer', fontWeight:700, fontFamily:'inherit',
      }}>✅ Да</button>
      <button onClick={() => { onRate(false); reset(); }} style={{
        background: rateStatus==='no' ? '#ff004433' : 'rgba(255,255,255,0.04)',
        border:`1px solid ${rateStatus==='no' ? '#ff0044' : '#44406a'}55`,
        borderRadius:8, padding:'5px 12px', color:rateStatus==='no'?'#ff0044':'#44406a',
        fontSize:12, cursor:'pointer', fontWeight:700, fontFamily:'inherit',
      }}>❌ Нет</button>
    </div>
  );

  /* ── BOTH MODE ── */
  if (studyMode === 'flip_both') {
    return (
      <div style={{ ...base, cursor:'default' }}>
        <div style={{ fontSize:10, color:'#FFD700', fontWeight:800, letterSpacing:1 }}>🇷🇺 RU</div>
        <div style={{ fontSize:fs_ru, fontWeight:900, color:'#FFD700', lineHeight:1.2, textAlign:'center' }}>{item.ru}</div>
        <div style={{ fontSize:11, color:'#44406a', fontStyle:'italic' }}>{item.pr}</div>
        <div style={{ width:'100%', height:1, background:'rgba(255,255,255,0.07)', margin:'3px 0' }}/>
        <div style={{ fontSize:10, color:cc, fontWeight:800, letterSpacing:1 }}>🇬🇧 EN</div>
        <div style={{ fontSize:fs_en, fontWeight:900, color:cc, lineHeight:1.2, textAlign:'center', textShadow:`0 0 14px ${cc}60` }}>{item.en}</div>
        {item.ex_ru && <div style={{ fontSize:10, color:'#44406a', fontStyle:'italic', textAlign:'center', lineHeight:1.4 }}>{item.ex_ru}</div>}
        <ActionRow/>
      </div>
    );
  }

  /* ── TYPE MODE ── */
  if (studyMode === 'type') {
    return (
      <div style={{ ...base, cursor: showInput||typeResult ? 'default' : 'pointer' }}
        onClick={() => !showInput && !typeResult && setShowInput(true)}>
        <div style={{ fontSize:10, color:'#FFD700', fontWeight:800, letterSpacing:1 }}>🇷🇺 RU</div>
        <div style={{ fontSize:fs_ru, fontWeight:900, color:'#FFD700', lineHeight:1.2, textAlign:'center' }}>{item.ru}</div>
        <div style={{ fontSize:11, color:'#44406a', fontStyle:'italic' }}>{item.pr}</div>
        {!showInput && !typeResult && (
          <div style={{ fontSize:10, color:'#3d3b60', fontWeight:700, marginTop:'auto' }}>⌨️ tap to type English</div>
        )}
        {showInput && !typeResult && (
          <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:6, width:'100%' }} onClick={e => e.stopPropagation()}>
            <input value={typeInput} onChange={e => setTypeInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && checkType()} placeholder="English…" autoFocus
              style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${cc}50`, borderRadius:10,
                padding:'7px 10px', color:'#d0d0e8', fontSize:13, fontWeight:600, fontFamily:'inherit', outline:'none' }}/>
            <button onClick={checkType} style={{ padding:'5px', borderRadius:10, border:`1px solid ${cc}60`,
              background:`${cc}18`, color:cc, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>✓ Check</button>
          </div>
        )}
        {typeResult && (
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:6, width:'100%' }}>
            <p style={{ fontSize:12, fontWeight:800, color:typeResult==='correct'?'#00FF88':'#FF006E', textAlign:'center' }}>
              {typeResult==='correct' ? '🎯 Correct!' : `❌ ${item.en}`}
            </p>
            <ActionRow/>
          </div>
        )}
      </div>
    );
  }

  /* ── LISTEN MODE ── */
  if (studyMode === 'listen') {
    return (
      <div style={{ ...base, cursor:'default', minHeight:210 }}>
        {listenPhase === 'idle' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:8 }}>
            <button onClick={e => { e.stopPropagation(); onSpeak(); setListenPhase('typing'); }}
              style={{ fontSize:28, background:'none', border:`2px solid ${cc}60`, borderRadius:'50%',
                width:54, height:54, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:`0 0 18px ${cc}30`, color:'#fff' }}>🔊</button>
            <p style={{ fontSize:10, color:'#5e5c88', fontWeight:700 }}>Tap to hear Russian</p>
          </div>
        )}
        {listenPhase === 'typing' && !typeResult && (
          <div style={{ display:'flex', flexDirection:'column', gap:6, width:'100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:10, color:cc, fontWeight:800 }}>🎧 Type the English:</p>
              <button onClick={e => { e.stopPropagation(); onSpeak(); }}
                style={{ fontSize:14, background:'none', border:'none', cursor:'pointer', color:'#7a789e' }}>🔊</button>
            </div>
            <input value={typeInput} onChange={e => setTypeInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && checkType()} placeholder="English…" autoFocus
              style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${cc}50`, borderRadius:10,
                padding:'7px 10px', color:'#d0d0e8', fontSize:13, fontWeight:600, fontFamily:'inherit', outline:'none' }}/>
            <button onClick={checkType} style={{ padding:'5px', borderRadius:10, border:`1px solid ${cc}60`,
              background:`${cc}18`, color:cc, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>✓ Check</button>
          </div>
        )}
        {typeResult && (
          <div style={{ display:'flex', flexDirection:'column', gap:5, width:'100%' }}>
            <div style={{ textAlign:'center', fontSize:20 }}>{typeResult==='correct'?'✅':'❌'}</div>
            <p style={{ fontSize:12, fontWeight:800, color:typeResult==='correct'?'#00FF88':'#FF006E', textAlign:'center' }}>
              {typeResult==='correct' ? '🎯 Correct!' : item.en}
            </p>
            <p style={{ fontSize:10, color:'#5e5c88', textAlign:'center' }}>🇷🇺 {item.ru}</p>
            <div style={{ display:'flex', gap:6, justifyContent:'center' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => { onRate(true); reset(); }} style={{
                background:'#00ff8822', border:'1px solid #00ff8855', borderRadius:8,
                padding:'5px 12px', color:'#00ff88', fontSize:12, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>✅ Да</button>
              <button onClick={() => { onRate(false); reset(); }} style={{
                background:'#ff004422', border:'1px solid #ff004455', borderRadius:8,
                padding:'5px 12px', color:'#ff0044', fontSize:12, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>❌ Нет</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── FLIP MODES ── */
  const emoji = getEmoji(item.en);

  return (
    <div style={base} onClick={onFlip} role="button" tabIndex={0} onKeyDown={e => e.key==='Enter' && onFlip()}>
      {rateStatus && (
        <div style={{ position:'absolute', top:6, right:8, fontSize:12 }}>
          {rateStatus==='yes' ? '✅' : '❌'}
        </div>
      )}
      {emoji && !isFlipped && <div style={{ fontSize:26, lineHeight:1 }}>{emoji}</div>}
      <div style={{ fontSize:10, color:frontColor, fontWeight:800, letterSpacing:1 }}>{frontLang}</div>
      <div style={{ fontSize:frontSize, fontWeight:900, color:frontColor, lineHeight:1.2, textAlign:'center',
        textShadow:isFlipped?`0 0 14px ${frontColor}80`:'none', transition:'text-shadow .2s' }}>
        {frontText}
      </div>
      {!isFlipped && !isReversed && (
        <div style={{ fontSize:11, color:'#44406a', fontStyle:'italic' }}>{item.pr}</div>
      )}
      {!isFlipped && (
        <div style={{ fontSize:10, color:'#3d3b60', fontWeight:700, marginTop:'auto' }}>
          👆 tap · hear 🔊 · rate ✅❌
        </div>
      )}
      {isFlipped && (
        <>
          <div style={{ width:'100%', height:1, background:'rgba(255,255,255,0.07)', margin:'2px 0' }}/>
          <div style={{ fontSize:10, color:backColor, fontWeight:800, letterSpacing:1 }}>{backLang}</div>
          <div style={{ fontSize:backSize, fontWeight:900, color:backColor, lineHeight:1.2, textAlign:'center',
            textShadow:`0 0 20px ${backColor},0 0 40px ${backColor}60`, letterSpacing:'-0.3px' }}>
            {backText}
          </div>
          {isReversed && <div style={{ fontSize:11, color:'#44406a', fontStyle:'italic' }}>{item.pr}</div>}
          {item.ex_ru && (
            <div style={{ fontSize:10, color:'#44406a', lineHeight:1.4, fontStyle:'italic',
              borderLeft:`2px solid ${cc}40`, paddingLeft:6, marginTop:2, textAlign:'left', width:'100%' }}>
              "{item.ex_ru}"
            </div>
          )}
          <ActionRow/>
          {rateStatus==='yes' && <div style={{ fontSize:9, color:'#00FF88', fontWeight:700 }}>🌟 Отлично!</div>}
          {rateStatus==='no' && <div style={{ fontSize:9, color:'#FF006E', fontWeight:700 }}>🔁 Повторить!</div>}
        </>
      )}
    </div>
  );
}
