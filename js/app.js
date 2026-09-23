import { renderChapter, loadFootnotes, getChapterCount } from './bible.js';
import { initNav, renderChapterGrid, BOOKS } from './nav.js';
import { showStudyPanel, initTabs } from './ui.js';
import { loadXRefs, loadCccRefs } from './refs.js';

// ── Global state ─────────────────────────────────────────
export const state = {
  book:            'JHN',
  chapter:         1,
  bookName:        'John',
  selectedVerseId:  null,
  selectedVerseText: '',
  activeTab:        'footnotes',
  mapInitialised:   false,
};

// ── Navigation ───────────────────────────────────────────
// Fetch and render a chapter into the English text column.
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

  // Update chapter grid
  await updateChapterGrid(bookId);

  // Update chapter button highlight
  document.querySelectorAll('.chapter-btn').forEach(b =>
    b.classList.toggle('active', parseInt(b.dataset.chapter) === chapterNum)
  );

  const enContainer = document.getElementById('textEn')?.querySelector('.text-col__content');

  if (enContainer) {
    await renderChapter(bookId, chapterNum, enContainer);
  }

  attachVerseHandlers();
}

async function updateChapterGrid(bookId) {
  try {
    const count = await getChapterCount(bookId);
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

  // Highlight the selected verse
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
  loadXRefs(verseId);
  loadCccRefs(verseId);
}

// ── Initialise ────────────────────────────────────────────
async function init() {
  initNav();
  initTabs();
  await navigate('JHN', 1); // Load John 1 on first open
}

init();
