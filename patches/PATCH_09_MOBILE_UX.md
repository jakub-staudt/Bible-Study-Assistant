# PATCH 09 — Mobile Layout & UX Polish

## After this patch the user can

Use the full app comfortably on a phone. Language and last-read position are remembered across sessions. Chapter navigation works with keyboard shortcuts. Loading states feel smooth, not broken.

## Prerequisites

- All previous patches complete (01–08)

## Files to modify

- `style.css` — responsive layout, bottom sheet, polish
- `js/app.js` — localStorage persistence, keyboard shortcuts, prev/next navigation
- `index.html` — mobile nav bar, bottom sheet handle

---

## Mobile layout strategy

**Desktop (≥ 900 px):** Three columns as built. No changes.

**Tablet (600 – 899 px):** Two columns — nav + bible text. Study panel becomes a bottom sheet.

**Mobile (< 600 px):** One column — bible text only. Nav collapses to a top dropdown bar. Study panel is a full-height bottom sheet.

---

## index.html — add mobile navigation bar and bottom sheet handle

Inside the `<header class="top-bar">`, add after the language toggle button:

```html
<!-- Mobile nav toggle (hidden on desktop) -->
<button class="btn btn--ghost mobile-nav-toggle" id="mobileNavToggle" title="Books">☰ Books</button>
```

The nav panel already exists as `.nav-panel`. On mobile, it becomes a slide-in drawer from the left (see CSS below).

At the very bottom of `<body>`, before the script tag, add the bottom sheet overlay:

```html
<!-- Mobile bottom sheet for study panel -->
<div class="sheet-overlay" id="sheetOverlay"></div>
```

No other HTML changes needed — the study panel itself becomes the bottom sheet via CSS.

---

## style.css — responsive additions

Add these at the end of `style.css`.

### Tablet (600–899 px)

```css
@media (max-width: 899px) {
  .layout {
    grid-template-columns: var(--nav-width) 1fr;
    grid-template-areas: "nav bible";
  }

  .study-panel {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 70vh;
    max-height: 70vh;
    border-left: none;
    border-top: 2px solid var(--color-border);
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 24px rgba(44,24,16,0.15);
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 200;
  }

  .study-panel.open {
    transform: translateY(0);
  }

  /* Drag handle at top of bottom sheet */
  .study-panel::before {
    content: '';
    display: block;
    width: 40px;
    height: 4px;
    background: var(--color-border);
    border-radius: 2px;
    margin: 10px auto 6px;
    flex-shrink: 0;
  }

  .sheet-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(44,24,16,0.35);
    z-index: 199;
  }
  .sheet-overlay.active { display: block; }
}
```

### Mobile (< 600 px)

```css
@media (max-width: 599px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-areas: "bible";
  }

  /* Nav becomes a slide-in drawer */
  .nav-panel {
    position: fixed;
    top: var(--top-bar-h);
    left: 0;
    bottom: 0;
    width: 260px;
    z-index: 300;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 4px 0 16px rgba(44,24,16,0.2);
  }

  .nav-panel.drawer-open {
    transform: translateX(0);
  }

  .mobile-nav-toggle {
    display: inline-flex !important;
  }

  /* Study panel takes full height on mobile */
  .study-panel {
    height: 85vh;
    max-height: 85vh;
  }

  /* Bible panel fills full width */
  .bible-panel {
    overflow-y: auto;
  }

  /* Side-by-side mode stacks vertically on mobile */
  .bible-panel.mode-side-by-side {
    grid-template-columns: 1fr;
  }

  /* Larger tap targets for verse numbers */
  .verse-num {
    font-size: 0.75em;
    padding: 2px 4px;
  }
}
```

### Desktop — hide mobile elements

```css
@media (min-width: 600px) {
  .mobile-nav-toggle { display: none !important; }
}
```

### Reading comfort improvements (all sizes)

```css
/* Better text rendering */
.text-col__content {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Slightly larger touch targets for chapter buttons on all sizes */
.chapter-btn {
  min-height: 32px;
  min-width: 32px;
}

/* Smooth scroll within bible panel */
.bible-panel {
  scroll-behavior: smooth;
}

/* Highlight currently reading verse with a subtle left border */
.verse.selected {
  background: var(--color-highlight);
  border-left: 3px solid var(--color-accent);
  padding-left: 4px;
  margin-left: -7px;
}

/* Study panel tab bar on small screens: smaller text */
@media (max-width: 400px) {
  .tab-btn {
    font-size: 0.65rem;
    padding: 0.55rem 0.1rem;
  }
}
```

---

## js/app.js — add persistence, keyboard nav, and mobile behaviour

### 1. Persist last-read position

In `navigate()`, after updating state, save to localStorage:

```js
export async function navigate(bookId, chapterNum) {
  // ... existing code ...

  // Persist so the user returns to the same spot
  localStorage.setItem('lastBook',    bookId);
  localStorage.setItem('lastChapter', String(chapterNum));
}
```

In `init()`, restore last position instead of always defaulting to John 1:

```js
async function init() {
  initNav();
  initTabs();
  initCommentary();
  applyLangMode(state.langMode);

  document.getElementById('langToggle')?.addEventListener('click', () => {
    const idx = LANG_MODES.indexOf(state.langMode);
    applyLangMode(LANG_MODES[(idx + 1) % LANG_MODES.length]);
  });

  // Restore last-read position or default to John 1
  const savedBook    = localStorage.getItem('lastBook')    || 'JHN';
  const savedChapter = parseInt(localStorage.getItem('lastChapter') || '1', 10);
  await navigate(savedBook, savedChapter);

  initKeyboardNav();
  initMobileUI();
  initMap();
}
```

### 2. Keyboard navigation

```js
function initKeyboardNav() {
  document.addEventListener('keydown', async e => {
    // Only fire when not typing in a text field
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === 'ArrowRight' || e.key === 'l') {
      e.preventDefault();
      await navigate(state.book, state.chapter + 1);
    }
    if (e.key === 'ArrowLeft' || e.key === 'h') {
      e.preventDefault();
      if (state.chapter > 1) await navigate(state.book, state.chapter - 1);
    }
  });
}
```

### 3. Mobile UI — drawer and bottom sheet

```js
function initMobileUI() {
  // Mobile nav drawer toggle
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navPanel        = document.querySelector('.nav-panel');
  const overlay         = document.getElementById('sheetOverlay');
  const studyPanel      = document.getElementById('studyPanel');

  mobileNavToggle?.addEventListener('click', () => {
    navPanel?.classList.toggle('drawer-open');
  });

  // Close drawer when a book is tapped (mobile)
  navPanel?.addEventListener('click', e => {
    if (e.target.closest('.book-item') && window.innerWidth < 600) {
      navPanel.classList.remove('drawer-open');
    }
  });

  // Bottom sheet: open when a verse is selected (on narrow screens)
  // selectVerse() already opens the study panel; we just add the CSS class
  const _origSelectVerse = window._selectVerseCallback;
  // Instead, patch this by dispatching a custom event in selectVerse():
  document.addEventListener('verseSelected', () => {
    if (window.innerWidth < 900) {
      studyPanel?.classList.add('open');
      overlay?.classList.add('active');
    }
  });

  // Close bottom sheet
  overlay?.addEventListener('click', closeSheet);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSheet();
  });

  function closeSheet() {
    studyPanel?.classList.remove('open');
    overlay?.classList.remove('active');
  }
}
```

In `selectVerse()`, dispatch the custom event:

```js
export function selectVerse(verseId) {
  // ... existing highlight + study panel code ...

  // Notify mobile UI
  document.dispatchEvent(new CustomEvent('verseSelected', { detail: { verseId } }));
}
```

### 4. Chapter boundary guard

Prevent navigating past the last chapter. Update `navigate()`:

```js
export async function navigate(bookId, chapterNum) {
  // Clamp chapter number — get max from the chapter grid
  const chapterBtns = document.querySelectorAll('.chapter-btn');
  const maxChapter  = chapterBtns.length || 150; // fallback
  const safeChapter = Math.max(1, Math.min(chapterNum, maxChapter));

  if (safeChapter !== chapterNum && chapterBtns.length > 0) {
    // Already at boundary — do nothing
    return;
  }

  state.book    = bookId;
  state.chapter = safeChapter;
  // ... rest of existing navigate() code ...
}
```

---

## Prev / Next chapter buttons

Add these to `index.html` inside `.bible-panel`, above the text columns:

```html
<div class="chapter-nav-bar">
  <button class="btn btn--ghost chapter-nav-btn" id="prevChapterBtn" style="color:var(--color-accent);background:none;border:1px solid var(--color-border);">← Prev</button>
  <span class="chapter-nav-label" id="chapterNavLabel">John 1</span>
  <button class="btn btn--ghost chapter-nav-btn" id="nextChapterBtn" style="color:var(--color-accent);background:none;border:1px solid var(--color-border);">Next →</button>
</div>
```

Style:

```css
.chapter-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  flex-shrink: 0;
}

.chapter-nav-label {
  font-family: var(--font-serif);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-accent);
}
```

Wire them in `app.js` inside `init()`:

```js
document.getElementById('prevChapterBtn')?.addEventListener('click', () => {
  if (state.chapter > 1) navigate(state.book, state.chapter - 1);
});
document.getElementById('nextChapterBtn')?.addEventListener('click', () => {
  navigate(state.book, state.chapter + 1);
});
```

Update the label in `navigate()`:

```js
const label = document.getElementById('chapterNavLabel');
if (label) label.textContent = `${state.bookName} ${safeChapter}`;
```

---

## Testing steps

### Desktop
1. Press `→` key → advances to next chapter.
2. Press `←` key → goes to previous chapter.
3. Press `→` at the last chapter of a book → nothing happens (no crash).
4. Reload the page → it reopens at the last chapter you were reading.

### Tablet (use browser DevTools → 768px viewport)
1. Three-column layout becomes two-column.
2. Study panel is hidden.
3. Click a verse → study panel slides up from the bottom.
4. Click the overlay (grey area behind the sheet) → panel slides back down.
5. Prev/Next buttons work.

### Mobile (375px viewport)
1. Nav sidebar is hidden; "☰ Books" button is visible in top bar.
2. Click "☰ Books" → nav drawer slides in from left.
3. Tap a book → drawer closes and that book loads.
4. Click a verse → full-height study panel slides up.
5. Press Escape → panel slides down.
6. Prev/Next chapter buttons are easily tappable.

### General UX
1. Selected verse has a left red bar (not just yellow background) — easier to find while scrolling.
2. Fonts render sharply (antialiased).
3. Scrolling within the bible panel is smooth.

## Done when

- [ ] Mobile layout works at 375px width
- [ ] Tablet layout works at 768px width
- [ ] Nav drawer opens and closes on mobile
- [ ] Study panel is a bottom sheet on mobile/tablet
- [ ] Prev/Next chapter buttons exist and work
- [ ] Keyboard arrow keys navigate chapters
- [ ] Last-read position restores on page reload
- [ ] Language preference restores on page reload
- [ ] No layout overflow or horizontal scroll at any viewport width
- [ ] No console errors
