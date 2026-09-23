import { CONFIG } from '../config.js';
import { renderChapter, loadFootnotes } from './bible.js';
import { initNav, renderChapterGrid, BOOKS } from './nav.js';
import { showStudyPanel, initTabs } from './ui.js';

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
  plAvailable:      CONFIG.BIBLE_ID_PL !== '',
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

  const enContainer = document.getElementById('textEn')?.querySelector('.text-col__content');
  const plContainer = document.getElementById('textPl')?.querySelector('.text-col__content');

  const tasks = [];

  if (enContainer) {
    tasks.push(renderChapter(CONFIG.BIBLE_ID_EN, bookId, chapterNum, enContainer));
  }

  if (plContainer && CONFIG.BIBLE_ID_PL) {
    tasks.push(renderChapter(CONFIG.BIBLE_ID_PL, bookId, chapterNum, plContainer));
  } else if (plContainer) {
    plContainer.innerHTML = `<p class="placeholder-msg">
      Biblia Tysiąclecia nie jest dostępna w tym planie API.<br>
      <a href="https://biblia.deon.pl" target="_blank" class="ref-link">Otwórz biblia.deon.pl ↗</a>
    </p>`;
  }

  await Promise.all(tasks); // Both load at the same time
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

  // Highlight in both columns
  document.querySelectorAll('.verse').forEach(v =>
    v.classList.toggle('selected', v.dataset.verseId === verseId)
  );

  // Build human-readable label e.g. "John 1:1"
  const [book, ch, v] = verseId.split('.');
  const allBooks = [...BOOKS.OT, ...BOOKS.NT];
  const bookName = allBooks.find(b => b.id === book)?.name || book;
  const label = `${bookName} ${ch}:${v}`;

  showStudyPanel(label);
  loadFootnotes(verseId);
}

// ── Language toggle ───────────────────────────────────────
const LANG_MODES = ['side-by-side', 'en', 'pl'];
const LANG_LABELS = { 'side-by-side': 'EN | PL', 'en': 'EN', 'pl': 'PL' };

function applyLangMode(mode) {
  state.langMode = mode;
  localStorage.setItem('langMode', mode);
  const panel = document.querySelector('.bible-panel');
  if (panel) {
    panel.className = `bible-panel mode-${mode}`;
  }
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = LANG_LABELS[mode];
}

// ── Synchronised scrolling (side-by-side mode) ─────────────
function syncScroll() {
  const en = document.getElementById('textEn');
  const pl = document.getElementById('textPl');
  if (!en || !pl) return;

  let syncing = false;

  en.addEventListener('scroll', () => {
    if (syncing || state.langMode !== 'side-by-side') return;
    syncing = true;
    pl.scrollTop = en.scrollTop;
    syncing = false;
  });

  pl.addEventListener('scroll', () => {
    if (syncing || state.langMode !== 'side-by-side') return;
    syncing = true;
    en.scrollTop = pl.scrollTop;
    syncing = false;
  });
}

// ── Initialise ────────────────────────────────────────────
async function init() {
  initNav();
  initTabs();
  applyLangMode(state.langMode);
  syncScroll();
  document.getElementById('langToggle')?.addEventListener('click', () => {
    const idx = LANG_MODES.indexOf(state.langMode);
    applyLangMode(LANG_MODES[(idx + 1) % LANG_MODES.length]);
  });
  await navigate('JHN', 1); // Load John 1 on first open
}

init();
