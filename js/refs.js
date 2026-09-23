// Cross-reference and CCC lookup module
let _crossRefs = null;
let _cccRefs   = null;

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}

async function getCrossRefs() {
  if (!_crossRefs) _crossRefs = await loadJson('./data/cross-refs.json');
  return _crossRefs;
}

export async function getCccRefs() {
  if (!_cccRefs) _cccRefs = await loadJson('./data/ccc-refs.json');
  return _cccRefs;
}

// ── Cross-reference display ───────────────────────────────

// book ID → human-readable name map (abbreviated)
const BOOK_NAMES = {
  GEN:'Gen',EXO:'Exod',LEV:'Lev',NUM:'Num',DEU:'Deut',JOS:'Josh',JDG:'Judg',
  RUT:'Ruth','1SA':'1 Sam','2SA':'2 Sam','1KI':'1 Kgs','2KI':'2 Kgs',
  '1CH':'1 Chr','2CH':'2 Chr',EZR:'Ezra',NEH:'Neh',EST:'Est',JOB:'Job',
  PSA:'Ps',PRO:'Prov',ECC:'Eccl',SNG:'Song',WIS:'Wis',SIR:'Sir',
  ISA:'Isa',JER:'Jer',LAM:'Lam',BAR:'Bar',EZK:'Ezek',DAN:'Dan',
  HOS:'Hos',JOL:'Joel',AMO:'Amos',OBA:'Obad',JON:'Jonah',MIC:'Mic',
  NAH:'Nah',HAB:'Hab',ZEP:'Zeph',HAG:'Hag',ZEC:'Zech',MAL:'Mal',
  MAT:'Matt',MRK:'Mark',LUK:'Luke',JHN:'John',ACT:'Acts',ROM:'Rom',
  '1CO':'1 Cor','2CO':'2 Cor',GAL:'Gal',EPH:'Eph',PHP:'Phil',COL:'Col',
  '1TH':'1 Thess','2TH':'2 Thess','1TI':'1 Tim','2TI':'2 Tim',TIT:'Titus',
  PHM:'Phlm',HEB:'Heb',JAS:'Jas','1PE':'1 Pet','2PE':'2 Pet',
  '1JN':'1 John','2JN':'2 John','3JN':'3 John',JUD:'Jude',REV:'Rev',
};

function verseLabel(verseId) {
  const [book, ch, v] = verseId.split('.');
  return `${BOOK_NAMES[book] || book} ${ch}:${v}`;
}

export async function loadXRefs(verseId) {
  const pane = document.getElementById('paneXref');
  if (!pane) return;

  pane.innerHTML = '<div class="loading-block"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>';

  try {
    const refs = await getCrossRefs();
    const matches = refs[verseId] || [];

    if (matches.length === 0) {
      pane.innerHTML = '<p class="placeholder-msg">No cross-references found for this verse.</p>';
      return;
    }

    const rows = matches.map(refId => {
      const label = verseLabel(refId);
      return `<div class="ref-item">
        <span class="ref-link" data-verse="${refId}">${label}</span>
      </div>`;
    }).join('');

    pane.innerHTML = `
      <p style="font-size:0.78rem; color:var(--color-text-muted); margin-bottom:0.75rem;">
        ${matches.length} cross-reference${matches.length !== 1 ? 's' : ''} — click to navigate
      </p>
      ${rows}
    `;

    // Attach click handlers
    pane.querySelectorAll('[data-verse]').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        import('./app.js').then(({ navigate }) => {
          const [book, ch] = el.dataset.verse.split('.');
          navigate(book, parseInt(ch));
          // After navigation, highlight the specific verse
          setTimeout(() => {
            import('./app.js').then(({ selectVerse }) => selectVerse(el.dataset.verse));
          }, 800); // wait for chapter to load
        });
      });
    });

  } catch (err) {
    pane.innerHTML = `<div class="error-msg">Could not load cross-references.<br><small>${err.message}</small>
      <br><br>Have you run <code>node scripts/process-cross-refs.mjs</code>?</div>`;
  }
}
