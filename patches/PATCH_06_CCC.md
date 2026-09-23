# PATCH 06 — Catechism References (CCC)

## After this patch the user can

Click any verse → switch to the Catechism tab → see which paragraphs of the Catechism of the Catholic Church reference this verse. Click a paragraph number → opens that paragraph on Vatican.va in a new tab.

## Prerequisites

- Patch 05 complete (`js/refs.js` exists)

## Files to create

- `data/ccc-refs.json`

## Files to modify

- `js/refs.js` — add `loadCccRefs()` function
- `js/app.js` — call `loadCccRefs()` on verse select

---

## data/ccc-refs.json

This is a static lookup table: verse ID → array of CCC paragraph numbers.

The seed data below covers the most-referenced verses. Expand it as you study.

```json
{
  "GEN.1.1":  [279, 290, 337, 338],
  "GEN.1.2":  [243, 291, 703],
  "GEN.1.26": [355, 356, 357, 1700, 1701],
  "GEN.1.27": [369, 383, 1604, 2331],
  "GEN.1.28": [307, 372, 2331, 2415],
  "GEN.2.2":  [314, 345, 2184],
  "GEN.2.7":  [362, 703],
  "GEN.2.17": [396, 400],
  "GEN.2.24": [1605, 2335],
  "GEN.3.15": [410, 411, 489, 726],
  "GEN.12.1": [59, 145],
  "GEN.15.6": [146, 1819],
  "GEN.22.18":[705, 706],
  "EXO.3.14": [203, 210, 213],
  "EXO.19.6": [62, 709, 762],
  "EXO.20.1": [2056, 2057, 2058],
  "EXO.20.2": [2084, 2085],
  "EXO.20.7": [2142, 2143],
  "EXO.20.8": [2168, 2169],
  "EXO.20.12":[2196, 2197],
  "EXO.20.13":[2258, 2259],
  "EXO.20.14":[2331, 2332],
  "EXO.20.15":[2401, 2402],
  "EXO.20.16":[2464, 2465],
  "EXO.20.17":[2534, 2535],
  "LEV.19.18": [2055, 2196],
  "DEU.6.4":  [228, 2083],
  "DEU.6.5":  [2055, 2083],
  "PSA.2.7":  [441, 536],
  "PSA.22.1": [603],
  "PSA.51.12":[1432],
  "PSA.110.4":[1544],
  "PSA.119.105":[141],
  "PRO.8.1":  [288, 721],
  "WIS.11.24":[301, 373],
  "WIS.13.1": [32, 287],
  "SIR.17.7": [1704],
  "ISA.7.14": [497],
  "ISA.9.6":  [712],
  "ISA.40.3": [523],
  "ISA.42.1": [436, 713],
  "ISA.44.6": [212],
  "ISA.53.4": [601],
  "ISA.53.11":[623],
  "ISA.61.1": [436, 714],
  "JER.31.31":[64, 715, 762],
  "EZK.36.26":[715, 1432],
  "DAN.12.2": [998, 1038],
  "MAL.3.1":  [719],
  "MAT.1.21": [430],
  "MAT.3.15": [536],
  "MAT.5.3":  [1716, 2546],
  "MAT.5.8":  [1720, 2518],
  "MAT.5.17": [577, 578],
  "MAT.5.20": [1968],
  "MAT.5.44": [1825, 1933],
  "MAT.5.48": [1693, 2013],
  "MAT.6.9":  [2759, 2777],
  "MAT.6.10": [2632, 2816, 2821],
  "MAT.6.11": [2837],
  "MAT.6.12": [2838, 2839],
  "MAT.7.12": [1789, 1970],
  "MAT.16.18":[552, 553, 881],
  "MAT.16.19":[553, 1444],
  "MAT.18.20":[1348],
  "MAT.22.37":[2055, 2083],
  "MAT.22.39":[2055, 2196],
  "MAT.26.26":[1337, 1338, 1339],
  "MAT.26.27":[1339, 1365],
  "MAT.28.19":[849, 1223, 1226],
  "MAT.28.20":[788, 860],
  "MRK.1.15": [1427, 1430],
  "MRK.10.45":[608, 786],
  "MRK.16.16":[1257],
  "LUK.1.28": [490, 491, 2676],
  "LUK.1.35": [484, 485, 486],
  "LUK.1.38": [148, 494, 2617],
  "LUK.1.46": [2619, 2675],
  "LUK.2.14": [333, 559],
  "LUK.2.52": [472, 473],
  "LUK.10.27":[2055],
  "LUK.15.20":[1439, 2795],
  "LUK.22.19":[1341, 1342],
  "LUK.22.20":[611, 1365],
  "LUK.24.26":[557],
  "JHN.1.1":  [241, 291, 454],
  "JHN.1.3":  [268, 291, 320],
  "JHN.1.14": [423, 456, 461],
  "JHN.1.18": [240, 261],
  "JHN.1.29": [523, 608],
  "JHN.2.1":  [495, 2618],
  "JHN.3.5":  [1215, 1225, 1226],
  "JHN.3.16": [457, 458, 733],
  "JHN.6.35": [1338],
  "JHN.6.51": [1406, 1413],
  "JHN.6.53": [1384],
  "JHN.8.32": [1741],
  "JHN.10.11":[754],
  "JHN.10.30":[255],
  "JHN.13.34":[1823, 1970],
  "JHN.14.6": [459],
  "JHN.14.26":[243, 692, 729],
  "JHN.15.5": [755, 787],
  "JHN.15.13":[609],
  "JHN.16.13":[243, 687, 692],
  "JHN.17.3": [1721],
  "JHN.19.30":[607, 730],
  "JHN.20.22":[976, 1485, 1087],
  "JHN.20.23":[1441, 1461],
  "ACT.2.38": [1226, 1427, 1473],
  "ACT.2.42": [1342],
  "ACT.9.4":  [598],
  "ROM.1.20": [32, 287],
  "ROM.3.23": [401, 430],
  "ROM.5.12": [385, 402, 403],
  "ROM.5.19": [411, 615],
  "ROM.6.3":  [1227, 1262],
  "ROM.6.4":  [628, 654, 1227],
  "ROM.8.15": [693, 736, 2766],
  "ROM.8.26": [741, 2559, 2630],
  "ROM.12.1": [2031],
  "1CO.6.19": [798, 1265],
  "1CO.11.26":[1344, 1362],
  "1CO.12.13":[694, 798],
  "1CO.15.3": [619, 651],
  "1CO.15.22":[605],
  "1CO.15.28":[674],
  "2CO.5.17": [1214, 1265],
  "GAL.3.27": [1227],
  "GAL.4.4":  [422, 484],
  "GAL.5.22": [736, 1832],
  "EPH.1.3":  [1077],
  "EPH.1.10": [518, 772, 1043],
  "EPH.2.8":  [1996],
  "EPH.4.5":  [866],
  "EPH.5.25": [1616],
  "PHP.2.6":  [461, 472],
  "COL.1.15": [241, 381, 1701],
  "COL.1.18": [792, 1138],
  "1TI.2.5":  [480],
  "HEB.2.17": [1]  ,
  "HEB.4.15": [467, 609],
  "HEB.10.5": [606],
  "JAB.2.14": [1815],
  "JAS.5.14": [1499, 1510, 1519],
  "1PE.2.5":  [784, 901, 1141],
  "1PE.2.9":  [782, 784, 1141],
  "1JN.1.8":  [827, 1425],
  "1JN.3.2":  [163, 1023, 1720],
  "1JN.4.8":  [214, 221, 733],
  "1JN.4.16": [221, 733],
  "REV.1.6":  [782, 786],
  "REV.4.11": [293],
  "REV.5.9":  [605],
  "REV.21.1": [1042, 1043, 1044],
  "REV.21.5": [314, 677, 1044],
  "REV.22.20":[671, 1130, 2853]
}
```

---

## js/refs.js — add loadCccRefs()

Add this function to `refs.js`:

```js
export async function loadCccRefs(verseId) {
  const pane = document.getElementById('paneCcc');
  if (!pane) return;

  pane.innerHTML = '<div class="loading-block"><div class="skeleton"></div><div class="skeleton"></div></div>';

  try {
    const refs = await getCccRefs(); // already defined in refs.js
    const paragraphs = refs[verseId] || [];

    if (paragraphs.length === 0) {
      pane.innerHTML = `
        <p class="placeholder-msg" style="margin-bottom:1rem">
          No Catechism references indexed for this verse yet.
        </p>
        <a href="https://www.vatican.va/archive/ENG0015/_INDEX.HTM"
          target="_blank" rel="noopener" class="ref-link">
          Browse the full CCC on Vatican.va ↗
        </a>`;
      return;
    }

    const rows = paragraphs.map(num => `
      <div class="ref-item">
        <a class="ref-link" 
           href="https://www.vatican.va/archive/ENG0015/__P${paragraphAnchor(num)}.HTM"
           target="_blank" rel="noopener">
          §${num}
        </a>
        <span class="ref-text">${CCC_TITLES[num] || 'Catechism of the Catholic Church'}</span>
      </div>
    `).join('');

    pane.innerHTML = `
      ${rows}
      <div class="fn-usccb-link" style="margin-top:0.75rem">
        <a href="https://www.vatican.va/archive/ENG0015/_INDEX.HTM"
          target="_blank" rel="noopener" class="ref-link">
          Full CCC index on Vatican.va ↗
        </a>
      </div>`;

  } catch (err) {
    pane.innerHTML = `<div class="error-msg">Could not load CCC references.<br>
      <small>${err.message}</small></div>`;
  }
}

// Convert paragraph number to Vatican.va anchor code
// Vatican.va uses base-26-ish hex anchors — simplest approach: link to the index
// and let the user navigate. For key paragraphs, deep links work like this:
function paragraphAnchor(num) {
  // Vatican.va CCC anchor format is not easily computable.
  // Fallback: link to the USCCB's catechism which supports #paragraph anchors.
  // Override the link href in the template above to use USCCB instead:
  return num; // placeholder — see note below
}
```

**Note on Vatican.va deep links:** The anchor format on Vatican.va is not easily computable from paragraph numbers. Replace the href in the template above with:

```
https://www.usccb.org/sites/default/files/flipbooks/catechism/index.html#${num}
```

Or, even simpler and most reliable — direct USCCB search:

```
https://www.usccb.org/search?q=catechism+%23${num}
```

The cleanest reliable deep link is:
```
https://www.catholicculture.org/culture/library/catechism/index.cfm?recnum=${num}
```

Use `catholicculture.org` as the deep link target — it supports paragraph number URLs and is a reputable Catholic source.

Update the `href` in the rows template accordingly:

```js
href="https://www.catholicculture.org/culture/library/catechism/index.cfm?recnum=${num}"
```

---

## Optional: CCC_TITLES lookup

For major paragraphs, add a short description so the user knows what they're clicking before opening:

```js
const CCC_TITLES = {
  1:    'The Life of Man — to know and love God',
  27:   'The desire for God',
  50:   'Why God revealed himself',
  101:  'The Sacred Scriptures',
  142:  'Faith',
  199:  'The Nicene Creed — "I believe in one God"',
  222:  'The implications of faith in one God',
  268:  'God is almighty',
  279:  'Creation — the foundation of God\'s saving plans',
  355:  'Man made in God\'s image',
  385:  'Original sin',
  422:  'The Son of God — born of the Virgin Mary',
  456:  'Why the Word became flesh',
  484:  'The Annunciation — the Incarnation begins',
  512:  'The mysteries of Christ\'s life',
  599:  'Christ\'s redemptive death',
  638:  'The Resurrection of Jesus',
  683:  'The Holy Spirit',
  748:  'The Church',
  857:  'The Church is apostolic',
  963:  'Mary — Mother of Christ, Mother of the Church',
  1021: 'Death and judgment',
  1077: 'The Liturgy',
  1113: 'The Sacraments',
  1210: 'Baptism',
  1285: 'Confirmation',
  1322: 'The Eucharist',
  1422: 'Penance and Reconciliation',
  1499: 'Anointing of the Sick',
  1536: 'Holy Orders',
  1601: 'Matrimony',
  1700: 'Man\'s vocation — life in the Spirit',
  1716: 'The Beatitudes',
  1803: 'The virtues',
  1846: 'Sin',
  1949: 'The moral law',
  2052: 'The Ten Commandments',
  2558: 'Prayer',
  2700: 'The life of prayer',
  2759: 'The Lord\'s Prayer',
};
```

---

## js/app.js — call loadCccRefs on verse select

Add the import:
```js
import { loadXRefs, loadCccRefs } from './refs.js';
```

In `selectVerse()`, after `loadXRefs(verseId)`, add:
```js
loadCccRefs(verseId);
```

---

## Testing steps

1. Click John 1:1 → switch to Catechism tab → see §241, §291, §454.
2. Click §241 → opens catholicculture.org in a new tab on the correct paragraph.
3. Click Genesis 1:26 → see §355, §356, §357, §1700, §1701 with descriptions.
4. Click a verse not in the dataset (e.g. a minor prophet verse) → see "No Catechism references indexed" with a link to the full CCC index.

## Done when

- [ ] `data/ccc-refs.json` exists with the seed data
- [ ] Catechism tab shows paragraph numbers for indexed verses
- [ ] Clicking a paragraph opens the correct page on catholicculture.org
- [ ] Fallback message + full CCC link shows for un-indexed verses
- [ ] No console errors
