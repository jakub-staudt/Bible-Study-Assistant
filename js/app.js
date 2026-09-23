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
