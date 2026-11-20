// Leonida Legends — an offline GTA VI trophy tracker. Progress and the spoiler
// setting live only in this browser (localStorage); nothing is sent anywhere.
const EARNED_KEY = 'leonida-legends-earned';
const SPOILER_KEY = 'leonida-legends-spoilers';

const cardsEl = document.getElementById('cards');
const countEl = document.getElementById('count');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const statusEl = document.getElementById('status');
const spoilersEl = document.getElementById('spoilers');

let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
let revealed = new Set(); // story trophies the reader chose to uncover this visit
let spoilersOn = localStorage.getItem(SPOILER_KEY) !== 'false';
spoilersEl.checked = spoilersOn;

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const KIND_LABEL = { story: 'Story', activity: 'Activity', collectible: 'Collectible', robbery: 'Robbery', misc: 'Miscellaneous' };

function save() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  localStorage.setItem(SPOILER_KEY, String(spoilersOn));
}

function isHidden(t) {
  return spoilersOn && t.kind === 'story' && !earned.has(t.id) && !revealed.has(t.id);
}

function matches(t) {
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  if (statusEl.value === 'earned' && !earned.has(t.id)) return false;
  if (statusEl.value === 'unearned' && earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
  return true;
}

function gradeBadge(t) {
  const b = document.createElement('span');
  b.className = 'badge ' + t.grade;
  b.textContent = t.grade;
  return b;
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  document.getElementById('progress-text').textContent = `${n} of ${total} earned`;
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${g} ${have}/${all}`;
  }).join(' · ');
  document.getElementById('progress-grades').textContent = byGrade;
  document.getElementById('progress-fill').style.width = `${(100 * n) / total}%`;
}

function render() {
  renderProgress();
  cardsEl.replaceChildren();
  const shown = trophies.filter(matches);
  countEl.textContent = shown.length === trophies.length
    ? `Showing all ${trophies.length} trophies.`
    : `Showing ${shown.length} of ${trophies.length} trophies.`;
  for (const t of shown) {
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.id) ? ' earned' : '');
    const head = document.createElement('div');
    head.className = 'card-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      render();
    });
    const title = document.createElement('div');
    title.className = 'card-title';
    const h = document.createElement('h3');
    const kind = document.createElement('span');
    kind.className = 'kind';
    kind.textContent = KIND_LABEL[t.kind] ?? t.kind;
    head.append(box, title, gradeBadge(t));
    if (isHidden(t)) {
      h.textContent = 'Hidden story trophy';
      title.append(h);
      const p = document.createElement('p');
      p.className = 'guide hidden-card';
      p.textContent = 'This trophy names a story moment. Earn it, turn the spoiler setting off, or reveal it here.';
      const reveal = document.createElement('button');
      reveal.type = 'button';
      reveal.className = 'reveal';
      reveal.textContent = 'Reveal this trophy';
      reveal.addEventListener('click', () => {
        revealed.add(t.id);
        render();
      });
      const wrap = document.createElement('div');
      wrap.className = 'hidden-card';
      wrap.append(reveal);
      card.append(head, p, wrap);
    } else {
      h.textContent = t.name;
      const desc = document.createElement('p');
      desc.className = 'desc';
      desc.textContent = t.description;
      title.append(h, desc);
      const guide = document.createElement('p');
      guide.className = 'guide';
      if (t.missable) {
        const flag = document.createElement('span');
        flag.className = 'missable-flag';
        flag.textContent = 'Potentially missable';
        guide.append(flag);
      }
      guide.append(document.createTextNode(t.guide));
      const src = document.createElement('p');
      src.className = 'sources';
      src.textContent = 'Sources: ' + t.sources;
      card.append(head, kind, guide, src);
    }
    cardsEl.append(card);
  }
}

function showView(name) {
  for (const v of ['tracker', 'roadmap', 'sources']) {
    document.getElementById('view-' + v).hidden = v !== name;
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === name);
  }
  if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
}

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}
const startView = ['tracker', 'roadmap', 'sources'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'tracker';
showView(startView);

for (const el of [searchEl, gradeEl, kindEl, statusEl]) el.addEventListener('input', render);
spoilersEl.addEventListener('change', () => {
  spoilersOn = spoilersEl.checked;
  save();
  render();
});

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned].sort((a, b) => a - b))], { type: 'application/json' }));
  a.download = 'leonida-legends-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const ids = JSON.parse(await file.text());
    earned = new Set(ids.filter((id) => trophies.some((t) => t.id === id)));
    save();
    render();
  } catch {
    countEl.textContent = 'That file could not be read as progress — no changes made.';
  }
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  revealed = new Set();
  save();
  render();
});

render();
