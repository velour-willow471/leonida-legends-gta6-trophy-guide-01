// Leonida Legends — offline GTA VI trophy tracker.
// Loads its own data file (app/data/trophies.json) and nothing else at run time.
// Progress lives in localStorage; export/import move it as a JSON file.
// Shareable links: ?trophy=<id> opens a guide, ?kind=<kind> filters the list,
// ?spoilers=on|off sets the spoiler mode, ?demo=1 seeds a sample of earned trophies
// when no progress is saved yet (used for the entry's screenshots).
const PROGRESS_KEY = 'leonida-legends-progress-v1';
const SPOILER_KEY = 'leonida-legends-spoilers-v1';
const DEMO_EARNED_IDS = [2, 3, 8, 16, 20, 21, 35, 42, 44, 51, 53, 55];

const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const progressBar = document.querySelector('.progress-bar');
const gradeCounts = document.getElementById('gradeCounts');
const roadmapFacts = document.getElementById('roadmapFacts');
const roadmapStages = document.getElementById('roadmapStages');
const searchInput = document.getElementById('search');
const gradeFilter = document.getElementById('gradeFilter');
const spoilerToggle = document.getElementById('spoilerToggle');
const hideEarnedToggle = document.getElementById('hideEarnedToggle');
const kindFilters = document.getElementById('kindFilters');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');
const detailBody = document.getElementById('detailBody');
const trophyCards = document.getElementById('trophyCards');
const listCount = document.getElementById('listCount');
const emptyState = document.getElementById('emptyState');
const sourceList = document.getElementById('sourceList');

const guideData = await (await fetch('data/trophies.json')).json();
const trophies = guideData.trophies;
const sources = guideData.sources;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

let earned = loadProgress();
let activeKind = 'all';
let selectedId = null;

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    return new Set(saved.filter((name) => byName.has(name)));
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

function readLinkParams() {
  const params = new URLSearchParams(location.search);
  const kind = params.get('kind');
  if (kind && [...kindFilters.querySelectorAll('[data-kind]')].some((b) => b.dataset.kind === kind)) {
    activeKind = kind;
  }
  const spoilers = params.get('spoilers');
  if (spoilers === 'on' || spoilers === 'off') {
    spoilerToggle.checked = spoilers === 'on';
    localStorage.setItem(SPOILER_KEY, spoilerToggle.checked ? 'on' : 'off');
  } else {
    spoilerToggle.checked = localStorage.getItem(SPOILER_KEY) !== 'off';
  }
  if (params.get('demo') === '1' && !localStorage.getItem(PROGRESS_KEY)) {
    for (const id of DEMO_EARNED_IDS) earned.add(byId.get(id).name);
    saveProgress();
  }
  const trophy = Number(params.get('trophy'));
  if (byId.has(trophy)) selectedId = trophy;
}

function isSpoilerHidden(trophy) {
  return spoilerToggle.checked && trophy.kind === 'story' && !earned.has(trophy.name);
}

function missableNote(trophy) {
  if (trophy.missable) {
    return { text: 'Possibly missable — do the Chapter 1 balcony meditation before Chapter 1 ends. See the guide above.', missable: true };
  }
  if (trophy.kind === 'story') return { text: 'Story trophy — cannot be missed.', missable: false };
  if (trophy.kind === 'side') return { text: 'Not missable — the questline stays available after the story in free roam.', missable: false };
  return { text: 'Not missable — free roam stays open after the story.', missable: false };
}

function kindLabel(kind) {
  return { story: 'Story', side: 'Character quest', collectibles: 'Collectibles', activities: 'Activities', completion: '100% completion', platinum: 'Platinum' }[kind] ?? kind;
}

function gradeWord(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

function matchesFilters(trophy) {
  if (activeKind === 'missable' && !trophy.missable) return false;
  if (activeKind === 'online') return false;
  if (activeKind !== 'all' && activeKind !== 'missable' && trophy.kind !== activeKind) return false;
  if (gradeFilter.value !== 'all' && trophy.grade !== gradeFilter.value) return false;
  if (hideEarnedToggle.checked && earned.has(trophy.name)) return false;
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const count = earned.size;
  progressText.textContent = `${count} of ${total} earned`;
  progressFill.style.width = `${Math.round((count / total) * 100)}%`;
  progressBar.setAttribute('aria-valuenow', String(count));
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => earned.has(t.name)).length;
    return `${got}/${inGrade.length} ${grade}`;
  });
  gradeCounts.textContent = parts.join(' · ');
}

function renderRoadmap() {
  roadmapFacts.replaceChildren();
  for (const fact of guideData.roadmap.facts) {
    const wrap = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = fact.label;
    const value = document.createElement('dd');
    value.textContent = fact.value;
    wrap.append(term, value);
    roadmapFacts.append(wrap);
  }
  roadmapStages.replaceChildren();
  for (const stage of guideData.roadmap.stages) {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = `Stage ${stage.stage}: ${stage.title}`;
    const text = document.createElement('span');
    text.textContent = stage.text;
    item.append(title, text);
    roadmapStages.append(item);
  }
}

function renderSources() {
  sourceList.replaceChildren();
  for (const entry of Object.values(sources)) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = entry.url;
    link.textContent = entry.label;
    link.rel = 'noopener';
    item.append(link);
    sourceList.append(item);
  }
}

function sourceLinks(trophy) {
  return trophy.sources.map((key) => sources[key]).filter(Boolean);
}

function openTrophyDetail(trophy) {
  selectedId = trophy.id;
  detailBody.replaceChildren();
  const heading = document.createElement('h3');
  const grade = document.createElement('span');
  grade.className = `grade-badge ${trophy.grade}`;
  grade.textContent = gradeWord(trophy.grade);
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  const miss = document.createElement('p');
  miss.className = 'detail-miss';
  const note = missableNote(trophy);
  miss.textContent = note.text;
  if (note.missable) miss.classList.add('missable');
  const sourcePara = document.createElement('p');
  sourcePara.className = 'detail-sources';
  sourcePara.textContent = 'Sources: ';
  const links = sourceLinks(trophy);
  links.forEach((entry, index) => {
    const link = document.createElement('a');
    link.href = entry.url;
    link.textContent = entry.label;
    link.rel = 'noopener';
    sourcePara.append(link);
    if (index < links.length - 1) sourcePara.append(', ');
  });
  if (isSpoilerHidden(trophy)) {
    heading.textContent = 'Hidden story trophy';
    meta.textContent = 'Story trophy — earn it to reveal its name and guide.';
    guide.textContent = 'Spoilers are hidden until this trophy is earned. Tick it off below once you have it, or switch the spoiler setting off.';
    detailBody.append(heading, meta, guide);
    return;
  }
  heading.textContent = trophy.name;
  meta.textContent = `${trophy.description} — ${kindLabel(trophy.kind)}${trophy.missable ? ' · Possibly missable' : ''}`;
  guide.textContent = trophy.guide;
  detailBody.append(heading, grade, meta, guide, miss, sourcePara);
}

function buildTrophyCard(trophy) {
  const card = document.createElement('article');
  card.className = 'card';
  if (earned.has(trophy.name)) card.classList.add('earned');
  if (trophy.missable) card.classList.add('missable-card');
  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveProgress();
    renderAll();
  });
  const title = document.createElement('h3');
  const grade = document.createElement('span');
  grade.className = `grade-badge ${trophy.grade}`;
  grade.textContent = gradeWord(trophy.grade);
  head.append(box, title, grade);
  const description = document.createElement('p');
  description.className = 'card-desc';
  const tags = document.createElement('div');
  tags.className = 'card-tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'kind-tag';
  kindTag.textContent = kindLabel(trophy.kind);
  tags.append(kindTag);
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'missable-tag';
    flag.textContent = '⚠ Possibly missable';
    tags.append(flag);
  }
  const excerpt = document.createElement('p');
  excerpt.className = 'card-excerpt';
  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.textContent = 'Read the full guide';
  openBtn.addEventListener('click', () => {
    openTrophyDetail(trophy);
    document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  if (isSpoilerHidden(trophy)) {
    title.textContent = 'Hidden story trophy';
    description.textContent = 'Hidden until earned — turn spoilers off or tick it off to reveal it.';
    excerpt.textContent = 'A story trophy. Its name and guide stay hidden while spoilers are on.';
    card.classList.add('spoiler-hidden');
  } else {
    title.textContent = trophy.name;
    description.textContent = trophy.description;
    excerpt.textContent = trophy.guide.length > 160 ? `${trophy.guide.slice(0, 160)}…` : trophy.guide;
  }
  card.append(head, description, tags, excerpt, openBtn);
  return card;
}

function renderCards() {
  const shown = trophies.filter(matchesFilters);
  trophyCards.replaceChildren();
  for (const trophy of shown) trophyCards.append(buildTrophyCard(trophy));
  listCount.textContent = `Showing ${shown.length} of ${trophies.length} trophies.`;
  if (activeKind === 'online') {
    emptyState.hidden = false;
    emptyState.textContent = 'There are no online trophies: all 55 are offline and single-player, and one playthrough is enough (PowerPyx). Nothing to track here.';
  } else if (shown.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = 'No trophies match these filters. Clear the search or pick another kind.';
  } else {
    emptyState.hidden = true;
  }
}

function renderAll() {
  renderProgress();
  renderCards();
  if (selectedId !== null && byId.has(selectedId)) openTrophyDetail(byId.get(selectedId));
}

function exportProgressFile() {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort() };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-legends-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

async function importProgressFile(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const valid = names.filter((name) => byName.has(name));
    earned = new Set(valid);
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a Leonida Legends progress export.');
  }
}

kindFilters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-kind]');
  if (!button) return;
  activeKind = button.dataset.kind;
  for (const chip of kindFilters.querySelectorAll('[data-kind]')) {
    chip.classList.toggle('active', chip === button);
  }
  renderCards();
});
searchInput.addEventListener('input', renderCards);
gradeFilter.addEventListener('change', renderCards);
hideEarnedToggle.addEventListener('change', renderCards);
spoilerToggle.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, spoilerToggle.checked ? 'on' : 'off');
  renderAll();
});
exportBtn.addEventListener('click', exportProgressFile);
importFile.addEventListener('change', (event) => {
  importProgressFile(event.target.files[0]);
  event.target.value = '';
});
resetBtn.addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveProgress();
  renderAll();
});

readLinkParams();
for (const chip of kindFilters.querySelectorAll('[data-kind]')) {
  chip.classList.toggle('active', chip.dataset.kind === activeKind);
}
renderRoadmap();
renderSources();
renderAll();
