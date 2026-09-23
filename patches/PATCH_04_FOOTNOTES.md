# PATCH 04 — Study Panel & Footnotes

## After this patch the user can

Click any verse → the study panel opens with the official NABRE footnotes for that verse. Clicking a verse reference inside a footnote navigates the reader there. A direct link to the USCCB website is always shown.

This patch also builds the study panel shell (tabs) that every later patch adds content to.

## Prerequisites

- Patch 03 complete
- English NABRE text renders and verse elements have `data-verse-id` attributes

## Files to create

None new.

## Files to modify

- `index.html` — replace study panel placeholder with full tab structure
- `js/app.js` — wire up `selectVerse()` to show the study panel
- `js/bible.js` — add `fetchVerseWithNotes()` call and footnote renderer
- `js/ui.js` — add `showStudyPanel()` helper

---

## index.html — study panel structure

Replace the entire `<aside class="study-panel" id="studyPanel">` block with:

```html
<aside class="study-panel" id="studyPanel">

  <!-- Empty state — shown when no verse is selected -->
  <div class="study-panel__empty" id="studyEmpty">
    <span class="study-panel__empty-icon">✝</span>
    <p>Select a verse to begin studying.</p>
  </div>

  <!-- Active state — shown when a verse is selected -->
  <div class="study-panel__active" id="studyActive" style="display:none; flex:1; display:none; flex-direction:column; height:100%;">

    <!-- Selected verse reference badge -->
    <div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border); flex-shrink:0;">
      <span class="verse-ref-pill" id="studyVerseRef">—</span>
    </div>

    <!-- Tab bar -->
    <div class="tabs">
      <button class="tab-btn active" data-tab="footnotes">Notes</button>
      <button class="tab-btn" data-tab="xref">References</button>
      <button class="tab-btn" data-tab="ccc">Catechism</button>
      <button class="tab-btn" data-tab="map">Map</button>
      <button class="tab-btn" data-tab="ai">Ask AI</button>
    </div>

    <!-- Tab panes -->
    <div class="tab-pane active" data-pane="footnotes" id="paneFootnotes">
      <p class="placeholder-msg">Loading footnotes…</p>
    </div>

    <div class="tab-pane" data-pane="xref" id="paneXref">
      <p class="placeholder-msg">Cross-references load in Patch 05.</p>
    </div>

    <div class="tab-pane" data-pane="ccc" id="paneCcc">
      <p class="placeholder-msg">Catechism references load in Patch 06.</p>
    </div>

    <div class="tab-pane" data-pane="map" id="paneMap">
      <p class="placeholder-msg">Map loads in Patch 07.</p>
    </div>

    <div class="tab-pane" data-pane="ai" id="paneAi">
      <p class="placeholder-msg">Magisterium AI loads in Patch 08.</p>
    </div>

  </div>

</aside>
```

Note: `study-panel__active` uses inline style `display:none` here as a starting state; JavaScript controls it.

---

## js/ui.js — add tab wiring and study panel toggle

Add to `ui.js`:

```js
// Show the study panel active state and switch to a tab
export function showStudyPanel(verseRefLabel) {
  document.getElementById('studyEmpty').style.display  = 'none';
  document.getElementById('studyActive').style.display = 'flex';
  const ref = document.getElementById('studyVerseRef');
  if (ref) ref.textContent = verseRefLabel;
  activateTab('footnotes');
}

// Wire up tab buttons — call once on init
export function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });
}
```

---

## js/bible.js — add footnote fetching and rendering

Add this function to `bible.js`:

```js
// Fetch a single verse with full content and footnotes (NABRE only)
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
      No NABRE footnotes for this verse.
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
```

---

## style.css — footnote entries

Add these styles:

```css
.fn-entry {
  display: flex;
  gap: 0.6rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
  line-height: 1.6;
}
.fn-entry:last-of-type { border-bottom: none; }

.fn-entry__marker {
  flex-shrink: 0;
  font-weight: 700;
  color: var(--color-accent);
  font-size: 0.8rem;
  padding-top: 0.1rem;
  min-width: 1.5rem;
}

.fn-entry__text {
  color: var(--color-text);
}

.fn-usccb-link {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.85rem;
}
```

---

## js/app.js — wire up selectVerse()

Replace the `selectVerse()` stub with:

```js
import { loadFootnotes } from './bible.js';
import { showStudyPanel, initTabs } from './ui.js';
import { BOOKS } from './nav.js';

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
```

Also add `initTabs()` to `init()`:

```js
async function init() {
  initNav();
  initTabs();               // ← add this line
  applyLangMode(state.langMode);
  document.getElementById('langToggle')?.addEventListener('click', () => {
    const idx = LANG_MODES.indexOf(state.langMode);
    applyLangMode(LANG_MODES[(idx + 1) % LANG_MODES.length]);
  });
  await navigate('JHN', 1);
}
```

---

## Testing steps

1. Load John 1. Click on verse 1 (John 1:1).
2. Study panel should animate open (empty state hides, active state shows).
3. Verse reference badge shows "John 1:1".
4. Footnotes tab is active and shows NABRE footnotes.
5. A "Read official USCCB commentary ↗" link appears at the bottom.
6. Click another verse — footnotes update.
7. Click the "References" tab — placeholder text shows ("Cross-references load in Patch 05").
8. Click the "Ask AI" tab — placeholder text shows ("Magisterium AI loads in Patch 08").
9. Open a verse with no footnotes (e.g. a short genealogy verse) — verify the fallback message + USCCB link renders.

## Done when

- [ ] Clicking a verse opens the study panel
- [ ] Verse reference badge shows the correct book/chapter:verse label
- [ ] NABRE footnotes render for verses that have them
- [ ] Fallback message + USCCB link shows for verses with no footnotes
- [ ] All five tabs are clickable and switch panes correctly
- [ ] No console errors
