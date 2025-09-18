/* ===============================
   i_seeeeeeee – Exhibitions Finder
   Single-file app.js (drop-in)
   =============================== */

// ------- Utilities -------
const $ = (sel) => document.querySelector(sel);
const $all = (sel) => Array.from(document.querySelectorAll(sel));
const byId = (id) => document.getElementById(id);

// Safe get elements (won’t crash if missing)
const els = {
  // top controls (use the IDs שקיימים אצלך אם שונים – הקוד מתמודד גם אם לא נמצאו)
  address: byId('address') || $('input[type="text"][placeholder*="כתובת"]'),
  btnGeocode: byId('btnGeocode') || $('button#geocodeBtn, button:has(> span:contains("חפש כתובת")), button:contains("חפש כתובת")'),
  btnMyLoc: byId('btnMyLoc') || $('button#myLocBtn, button:contains("במיקומי")'),
  artist: byId('artist') || $('input[placeholder*="אמן"],input[placeholder*="אמנית"]'),
  dateFrom: byId('dateFrom') || $('input[type="date"]:nth-of-type(1)'),
  dateTo: byId('dateTo') || $('input[type="date"]:nth-of-type(2)'),
  btnSync: byId('btnSync') || $('button#syncBtn, button:contains("סינון תערוכות")'),
  radius: byId('radius') || $('input[type="range"]'),
  status: byId('status') || $('.muted'),
  map: byId('map') || $('#map'),
  list: byId('results') || $('#resultsList') || $('section#results') || $('div#results'),
};
const todayISO = () => new Date().toISOString().slice(0, 10);

// ------- Demo Data (You can replace with real DB later) -------
/* כל תערוכה:
  {
    id, title, artist, venue, city, address, lat, lng,
    start: 'YYYY-MM-DD', end: 'YYYY-MM-DD',
    images: ['url1','url2',...],
    link: 'external url',
    desc: 'short text'
  }
*/
const EXHIBITIONS = [
  {
    id: 'tlv-rubin-nachum-gutman',
    title: 'ציורים מוקדמים',
    artist: 'נחום גוטמן',
    venue: 'בית ראובן',
    city: 'תל אביב',
    address: 'שד׳ רוטשילד 60, תל אביב',
    lat: 32.0656, lng: 34.7745,
    start: '2025-09-01', end: '2025-11-30',
    images: [
      'https://images.unsplash.com/photo-1559136656-3b46c0c68b13?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1600&auto=format&fit=crop'
    ],
    link: 'https://rubinmuseum.org.il',
    desc: 'מבט מחודש על שנותיו המוקדמות של הצייר נחום גוטמן.'
  },
  {
    id: 'tlv-tm-modern-voices',
    title: 'קולות מודרניים',
    artist: 'אביבה אורי',
    venue: 'מוזיאון תל אביב לאמנות',
    city: 'תל אביב',
    address: 'שדרות שאול המלך 27, תל אביב',
    lat: 32.0773, lng: 34.7871,
    start: '2025-09-10', end: '2026-01-15',
    images: [
      'https://images.unsplash.com/photo-1504198266285-165a18b73c56?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?q=80&w=1600&auto=format&fit=crop'
    ],
    link: 'https://www.tamuseum.org.il',
    desc: 'רישומים ועבודות נייר נדירות של אביבה אורי.'
  },
  {
    id: 'tlv-bialik-house-group',
    title: 'שירה חזותית',
    artist: 'קבוצת אמנים ת״א',
    venue: 'בית ביאליק',
    city: 'תל אביב',
    address: 'רח׳ ביאליק 22, תל אביב',
    lat: 32.0724, lng: 34.7721,
    start: '2025-08-20', end: '2025-10-31',
    images: [
      'https://images.unsplash.com/photo-1534791547702-70b3f1d3c4ae?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop'
    ],
    link: 'https://www.bialik-house.org.il',
    desc: 'תערוכה קבוצתית החוקרת את המפגש בין טקסט לתמונה.'
  },
  {
    id: 'tlv-ergon-solo',
    title: 'אור וחומר',
    artist: 'יעל ארגון',
    venue: 'גלריה עכשווית',
    city: 'תל אביב',
    address: 'דיזנגוף 100, תל אביב',
    lat: 32.0824, lng: 34.7746,
    start: '2025-09-05', end: '2025-10-20',
    images: [
      'https://images.unsplash.com/photo-1549887534-3db1bd59dcca?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517817748496-62b2d8f68e62?q=80&w=1600&auto=format&fit=crop'
    ],
    link: '#',
    desc: 'מיצבי אור אינטראקטיביים.'
  },
  // עיר נוספת לדוגמה
  {
    id: 'jeru-israel-museum',
    title: 'חפצים מספרים',
    artist: 'אוצרות ישראל',
    venue: 'מוזיאון ישראל',
    city: 'ירושלים',
    address: 'רות 11, ירושלים',
    lat: 31.773, lng: 35.203,
    start: '2025-07-15', end: '2025-12-31',
    images: [
      'https://images.unsplash.com/photo-1486634840631-37d598cf3f63?q=80&w=1600&auto=format&fit=crop'
    ],
    link: 'https://www.imj.org.il',
    desc: 'מסע בין חפצים וסיפורים מקומיים.'
  }
];

// ------- Followed artists (localStorage) -------
const LS_FOLLOW = 'iseee_follow_artists';
const getFollow = () => new Set(JSON.parse(localStorage.getItem(LS_FOLLOW) || '[]'));
const setFollow = (set) => localStorage.setItem(LS_FOLLOW, JSON.stringify([...set]));

// ------- Map (Leaflet) -------
let map, userMarker, userCircle;
let markersLayer = L.layerGroup();

function initMap() {
  if (!els.map) return;
  map = L.map(els.map, { zoomControl: true }).setView([31.8, 34.7], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OSM'
  }).addTo(map);
  markersLayer.addTo(map);

  // כפתור “למיקומי”
  L.Control.MyLocation = L.Control.extend({
    onAdd: function () {
      const btn = L.DomUtil.create('button', 'btn-my-loc');
      btn.title = 'חזרה למיקום שלי';
      btn.style.cssText = 'background:#fff;border:1px solid #ccc;border-radius:8px;padding:8px;box-shadow:0 1px 4px rgba(0,0,0,.2);cursor:pointer;';
      btn.innerHTML = '📍 למיקומי';
      btn.onclick = (e) => { e.preventDefault(); useMyLocation(); };
      return btn;
    },
    onRemove: function () {}
  });
  L.control.myLocation = (opts) => new L.Control.MyLocation(opts);
  L.control.myLocation({ position: 'topleft' }).addTo(map);
}

// חתול 😺 כאייקון משתמש
const catIcon = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f408.png',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// ------- Geo helpers -------
function setStatus(txt) { if (els.status) els.status.textContent = txt || ''; }
function kmToMeters(km) { return Number(km || 10) * 1000; }

async function geocodeAddress(q) {
  if (!q) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'he' } });
    const [hit] = await res.json();
    if (!hit) return null;
    return { lat: +hit.lat, lng: +hit.lon, display: hit.display_name };
  } catch { return null; }
}

function setUserLocation(lat, lng) {
  if (!map) return;
  if (userMarker) { map.removeLayer(userMarker); map.removeLayer(userCircle); }
  userMarker = L.marker([lat, lng], { icon: catIcon }).addTo(map).bindPopup('את/ה כאן 😺');
  const r = kmToMeters(els.radius?.value || 10);
  userCircle = L.circle([lat, lng], { radius: r, color: '#7c4dff', fillOpacity: 0.06 }).addTo(map);
  map.setView([lat, lng], 13);
}

function useMyLocation() {
  if (!navigator.geolocation) { setStatus('המכשיר לא תומך במיקום'); return; }
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    setUserLocation(coords.latitude, coords.longitude);
    currentCenter = { lat: coords.latitude, lng: coords.longitude };
    render();
  }, () => setStatus('לא ניתן היה לאתר מיקום'), { enableHighAccuracy: true });
}

// ------- Filtering -------
let currentCenter = null; // {lat,lng}
function inDateRange(exh, fromISO, toISO) {
  const from = fromISO || '0000-01-01';
  const to = toISO || '9999-12-31';
  return !(exh.end < from || exh.start > to);
}
function distanceKm(a, b) {
  // Haversine
  const toRad = (x) => x * Math.PI/180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function filterExhibitions() {
  const artistQ = (els.artist?.value || '').trim().toLowerCase();
  const from = els.dateFrom?.value || '';
  const to = els.dateTo?.value || '';
  const maxKm = Number(els.radius?.value || 10);

  return EXHIBITIONS.filter((ex) => {
    const byArtist = !artistQ || ex.artist.toLowerCase().includes(artistQ);
    const byDate = inDateRange(ex, from, to);
    const byDist = !currentCenter ? true : distanceKm(currentCenter, ex) <= maxKm + 0.001;
    return byArtist && byDate && byDist;
  });
}

// ------- List + Markers -------
function clearMarkers() { markersLayer.clearLayers(); }

function addMarker(ex) {
  const marker = L.marker([ex.lat, ex.lng]).addTo(markersLayer);
  marker.bindPopup(`<b>${ex.title}</b><br>${ex.artist} · ${ex.venue}<br><small>${ex.city}</small>`);
  marker.on('click', () => openModal(ex));
}

function renderList(items) {
  if (!els.list) return;
  els.list.innerHTML = '';
  if (!items.length) {
    els.list.innerHTML = `<div class="card muted" style="padding:16px;border-radius:12px;border:1px solid #333;background:#141414;color:#bbb;">לא נמצאו תערוכות בתנאים שבחרת</div>`;
    return;
  }
  const followed = getFollow();
  const frag = document.createDocumentFragment();

  items.forEach((ex) => {
    // card
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;margin:10px 0;overflow:hidden;';
    card.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;padding:12px;">
        <img src="${ex.images[0]}" alt="" style="width:84px;height:84px;object-fit:cover;border-radius:10px;border:1px solid #2a2a2a;">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700">${ex.title}</div>
          <div class="muted" style="font-size:.95rem">${ex.artist} · ${ex.venue} · ${ex.city}</div>
          <div class="muted" style="font-size:.85rem">${ex.start} – ${ex.end}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
          <button class="btn primary" data-open="${ex.id}" style="padding:8px 12px;border-radius:10px;border:0;background:#7c4dff;color:#fff">קראו עוד</button>
          <button class="btn follow" data-follow="${ex.artist}" style="padding:6px 10px;border-radius:10px;border:1px solid #444;background:#111;color:#ddd">
            ${followed.has(ex.artist) ? '★ עוקב/ת' : '☆ עקוב/י'}
          </button>
        </div>
      </div>
    `;
    frag.appendChild(card);
  });

  els.list.appendChild(frag);

  // wire buttons
  $all('button[data-open]').forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-open');
      const ex = items.find(x => x.id === id);
      if (ex) openModal(ex);
    });
  });
  $all('button[data-follow]').forEach((b) => {
    b.addEventListener('click', () => {
      const name = b.getAttribute('data-follow');
      const set = getFollow();
      if (set.has(name)) set.delete(name); else set.add(name);
      setFollow(set);
      b.textContent = set.has(name) ? '★ עוקב/ת' : '☆ עקוב/י';
    });
  });
}

function render() {
  const items = filterExhibitions();
  clearMarkers();
  items.forEach(addMarker);
  renderList(items);
}

// ------- Modal with Gallery -------
let modalEl;
function ensureModal() {
  if (modalEl) return modalEl;
  modalEl = document.createElement('div');
  modalEl.id = 'ex-modal';
  modalEl.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.6);
    display:none;align-items:center;justify-content:center;z-index:9999;
  `;
  modalEl.innerHTML = `
    <div style="background:#101010;color:#eee;max-width:920px;width:92%;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #2a2a2a">
        <div id="ex-title" style="font-weight:800"></div>
        <button id="ex-close" style="background:#1a1a1a;border:1px solid #333;border-radius:10px;color:#ddd;padding:6px 10px">סגירה</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;padding:12px 12px 16px">
        <div style="position:relative">
          <div id="ex-gallery" style="position:relative;overflow:hidden;border-radius:12px;border:1px solid #2a2a2a;height:52vh;max-height:520px"></div>
          <button id="ex-prev" style="position:absolute;top:50%;inset-inline-start:8px;transform:translateY(-50%);background:#0008;border:0;border-radius:10px;color:#fff;padding:8px 10px">◀</button>
          <button id="ex-next" style="position:absolute;top:50%;inset-inline-end:8px;transform:translateY(-50%);background:#0008;border:0;border-radius:10px;color:#fff;padding:8px 10px">▶</button>
        </div>
        <div id="ex-meta" class="muted" style="line-height:1.5"></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a id="ex-link" target="_blank" rel="noopener" style="background:#7c4dff;color:#fff;padding:8px 12px;border-radius:10px;text-decoration:none">לאתר/אירוע</a>
          <button id="ex-follow" style="background:#111;border:1px solid #444;color:#ddd;padding:8px 12px;border-radius:10px">☆ עקוב/י אחרי האמן</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);
  modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });
  modalEl.querySelector('#ex-close').onclick = closeModal;
  return modalEl;
}

function openModal(ex) {
  ensureModal();
  const title = `${ex.title} — ${ex.artist} · ${ex.venue}`;
  modalEl.querySelector('#ex-title').textContent = title;
  modalEl.querySelector('#ex-meta').innerHTML =
    `${ex.city} · ${ex.address}<br>${ex.start} – ${ex.end}<br>${ex.desc || ''}`;

  // follow button state
  const set = getFollow();
  const followBtn = modalEl.querySelector('#ex-follow');
  const updateFollowText = () => followBtn.textContent = set.has(ex.artist) ? '★ עוקב/ת אחרי האמן' : '☆ עקוב/י אחרי האמן';
  updateFollowText();
  followBtn.onclick = () => {
    if (set.has(ex.artist)) set.delete(ex.artist); else set.add(ex.artist);
    setFollow(set);
    updateFollowText();
    // גם בכרטיסים ברשימה
    $all(`button[data-follow="${ex.artist}"]`).forEach(b => b.textContent = set.has(ex.artist) ? '★ עוקב/ת' : '☆ עקוב/י');
  };

  // link
  const a = modalEl.querySelector('#ex-link');
  a.href = ex.link || '#';

  // gallery
  const gal = modalEl.querySelector('#ex-gallery');
  gal.innerHTML = '';
  let idx = 0;
  const slides = ex.images.map((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${ex.title} ${i+1}`;
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .3s;opacity:0;';
    gal.appendChild(img);
    return img;
  });
  const show = (i) => slides.forEach((im, k) => im.style.opacity = k === i ? '1' : '0');
  show(0);

  modalEl.querySelector('#ex-prev').onclick = () => { idx = (idx - 1 + slides.length) % slides.length; show(idx); };
  modalEl.querySelector('#ex-next').onclick = () => { idx = (idx + 1) % slides.length; show(idx); };

  // swipe (mobile)
  let sx = 0;
  gal.ontouchstart = (e) => sx = e.touches[0].clientX;
  gal.ontouchend = (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) idx = (idx + (dx < 0 ? 1 : -1) + slides.length) % slides.length, show(idx);
  };

  modalEl.style.display = 'flex';
}
function closeModal() { if (modalEl) modalEl.style.display = 'none'; }

// ------- Wiring & Events -------
function wireUI() {
  // רדיוס מעדכן מעגל
  els.radius?.addEventListener('input', () => {
    if (userCircle) userCircle.setRadius(kmToMeters(els.radius.value));
    render();
  });

  // חיפוש כתובת
  els.btnGeocode?.addEventListener('click', async () => {
    const q = els.address?.value?.trim();
    if (!q) return;
    setStatus('מחפש/ת כתובת…');
    const hit = await geocodeAddress(q);
    if (!hit) { setStatus('לא נמצאה כתובת'); return; }
    setStatus(hit.display);
    currentCenter = { lat: hit.lat, lng: hit.lng };
    setUserLocation(hit.lat, hit.lng);
    render();
  });

  // מיקומי
  els.btnMyLoc?.addEventListener('click', useMyLocation);

  // סינון (אמן/ת ותאריכים)
  const onFilter = () => render();
  els.artist?.addEventListener('input', onFilter);
  els.dateFrom?.addEventListener('change', onFilter);
  els.dateTo?.addEventListener('change', onFilter);
  els.btnSync?.addEventListener('click', onFilter);
}

// ------- Boot -------
(function boot() {
  initMap();
  wireUI();

  // ברירת מחדל: ת״א כמרכז אם אין מיקום
  currentCenter = { lat: 32.0809, lng: 34.7806 };
  setUserLocation(currentCenter.lat, currentCenter.lng);

  // אם יש ערך אינפוטים מה-DOM – נשמור טווח תאריכים נוח
  if (els.dateFrom && !els.dateFrom.value) els.dateFrom.value = todayISO();
  if (els.dateTo && !els.dateTo.value) {
    const d = new Date(); d.setMonth(d.getMonth() + 3);
    els.dateTo.value = d.toISOString().slice(0, 10);
  }

  render();
})();
