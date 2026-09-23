# PATCH 03 — Bilingual (English + Polish)

## After this patch the user can

Read NABRE English and Biblia Tysiąclecia Polish side-by-side, or toggle to either language alone. Both translations scroll together.

## Prerequisites

- Patch 02 complete (English NABRE loads)
- `BIBLE_ID_PL` set in `config.js` (Biblia Tysiąclecia ID found via `GET /v1/bibles`)

## Files to modify

- `js/app.js` — fetch and render both translations on navigate
- `js/bible.js` — minor: no changes needed if `renderChapter` is already generic
- `style.css` — ensure `text-col--pl` styling is correct (should be from Patch 01)
- `index.html` — verify PL text column has `.text-col__content` with id `verseListPl`

---

## Handling the case where Biblia Tysiąclecia is not on API.Bible

API.Bible may not have Biblia Tysiąclecia on the free Starter plan. If it is not available:

1. Check api.bible for any Polish Catholic translation (search "Polish")
2. If none exists, fall back to the **Biblia Gdańska** (Protestant but widely available) as a placeholder
3. If no Polish translation is available at all, render a message in the PL panel:
   ```
   Biblia Tysiąclecia nie jest dostępna w tym planie API.
   Odwiedź biblia.deon.pl, aby przeczytać w języku polskim.
   ```
   And add a prominent link to `https://biblia.deon.pl` in the PL panel.

In `state`, track this: `state.plAvailable = CONFIG.BIBLE_ID_PL !== ''`

---

## js/app.js — changes

In the `navigate()` function, after rendering English, add a parallel fetch for Polish. Both fetches run concurrently with `Promise.all` to avoid waiting sequentially.

Replace this section of `navigate()`:

```js
// Render English text
const enContainer = document.getElementById('textEn')?.querySelector('.text-col__content');
if (enContainer) {
  await renderChapter(CONFIG.BIBLE_ID_EN, bookId, chapterNum, enContainer);
}
```

With:

```js
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
```

---

## Synchronised scrolling (optional enhancement)

Both text columns are inside `.bible-panel` which scrolls as one. This is fine.

If you want EN and PL to scroll independently and in sync (when in side-by-side mode), add this to `js/app.js` after navigate():

```js
function syncScroll() {
  const en = document.getElementById('textEn');
  const pl = document.getElementById('textPl');
  if (!en || !pl) return;

  let syncing = false;

  en.addEventListener('scroll', () => {
    if (syncing) return;
    syncing = true;
    pl.scrollTop = en.scrollTop;
    syncing = false;
  });

  pl.addEventListener('scroll', () => {
    if (syncing) return;
    syncing = true;
    en.scrollTop = pl.scrollTop;
    syncing = false;
  });
}
```

Call `syncScroll()` once in `init()`. Only activate it if `langMode === 'side-by-side'`.

For this to work, each text column must have `overflow-y: auto` and a fixed height. Update `style.css`:

```css
/* Make the bible panel display side-by-side in side-by-side mode */
.bible-panel.mode-side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}

.bible-panel.mode-side-by-side .text-col {
  overflow-y: auto;
  height: 100%;
  border-right: 1px solid var(--color-border);
  border-bottom: none;
}

.bible-panel.mode-en .text-col--pl,
.bible-panel.mode-pl .text-col--en {
  display: none;
}
```

In `applyLangMode()` in `app.js`, also toggle the class on `.bible-panel`:

```js
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
```

Remove the manual `display` toggling of `textEn`/`textPl` — the CSS class handles it now.

---

## index.html — verify PL column structure

The PL column in `index.html` must have this structure (Patch 01 should have created it):

```html
<section class="text-col text-col--pl" id="textPl">
  <div class="text-col__lang-label">Biblia Tysiąclecia</div>
  <div class="text-col__content" id="verseListPl">
    <!-- populated by renderChapter -->
  </div>
</section>
```

If it's missing or different, fix it now.

---

## Testing steps

1. Open the app. John 1 loads. Both EN and PL columns should populate simultaneously.
2. Click "EN | PL" → cycles between side-by-side, EN only, PL only.
3. Navigate to a different book → both columns update together.
4. In side-by-side mode, scrolling one column should scroll the other (if sync scroll was added).
5. Set `BIBLE_ID_PL: ''` temporarily and verify the fallback message appears with the deon.pl link.

## Done when

- [ ] Both EN and PL text render simultaneously on chapter load
- [ ] Language toggle correctly shows/hides each column
- [ ] Mode preference persists across page refresh (localStorage)
- [ ] If PL unavailable, a helpful message + link to biblia.deon.pl appears
- [ ] No console errors
