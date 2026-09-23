# PATCH 02 — Bible Reader (English / NABRE)

## After this patch the user can

Navigate to any book and chapter using the sidebar and read the full NABRE text in English. Chapters are cached so switching back and forth is instant.

## Prerequisites

- Patch 01 complete (shell renders)
- User has signed up at [api.bible](https://api.bible) (free Starter plan) and has their API key
- User must also **identify their Bible IDs** — instructions below

## Files to create

- `config.example.js`
- `config.js` ← user fills this in; it is gitignored
- `js/app.js`
- `js/bible.js`
- `js/nav.js`
- `js/ui.js`
- `.gitignore`

## Files to modify

- `index.html` — uncomment the app script tag at the bottom

---

## Step 0 — Find the Bible IDs

Before writing any code, tell the user to open their browser console and run:

```js
fetch('https://api.scripture.api.bible/v1/bibles', {
  headers: { 'api-key': 'THEIR_KEY_HERE' }
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d.data.map(b => ({ id: b.id, name: b.name, language: b.language?.name })), null, 2)));
```

They will see a list. They should find:
- **English Catholic:** search for "New American Bible" — the NABRE entry
- **Polish Catholic:** search for "Biblia" — look for "Biblia Tysiąclecia" (Millennium Bible)

If Biblia Tysiąclecia is not available on API.Bible free tier, the Polish support is deferred to Patch 03. Set `BIBLE_ID_PL` to an empty string for now.

---

## .gitignore

```
config.js
node_modules/
```

---

## config.example.js

```js
// Copy this file to config.js and fill in your keys.
// config.js is gitignored — never commit real keys.
export const CONFIG = {
  BIBLE_API_KEY: 'GET_FROM_API.BIBLE',
  BIBLE_ID_EN:   'FIND_VIA_GET_BIBLES_ENDPOINT',  // NABRE
  BIBLE_ID_PL:   'FIND_VIA_GET_BIBLES_ENDPOINT',  // Biblia Tysiąclecia
  MAI_API_KEY:   'GET_FROM_MAGISTERIUMMAGI.AI',
  MAI_API_URL:   'https://api.magisteriummagi.ai/v1/',
};
```

---

## js/ui.js

Shared UI helpers used by every patch.

```js
// Show/hide a loading skeleton inside a container element
export function showLoading(container, lines = 4) {
  container.innerHTML = `<div class="loading-block">
    ${Array.from({ length: lines }, () => '<div class="skeleton"></div>').join('')}
  </div>`;
}

// Show an error message inside a container
export function showError(container, message) {
  container.innerHTML = `<div class="error-msg">${message}</div>`;
}

// Switch active tab; hide/show panes
export function activateTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === tabId));
}
```

---

## js/bible.js

API calls and rendering. All text rendering happens here.

```js
import { CONFIG } from '../config.js';
import { showLoading, showError } from './ui.js';
import { state } from './app.js';

const API_BASE = 'https://api.scripture.api.bible/v1';

// ── Chapter cache ────────────────────────────────────────
const _chapterCache = {};

function cacheKey(bibleId, chapterId) {
  return `${bibleId}::${chapterId}`;
}

// ── Fetch helpers ────────────────────────────────────────

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'api-key': CONFIG.BIBLE_API_KEY }
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// Returns array of verse objects for a chapter
export async function fetchChapterVerses(bibleId, bookId, chapterNum) {
  const chapterId = `${bookId}.${chapterNum}`;
  const key = cacheKey(bibleId, chapterId);

  if (_chapterCache[key]) return _chapterCache[key];

  const data = await apiFetch(
    `/bibles/${bibleId}/chapters/${chapterId}/verses`
  );

  const verses = data.data || [];
  _chapterCache[key] = verses;
  return verses;
}

// Returns a single verse with full content + footnotes
export async function fetchVerseWithNotes(bibleId, verseId) {
  const data = await apiFetch(
    `/bibles/${bibleId}/verses/${verseId}?content-type=json&include-notes=true&include-verse-numbers=true`
  );
  return data.data;
}

// ── Rendering ─────────────────────────────────────────────

// Render a chapter into the given container element.
// Returns the verse ID list so the caller can sync EN and PL.
export async function renderChapter(bibleId, bookId, chapterNum, containerEl) {
  showLoading(containerEl);

  try {
    const verses = await fetchChapterVerses(bibleId, bookId, chapterNum);

    // Build chapter heading
    const bookName = state.bookName || bookId;
    containerEl.innerHTML = `
      <h2 class="chapter-heading">${bookName} ${chapterNum}</h2>
      <p class="verse-block" id="verseBlock_${bibleId}"></p>
    `;

    const block = containerEl.querySelector(`#verseBlock_${bibleId}`);

    verses.forEach(v => {
      // The verse list endpoint returns minimal data; we render what we have.
      // Full content is fetched on demand when the user clicks a verse.
      const num = v.id.split('.')[2]; // e.g. "JHN.1.1" → "1"
      const span = document.createElement('span');
      span.className = 'verse';
      span.dataset.verseId = v.id;
      span.innerHTML = `<sup class="verse-num">${num}</sup>${v.reference || ''} `;
      block.appendChild(span);
    });

    // Now fetch full chapter content in one call for readable text
    await renderChapterContent(bibleId, bookId, chapterNum, containerEl);

  } catch (err) {
    showError(containerEl, `Could not load chapter. Check your API key and Bible ID.<br><small>${err.message}</small>`);
  }
}

// Fetches the full chapter passage and injects verse text
async function renderChapterContent(bibleId, bookId, chapterNum, containerEl) {
  try {
    const chapterId = `${bookId}.${chapterNum}`;
    const data = await apiFetch(
      `/bibles/${bibleId}/chapters/${chapterId}?content-type=text&include-notes=true&include-verse-numbers=true`
    );

    // API returns HTML content; inject directly and then wire up verse spans
    const bookName = state.bookName || bookId;
    containerEl.innerHTML = `<h2 class="chapter-heading">${bookName} ${chapterNum}</h2>
      <div class="verse-block">${data.data?.content || 'No content available.'}</div>`;

    // Add verse class + data attributes to verse spans the API renders
    // The API wraps each verse in a <p data-number="N"> or similar — we augment them
    containerEl.querySelectorAll('[data-number]').forEach(el => {
      const num = el.getAttribute('data-number');
      const verseId = `${bookId}.${chapterNum}.${num}`;
      el.classList.add('verse');
      el.dataset.verseId = verseId;
    });

  } catch (err) {
    // Non-fatal: the verse list already rendered, just without full content
    console.warn('Full chapter content fetch failed:', err.message);
  }
}
```

> **Note on the API response format:** API.Bible's chapter content endpoint returns
> HTML with Bible Society markup. The exact element structure varies by translation.
> After implementing, open the browser console, fetch a chapter manually, and inspect
> `data.data.content` to see what selectors to use for verse identification. Adjust
> the `querySelectorAll` selector above to match what the API actually returns.

---

## js/nav.js

Book list and chapter selector.

```js
import { state, navigate } from './app.js';

// ── Book list ─────────────────────────────────────────────
// Catholic canonical order including Deuterocanonical books.
// format: { id: API.Bible book ID, name: display name }

export const BOOKS = {
  OT: [
    { id: 'GEN', name: 'Genesis' },       { id: 'EXO', name: 'Exodus' },
    { id: 'LEV', name: 'Leviticus' },     { id: 'NUM', name: 'Numbers' },
    { id: 'DEU', name: 'Deuteronomy' },   { id: 'JOS', name: 'Joshua' },
    { id: 'JDG', name: 'Judges' },        { id: 'RUT', name: 'Ruth' },
    { id: '1SA', name: '1 Samuel' },      { id: '2SA', name: '2 Samuel' },
    { id: '1KI', name: '1 Kings' },       { id: '2KI', name: '2 Kings' },
    { id: '1CH', name: '1 Chronicles' },  { id: '2CH', name: '2 Chronicles' },
    { id: 'EZR', name: 'Ezra' },          { id: 'NEH', name: 'Nehemiah' },
    { id: 'TOB', name: 'Tobit ✦' },       { id: 'JDT', name: 'Judith ✦' },
    { id: 'EST', name: 'Esther' },        { id: '1MA', name: '1 Maccabees ✦' },
    { id: '2MA', name: '2 Maccabees ✦' }, { id: 'JOB', name: 'Job' },
    { id: 'PSA', name: 'Psalms' },        { id: 'PRO', name: 'Proverbs' },
    { id: 'ECC', name: 'Ecclesiastes' },  { id: 'SNG', name: 'Song of Songs' },
    { id: 'WIS', name: 'Wisdom ✦' },      { id: 'SIR', name: 'Sirach ✦' },
    { id: 'ISA', name: 'Isaiah' },        { id: 'JER', name: 'Jeremiah' },
    { id: 'LAM', name: 'Lamentations' },  { id: 'BAR', name: 'Baruch ✦' },
    { id: 'EZK', name: 'Ezekiel' },       { id: 'DAN', name: 'Daniel' },
    { id: 'HOS', name: 'Hosea' },         { id: 'JOL', name: 'Joel' },
    { id: 'AMO', name: 'Amos' },          { id: 'OBA', name: 'Obadiah' },
    { id: 'JON', name: 'Jonah' },         { id: 'MIC', name: 'Micah' },
    { id: 'NAH', name: 'Nahum' },         { id: 'HAB', name: 'Habakkuk' },
    { id: 'ZEP', name: 'Zephaniah' },     { id: 'HAG', name: 'Haggai' },
    { id: 'ZEC', name: 'Zechariah' },     { id: 'MAL', name: 'Malachi' },
  ],
  NT: [
    { id: 'MAT', name: 'Matthew' },   { id: 'MRK', name: 'Mark' },
    { id: 'LUK', name: 'Luke' },      { id: 'JHN', name: 'John' },
    { id: 'ACT', name: 'Acts' },      { id: 'ROM', name: 'Romans' },
    { id: '1CO', name: '1 Corinthians' }, { id: '2CO', name: '2 Corinthians' },
    { id: 'GAL', name: 'Galatians' }, { id: 'EPH', name: 'Ephesians' },
    { id: 'PHP', name: 'Philippians' }, { id: 'COL', name: 'Colossians' },
    { id: '1TH', name: '1 Thessalonians' }, { id: '2TH', name: '2 Thessalonians' },
    { id: '1TI', name: '1 Timothy' }, { id: '2TI', name: '2 Timothy' },
    { id: 'TIT', name: 'Titus' },     { id: 'PHM', name: 'Philemon' },
    { id: 'HEB', name: 'Hebrews' },   { id: 'JAS', name: 'James' },
    { id: '1PE', name: '1 Peter' },   { id: '2PE', name: '2 Peter' },
    { id: '1JN', name: '1 John' },    { id: '2JN', name: '2 John' },
    { id: '3JN', name: '3 John' },    { id: 'JUD', name: 'Jude' },
    { id: 'REV', name: 'Revelation' },
  ]
};
// ✦ = Deuterocanonical (Catholic canon, not in Protestant Bibles)
// These may not be available in all API.Bible translations.

// Build the nav panel HTML
export function initNav() {
  const navInner = document.querySelector('.nav-panel__inner');
  if (!navInner) return;

  let html = '';

  html += `<div class="nav-section-label">Old Testament</div>`;
  BOOKS.OT.forEach(b => {
    html += `<button class="book-item" data-book="${b.id}">${b.name}</button>`;
  });

  html += `<div class="nav-section-label">New Testament</div>`;
  BOOKS.NT.forEach(b => {
    html += `<button class="book-item" data-book="${b.id}">${b.name}</button>`;
  });

  html += `
    <div class="chapter-selector">
      <div class="nav-section-label" style="padding:0 0 0.35rem">Chapter</div>
      <div class="chapter-grid" id="chapterGrid"></div>
    </div>
  `;

  navInner.innerHTML = html;

  // Book click handler
  navInner.addEventListener('click', e => {
    const bookBtn = e.target.closest('.book-item');
    if (bookBtn) {
      const bookId = bookBtn.dataset.book;
      navigate(bookId, 1);
      document.querySelectorAll('.book-item').forEach(b => b.classList.remove('active'));
      bookBtn.classList.add('active');
    }

    const chapterBtn = e.target.closest('.chapter-btn');
    if (chapterBtn) {
      const ch = parseInt(chapterBtn.dataset.chapter);
      navigate(state.book, ch);
    }
  });
}

// Update the chapter grid for the given book.
// chapterCount: how many chapters this book has.
export function renderChapterGrid(chapterCount) {
  const grid = document.getElementById('chapterGrid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: chapterCount }, (_, i) => {
    const n = i + 1;
    return `<button class="chapter-btn${n === state.chapter ? ' active' : ''}" data-chapter="${n}">${n}</button>`;
  }).join('');
}
```

---

## js/app.js

Entry point. Wires everything together.

```js
import { CONFIG } from '../config.js';
import { renderChapter } from './bible.js';
import { initNav, renderChapterGrid, BOOKS } from './nav.js';

// ── Global state ─────────────────────────────────────────
export const state = {
  book:            'JHN',
  chapter:         1,
  bookName:        'John',
  selectedVerseId:  null,
  selectedVerseText: '',
  langMode:         localStorage.getItem('langMode') || 'side-by-side',
  activeTab:        'footnotes',
  mapInitialised:   false,
};

// ── Navigation ───────────────────────────────────────────
// Fetch and render a chapter in both EN and PL columns.
export async function navigate(bookId, chapterNum) {
  state.book    = bookId;
  state.chapter = chapterNum;
  state.selectedVerseId = null;

  // Update book name for the heading
  const allBooks = [...BOOKS.OT, ...BOOKS.NT];
  const bookEntry = allBooks.find(b => b.id === bookId);
  state.bookName = bookEntry?.name || bookId;

  // Highlight active book in nav
  document.querySelectorAll('.book-item').forEach(b =>
    b.classList.toggle('active', b.dataset.book === bookId)
  );

  // Update chapter grid — fetch chapter count from API
  await updateChapterGrid(bookId);

  // Update chapter button highlight
  document.querySelectorAll('.chapter-btn').forEach(b =>
    b.classList.toggle('active', parseInt(b.dataset.chapter) === chapterNum)
  );

  // Render English text
  const enContainer = document.getElementById('textEn')?.querySelector('.text-col__content');
  if (enContainer) {
    await renderChapter(CONFIG.BIBLE_ID_EN, bookId, chapterNum, enContainer);
  }

  // Attach verse click handlers
  attachVerseHandlers();
}

async function updateChapterGrid(bookId) {
  try {
    const res = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${CONFIG.BIBLE_ID_EN}/books/${bookId}/chapters`,
      { headers: { 'api-key': CONFIG.BIBLE_API_KEY } }
    );
    const data = await res.json();
    const count = (data.data || []).filter(c => c.id !== `${bookId}.intro`).length;
    renderChapterGrid(count);
  } catch {
    renderChapterGrid(30); // fallback
  }
}

// ── Verse interaction ─────────────────────────────────────
function attachVerseHandlers() {
  document.querySelectorAll('.verse').forEach(el => {
    el.addEventListener('click', () => selectVerse(el.dataset.verseId));
  });
}

export function selectVerse(verseId) {
  if (!verseId) return;
  state.selectedVerseId = verseId;
  document.querySelectorAll('.verse').forEach(v =>
    v.classList.toggle('selected', v.dataset.verseId === verseId)
  );
  // Study panel updates added in Patch 04
  console.log('Selected verse:', verseId);
}

// ── Language toggle ───────────────────────────────────────
const LANG_MODES = ['side-by-side', 'en', 'pl'];
const LANG_LABELS = { 'side-by-side': 'EN | PL', 'en': 'EN', 'pl': 'PL' };

function applyLangMode(mode) {
  state.langMode = mode;
  localStorage.setItem('langMode', mode);
  document.getElementById('textEn')?.style.setProperty('display',
    mode === 'pl' ? 'none' : 'block');
  document.getElementById('textPl')?.style.setProperty('display',
    mode === 'en' ? 'none' : 'block');
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = LANG_LABELS[mode];
}

// ── Initialise ────────────────────────────────────────────
async function init() {
  initNav();
  applyLangMode(state.langMode);
  document.getElementById('langToggle')?.addEventListener('click', () => {
    const idx = LANG_MODES.indexOf(state.langMode);
    applyLangMode(LANG_MODES[(idx + 1) % LANG_MODES.length]);
  });
  await navigate('JHN', 1); // Load John 1 on first open
}

init();
```

## index.html — modification

Uncomment the script tag at the bottom of `<body>`:

```html
<script type="module" src="js/app.js"></script>
```

---

## Testing steps

1. Fill in `config.js` with your real API key and Bible IDs.
2. Serve the project locally: `npx serve .` or Python's `python3 -m http.server 8080` (ES modules require a server, not a file:// URL).
3. Open `http://localhost:8080` — John chapter 1 should load automatically.
4. Click a different book in the nav → chapter grid updates → text loads.
5. Click a chapter number → text updates.
6. Click the "EN | PL" button → cycles through EN, PL, side-by-side modes.
7. Open browser console — there should be no errors.

## Done when

- [ ] `config.js` and `config.example.js` exist
- [ ] `.gitignore` includes `config.js`
- [ ] John 1 loads on first open with NABRE text
- [ ] Clicking any book and chapter loads the correct text
- [ ] Language toggle works (PL column shows placeholder text; full PL added in Patch 03)
- [ ] Verse click logs the verse ID to the console
- [ ] No console errors
