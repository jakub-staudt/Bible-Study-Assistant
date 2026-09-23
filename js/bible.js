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

// ── Footnotes ─────────────────────────────────────────────

// Fetch a single verse with full content and footnotes
export async function loadFootnotes(verseId) {
  const pane = document.getElementById('paneFootnotes');
  if (!pane) return;

  showLoading(pane, 3);

  try {
    const data = await apiFetch(
      `/bibles/${CONFIG.BIBLE_ID_EN}/verses/${verseId}?content-type=json&include-notes=true&include-chapter-numbers=false&include-verse-numbers=true`
    );

    const verse = data.data;
    const notes = verse.notes || [];

    if (notes.length === 0) {
      pane.innerHTML = renderNoFootnotes(verseId);
      return;
    }

    const html = notes.map((note, i) => `
      <div class="fn-entry">
        <span class="fn-entry__marker">${note.noteId || (i + 1)}</span>
        <div class="fn-entry__text">${renderNoteContent(note)}</div>
      </div>
    `).join('');

    const [book, ch, v] = verseId.split('.');
    const usccbUrl = buildUsccbUrl(book, ch, v);

    pane.innerHTML = `
      ${html}
      <div class="fn-usccb-link">
        <a href="${usccbUrl}" target="_blank" rel="noopener" class="ref-link">
          Read official USCCB commentary ↗
        </a>
      </div>
    `;

    // Make verse references in footnotes clickable
    pane.querySelectorAll('[data-ref]').forEach(el => {
      el.classList.add('ref-link');
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        // Import navigate dynamically to avoid circular imports
        import('./app.js').then(({ navigate }) => {
          const [b, c] = el.dataset.ref.split('.');
          navigate(b, parseInt(c));
        });
      });
    });

  } catch (err) {
    showError(pane, `Could not load footnotes.<br><small>${err.message}</small>`);
  }
}

function renderNoteContent(note) {
  // API.Bible returns note.content as an HTML string or array of content segments
  if (typeof note.content === 'string') return note.content;
  if (Array.isArray(note.content)) {
    return note.content.map(seg => {
      if (seg.type === 'text') return seg.text;
      if (seg.type === 'ref')  return `<span class="ref-link" data-ref="${seg.verseId}">${seg.text}</span>`;
      return seg.text || '';
    }).join('');
  }
  return 'No footnote text available.';
}

function renderNoFootnotes(verseId) {
  const [book, ch, v] = verseId.split('.');
  const usccbUrl = buildUsccbUrl(book, ch, v);
  return `
    <p class="placeholder-msg" style="margin-bottom:1rem">
      No footnotes for this verse.
    </p>
    <a href="${usccbUrl}" target="_blank" rel="noopener" class="ref-link">
      Check USCCB for commentary ↗
    </a>
  `;
}

function buildUsccbUrl(bookId, chapter, verse) {
  // USCCB Bible URL format: https://bible.usccb.org/bible/{book}/{chapter}#{verse}
  const USCCB_SLUGS = {
    GEN:'genesis', EXO:'exodus', LEV:'leviticus', NUM:'numbers', DEU:'deuteronomy',
    JOS:'joshua', JDG:'judges', RUT:'ruth', '1SA':'1-samuel', '2SA':'2-samuel',
    '1KI':'1-kings', '2KI':'2-kings', '1CH':'1-chronicles', '2CH':'2-chronicles',
    EZR:'ezra', NEH:'nehemiah', TOB:'tobit', JDT:'judith', EST:'esther',
    '1MA':'1-maccabees', '2MA':'2-maccabees', JOB:'job', PSA:'psalms',
    PRO:'proverbs', ECC:'ecclesiastes', SNG:'song-of-songs', WIS:'wisdom',
    SIR:'sirach', ISA:'isaiah', JER:'jeremiah', LAM:'lamentations', BAR:'baruch',
    EZK:'ezekiel', DAN:'daniel', HOS:'hosea', JOL:'joel', AMO:'amos',
    OBA:'obadiah', JON:'jonah', MIC:'micah', NAH:'nahum', HAB:'habakkuk',
    ZEP:'zephaniah', HAG:'haggai', ZEC:'zechariah', MAL:'malachi',
    MAT:'matthew', MRK:'mark', LUK:'luke', JHN:'john', ACT:'acts',
    ROM:'romans', '1CO':'1-corinthians', '2CO':'2-corinthians', GAL:'galatians',
    EPH:'ephesians', PHP:'philippians', COL:'colossians', '1TH':'1-thessalonians',
    '2TH':'2-thessalonians', '1TI':'1-timothy', '2TI':'2-timothy', TIT:'titus',
    PHM:'philemon', HEB:'hebrews', JAS:'james', '1PE':'1-peter', '2PE':'2-peter',
    '1JN':'1-john', '2JN':'2-john', '3JN':'3-john', JUD:'jude', REV:'revelation'
  };
  const slug = USCCB_SLUGS[bookId] || bookId.toLowerCase();
  return `https://bible.usccb.org/bible/${slug}/${chapter}#${verse}`;
}
