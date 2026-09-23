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
