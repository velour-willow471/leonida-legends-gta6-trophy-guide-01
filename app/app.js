// Leonida Legends — offline trophy tracker.
// State lives in localStorage; URL params seed the first view so screenshots
// and shared links are reproducible: ?view=roadmap, ?spoilers=1, ?q=term,
// ?earned=n (pre-tick the first n trophies for display only until changed).
const KEY = 'leonida-legends-progress-v1';
const listEl = document.getElementById('list');
const qEl = document.getElementById('q');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const statusEl = document.getElementById('status');
const spoilerEl = document.getElementById('spoilers');
const params = new URLSearchParams(location.search);

let earned = new Set();
try { earned = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { earned = new Set(); }
const revealed = new Set();
let doc = null;

function save() { localStorage.setItem(KEY, JSON.stringify([...earned])); }

async function load() {
  const res = await fetch('data/trophies.json');
  doc = await res.json();
  // URL params
  if (params.get('q')) qEl.value = params.get('q');
  if (params.get('spoilers') === '1' || params.get('spoilers') === 'true') spoilerEl.checked = true;
  const n = parseInt(params.get('earned') || '', 10);
  if (Number.isFinite(n) && n > 0) {
    earned = new Set(doc.trophies.slice(0, Math.min(n, doc.trophies.length)).map(t => t.id));
  }
  render();
  if (params.get('view') === 'roadmap') {
    // Roadmap view: bring the roadmap to the front so it fills the screen.
    listEl.style.display = 'none';
    document.getElementById('showing').style.display = 'none';
    document.getElementById('roadmap').scrollIntoView();
    window.scrollTo(0, document.getElementById('roadmap').offsetTop - 70);
  }
}

function matches(t) {
  const q = qEl.value.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind).toLowerCase().includes(q)) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  if (statusEl.value === 'earned' && !earned.has(t.id)) return false;
  if (statusEl.value === 'unearned' && earned.has(t.id)) return false;
  return true;
}

function render() {
  if (!doc) return;
  listEl.replaceChildren();
  let shown = 0;
  for (const t of doc.trophies) {
    if (!matches(t)) continue;
    shown++;
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.id) ? ' done' : '');
    const hidden = spoilerEl.checked && t.kind === 'story' && !earned.has(t.id) && !revealed.has(t.id);
    if (hidden) {
      card.classList.add('spoiler');
      const p = document.createElement('p');
      p.className = 'spoiler-note';
      p.textContent = '🔒 Story trophy hidden by spoiler protection.';
      const btn = document.createElement('button');
      btn.type = 'button'; btn.textContent = 'Reveal trophy';
      btn.addEventListener('click', () => { revealed.add(t.id); render(); });
      card.append(p, btn);
      listEl.append(card);
      continue;
    }
    const head = document.createElement('div'); head.className = 'card-head';
    const box = document.createElement('input');
    box.type = 'checkbox'; box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('change', () => { if (box.checked) earned.add(t.id); else earned.delete(t.id); save(); render(); });
    const title = document.createElement('h3'); title.textContent = t.name;
    const badge = document.createElement('span'); badge.className = 'badge grade-' + t.grade; badge.textContent = t.grade;
    const kind = document.createElement('span'); kind.className = 'badge kind'; kind.textContent = t.kind;
    head.append(box, title, badge, kind);
    if (t.missable) { const m = document.createElement('span'); m.className = 'badge missable'; m.textContent = '⚠ missable — plan ahead'; head.append(m); }
    const desc = document.createElement('p'); desc.className = 'desc'; desc.textContent = t.description;
    const guide = document.createElement('p'); guide.className = 'guide'; guide.textContent = t.guide;
    const src = document.createElement('p'); src.className = 'sources'; src.textContent = 'Sources: ' + (t.sources || '');
    card.append(head, desc, guide, src);
    listEl.append(card);
  }
  document.getElementById('showing').textContent = 'Showing ' + shown + ' of ' + doc.trophies.length + ' trophies';
  document.getElementById('progress').textContent = earned.size + ' of ' + doc.trophies.length + ' earned';
  const pct = Math.round((earned.size / doc.trophies.length) * 100);
  document.getElementById('percent').textContent = pct + '%';
  document.getElementById('barfill').style.width = pct + '%';
}

[qEl, gradeEl, kindEl, statusEl, spoilerEl].forEach(el => {
  el.addEventListener('input', render); el.addEventListener('change', render);
});
document.getElementById('reset').addEventListener('click', () => {
  qEl.value = ''; gradeEl.value = 'all'; kindEl.value = 'all'; statusEl.value = 'all'; spoilerEl.checked = false; render();
});
document.getElementById('export').addEventListener('click', () => {
  const payload = JSON.stringify({ app: 'leonida-legends', earnedIds: [...earned] }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  a.download = 'leonida-legends-progress.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : (data.earnedIds || data.earned || []);
    earned = new Set(ids.map(x => typeof x === 'number' ? x : x));
    // Accept name-based exports too
    if (doc && ids.length && typeof ids[0] === 'string') {
      earned = new Set(doc.trophies.filter(t => ids.includes(t.name) || ids.includes(t.id)).map(t => t.id));
    }
    save(); render();
  } catch { alert('That file could not be read as progress JSON.'); }
});
load();
