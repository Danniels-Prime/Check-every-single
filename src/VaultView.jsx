// VAULT — Save everything: YouTube, Discord servers, images, links, notes
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

const C = {
  void:'#03010a', card:'#0e0c1a', glass:'#14102a',
  violet:'#c77dff', ultra:'#9b30ff', cyan:'#00e5ff', bio:'#00ff88',
  acid:'#aaff00', gold:'#FFD700', rose:'#ff006b', silver:'#d0d0e8',
  dim:'#44406a', ghost:'#140f20', red:'#ff0044', amber:'#ffaa00', teal:'#00ccaa',
  discord:'#5865F2',
};

const VAULT_KEY = 'aethermind_vault_v3';
const TODAY_KEY = 'vault_done_v3';

function loadVault() {
  try { return JSON.parse(localStorage.getItem(VAULT_KEY) || '[]'); } catch { return []; }
}
function saveVault(v) {
  try { localStorage.setItem(VAULT_KEY, JSON.stringify(v)); }
  catch { alert('Storage full — try removing some images.'); }
}
function loadToday() {
  try {
    const d = JSON.parse(localStorage.getItem(TODAY_KEY) || '{}');
    return d.date === new Date().toDateString() ? (d.ids || []) : [];
  } catch { return []; }
}
function saveToday(ids) {
  localStorage.setItem(TODAY_KEY, JSON.stringify({ date: new Date().toDateString(), ids }));
}

function getYTId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function detectType(url) {
  if (!url.trim()) return 'note';
  if (getYTId(url)) return 'youtube';
  if (/discord\.(gg|com)/i.test(url)) return 'discord';
  return 'link';
}

async function compressImg(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const maxW = 600;
        const scale = Math.min(1, maxW / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.68));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const TYPE_META = {
  youtube: { label: '📹 YouTube',   color: '#ff2a2a', bg: '#ff2a2a' },
  discord: { label: '🎮 Discord',   color: C.discord, bg: C.discord },
  image:   { label: '🖼️ Image',     color: C.bio,     bg: C.bio },
  link:    { label: '🔗 Link',      color: C.cyan,    bg: C.cyan },
  note:    { label: '📝 Note',      color: C.gold,    bg: C.gold },
};

const PRESET_TAGS = ['🔥 Must-do','⭐ Fav','🧠 Mindset','📖 Grammar','🎧 Listening','💬 Phrases','🌍 Culture','🤖 AI','🎵 Music'];

function Glass({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'rgba(14,12,26,0.82)', backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(199,125,255,0.15)',
      borderRadius: 16, ...style,
    }}>{children}</div>
  );
}
function Btn({ children, onClick, color = C.violet, style = {}, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: `${color}22`, border: `1.5px solid ${color}55`,
      borderRadius: 12, padding: '11px 18px', color,
      fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1,
      transition: 'all .2s', ...style,
    }}>{children}</button>
  );
}

// ── ADD FORM MODAL ────────────────────────────────────────────────────────────
function AddForm({ onSave, onCancel }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [tag, setTag] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [imgData, setImgData] = useState(null);
  const [imgName, setImgName] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const detectedType = url.trim() ? detectType(url) : (imgData ? 'image' : 'note');
  const meta = TYPE_META[detectedType] || TYPE_META.link;
  const ytId = getYTId(url);

  const pickImg = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const compressed = await compressImg(file);
    setImgData(compressed);
    setImgName(file.name.replace(/\.[^.]+$/, ''));
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
    setSaving(false);
  };

  const finalTag = customTag.trim() || tag;

  const save = async () => {
    if (!url.trim() && !imgData && !title.trim()) return;
    setSaving(true);
    const item = {
      id: `vi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: detectedType,
      url: url.trim(),
      title: title.trim() || (ytId ? 'YouTube Video' : url.trim() || 'Untitled'),
      note: note.trim(),
      tag: finalTag,
      pinned: false,
      addedAt: Date.now(),
      imgData: detectedType === 'image' ? imgData : null,
    };
    onSave(item);
    setSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(3,1,10,0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 500,
        background: '#0e0c1a', borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(199,125,255,0.2)', borderBottom: 'none',
        padding: '20px 18px 40px', animation: 'slideUp .3s ease',
      }}>
        {/* Type badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{
            background: `${meta.color}22`, border: `1px solid ${meta.color}55`,
            borderRadius: 20, padding: '4px 12px', fontSize: 11, color: meta.color, fontWeight: 700,
          }}>{meta.label}</div>
          <div style={{ color: C.dim, fontSize: 11 }}>auto-detected</div>
        </div>

        {/* URL field */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: C.dim, letterSpacing: 2, display: 'block', marginBottom: 5 }}>
            URL / LINK (YouTube, Discord, any site)
          </label>
          <input value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or discord.gg/..."
            style={{
              width: '100%', background: C.glass, border: `1px solid ${C.dim}44`,
              borderRadius: 10, padding: '10px 12px', color: C.silver, fontSize: 13,
              outline: 'none', fontFamily: "'Outfit',sans-serif", boxSizing: 'border-box',
            }} />
        </div>

        {/* YouTube preview */}
        {ytId && (
          <div style={{ marginBottom: 10, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
            <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt=""
              style={{ width: '100%', display: 'block', borderRadius: 10 }} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.25)',
            }}>
              <div style={{
                width: 52, height: 38, background: '#ff0000ee', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 20 }}>▶</span>
              </div>
            </div>
          </div>
        )}

        {/* Image upload */}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickImg} />
        {!url.trim() && !imgData && (
          <button onClick={() => fileRef.current?.click()} style={{
            width: '100%', padding: '12px 0', marginBottom: 10, borderRadius: 10,
            background: `${C.bio}11`, border: `1.5px dashed ${C.bio}55`,
            color: C.bio, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Outfit',sans-serif",
          }}>🖼️ Upload Image (jpg/png/gif)</button>
        )}
        {imgData && (
          <div style={{ marginBottom: 10, position: 'relative' }}>
            <img src={imgData} alt="" style={{ width: '100%', borderRadius: 10, display: 'block', maxHeight: 200, objectFit: 'cover' }} />
            <button onClick={() => { setImgData(null); setImgName(''); }} style={{
              position: 'absolute', top: 8, right: 8, background: `${C.red}cc`,
              border: 'none', borderRadius: '50%', width: 28, height: 28,
              color: '#fff', cursor: 'pointer', fontSize: 14,
            }}>✕</button>
          </div>
        )}

        {/* Discord badge */}
        {detectedType === 'discord' && (
          <div style={{
            background: `${C.discord}22`, border: `1px solid ${C.discord}55`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>🎮</span>
            <div>
              <div style={{ color: C.discord, fontWeight: 700, fontSize: 13 }}>Discord Server</div>
              <div style={{ color: C.dim, fontSize: 11 }}>Saved as Discord invite link</div>
            </div>
          </div>
        )}

        {/* Title */}
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Title / description (optional)"
          style={{
            width: '100%', background: C.glass, border: `1px solid ${C.dim}44`,
            borderRadius: 10, padding: '10px 12px', color: C.silver, fontSize: 14,
            outline: 'none', fontFamily: "'Outfit',sans-serif", boxSizing: 'border-box', marginBottom: 10,
          }} />

        {/* Note */}
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Notes (what to do with this, why you saved it...)"
          rows={2}
          style={{
            width: '100%', background: C.glass, border: `1px solid ${C.dim}44`,
            borderRadius: 10, padding: '10px 12px', color: C.silver, fontSize: 13,
            outline: 'none', resize: 'none', fontFamily: "'Outfit',sans-serif",
            boxSizing: 'border-box', marginBottom: 10,
          }} />

        {/* Tags */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: C.dim, letterSpacing: 2, display: 'block', marginBottom: 6 }}>TAG</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {PRESET_TAGS.map(t => (
              <button key={t} onClick={() => { setTag(t === tag ? '' : t); setCustomTag(''); }} style={{
                background: tag === t ? `${C.violet}33` : C.glass,
                border: `1px solid ${tag === t ? C.violet : C.dim}44`,
                borderRadius: 20, padding: '4px 10px', fontSize: 11,
                color: tag === t ? C.violet : C.dim, cursor: 'pointer',
                fontFamily: "'Outfit',sans-serif",
              }}>{t}</button>
            ))}
          </div>
          <input value={customTag} onChange={e => { setCustomTag(e.target.value); setTag(''); }}
            placeholder="or type a custom tag..."
            style={{
              width: '100%', background: C.glass, border: `1px solid ${C.dim}33`,
              borderRadius: 8, padding: '7px 10px', color: C.silver, fontSize: 12,
              outline: 'none', fontFamily: "'Outfit',sans-serif", boxSizing: 'border-box',
            }} />
        </div>

        {/* Save / Cancel */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '13px 0', borderRadius: 12, border: `1px solid ${C.dim}44`,
            background: 'none', color: C.dim, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: 14,
          }}>Cancel</button>
          <button onClick={save} disabled={saving || (!url.trim() && !imgData && !title.trim())} style={{
            flex: 2, padding: '13px 0', borderRadius: 12,
            background: `linear-gradient(135deg,${C.violet}44,${C.ultra}22)`,
            border: `1.5px solid ${C.violet}77`,
            color: C.violet, cursor: 'pointer', fontWeight: 800,
            fontFamily: "'Outfit',sans-serif", fontSize: 15,
            opacity: saving ? 0.6 : 1,
          }}>{saving ? '⏳ Saving…' : '+ Save to Vault'}</button>
        </div>
      </div>
    </div>
  );
}

// ── ITEM CARD ─────────────────────────────────────────────────────────────────
function VaultItem({ item, onDelete, onPin, onToggleDone, done, onOpen }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[item.type] || TYPE_META.link;
  const ytId = item.type === 'youtube' ? getYTId(item.url) : null;

  return (
    <Glass style={{
      marginBottom: 10, overflow: 'hidden',
      borderColor: item.pinned ? `${meta.color}77` : done ? `${C.bio}44` : `${meta.color}22`,
      transition: 'border-color .2s',
    }}>
      {/* YouTube thumbnail */}
      {ytId && (
        <div onClick={onOpen} style={{ position: 'relative', cursor: 'pointer' }}>
          <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt=""
            style={{ width: '100%', display: 'block', maxHeight: 170, objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(transparent 50%,rgba(0,0,0,0.6))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 52, height: 38, background: '#ff0000ee', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 20 }}>▶</span>
            </div>
          </div>
        </div>
      )}

      {/* Image */}
      {item.type === 'image' && item.imgData && (
        <div onClick={onOpen} style={{ cursor: 'pointer' }}>
          <img src={item.imgData} alt={item.title}
            style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }} />
        </div>
      )}

      {/* Discord banner */}
      {item.type === 'discord' && (
        <div style={{ background: `${C.discord}22`, padding: '12px 16px', borderBottom: `1px solid ${C.discord}33` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎮</span>
            <div style={{ color: C.discord, fontWeight: 700, fontSize: 13 }}>Discord Server</div>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }} onClick={() => setExpanded(e => !e)}>
            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <div style={{
                background: `${meta.color}22`, border: `1px solid ${meta.color}44`,
                borderRadius: 20, padding: '2px 8px', fontSize: 10, color: meta.color,
              }}>{meta.label}</div>
              {item.tag && (
                <div style={{
                  background: `${C.violet}18`, border: `1px solid ${C.violet}33`,
                  borderRadius: 20, padding: '2px 8px', fontSize: 10, color: C.violet,
                }}>{item.tag}</div>
              )}
              {item.pinned && <span style={{ fontSize: 12 }}>📌</span>}
              {done && <span style={{ fontSize: 10, color: C.bio, fontWeight: 700 }}>✓ done today</span>}
            </div>

            {/* Title */}
            <div style={{
              color: done ? `${C.silver}88` : C.silver,
              fontSize: 14, fontWeight: 600, lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: expanded ? 'normal' : 'nowrap',
            }}>{item.title}</div>

            {/* Expanded: note + link */}
            {expanded && (
              <div style={{ marginTop: 8, animation: 'fadeIn .2s' }}>
                {item.note && (
                  <div style={{
                    color: C.dim, fontSize: 12, lineHeight: 1.7, marginBottom: 8,
                    background: `${C.ultra}0a`, borderRadius: 8, padding: '8px 10px',
                  }}>{item.note}</div>
                )}
                {item.url && item.type !== 'image' && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
                    color: meta.color, fontSize: 12, display: 'block',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>→ {item.url}</a>
                )}
              </div>
            )}

            <div style={{ color: `${C.dim}66`, fontSize: 10, marginTop: 5, fontFamily: "'Space Mono',monospace" }}>
              {new Date(item.addedAt).toLocaleDateString()}
              {(item.note || item.url) && <span style={{ marginLeft: 6 }}>{expanded ? '▲ less' : '▼ more'}</span>}
            </div>
          </div>

          {/* Actions column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
            <button onClick={onPin} title="Pin" style={{
              background: item.pinned ? `${C.gold}22` : 'none',
              border: `1px solid ${item.pinned ? C.gold : C.dim}44`,
              borderRadius: 7, padding: '5px 7px', color: item.pinned ? C.gold : `${C.dim}88`,
              cursor: 'pointer', fontSize: 13,
            }}>📌</button>
            <button onClick={onToggleDone} title="Mark done today" style={{
              background: done ? `${C.bio}22` : 'none',
              border: `1px solid ${done ? C.bio : C.dim}44`,
              borderRadius: 7, padding: '5px 7px', color: done ? C.bio : `${C.dim}88`,
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
            }}>{done ? '✓' : '○'}</button>
            {item.url && item.type !== 'image' && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
                background: `${meta.color}18`, border: `1px solid ${meta.color}44`,
                borderRadius: 7, padding: '5px 7px', color: meta.color,
                fontSize: 11, cursor: 'pointer', textDecoration: 'none', textAlign: 'center',
              }}>↗</a>
            )}
            <button onClick={onDelete} title="Delete" style={{
              background: 'none', border: `1px solid ${C.red}22`,
              borderRadius: 7, padding: '5px 7px', color: `${C.red}66`,
              cursor: 'pointer', fontSize: 12,
            }}>🗑</button>
          </div>
        </div>
      </div>
    </Glass>
  );
}

// ── VAULT MAIN ────────────────────────────────────────────────────────────────
export default function VaultView({ nav }) {
  const [items, setItemsRaw] = useState(loadVault);
  const [todayDone, setTodayDoneRaw] = useState(loadToday);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');
  const [lightbox, setLightbox] = useState(null); // image URL for fullscreen

  const setItems = (v) => { setItemsRaw(v); saveVault(v); };
  const setTodayDone = (ids) => { setTodayDoneRaw(ids); saveToday(ids); };

  const saveItem = (item) => {
    setItems([item, ...items]);
    setAdding(false);
  };
  const deleteItem = (id) => {
    setItems(items.filter(i => i.id !== id));
    setTodayDone(todayDone.filter(x => x !== id));
  };
  const togglePin = (id) => setItems(items.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i));
  const toggleDone = (id) => {
    setTodayDone(todayDone.includes(id) ? todayDone.filter(x => x !== id) : [...todayDone, id]);
  };

  const allTags = useMemo(() => {
    const tags = new Set(items.filter(i => i.tag).map(i => i.tag));
    return ['ALL', ...tags];
  }, [items]);

  const displayed = useMemo(() => {
    let list = [...items];
    if (typeFilter !== 'ALL') list = list.filter(i => i.type === typeFilter);
    if (tagFilter !== 'ALL') list = list.filter(i => i.tag === tagFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(i =>
        (i.title || '').toLowerCase().includes(s) ||
        (i.note || '').toLowerCase().includes(s) ||
        (i.url || '').toLowerCase().includes(s) ||
        (i.tag || '').toLowerCase().includes(s)
      );
    }
    return [...list.filter(i => i.pinned), ...list.filter(i => !i.pinned)];
  }, [items, typeFilter, tagFilter, search]);

  const doneTodayCount = todayDone.filter(id => displayed.some(i => i.id === id)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 0', background: C.void, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => nav('cosmos')} style={{ background: 'none', border: 'none', color: C.dim, fontSize: 20, cursor: 'pointer' }}>←</button>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',display", fontSize: 30, color: C.gold, letterSpacing: 4, lineHeight: 1 }}>VAULT</div>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, fontFamily: "'Space Mono',monospace" }}>LINKS · VIDEOS · DISCORD · IMAGES · NOTES</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: C.dim, fontSize: 11, fontFamily: "'Space Mono',monospace" }}>{items.length} items</div>
          </div>
        </div>

        {/* Daily progress */}
        {displayed.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: C.dim }}>Today's routine</span>
              <span style={{ fontSize: 12, color: doneTodayCount === displayed.length && displayed.length > 0 ? C.bio : C.amber, fontWeight: 700 }}>
                {doneTodayCount} / {displayed.length}
              </span>
            </div>
            <div style={{ height: 3, background: C.ghost, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${displayed.length ? Math.round((doneTodayCount / displayed.length) * 100) : 0}%`,
                background: `linear-gradient(90deg,${C.bio},${C.cyan})`, borderRadius: 2, transition: 'width .4s',
              }} />
            </div>
          </div>
        )}

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search vault..."
          style={{
            width: '100%', background: C.glass, border: `1px solid ${C.dim}44`,
            borderRadius: 10, padding: '10px 14px', color: C.silver, fontSize: 14,
            marginBottom: 10, outline: 'none', fontFamily: "'Outfit',sans-serif",
            boxSizing: 'border-box',
          }} />

        {/* Type filter pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
          {['ALL', 'youtube', 'discord', 'image', 'link', 'note'].map(t => {
            const meta = t === 'ALL' ? { label: 'ALL', color: C.violet } : (TYPE_META[t] || {});
            return (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                flexShrink: 0, background: typeFilter === t ? `${meta.color}33` : C.glass,
                border: `1px solid ${typeFilter === t ? meta.color : C.dim}44`,
                borderRadius: 20, padding: '5px 12px', fontSize: 11,
                color: typeFilter === t ? meta.color : C.dim, cursor: 'pointer',
                fontFamily: "'Outfit',sans-serif", fontWeight: typeFilter === t ? 700 : 400,
              }}>{t === 'ALL' ? 'All' : (TYPE_META[t]?.label || t)}</button>
            );
          })}
        </div>

        {/* Tag filter (only show if there are tags) */}
        {allTags.length > 1 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
            {allTags.map(t => (
              <button key={t} onClick={() => setTagFilter(t)} style={{
                flexShrink: 0, background: tagFilter === t ? `${C.ultra}33` : 'none',
                border: `1px solid ${tagFilter === t ? C.ultra : C.dim}33`,
                borderRadius: 20, padding: '3px 10px', fontSize: 10,
                color: tagFilter === t ? C.violet : `${C.dim}aa`, cursor: 'pointer',
                fontFamily: "'Outfit',sans-serif",
              }}>{t}</button>
            ))}
          </div>
        )}
      </div>

      {/* Items list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 100px' }}>
        {/* Empty state */}
        {displayed.length === 0 && !search && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: C.dim }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🗄️</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: C.dim, letterSpacing: 2, marginBottom: 10 }}>VAULT EMPTY</div>
            <div style={{ fontSize: 13, lineHeight: 1.8, maxWidth: 280, margin: '0 auto' }}>
              Save <span style={{ color: C.gold }}>YouTube videos</span>, <span style={{ color: C.discord }}>Discord servers</span>, <span style={{ color: C.bio }}>images</span>, any links, or <span style={{ color: C.amber }}>notes</span> — all in one place for your daily learning routine.
            </div>
            <button onClick={() => setAdding(true)} style={{
              marginTop: 24, padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 700,
              background: `${C.gold}22`, border: `1.5px solid ${C.gold}66`,
              color: C.gold, cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
            }}>+ Add First Item</button>
          </div>
        )}

        {displayed.length === 0 && search && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: C.dim }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 13 }}>Nothing found for "{search}"</div>
          </div>
        )}

        {displayed.map(item => (
          <VaultItem
            key={item.id}
            item={item}
            done={todayDone.includes(item.id)}
            onDelete={() => deleteItem(item.id)}
            onPin={() => togglePin(item.id)}
            onToggleDone={() => toggleDone(item.id)}
            onOpen={() => {
              if (item.type === 'image' && item.imgData) setLightbox(item.imgData);
              else if (item.url) window.open(item.url, '_blank');
            }}
          />
        ))}
      </div>

      {/* FAB: Add button */}
      <button onClick={() => setAdding(true)} style={{
        position: 'fixed', bottom: 82, right: 18, zIndex: 50,
        width: 56, height: 56, borderRadius: '50%',
        background: `linear-gradient(135deg,${C.gold},${C.amber})`,
        border: 'none', color: C.void, fontSize: 24, fontWeight: 900,
        cursor: 'pointer', boxShadow: `0 4px 20px ${C.gold}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>+</button>

      {/* Add form modal */}
      {adding && <AddForm onSave={saveItem} onCancel={() => setAdding(false)} />}

      {/* Lightbox for images */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,0.92)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <img src={lightbox} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <button onClick={() => setLightbox(null)} style={{
            position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)',
            border: 'none', borderRadius: '50%', width: 40, height: 40,
            color: '#fff', fontSize: 20, cursor: 'pointer',
          }}>✕</button>
        </div>
      )}
    </div>
  );
}
