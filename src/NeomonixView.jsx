// NEOMONIX — Memory Palace: funny, exaggerated mnemonic hooks that BURN words in
import { useState, useEffect, useCallback, useMemo } from 'react';
import { VOCAB } from './vocab.js';

const C = {
  void:'#03010a', card:'#0e0c1a', glass:'#14102a',
  violet:'#c77dff', ultra:'#9b30ff', cyan:'#00e5ff', bio:'#00ff88',
  acid:'#aaff00', gold:'#FFD700', rose:'#ff006b', silver:'#d0d0e8',
  dim:'#44406a', ghost:'#140f20', red:'#ff0044', amber:'#ffaa00',
};

// Each hook: bridge = the sound→meaning link shown prominently, scene = visual emoji row, story = the funny story
const HOOKS = {
  v1: {
    bridge: 'PRIVATE → privet',
    scene: '🕵️☕💥🪟👋',
    story: "A PRIVATE eye detective crashes through your window, spills coffee everywhere, then tips his hat: 'PRIIIIvet! Hello there, pal!' Like he didn't just destroy your kitchen. 😂",
  },
  v2: {
    bridge: 'DOBBY + ULTRA → dobroye utro',
    scene: '🧝💡😱☀️😤',
    story: "DOBBY appears at 4 AM in an ULTRA-bright LED suit, shines a flashlight in your face: 'DOBBY WISHES YOU DOBROYE UTRO!!!' That's GOOD MORNING and you never wanted it.",
  },
  v3: {
    bridge: "DOBBY's DEN → dobry den",
    scene: '🧝🏠🎩🫖🌤️',
    story: "You visit DOBBY's secret DEN at 2 PM. He's got a banner that says GOOD AFTERNOON, a tiny tuxedo, and is serving crumpets. He's been expecting you. Very formal.",
  },
  v4: {
    bridge: 'DOBBY + VOUCHER → dobry vecher',
    scene: '🧝🎟️🌆🤵✨',
    story: "DOBBY hands you a golden VOUCHER at sunset for 'One Free Good Evening.' He's wearing a bow tie. He's very proud. DOBRY VECHER = good evening.",
  },
  v5: {
    bridge: 'DO SEE VANIA → do svidaniya',
    scene: '👵🚀🌌👋😭',
    story: "DO SEE VANIA! A massive Russian babushka named VANIA waves from a departing spaceship: 'DO SVIDANIYYYYA!!!' She gets smaller and smaller until she's a tiny dot in the cosmos.",
  },
  v6: {
    bridge: 'POKE A bear → poka',
    scene: '🐻👉😴👋💤',
    story: "You POKE a sleeping grizzly. He opens ONE eye, checks his watch, waves lazily: 'Poka. Gotta hibernate.' Then goes back to sleep. The most unbothered goodbye in history.",
  },
  v7: {
    bridge: 'SPA + SEE + BOA → spasibo',
    scene: '🐍💆‍♀️😱🛁🙏',
    story: "You're at a luxury SPA when you SEE a giant BOA CONSTRICTOR doing the massage. You scream. He hands you a towel. You whisper 'SPASIBO.' You thank the snake. He nods.",
  },
  v8: {
    bridge: 'PULL A SHAWL + STOP → pozhaluysta',
    scene: '🧣😤💪🙏😅',
    story: "You're dramatically PULLING a giant SHAWL across the floor, screaming 'POZHALUYSTA — PLEASE just one more inch!' It stops. CRISIS AVERTED. POZHALUYSTA = please.",
  },
  v9: {
    bridge: '🤯 SAME WORD — please = you\'re welcome!',
    scene: '🤯🤷‍♂️🇷🇺✌️😂',
    story: "POZHALUYSTA means BOTH 'please' AND 'you're welcome.' Russians went: 'Same vibes, same word, deal with it.' And they're RIGHT. One less word to learn. TAKE THE WIN.",
  },
  v10: {
    bridge: 'EEZ + VEE + NITE → izvinite',
    scene: '🦡🌙👔🚪😂',
    story: "A weasel (EEZ-el) in a V-neck (VEE) sweater knocks at NIGHT: 'Izvinite... sorry for being nocturnal.' You: 'You're a weasel.' Him: 'Izvinite.' He's genuinely sorry.",
  },
  v11: {
    bridge: 'YA + NO + PONY + MY + YOU → ya ne ponimayu',
    scene: '🐴😤🧑‍🤝‍🧑💬🤦',
    story: "YA: 'NO! MY PONY understands me and YOU don't!' The pony nods furiously, looks at you with disappointment. Your pony is more bilingual than you. He's judging you hard.",
  },
  v12: {
    bridge: 'V-GOAT + GREET → vy govorite',
    scene: '🐐🤵💬🗣️😶',
    story: "A fancy V-neck GOAT approaches, extends a hoof: 'Vy govorite English? Do YOU SPEAK English?' He's more cultured than you. He also speaks French. You feel embarrassed.",
  },
  v13: {
    bridge: 'YA + ACHOO + ROOST + KEY → ya uchu russkiy',
    scene: '🤧🐓🔑🇷🇺😩',
    story: "You ACHOO so hard you sneeze the KEY to the chicken ROOST, and now you must learn Russian to ask the rooster for it back. YA UCHU RUSSKIY! The rooster is your teacher now.",
  },
  v14: {
    bridge: 'CACKLE + VAS + ZOO + PUT → kak vas zovut',
    scene: '🦁😂📋❓🦁',
    story: "At the ZOO a hyena CACKLEs at you: 'KAK VAS ZOVUT?!' She's TAKING ATTENDANCE. She has a tiny clipboard and WAITS. Professional. Thorough. She wants your full name.",
  },
  v15: {
    bridge: 'ME + NYA + ZOO + PUT → menya zovut',
    scene: '🦁😐🙋‍♀️🏷️💀',
    story: "At the ZOO you raise your hand: 'MENYA ZOVUT... I'm the one who came to see YOU.' The lion shrugs. 'Cool. I don't care.' Dead behind the eyes. Ice cold. My name is.",
  },
  v16: {
    bridge: 'PREE + YACHT + NO → priyatno',
    scene: '⛵🎊💥🤝😮',
    story: "A Russian billionaire invites you aboard his YACHT. Says 'PRIYATNO!!!' and the yacht EXPLODES with CONFETTI. That's how much he's pleased to meet you. No expense spared.",
  },
  v17: {
    bridge: 'CACKLE + DEAL → kak dela',
    scene: '🦁😂💼❓🫶',
    story: "The hyena is BACK. CACKLEs in your face: 'KAK DELA?! What's the DEAL? How ARE you doing?!' She's that friend who just shows up. She genuinely wants to know.",
  },
  v18: {
    bridge: "HER SHOW → khorosho",
    scene: '🎪🎤👩🏆🔥',
    story: "The Russian talent show host: 'KHOROSHO! HER SHOW was GOOD!' Audience erupts. Because khorosho = GOOD and HER SHOW WAS GOOD. Beautifully circular. Simple. True.",
  },
  v19: {
    bridge: 'DA = YES — the mob boss nod',
    scene: '🤵‍♂️😐👆✅💰',
    story: "You ask the Russian mob boss ANYTHING. He looks at you slowly. Slowly. Points one finger. 'Da.' That's it. Deal made. You're in. You've also seen too much. DA = YES.",
  },
  v20: {
    bridge: 'NET = NYET = NO',
    scene: '🚫🥅🐟🏒🤌',
    story: "'NET! NET! NET!' shouts every Russian referee AND fisherman AND hockey player. NET in Russian = NO. They also net fish and net goals. Everything in Russia is a net of denial.",
  },
  v21: {
    bridge: 'VODKA without the KA → voda',
    scene: '🍶😮💧🇷🇺😂',
    story: "Russian tourist: 'VODKA, please!' Waiter brings water. 'Is this vodka?' 'No sir — VODA.' 'Watered down vodka?' IT'S WATER. VODA = WATER. Not vodka. Very different.",
  },
  v22: {
    bridge: 'KO + FEH → kofe (literally just coffee)',
    scene: '☕🇷🇺😌✌️💯',
    story: "KOFE. It's literally just COFFEE with a Russian shrug. They didn't even try to rename it. 'Kofe?' 'Da, kofe.' Absolute legends. Sometimes languages just vibe.",
  },
  v23: {
    bridge: 'CHAI = chay (you already knew this!)',
    scene: '🍵😱🤯✨🇷🇺',
    story: "It's literally CHAI! You've been saying Russian at Starbucks this WHOLE TIME!! CHAI LATTE?? That's Russian! You've been bilingual and you didn't even KNOW. Welcome.",
  },
  v24: {
    bridge: 'CLAY BLOB + BREAD → khleb',
    scene: '🍞😤💥😂🏆',
    story: "You trip over a CLAY BLOB, fall FACE-FIRST into a loaf of bread, rise covered in flour, fist raised: 'KHLEB!' Like you conquered it. KHLEB = BREAD. You earned it.",
  },
  v25: {
    bridge: 'V + COOZ + NO → vkusno',
    scene: '😋👨‍🍳🍽️✨💫',
    story: "Russian chef slides a mystery dish across the counter. You eye it. Tiny bite. Eyes go wide. You whisper: '...Vkusno.' Delicious. You didn't expect it. But here you are.",
  },
  v26: {
    bridge: 'YA + GOLD + NEED → ya golodnyy',
    scene: '💰😩🍽️😭🌟',
    story: "A gold digger runs out of gold and grabs her stomach: 'YA GOLODNYYYY!' I'm HUNGRY! She wanted GOLD and got HUNGER instead. YA GOLODNYY = I'm hungry. She needs food.",
  },
  v27: {
    bridge: 'RESTORAN = restaurant (just say it Russian)',
    scene: '🍽️✌️🇷🇺💅😎',
    story: "IT IS LITERALLY RESTAURANT WITH A RUSSIAN ACCENT. Say RESTORAN in a deep Russian voice. YOU ARE SPEAKING RUSSIAN. Take this easy win. You deserve it.",
  },
  v28: {
    bridge: 'ODIN + ALONE → odin = one',
    scene: '⚡👁️🍺🐦👤',
    story: "ODIN the Norse god sits ALONE in Valhalla with ONE beer, ONE raven, and ONE eye. He is literally ALONE with ONE of everything. ODIN = ONE. He planned this from the start.",
  },
  v29: {
    bridge: 'DVA = TWO — dramatic card player',
    scene: '2️⃣🃏😤💪🙂',
    story: "'DVA!!' yells the Russian poker player, slamming down TWO cards dramatically. He stands up. Everyone stares. He sits back down quietly. He has two. DVA = TWO.",
  },
  v30: {
    bridge: 'TRI-CYCLE = three wheels → tri',
    scene: '🐻🚲3️⃣🎪👏',
    story: "A bear on a TRI-CYCLE pedals by on THREE wheels. He's doing GREAT. TRI = THREE. Three wheels, one bear, zero problems. He doesn't need your help. He has this.",
  },
  v31: {
    bridge: 'DES-YAT = TEN DAYS yet!',
    scene: '📅🪖😰🔟⏰',
    story: "The general storms in: 'DESYAT DAYS until inspection! TEN DAYS!' Everyone panics. Someone hasn't washed their uniform in DESYAT days. DESYAT = TEN. Very specific pressure.",
  },
  v32: {
    bridge: 'STO + P = one hundred soldiers STOP',
    scene: '💯🪖🛑🤔😂',
    story: "ONE HUNDRED soldiers marching. Sergeant yells 'STO!!!' They think it means STOP. It means ONE HUNDRED. One hundred confused soldiers have stopped. STO = 100.",
  },
  v33: {
    bridge: "SAY + GOD + NYA → segodnya = today",
    scene: '🙏😂📅✨👼',
    story: "You SAY to GOD: 'NYA NYA NYA, I'll do it SEGODNYA!' meaning TODAY. God checks the calendar. 'Sure.' But you also said 'nyanya' = nanny. Your nanny is now God. Today.",
  },
  v34: {
    bridge: 'ZAP + TRAP → zavtra = tomorrow',
    scene: '⚡🪤😵📅🌅',
    story: "You got ZAPPED by a laser TRAP and wake up and it's TOMORROW. You got ZAVTRA-PPED. That's not real but ZAVTRA IS and it means TOMORROW, where you just woke up.",
  },
  v35: {
    bridge: 'V-CHAIR + AH → vchera = yesterday',
    scene: '🪑😖💺👉📅',
    story: "YESTERDAY you sat in a weird V-SHAPED chair and made the noise 'AHHHHH' the whole time. VCHERA — AH! Yesterday was uncomfortable. VCHERA = yesterday.",
  },
  v36: {
    bridge: 'SAY + CHASE → seychas = right now!',
    scene: '🏃‍♂️😱💨🗣️⏱️',
    story: "Someone is CHASING you. You SAY: 'SEYCHAS! SEYCHAS!' — RIGHT NOW! I'll give it back RIGHT NOW please stop chasing me! SEYCHAS = now. Also used in less panicked contexts.",
  },
  v37: {
    bridge: 'ULTRA → utro = morning',
    scene: '⏰😐💤🌅🎵',
    story: "Your alarm drops an ULTRA-BASS beat at 5 AM. You: '...utro.' Flat face. Morning. UTRO. The morning is ULTRA. You are not. You are just a person in the utro.",
  },
  v38: {
    bridge: 'VOUCHER → vecher = evening',
    scene: '🌆🎟️☕😌✨',
    story: "You receive a golden VOUCHER: 'ONE FREE VECHER!' VECHER = evening. It's basically a VOUCHER for the evening. Use it to stay in, drink chay, do absolutely nothing. Very cozy.",
  },
  v39: {
    bridge: 'NO + SPEECH = noch = night',
    scene: '🌙😴🌟💤🔇',
    story: "It's NOCHE — night. SPEAK NO MORE. It's time for NOCH. Silent. Dark. You NOCTURNAL-adjacent now. Good NOCH. Goodnight. Noche. Speak no chi more.",
  },
  v40: {
    bridge: 'NO DEAL → nedelya = week',
    scene: '🤝😤📅💼🚫',
    story: "Russian businessman, one week of negotiations. Stares you down. 'Nedelya has passed.' A FULL WEEK. 'NO DEAL.' NEDELYA = week. That whole nedelya went absolutely nowhere.",
  },
  v41: {
    bridge: 'ROBOT + AH → rabota = work',
    scene: '🤖💼☕📊😮‍💨',
    story: "A ROBOT drags itself through the door Monday morning, badge around neck, coffee in mechanical claw: 'Rabota...' and sits at a tiny desk. RABOTA = work. We're all the robot.",
  },
  v42: {
    bridge: 'DANDY GUY → den\'gi = money',
    scene: '🎩🧐💰💅👑',
    story: "A DANDY GUY in a top hat, cane spinning, monocle gleaming: 'Den'gi, darling! One needs DEN'GI to look this fabulous!' He's absolutely right. DEN'GI = MONEY.",
  },
  v43: {
    bridge: 'SCENE + AH → tsena = price',
    scene: '🏷️🎭😮💫🛒',
    story: "The market seller yanks off a cloth with a dramatic 'AH!' revealing... a price tag. That's THE WHOLE SCENE. A tsena reveal. TSENA = PRICE. Very theatrical pricing strategy.",
  },
  v44: {
    bridge: 'DO + LOGO + GO → dorogo = expensive',
    scene: '💸😱🎨💳😭',
    story: "You ask a designer for a logo. They quote you. 'DOROGO!' you shriek. TOO EXPENSIVE. DO NOT let that LOGO GO on my bill. DOROGO = expensive. Your wallet weeps.",
  },
  v45: {
    bridge: "JO'S SHOW → dyoshevo = cheap",
    scene: '🎪😂💰🃏✌️',
    story: "'JO'S SHOW' — a budget Russian variety show, ONE ruble entry. 'DYOSHEVO! So CHEAP!' Jo comes out in a cardboard suit. It's incredible. DYOSHEVO = cheap/inexpensive.",
  },
  v46: {
    bridge: 'DOME = dom = home',
    scene: '🏠⛩️💕🌂😊',
    story: "Your home is a GIANT DOME. You live in a dome. DOM-estic bliss. It echoes but it's warm and the DOME keeps the rain out. DOM = home. You love your dome. It's yours.",
  },
  v47: {
    bridge: 'QUARTER + TIARA → kvartira = apartment',
    scene: '🏢👑25¢💎😂',
    story: "Your APARTMENT costs exactly one QUARTER, but you must pay in TIARAS. Weird landlord. KVARTIRA — a quarter in a tiara neighborhood. Very exclusive. Very strange.",
  },
  v48: {
    bridge: 'COMA + NOT + AH → komnata = room',
    scene: '🛋️😴💤🏠😂',
    story: "The ROOM is so boring you go into a COMA. 'NOT AH-gain!' they say. KOMNATA... Yep. Another coma in the room. The room gives you a coma. That's just this room's thing.",
  },
  v49: {
    bridge: 'MAMA is universal 🌍',
    scene: '❤️👩‍👧🌍🤱💐',
    story: "MAMA. MA. MOM. MÈRE. Every single language decided MAMA = MOM. No meetings held, no votes cast. Just global agreement. Your mom transcends all languages. She deserves this.",
  },
  v50: {
    bridge: 'PAPA is universal 🌍',
    scene: '👨‍👧‍👦🌍❤️🏆✌️',
    story: "Same as mama! Every dad everywhere looked up and said: 'I am Papa.' Done. They didn't overthink it. Zero drama. Very dad energy. PAPA = dad. Universal dad vibes.",
  },
  v51: {
    bridge: 'DRUG in Russian = FRIEND (not what you think!)',
    scene: '🤝😅🚨🇷🇺😂',
    story: "'Hey, my DRUG is coming over!' Neighbor calls the police. 'NO — my DRUG! My FRIEND! In Russian DRUG means FRIEND!' Police arrive anyway. Cultural exchange is complicated.",
  },
  v52: {
    bridge: 'BRAT of a brother → brat = brother',
    scene: '👦😤🤦‍♀️🇷🇺😂',
    story: "Your brother is being a TOTAL BRAT. Of COURSE in Russian BRAT literally MEANS brother. Because brothers ARE brats. Russians understood sibling dynamics from day one.",
  },
  v53: {
    bridge: 'orch-ESTRA + SIS → sestra = sister',
    scene: '🎻👧🎼😒💅',
    story: "Your SESTRA (SIS) is in the orchESTRA, playing violin in a tiny straw hat, very seriously. SESTRA = sister. She's in the sestra-phonie. She doesn't think that's funny.",
  },
  v54: {
    bridge: "G'DAY → gde = where",
    scene: '🦘🌏❓🗺️😂',
    story: "An Australian in Russia keeps saying 'G'DAY mate!' and accidentally asking WHERE in Russian every time. He's bilingual by accident. GDE = WHERE. The accidental polyglot.",
  },
  v55: {
    bridge: 'SCHOOL + KO → skolko = how much',
    scene: '🏫💰❓📚😵',
    story: "'SKOLKO does school cost?' they ask. 'SKOLKO do you WANT to learn? SKOLKO knowledge??' It's a confusing institution. SKOLKO = how much / how many. Big questions.",
  },
  v56: {
    bridge: 'GHOST + INITIATE → gostinitsa = hotel',
    scene: '👻🏨🔑😱⭐',
    story: "You check in. The bellhop is transparent. A GHOST initiates you: 'Welcome to the GOSTINITSA!' Reviews on this hotel are... mixed. Three stars. Would not stay again.",
  },
  v57: {
    bridge: 'POW + MOGUL + IT → pomogite = HELP!',
    scene: '💥🏆😱🆘😂',
    story: "A business MOGUL falls off his throne with a POW and screams 'POMOGITE!! HELP ME!!' Assistants scramble. The mighty mogul needs help-IT. POMOGITE! Always dramatic.",
  },
  v58: {
    bridge: 'YA + ZAP + BLOOD + DEAL + SYA → zabludilsya = I\'m lost',
    scene: '🗺️😱🚶💀❓',
    story: "YA is wandering in circles, got ZAPPED, made a blood deal somehow, and is now completely LOST. 'Ya zabludilsya!' He should've gotten GPS instead of that blood deal.",
  },
  v59: {
    bridge: 'REACH for the VRACH → vrach = doctor',
    scene: '🏥📞🤒👨‍⚕️🙌',
    story: "You're sick. REACH for your phone. Call the VRACH. The VRACH will REACH back. It's mutual reaching. The VRACH is REACHABLE. Very wholesome healthcare system.",
  },
  v60: {
    bridge: 'ME + PLONK + OH → mne plokho = I feel bad/sick',
    scene: '🍷🤢😵🛁😂',
    story: "You drank too much PLONK (cheap wine) and now feel PLOKHO = BAD. 'MNEEE PLOKHO!' MNE PLOKHO = I feel bad. Plonk will do that. Plonk is plokho. Lesson learned maybe.",
  },
  v61: {
    bridge: 'BOWL of PAIN → bol = pain',
    scene: '🥣😣💀😂🌶️',
    story: "Someone hands you a BOWL labeled 'PAIN.' 'What's in here?' 'Bol.' 'In English?' 'Pain.' 'So this is literally a bowl of pain?' 'BOL'!' They shout. You eat it. It hurts.",
  },
  v63: {
    bridge: 'YA + DOOM + A + YOU → ya dumayu = I think',
    scene: '🤔💭⚡😤🧠',
    story: "YA = I. I DOOM you with my THINKING. YA DUMAYU = I think. I think therefore I DOOM. Descartes but Russian and darker. Russian philosophers were built different.",
  },
  v64: {
    bridge: 'YA + KA-CHOO → ya khochu = I want',
    scene: '🤧⛵✨😮💫',
    story: "You SNEEZE (KA-CHOO!) and accidentally summon a luxury yacht. 'YA KHOCHU that yacht!' you declare. You sneezed your desires into reality. YA KHOCHU = I want. Bless you.",
  },
  v65: {
    bridge: 'MO + JET + BITE → mozhet byt = maybe',
    scene: '✈️😬❓🎲💭',
    story: "MAYBE the JET will BITE the runway gently today. MOZHET BYT'. The uncertainty of jet-runway interaction IS the meaning of MOZHET BYT'. Maybe. Perhaps. Who knows.",
  },
  v66: {
    bridge: 'KO + NECK + NO → konechno = of course',
    scene: '🦒😤🔥🫡✅',
    story: "Your giraffe friend has a very long NECK. 'Of COURSE he does. KONECHNO! Why would he NOT have a NECK?! Necks are STANDARD!' The giraffe is unbothered. KO-NECH-NO.",
  },
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

// Mnemonic hook card — the funny visual block
function HookCard({ hook, compact = false }) {
  if (!hook) return null;
  return (
    <Glass style={{
      padding: compact ? '12px 14px' : '18px 18px',
      borderColor: `${C.gold}44`,
      background: 'rgba(255,215,0,0.04)',
    }}>
      {/* Scene emojis — the visual image */}
      <div style={{
        fontSize: compact ? 26 : 34, letterSpacing: 6, textAlign: 'center',
        marginBottom: compact ? 8 : 12, lineHeight: 1,
      }}>
        {hook.scene}
      </div>

      {/* Bridge text — the sound→meaning link */}
      <div style={{
        background: `${C.gold}18`, borderRadius: 8,
        padding: '6px 12px', marginBottom: compact ? 8 : 10,
        fontFamily: "'Space Mono',monospace",
        fontSize: compact ? 11 : 12,
        color: C.gold, fontWeight: 700, textAlign: 'center',
        border: `1px solid ${C.gold}33`,
        letterSpacing: 0.5,
      }}>
        🔗 {hook.bridge}
      </div>

      {/* The funny story */}
      <div style={{
        fontSize: compact ? 12 : 14,
        color: C.silver, lineHeight: 1.65,
        fontFamily: "'Outfit',sans-serif",
      }}>
        {hook.story}
      </div>
    </Glass>
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

  useEffect(() => {
    const withHooks = VOCAB.filter(v => HOOKS[v.id]);
    const rest = VOCAB.filter(v => !HOOKS[v.id]);
    setPool([...withHooks, ...rest]);
  }, []);

  const startBlitz = () => {
    const shuffled = [...VOCAB].sort(() => Math.random() - 0.5).slice(0, 50);
    setBlitzPool(shuffled);
    setBlitzIdx(0);
    setBlitzTimer(6);
    setBlitzDone(false);
    setMode('blitz');
  };

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

  useEffect(() => {
    if (mode !== 'explore' || !pool[idx]) return;
    setFlipped(false);
    setTimeout(() => { if (speak) speak(pool[idx].ru, null); }, 200);
  }, [idx, mode]); // eslint-disable-line

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
            : <div style={{ color: C.dim, fontSize: 12 }}>{targetWords - committedCount} words to burn in today's goal</div>
          }
        </Glass>

        <Glass style={{ padding: 16, marginBottom: 16, borderColor: `${C.violet}33` }}>
          <div style={{ color: C.violet, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🧠 The Neomonix Method</div>
          <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.7 }}>
            Each word gets a <span style={{ color: C.gold }}>hilarious, ridiculous story</span> that ties the Russian sound to the English meaning. Your brain laughs — your brain <span style={{ color: C.cyan }}>remembers.</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            {[
              ['🎯', 'Hear the sound'],
              ['😂', 'Laugh at the story'],
              ['🔗', 'Lock the bridge'],
              ['🔥', '50 words/day'],
            ].map(([e, l]) => (
              <div key={l} style={{ background: `${C.ultra}11`, borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{e}</span>
                <span style={{ color: C.silver, fontSize: 12 }}>{l}</span>
              </div>
            ))}
          </div>
        </Glass>

        {/* Sample hook preview */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: C.dim, fontSize: 11, letterSpacing: 2, fontFamily: "'Space Mono',monospace", marginBottom: 8, paddingLeft: 4 }}>EXAMPLE HOOK</div>
          <HookCard hook={HOOKS['v7']} />
        </div>

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

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, overflowY: 'auto', paddingBottom: 8 }}>
          {/* Word card */}
          <Glass onClick={() => { setFlipped(f => !f); if (!flipped && speak) speak(card.ru, card.ex_ru); }}
            style={{ padding: '24px 20px', textAlign: 'center', cursor: 'pointer', borderColor: `${C.gold}55`, position: 'relative' }}>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, fontFamily: "'Space Mono',monospace", marginBottom: 8 }}>{card.cat}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: card.ru.length > 20 ? 28 : card.ru.length > 12 ? 38 : 50, color: C.gold, letterSpacing: 2, lineHeight: 1.1, marginBottom: 4, textShadow: `0 0 30px ${C.gold}66` }}>
              {card.ru}
            </div>
            <div style={{ color: '#6a6890', fontSize: 14, fontStyle: 'italic', fontFamily: "'Space Mono',monospace", marginBottom: flipped ? 10 : 4 }}>{card.pr}</div>
            {!flipped && (
              <div style={{ fontSize: 11, color: `${C.dim}88`, marginTop: 4 }}>tap to reveal English</div>
            )}
            {flipped && (
              <>
                <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0 10px' }} />
                <div style={{ fontSize: card.en.length > 25 ? 18 : 24, fontWeight: 800, color: C.violet, lineHeight: 1.2, textShadow: `0 0 20px ${C.violet}66` }}>
                  {card.en}
                </div>
                {card.ex_ru && (
                  <div style={{ marginTop: 10, background: `${C.ultra}11`, borderRadius: 10, padding: '8px 12px', textAlign: 'left' }}>
                    <div style={{ fontSize: 13, color: C.silver, marginBottom: 3 }}>{card.ex_ru}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{card.ex_en}</div>
                  </div>
                )}
                {isCommitted && <div style={{ marginTop: 8, color: C.bio, fontSize: 12, fontWeight: 700 }}>✓ Burned in!</div>}
              </>
            )}
          </Glass>

          {/* Mnemonic hook */}
          {hook
            ? <HookCard hook={hook} />
            : (
              <Glass style={{ padding: '14px 18px', borderColor: `${C.dim}33` }}>
                <div style={{ fontSize: 11, color: C.dim, textAlign: 'center', lineHeight: 1.6 }}>
                  No hook yet — create your own!<br />
                  <span style={{ color: C.violet, fontSize: 12 }}>Tip: connect "{card.pr}" sound to "{card.en}"</span>
                </div>
              </Glass>
            )
          }
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '12px 0 32px' }}>
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} style={{
            background: C.glass, border: `1px solid ${C.dim}44`, borderRadius: 12,
            color: idx === 0 ? `${C.dim}55` : '#fff', cursor: idx === 0 ? 'default' : 'pointer',
            padding: '12px 18px', fontSize: 14, fontFamily: "'Outfit',sans-serif",
          }}>← Back</button>

          <button onClick={() => { commit(card.id); setTimeout(() => setIdx(i => i + 1), 400); }}
            disabled={isCommitted}
            style={{
              flex: 1, background: isCommitted ? `${C.bio}22` : `linear-gradient(135deg,${C.gold}33,${C.amber}22)`,
              border: `1.5px solid ${isCommitted ? C.bio : C.gold}88`, borderRadius: 12,
              color: isCommitted ? C.bio : C.gold, cursor: isCommitted ? 'default' : 'pointer',
              padding: '12px 0', fontSize: 14, fontWeight: 700, fontFamily: "'Outfit',sans-serif",
            }}>
            {isCommitted ? '✓ Burned in!' : '🧠 Burn It In'}
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
          <div style={{ color: C.silver, fontSize: 20, fontWeight: 700 }}>{blitzCommitted} / 50 burned in</div>
          <div style={{ color: C.dim, fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
            Total today: <span style={{ color: C.gold, fontWeight: 700 }}>{committedCount}</span> / {targetWords} words
          </div>
          <Glass style={{ padding: '14px 24px', borderColor: `${C.bio}44`, textAlign: 'center' }}>
            <div style={{ color: C.bio, fontWeight: 700, marginBottom: 4 }}>🧠 Neomonix Science</div>
            <div style={{ color: C.dim, fontSize: 12, lineHeight: 1.6 }}>Your brain formed <span style={{ color: C.cyan }}>{blitzCommitted} new neural pathways.</span> Review again in 15 minutes to seal them in.</div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, paddingBottom: 8 }}>
          <button onClick={() => setMode('menu')} style={{ background: 'none', border: 'none', color: C.dim, fontSize: 20, cursor: 'pointer' }}>✕</button>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: C.gold, letterSpacing: 2 }}>50-WORD BLITZ</div>
          <div style={{ marginLeft: 'auto', color: C.amber, fontSize: 14, fontWeight: 700, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>
            {blitzIdx + 1} / {blitzPool.length}
          </div>
        </div>

        <div style={{ height: 4, background: C.ghost, borderRadius: 2, overflow: 'hidden', marginBottom: 3 }}>
          <div style={{ height: '100%', width: `${blitzPct}%`, background: `linear-gradient(90deg,${C.gold},${C.amber})`, transition: 'width .4s ease' }} />
        </div>
        <div style={{ height: 3, background: C.ghost, borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ height: '100%', width: `${timerPct}%`, background: blitzTimer <= 2 ? C.red : C.cyan, transition: 'width .9s linear', borderRadius: 2 }} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, overflowY: 'auto' }}>
          <Glass style={{ padding: '22px 20px', textAlign: 'center', borderColor: `${C.gold}55` }}>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, fontFamily: "'Space Mono',monospace", marginBottom: 6 }}>{blitzCard.cat}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: blitzCard.ru.length > 20 ? 28 : blitzCard.ru.length > 12 ? 40 : 54, color: C.gold, letterSpacing: 2, lineHeight: 1.1, textShadow: `0 0 30px ${C.gold}55` }}>
              {blitzCard.ru}
            </div>
            <div style={{ color: '#6a6890', fontSize: 13, fontStyle: 'italic', fontFamily: "'Space Mono',monospace", margin: '5px 0' }}>{blitzCard.pr}</div>
            <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', margin: '7px 0' }} />
            <div style={{ fontSize: blitzCard.en.length > 25 ? 17 : 22, fontWeight: 800, color: C.violet, lineHeight: 1.2 }}>{blitzCard.en}</div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <div style={{ color: blitzTimer <= 2 ? C.red : C.cyan, fontSize: 26, fontWeight: 700, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>{blitzTimer}</div>
              <div style={{ color: C.dim, fontSize: 11 }}>sec</div>
            </div>
          </Glass>

          {blitzHook && <HookCard hook={blitzHook} compact />}
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '10px 0 32px' }}>
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
            {daily.committed.includes(blitzCard.id) ? '✓ Burned in!' : '🔥 BURNED IN → Next'}
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
