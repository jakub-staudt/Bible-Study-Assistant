# PATCH 01 — Shell & Layout

## After this patch the user can

Open `index.html` in a browser and see the full three-column layout with correct fonts, colours, and spacing — even though no Bible text loads yet.

## Prerequisites

None. This is the first patch.

## Files to create

- `index.html`
- `style.css`

## Files to modify

None.

---

## index.html

Create the full HTML skeleton. No data, no API calls — just structure.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catholic Bible Study</title>

  <!-- Leaflet CSS (map, loaded early so tiles don't flash unstyled) -->
  <link rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">

  <!-- Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
    rel="stylesheet">

  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- ── Top bar ───────────────────────────────────────── -->
  <header class="top-bar">
    <div class="top-bar__brand">✝ Catholic Bible Study</div>
    <div class="top-bar__controls">
      <button class="btn btn--ghost" id="langToggle" title="Toggle language">EN / PL</button>
    </div>
  </header>

  <!-- ── Three-column layout ───────────────────────────── -->
  <div class="layout">

    <!-- Left: book + chapter navigation -->
    <nav class="nav-panel" id="navPanel">
      <div class="nav-panel__inner">
        <p class="nav-panel__hint">Navigation loads in Patch 02.</p>
      </div>
    </nav>

    <!-- Centre: Bible text -->
    <main class="bible-panel" id="biblePanel">

      <!-- English text column -->
      <section class="text-col text-col--en" id="textEn">
        <div class="text-col__lang-label">New American Bible (NABRE)</div>
        <div class="text-col__content" id="verseListEn">
          <p class="placeholder-msg">Bible text loads in Patch 02.</p>
        </div>
      </section>

      <!-- Polish text column -->
      <section class="text-col text-col--pl" id="textPl">
        <div class="text-col__lang-label">Biblia Tysiąclecia</div>
        <div class="text-col__content" id="verseListPl">
          <p class="placeholder-msg">Tekst biblijny ładuje się w Łatce 03.</p>
        </div>
      </section>

    </main>

    <!-- Right: study panel -->
    <aside class="study-panel" id="studyPanel">
      <div class="study-panel__empty">
        <span class="study-panel__empty-icon">✝</span>
        <p>Select a verse to begin studying.</p>
      </div>
    </aside>

  </div>

  <!-- App entry point — added in Patch 02 -->
  <!-- <script type="module" src="js/app.js"></script> -->

</body>
</html>
```

---

## style.css

Write the complete stylesheet. Use only the CSS custom properties defined in CLAUDE.md.

### Reset and base

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  overflow: hidden;   /* The layout controls its own scroll */
}

body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 16px;
}
```

### Top bar

```css
.top-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--top-bar-h);
  background: var(--color-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 100;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

.top-bar__brand {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.top-bar__controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
```

### Three-column grid

```css
.layout {
  display: grid;
  grid-template-columns: var(--nav-width) 1fr var(--panel-width);
  grid-template-rows: 1fr;
  height: 100vh;
  padding-top: var(--top-bar-h);
  overflow: hidden;
}
```

### Nav panel

```css
.nav-panel {
  background: var(--color-surface-alt);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  height: 100%;
}

.nav-panel__inner {
  padding: 1rem 0.75rem;
}

.nav-panel__hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* Book list items — used from Patch 02 */
.book-item {
  display: block;
  width: 100%;
  padding: 0.35rem 0.75rem;
  background: none;
  border: none;
  text-align: left;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--color-text);
  cursor: pointer;
  border-radius: var(--radius);
  transition: background 0.1s;
}
.book-item:hover  { background: var(--color-border); }
.book-item.active { background: var(--color-accent); color: #fff; font-weight: 600; }

.nav-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding: 1rem 0.75rem 0.35rem;
}

.chapter-selector {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--color-border);
  margin-top: 0.5rem;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
  margin-top: 0.35rem;
}

.chapter-btn {
  padding: 0.3rem;
  font-size: 0.78rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  cursor: pointer;
  text-align: center;
  transition: background 0.1s;
}
.chapter-btn:hover  { background: var(--color-border); }
.chapter-btn.active { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
```

### Bible panel (two text columns)

```css
.bible-panel {
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.text-col {
  padding: 1.5rem 2rem;
}

.text-col--en {
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
}

.text-col--pl {
  background: var(--color-pl-bg);
}

.text-col__lang-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.text-col__content {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text);
}

/* Individual verse */
.verse {
  display: inline;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.15s;
  padding: 0 1px;
}
.verse:hover   { background: rgba(139, 26, 26, 0.08); }
.verse.selected { background: var(--color-highlight); }

.verse-num {
  font-size: 0.65em;
  font-weight: 700;
  color: var(--color-accent);
  vertical-align: super;
  margin-right: 3px;
  user-select: none;
}

.fn-marker {
  font-size: 0.65em;
  color: var(--color-accent);
  vertical-align: super;
  cursor: help;
}

.chapter-heading {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-accent);
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.placeholder-msg {
  color: var(--color-text-muted);
  font-style: italic;
}
```

### Study panel

```css
.study-panel {
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.study-panel__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
}

.study-panel__empty-icon {
  font-size: 2.5rem;
  color: var(--color-border);
}

/* Tabs — populated in Patch 04 */
.tabs {
  display: flex;
  border-bottom: 2px solid var(--color-border);
  background: var(--color-surface-alt);
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 0.65rem 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
}
.tab-btn:hover  { color: var(--color-text); }
.tab-btn.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }

.tab-pane {
  display: none;
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}
.tab-pane.active { display: block; }

.verse-ref-pill {
  display: inline-block;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-accent);
  margin-bottom: 0.75rem;
}
```

### Shared button styles

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.15s, opacity 0.15s;
}
.btn--ghost {
  background: rgba(255,255,255,0.15);
  color: #fff;
}
.btn--ghost:hover { background: rgba(255,255,255,0.25); }
.btn--primary {
  background: var(--color-accent);
  color: #fff;
}
.btn--primary:hover { background: var(--color-accent-hover); }
.btn--sm { padding: 0.3rem 0.6rem; font-size: 0.75rem; }

/* External link rows used in footnotes, xref, CCC */
.ref-item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
}
.ref-item:last-child { border-bottom: none; }
.ref-link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}
.ref-link:hover { text-decoration: underline; }
.ref-text { color: var(--color-text-muted); font-style: italic; font-size: 0.85rem; }

/* Loading skeleton */
.skeleton {
  background: linear-gradient(90deg, var(--color-border) 25%, var(--color-surface-alt) 50%, var(--color-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 3px;
  height: 1em;
  margin: 0.5rem 0;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Loading/error states

```css
.loading-block .skeleton { width: 100%; }
.loading-block .skeleton:nth-child(2) { width: 88%; }
.loading-block .skeleton:nth-child(3) { width: 94%; }
.loading-block .skeleton:nth-child(4) { width: 75%; }

.error-msg {
  background: #fde8e8;
  border: 1px solid #f5c2c2;
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  color: #7b1111;
  font-size: 0.87rem;
}
```

---

## Testing steps

1. Open `index.html` directly in a browser (no server needed at this stage).
2. Verify the three columns are visible at correct proportions.
3. Verify the top bar is burgundy with white text and the cross symbol shows.
4. Verify the English panel has a white background and the Polish panel has a blue tint.
5. Verify EB Garamond loads for the brand name in the top bar (may need a local server or internet connection for fonts).
6. Resize the window — at this stage the layout may break on mobile, that is expected (fixed in Patch 09).

## Done when

- [ ] `index.html` exists with the full semantic structure above
- [ ] `style.css` exists with all custom properties and all classes listed in this patch
- [ ] The three-column layout renders correctly in a desktop browser
- [ ] No JavaScript errors in the browser console
