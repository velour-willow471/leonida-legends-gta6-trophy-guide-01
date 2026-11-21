// Leonida Legends tracker logic.
// Progress lives in localStorage as a list of earned trophy names.
// Guides are treated as spoilers by default: each card hides its guide
// behind a reveal button unless the spoiler toggle or URL says otherwise.
// Supported URL parameters on load:
//   ?view=roadmap  scrolls to the roadmap section
//   ?spoilers=1    turns the spoiler toggle on
//   ?q=<term>      pre-fills the search box
//   ?earned=<n>    if no saved progress exists, marks the first n trophies earned
const KEY = 'leonida-legends-progress-v1';
const cardsEl = document.getElementById('cards');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const statusEl = document.getElementById('status');
const spoilersEl = document.getElementById('spoilers');
const progressEl = document.getElementById('progress');
const percentEl = document.getElementById('percent');
const barFillEl = document.getElementById('bar-fill');
const showingEl = document.getElementById('showing');
const params = new URLSearchParams(window.location.search);
let earned = new Set();
try {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]');
  if (Array.isArray(saved)) earned = new Set(saved.filter((x) => typeof x === 'string'));
} catch {
  earned = new Set();
}
const revealed = new Set();
const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
if (params.has('earned') && localStorage.getItem(KEY) === null) {
  const n = Math.max(0, Math.min(trophies.length, Number(params.get('earned')) || 0));
  for (let i = 0; i < n; i += 1) earned.add(trophies[i].name);
  save();
}
if (params.get('spoilers') === '1') spoilersEl.checked = true;
if (params.get('q')) searchEl.value = params.get('q');
function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}
function badge(text, cls) {
  const span = document.createElement('span');
  span.className = 'badge ' + cls;
  span.textContent = text;
  return span;
}
function render() {
  const term = searchEl.value.trim().toLowerCase();
  cardsEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) continue;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) continue;
    const isEarned = earned.has(t.name);
    if (statusEl.value === 'earned' && !isEarned) continue;
    if (statusEl.value === 'unearned' && isEarned) continue;
    if (term) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind).toLowerCase();
      if (!hay.includes(term)) continue;
    }
    shown += 1;
    const card = document.createElement('article');
    card.className = isEarned ? 'card earned-card' : 'card';
    const top = document.createElement('div');
    top.className = 'card-top';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned;
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      save();
      render();
    });
    const title = document.createElement('h3');
    title.textContent = t.name;
    top.append(box, title);
    const badges = document.createElement('div');
    badges.className = 'badges';
    badges.append(badge(t.grade, 'grade-' + t.grade));
    badges.append(badge(t.kind, 'kind-badge'));
    if (t.missable) badges.append(badge('missable', 'missable-badge'));
    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = t.description;
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    const showGuide = spoilersEl.checked || revealed.has(t.name);
    guide.hidden = !showGuide;
    const revealBtn = document.createElement('button');
    revealBtn.type = 'button';
    revealBtn.className = 'reveal';
    revealBtn.textContent = showGuide ? 'Hide guide' : 'Reveal guide (spoiler)';
    revealBtn.hidden = spoilersEl.checked;
    revealBtn.addEventListener('click', () => {
      if (revealed.has(t.name)) revealed.delete(t.name);
      else revealed.add(t.name);
      render();
    });
    const src = document.createElement('p');
    src.className = 'sources';
    src.textContent = 'Sources: ' + t.sources;
    card.append(top, badges, desc, revealBtn, guide, src);
    cardsEl.append(card);
  }
  showingEl.textContent = 'Showing ' + shown + ' of ' + trophies.length + ' trophies';
  progressEl.textContent = earned.size + ' of ' + trophies.length + ' earned';
  const pct = trophies.length ? Math.round((earned.size / trophies.length) * 100) : 0;
  percentEl.textContent = pct + '% to the platinum';
  barFillEl.style.width = pct + '%';
}
document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-legends-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (Array.isArray(names)) {
      earned = new Set(names.filter((x) => typeof x === 'string'));
      save();
      render();
    }
  } catch {
    showingEl.textContent = 'That import file could not be read as progress JSON.';
  }
});
searchEl.addEventListener('input', render);
gradeEl.addEventListener('change', render);
kindEl.addEventListener('change', render);
statusEl.addEventListener('change', render);
spoilersEl.addEventListener('change', render);
render();
if (params.get('view') === 'roadmap') {
  // Roadmap view: hide the trophy list so the roadmap fills the page
  // from the top, with no scrolling needed.
  document.getElementById('trophies').hidden = true;
}
