# PATCH 07 — Interactive Map

## After this patch the user can

Click the Map tab in the study panel → see a Leaflet map of the Holy Land with biblical places marked. Navigating to Acts shows Paul's missionary journeys as coloured paths. Clicking a place marker shows its name and description.

## Prerequisites

- Patch 06 complete
- Leaflet CSS is already in `index.html` from Patch 01

## Files to create

- `data/places.json`
- `data/journeys.json`
- `js/map.js`

## Files to modify

- `index.html` — add map container inside the map pane
- `js/app.js` — init map on first load; filter map on navigate
- `style.css` — map container sizing

---

## data/places.json

Key biblical locations with coordinates and which books reference them.

```json
[
  { "id":"jerusalem",    "name":"Jerusalem",            "lat":31.7683,"lng":35.2137, "books":["GEN","PSA","ISA","JER","MAT","MRK","LUK","JHN","ACT","REV"], "desc":"Holy city; site of the Temple, the Last Supper, the Passion, and Resurrection." },
  { "id":"bethlehem",    "name":"Bethlehem",            "lat":31.7054,"lng":35.2024, "books":["RUT","MIC","MAT","LUK"],                                     "desc":"Birthplace of David and of Jesus." },
  { "id":"nazareth",     "name":"Nazareth",             "lat":32.6996,"lng":35.3035, "books":["MAT","MRK","LUK","JHN"],                                     "desc":"Hometown of Jesus; site of the Annunciation." },
  { "id":"capernaum",    "name":"Capernaum",            "lat":32.8808,"lng":35.5751, "books":["MAT","MRK","LUK","JHN"],                                     "desc":"Jesus' base of ministry in Galilee; Peter's house was here." },
  { "id":"sea-galilee",  "name":"Sea of Galilee",       "lat":32.8321,"lng":35.6011, "books":["MAT","MRK","LUK","JHN"],                                     "desc":"Jesus walked on the water and calmed the storm here. Several disciples were fishermen on this lake." },
  { "id":"cana",         "name":"Cana",                 "lat":32.7429,"lng":35.3503, "books":["JHN"],                                                       "desc":"Site of the Wedding at Cana — Jesus' first sign." },
  { "id":"jordan-river", "name":"Jordan River (Baptism)","lat":31.8353,"lng":35.5497, "books":["MAT","MRK","LUK","JHN"],                                   "desc":"Jesus was baptised here by John." },
  { "id":"jericho",      "name":"Jericho",              "lat":31.8600,"lng":35.4444, "books":["JOS","LUK"],                                                 "desc":"The Israelites miraculously captured Jericho. Zacchaeus lived here." },
  { "id":"bethany",      "name":"Bethany",              "lat":31.7693,"lng":35.2646, "books":["MAT","MRK","LUK","JHN"],                                     "desc":"Home of Mary, Martha, and Lazarus. Jesus raised Lazarus here." },
  { "id":"samaria",      "name":"Samaria (Shechem)",    "lat":32.2085,"lng":35.2751, "books":["GEN","JHN","ACT"],                                           "desc":"Jacob's well was here; Jesus spoke with the Samaritan woman." },
  { "id":"mt-tabor",     "name":"Mount of Transfiguration","lat":32.6868,"lng":35.3943, "books":["MAT","MRK","LUK"],                                       "desc":"Traditional site of the Transfiguration of Jesus." },
  { "id":"mount-sinai",  "name":"Mount Sinai",          "lat":28.5390,"lng":33.9750, "books":["EXO","DEU","GAL"],                                           "desc":"God gave Moses the Ten Commandments here. Elijah also fled here." },
  { "id":"egypt",        "name":"Egypt (Goshen)",        "lat":30.8000,"lng":31.9000, "books":["GEN","EXO","MAT"],                                          "desc":"Joseph was sold into slavery here; the Israelites were enslaved; Jesus fled here as a child." },
  { "id":"red-sea",      "name":"Red Sea Crossing (approx.)","lat":29.5000,"lng":32.6000, "books":["EXO"],                                                  "desc":"God parted the sea for the Israelites to cross on dry land." },
  { "id":"babylon",      "name":"Babylon",              "lat":32.5420,"lng":44.4210, "books":["2KI","ISA","JER","DAN","REV"],                               "desc":"Capital of the Babylonian Empire; site of the Exile. Used symbolically in Revelation." },
  { "id":"ur",           "name":"Ur of the Chaldeans",  "lat":30.9600,"lng":46.1030, "books":["GEN"],                                                      "desc":"Abraham's birthplace." },
  { "id":"haran",        "name":"Haran",                "lat":36.8650,"lng":39.0270, "books":["GEN"],                                                      "desc":"Abraham stopped here on the way to Canaan." },
  { "id":"hebron",       "name":"Hebron / Mamre",       "lat":31.5330,"lng":35.0950, "books":["GEN","NUM"],                                                 "desc":"Abraham lived here. The Cave of Machpelah (Patriarchs' tomb) is here." },
  { "id":"bethel",       "name":"Bethel",               "lat":31.9249,"lng":35.2280, "books":["GEN","AMO","HOS"],                                           "desc":"Jacob's dream of the ladder to heaven took place here." },
  { "id":"antioch-syria","name":"Antioch (Syria)",      "lat":36.2021,"lng":36.1606, "books":["ACT","GAL"],                                                 "desc":"First city where followers of Jesus were called 'Christians'. Base for Paul's missionary journeys." },
  { "id":"antioch-pisidia","name":"Antioch (Pisidian)", "lat":38.3050,"lng":31.2080, "books":["ACT"],                                                      "desc":"Paul preached his first major recorded sermon here." },
  { "id":"ephesus",      "name":"Ephesus",              "lat":37.9390,"lng":27.3410, "books":["ACT","EPH","REV"],                                           "desc":"Major city of Asia Minor. Paul spent over 2 years here. Addressed in Revelation." },
  { "id":"corinth",      "name":"Corinth",              "lat":37.9060,"lng":22.8790, "books":["ACT","1CO","2CO"],                                           "desc":"Paul spent 18 months here. Two of his letters are addressed to this church." },
  { "id":"philippi",     "name":"Philippi",             "lat":41.0120,"lng":24.2870, "books":["ACT","PHP"],                                                 "desc":"First European city where Paul preached. Lydia was converted here." },
  { "id":"thessalonica", "name":"Thessalonica",         "lat":40.6401,"lng":22.9444, "books":["ACT","1TH","2TH"],                                           "desc":"Paul preached here for three Sabbaths. Two letters addressed to this church." },
  { "id":"athens",       "name":"Athens",               "lat":37.9795,"lng":23.7162, "books":["ACT"],                                                      "desc":"Paul preached at the Areopagus (Mars Hill), referencing the altar 'To the Unknown God'." },
  { "id":"rome",         "name":"Rome",                 "lat":41.9028,"lng":12.4964, "books":["ACT","ROM","PHP","2TI","1PE"],                               "desc":"Paul was imprisoned and martyred here. Peter also died here." },
  { "id":"malta",        "name":"Malta",                "lat":35.9375,"lng":14.3754, "books":["ACT"],                                                      "desc":"Paul was shipwrecked here on the way to Rome." },
  { "id":"patmos",       "name":"Patmos",               "lat":37.3200,"lng":26.5500, "books":["REV"],                                                      "desc":"John received the Book of Revelation on this island while exiled." },
  { "id":"damascus",     "name":"Damascus",             "lat":33.5138,"lng":36.2765, "books":["GEN","ACT","GAL"],                                           "desc":"Paul was struck blind and converted on the road to Damascus." },
  { "id":"caesarea",     "name":"Caesarea Maritima",    "lat":32.5025,"lng":34.8910, "books":["ACT"],                                                      "desc":"Roman capital of Judea. Peter baptised Cornelius here. Paul was imprisoned here." },
  { "id":"cyprus",       "name":"Cyprus (Salamis/Paphos)","lat":35.1856,"lng":33.3823, "books":["ACT"],                                                    "desc":"Barnabas' homeland. Paul and Barnabas began their first journey here." },
  { "id":"mt-carmel",   "name":"Mount Carmel",          "lat":32.7356,"lng":34.9681, "books":["1KI"],                                                      "desc":"Elijah confronted the prophets of Baal here." },
  { "id":"nineveh",     "name":"Nineveh",               "lat":36.3590,"lng":43.1530, "books":["JON","NAH"],                                                "desc":"Jonah preached repentance here; the city repented. Later destroyed as Nahum prophesied." },
  { "id":"tyre",        "name":"Tyre",                  "lat":33.2705,"lng":35.1948, "books":["ISA","EZK","MAT","ACT"],                                     "desc":"Ancient Phoenician city; Paul spent a week here on his third journey." },
  { "id":"caesarea-philippi","name":"Caesarea Philippi","lat":33.2480,"lng":35.6920, "books":["MAT","MRK"],                                                 "desc":"Peter's confession of faith — 'You are the Christ' — was made here." }
]
```

---

## data/journeys.json

Named biblical paths drawn as polylines on the map.

```json
[
  {
    "id":"exodus", "name":"The Exodus", "books":["EXO","NUM","DEU"],
    "color":"#c0392b", "dash":"8,4",
    "waypoints":[
      {"name":"Goshen (Egypt)","lat":30.8,"lng":31.9},
      {"name":"Red Sea Crossing (approx.)","lat":29.5,"lng":32.6},
      {"name":"Marah","lat":28.9,"lng":33.1},
      {"name":"Mount Sinai","lat":28.539,"lng":33.975},
      {"name":"Kadesh-Barnea","lat":30.683,"lng":34.390},
      {"name":"Plains of Moab","lat":31.760,"lng":35.576}
    ]
  },
  {
    "id":"paul-1", "name":"Paul — 1st Journey", "books":["ACT"],
    "color":"#2980b9", "dash":"none",
    "waypoints":[
      {"name":"Antioch (Syria)","lat":36.202,"lng":36.160},
      {"name":"Salamis (Cyprus)","lat":35.185,"lng":33.896},
      {"name":"Paphos","lat":34.775,"lng":32.424},
      {"name":"Perga","lat":36.960,"lng":30.854},
      {"name":"Pisidian Antioch","lat":38.305,"lng":31.208},
      {"name":"Iconium","lat":37.874,"lng":32.494},
      {"name":"Lystra","lat":37.571,"lng":32.314},
      {"name":"Derbe","lat":37.359,"lng":33.415},
      {"name":"Antioch (Syria)","lat":36.202,"lng":36.160}
    ]
  },
  {
    "id":"paul-2", "name":"Paul — 2nd Journey", "books":["ACT"],
    "color":"#27ae60", "dash":"none",
    "waypoints":[
      {"name":"Antioch (Syria)","lat":36.202,"lng":36.160},
      {"name":"Lystra","lat":37.571,"lng":32.314},
      {"name":"Troas","lat":39.791,"lng":26.238},
      {"name":"Philippi","lat":41.012,"lng":24.287},
      {"name":"Thessalonica","lat":40.640,"lng":22.944},
      {"name":"Berea","lat":40.519,"lng":22.206},
      {"name":"Athens","lat":37.979,"lng":23.727},
      {"name":"Corinth","lat":37.906,"lng":22.879},
      {"name":"Ephesus","lat":37.939,"lng":27.341},
      {"name":"Caesarea Maritima","lat":32.502,"lng":34.891},
      {"name":"Antioch (Syria)","lat":36.202,"lng":36.160}
    ]
  },
  {
    "id":"paul-3", "name":"Paul — 3rd Journey", "books":["ACT"],
    "color":"#8e44ad", "dash":"none",
    "waypoints":[
      {"name":"Antioch (Syria)","lat":36.202,"lng":36.160},
      {"name":"Ephesus","lat":37.939,"lng":27.341},
      {"name":"Philippi","lat":41.012,"lng":24.287},
      {"name":"Corinth","lat":37.906,"lng":22.879},
      {"name":"Miletus","lat":37.530,"lng":27.277},
      {"name":"Tyre","lat":33.270,"lng":35.194},
      {"name":"Caesarea Maritima","lat":32.502,"lng":34.891},
      {"name":"Jerusalem","lat":31.768,"lng":35.214}
    ]
  },
  {
    "id":"paul-rome", "name":"Paul — Voyage to Rome", "books":["ACT"],
    "color":"#e67e22", "dash":"6,3",
    "waypoints":[
      {"name":"Caesarea Maritima","lat":32.502,"lng":34.891},
      {"name":"Sidon","lat":33.563,"lng":35.370},
      {"name":"Myra (Lycia)","lat":36.260,"lng":29.986},
      {"name":"Malta","lat":35.937,"lng":14.375},
      {"name":"Syracuse (Sicily)","lat":37.075,"lng":15.287},
      {"name":"Rome","lat":41.902,"lng":12.496}
    ]
  },
  {
    "id":"holy-family", "name":"Flight into Egypt", "books":["MAT"],
    "color":"#f39c12", "dash":"5,5",
    "waypoints":[
      {"name":"Bethlehem","lat":31.705,"lng":35.200},
      {"name":"Egypt (approx.)","lat":30.1,"lng":31.2},
      {"name":"Nazareth","lat":32.700,"lng":35.303}
    ]
  },
  {
    "id":"abraham", "name":"Abraham's Journey", "books":["GEN"],
    "color":"#16a085", "dash":"8,4",
    "waypoints":[
      {"name":"Ur of the Chaldeans","lat":30.960,"lng":46.103},
      {"name":"Haran","lat":36.865,"lng":39.027},
      {"name":"Shechem","lat":32.208,"lng":35.275},
      {"name":"Bethel","lat":31.925,"lng":35.228},
      {"name":"Egypt","lat":30.1,"lng":31.2},
      {"name":"Hebron / Mamre","lat":31.533,"lng":35.095}
    ]
  }
]
```

---

## js/map.js

```js
import { state } from './app.js';

let _map      = null;
let _markers  = [];
let _polylines = [];
let _places   = [];
let _journeys = [];
let _legend   = null;

export async function initMap() {
  if (state.mapInitialised) return;
  state.mapInitialised = true;

  // Load data files in parallel
  const [placesRes, journeysRes] = await Promise.all([
    fetch('./data/places.json').then(r => r.json()),
    fetch('./data/journeys.json').then(r => r.json()),
  ]);
  _places   = placesRes;
  _journeys = journeysRes;

  // Create map inside the map pane container
  const container = document.getElementById('mapContainer');
  if (!container) return;

  _map = L.map(container, {
    center:    [31.77, 35.21], // Jerusalem
    zoom:      6,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(_map);

  drawAll();
  addLegend();
}

function drawAll() {
  clearMap();
  const book = state.book;

  // Place markers
  _places.forEach(place => {
    if (!place.books.includes(book)) return;
    const marker = L.circleMarker([place.lat, place.lng], {
      radius:      8,
      fillColor:   '#8b1a1a',
      color:       '#fff',
      weight:      2,
      opacity:     1,
      fillOpacity: 0.85,
    }).addTo(_map);

    marker.bindPopup(`
      <strong>${place.name}</strong><br>
      <span style="font-size:0.85em;color:#555">${place.desc}</span>
    `);
    _markers.push(marker);
  });

  // Journey paths
  const activeJourneys = _journeys.filter(j => j.books.includes(book));
  activeJourneys.forEach(journey => {
    const latlngs = journey.waypoints.map(w => [w.lat, w.lng]);
    const dashArray = journey.dash === 'none' ? null : journey.dash;
    const line = L.polyline(latlngs, {
      color:     journey.color,
      weight:    3,
      opacity:   0.85,
      dashArray,
    }).addTo(_map);
    line.bindPopup(`<strong>${journey.name}</strong>`);
    _polylines.push({ line, journey });
  });

  // Fit map to visible markers + paths
  const allLatLngs = [
    ..._markers.map(m => m.getLatLng()),
    ..._polylines.flatMap(({ journey }) =>
      journey.waypoints.map(w => L.latLng(w.lat, w.lng))
    ),
  ];

  if (allLatLngs.length > 0) {
    _map.fitBounds(L.latLngBounds(allLatLngs).pad(0.1));
  }

  updateLegend(activeJourneys);
}

function clearMap() {
  _markers.forEach(m => m.remove());
  _polylines.forEach(({ line }) => line.remove());
  _markers   = [];
  _polylines = [];
}

function addLegend() {
  _legend = L.control({ position: 'bottomleft' });
  _legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-legend');
    div.id = 'mapLegend';
    return div;
  };
  _legend.addTo(_map);
}

function updateLegend(activeJourneys) {
  const el = document.getElementById('mapLegend');
  if (!el) return;
  if (activeJourneys.length === 0) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  el.innerHTML = activeJourneys.map(j => `
    <div class="map-legend__item">
      <span class="map-legend__dot" style="background:${j.color}"></span>
      ${j.name}
    </div>
  `).join('');
}

// Called by app.js when the book changes
export function updateMapForBook(bookId) {
  if (!state.mapInitialised) return;
  drawAll();
}

// Called when user opens the Map tab (Leaflet needs invalidateSize after being hidden)
export function onMapTabOpen() {
  if (_map) {
    setTimeout(() => _map.invalidateSize(), 50);
  } else {
    initMap();
  }
}
```

---

## index.html — map pane

Replace the map tab pane placeholder with:

```html
<div class="tab-pane" data-pane="map" id="paneMap">
  <div id="mapContainer" style="height:340px; border-radius:var(--radius); overflow:hidden;"></div>
</div>
```

---

## style.css — map legend

```css
.map-legend {
  background: rgba(255,255,255,0.92);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.5rem 0.75rem;
  font-size: 0.78rem;
  font-family: var(--font-sans);
  max-width: 200px;
}
.map-legend__item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.2rem;
}
.map-legend__dot {
  width:  10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
```

---

## js/app.js — integrate map

Add the imports at the top:
```js
import { updateMapForBook, onMapTabOpen } from './map.js';
```

In `navigate()`, after rendering chapters, call:
```js
updateMapForBook(bookId);
```

In `initTabs()` in `ui.js`, or in the tab click handler in `app.js`, detect when the map tab is activated:
```js
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activateTab(btn.dataset.tab);
    if (btn.dataset.tab === 'map') {
      import('./map.js').then(({ onMapTabOpen }) => onMapTabOpen());
    }
  });
});
```

Also call `initMap()` on first page load so the map is ready:
```js
import { initMap } from './map.js';
// in init():
initMap();
```

---

## Testing steps

1. Load the app. Navigate to Acts 13.
2. Open the Map tab in the study panel.
3. Paul's three missionary journeys should appear as coloured paths.
4. Place markers for Antioch, Cyprus, Ephesus, Corinth, Athens should appear.
5. A legend shows the journey names with their colours.
6. Click a marker → popup shows place name and description.
7. Navigate to Genesis 12 → map redraws showing Abraham's journey and Canaan places.
8. Navigate to Matthew 2 → Flight into Egypt path appears.
9. Close and reopen the Map tab → map renders correctly (Leaflet invalidateSize fix).

## Done when

- [ ] `data/places.json` and `data/journeys.json` exist
- [ ] Map tab shows the Leaflet map with place markers
- [ ] Journey paths appear when the current book is relevant
- [ ] Map updates automatically when navigating to a new book
- [ ] Place popups show name and description
- [ ] Legend shows active journey names
- [ ] No console errors
