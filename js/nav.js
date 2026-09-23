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
