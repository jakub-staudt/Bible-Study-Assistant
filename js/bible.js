import { showLoading, showError } from './ui.js';
import { state } from './app.js';

// ── Book text cache ─────────────────────────────────────────
// Each data/bible/<BOOK_ID>.json is { "<chapter>": { "<verse>": "text" } }
const _bookCache = {};

async function loadBook(bookId) {
  if (_bookCache[bookId]) return _bookCache[bookId];

  const res = await fetch(`./data/bible/${bookId}.json`);
  if (!res.ok) throw new Error(`Could not load ${bookId}.json (${res.status})`);

  const data = await res.json();
  _bookCache[bookId] = data;
  return data;
}

// Returns how many chapters a book has (for the chapter grid)
export async function getChapterCount(bookId) {
  const book = await loadBook(bookId);
  return Object.keys(book).length;
}

// ── Rendering ─────────────────────────────────────────────

// Render a chapter into the given container element.
export async function renderChapter(bookId, chapterNum, containerEl) {
  showLoading(containerEl);

  try {
    const book = await loadBook(bookId);
    const chapter = book[String(chapterNum)];

    if (!chapter) {
      showError(containerEl, `Chapter ${chapterNum} not found for this book.`);
      return;
    }

    const bookName = state.bookName || bookId;
    const verseNums = Object.keys(chapter).sort((a, b) => parseInt(a) - parseInt(b));

    const versesHtml = verseNums.map(num => {
      const verseId = `${bookId}.${chapterNum}.${num}`;
      const text = chapter[num];
      return `<span class="verse" data-verse-id="${verseId}"><sup class="verse-num">${num}</sup>${text} </span>`;
    }).join('');

    containerEl.innerHTML = `
      <h2 class="chapter-heading">${bookName} ${chapterNum}</h2>
      <p class="verse-block">${versesHtml}</p>
    `;

  } catch (err) {
    showError(containerEl, `Could not load chapter.<br><small>${err.message}</small>`);
  }
}

// ── Footnotes ─────────────────────────────────────────────
// The bundled Douay-Rheims text has no structured footnote data,
// so this always shows the USCCB fallback link.
export async function loadFootnotes(verseId) {
  const pane = document.getElementById('paneFootnotes');
  if (!pane) return;

  pane.innerHTML = renderNoFootnotes(verseId);
}

function renderNoFootnotes(verseId) {
  const [book, ch, v] = verseId.split('.');
  const usccbUrl = buildUsccbUrl(book, ch, v);
  return `
    <p class="placeholder-msg" style="margin-bottom:1rem">
      This translation doesn't include footnotes in the app.
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
