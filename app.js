/* app.js — גרסה עצמאית עם מפה, מיקום, גיאוקוד ורשימת תערוכות */

// ===== נתוני דמה =====
const EXHIBITIONS = [
  // --- תל אביב ---
  { id: 'ta1', city: 'תל אביב', title: 'אור וצל', venue: 'מוזיאון תל אביב לאמנות', lat: 32.0777, lng: 34.7860, start: '2025-09-10', end: '2025-11-30', tags: ['צילום','מודרני'], address: 'שדרות שאול המלך 27, תל אביב' },
  { id: 'ta2', city: 'תל אביב', title: 'קווים משתנים', venue: 'בית תמי', lat: 32.0694, lng: 34.7759, start: '2025-09-01', end: '2025-10-20', tags: ['איור','עכשווי'], address: 'שינקין 6, תל אביב' },
  { id: 'ta3', city: 'תל אביב', title: 'ים של צבע', venue: 'גלריה גורדון', lat: 32.0913, lng: 34.7727, start: '2025-09-05', end: '2025-12-01', tags: ['ציור'], address: 'הירקון 95, תל אביב' },
  { id: 'ta4', city: 'תל אביב', title: 'פני העיר', venue: 'בית העיר', lat: 32.0722, lng: 34.7748, start: '2025-09-18', end: '2025-12-31', tags: ['היסטורי','עירוניות'], address: 'ביאליק 27, תל אביב' },
  { id: 'ta5', city: 'תל אביב', title: 'תנועה בחומר', venue: 'גלריה יפה כפיר', lat: 32.0618, lng: 34.7720, start: '2025-09-12', end: '2025-10-31', tags: ['פיסול'], address: 'אלנבי 114, תל אביב' },
  { id: 'ta6', city: 'תל אביב', title: 'דיאלוגים', venue: 'סדנאות האמנים', lat: 32.0685, lng: 34.7800, start: '2025-09-20', end: '2025-11-10', tags: ['עכשווי'], address: 'הראשונים 9, תל אביב' },
  { id: 'ta7', city: 'תל אביב', title: 'מסכים זזים', venue: 'CCA מרכז לאמנות עכשווית', lat: 32.0699, lng: 34.7815, start: '2025-09-07', end: '2025-11-25', tags: ['וידאו ארט'], address: 'תל גיבורים 3, תל אביב' },
  { id: 'ta8', city: 'תל אביב', title: 'רישומים מהדרך', venue: 'גלריה בסיס', lat: 32.1002, lng: 34.7751, start: '2025-09-03', end: '2025-10-28', tags: ['רישום'], address: 'בני דן 5, תל אביב' },
  // --- עוד כמה מחוץ לתל אביב לדוגמה ---
  { id: 'hz1', city: 'חיפה', title: 'קווי רכס', venue: 'מוזיאון חיפה', lat: 32.8057, lng: 34.9856, start: '2025-09-10', end: '2025-12-15', tags: ['צילום'] },
  { id: 'jr1', city: 'ירושלים', title: 'אבנים מדברות', venue: 'מוזיאון ישראל', lat: 31.7767, lng: 35.2024, start: '2025-09-02', end: '2025-11-30', tags: ['ארכיאולוגיה'] },
];

// ===== עזר: חישוב מרחק (Haversine) בק״מ =====
function distanceKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const sa = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180) * Math.cos(b.lat*Math.PI/180) * Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(sa));
}

// ===== מצב גלובלי =====
let map, centerMarker, userCenter = null, radiusKm = 10;
let markersLayer;

// ===== DOM =====
const qs = s => document.querySelector(s);
const addressInput = qs('#addressInput');
const geocodeBtn = qs('#geocodeBtn');
const useMyLocationBtn = qs('#useMyLocationBtn');
const radiusInput = qs('#radiusInput');
const radiusVal = qs('#radiusVal');
const chosenPlaceEl = qs('#chosenPlace');
const resultsEl = qs('#results');
const telAvivListEl = qs('#telAvivList');

// ===== אתחול מפה =====
function initMap() {
  map = L.map('map', { zoomControl: true, scrollWheelZoom: true });
  const tlv = [32.0853, 34.7818]; // ת״א ברירת מחדל
  map.setView(tlv, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

function setCenter(lat, lng, label = 'מיקום נבחר') {
  userCenter = { lat, lng };
  map.setView([lat, lng], 13);
  if (centerMarker) centerMarker.remove();
  centerMarker = L.marker([lat, lng], { title: label }).addTo(map);
  chosenPlaceEl.textContent = `${label} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  renderNearby(); // עדכן תוצאות
}

// ===== גיאוקוד כתובת (Nominatim) =====
async function geocodeAddress(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'he' } });
    const data = await res.json();
    if (data && data[0]) {
      const { lat, lon, display_name } = data[0];
      setCenter(parseFloat(lat), parseFloat(lon), display_name);
    } else {
      alert('לא נמצאה כתובת תואמת. נסי לכתוב אחרת.');
    }
  } catch (e) {
    console.error(e);
    alert('שגיאת חיבור לגיאוקוד. נסי שוב בעוד רגע.');
  }
}

// ===== מיקום אוטומטי של המשתמש =====
function useMyLocation() {
  if (!navigator.geolocation) {
    alert('דפדפן לא תומך בזיהוי מיקום.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      setCenter(latitude, longitude, 'המיקום שלך');
    },
    err => {
      console.warn(err);
      alert('לא ניתן היה לקבל מיקום. אפשרי שצריך לאשר גישה למיקום בדפדפן.');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ===== ציור תערוכות קרובות לפי רדיוס =====
function renderNearby() {
  resultsEl.innerHTML = '';
  markersLayer.clearLayers();
  if (!userCenter) {
    resultsEl.innerHTML = `<div class="muted">לא נבחר מיקום עדיין</div>`;
    return;
  }

  const near = EXHIBITIONS
    .map(x => ({ ...x, distance: distanceKm(userCenter, { lat: x.lat, lng: x.lng }) }))
    .filter(x => x.distance <= radiusKm)
    .sort((a,b) => a.distance - b.distance);

  if (near.length === 0) {
    resultsEl.innerHTML = `<div class="muted">לא נמצאו תערוכות בטווח ${radiusKm} ק״מ.</div>`;
  } else {
    near.forEach(x => {
      // סמן במפה
      const m = L.marker([x.lat, x.lng]).addTo(markersLayer);
      m.bindPopup(`<b>${x.title}</b><br>${x.venue}<br>${x.address ?? ''}`);

      // כרטיס ברשימה
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <div class="row wrap" style="justify-content:space-between;gap:10px">
          <div>
            <div style="font-weight:700">${x.title}</div>
            <div class="muted small">${x.venue} · ${x.city}</div>
            <div class="muted small">${x.start} – ${x.end}</div>
            <div class="muted small">${x.address ?? ''}</div>
            <div class="muted small">${x.tags.join(' · ')}</div>
          </div>
          <div class="muted small" style="min-width:80px;text-align:center">
            ${x.distance.toFixed(1)} ק״מ
          </div>
        </div>
      `;
      el.addEventListener('click', () => {
        map.setView([x.lat, x.lng], 15);
        m.openPopup();
      });
      resultsEl.appendChild(el);
    });
  }
}

// ===== רשימת ת״א קבועה =====
function renderTelAvivList() {
  telAvivListEl.innerHTML = '';
  EXHIBITIONS.filter(x => x.city === 'תל אביב').forEach(x => {
    const li = document.createElement('li');
    li.className = 'card';
    li.style.listStyle = 'none';
    li.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:4px">
        <div><b>${x.title}</b> — ${x.venue}</div>
        <div class="muted small">${x.start} – ${x.end}</div>
        <div class="muted small">${x.address}</div>
        <div class="muted small">${x.tags.join(' · ')}</div>
      </div>
    `;
    li.addEventListener('click', () => {
      map.setView([x.lat, x.lng], 15);
      L.popup().setLatLng([x.lat, x.lng]).setContent(`<b>${x.title}</b><br>${x.venue}`).openOn(map);
    });
    telAvivListEl.appendChild(li);
  });
}

// ===== חיבור אירועים =====
function wireUI() {
  geocodeBtn?.addEventListener('click', () => {
    const q = (addressInput?.value || '').trim();
    if (!q) { alert('כתבי כתובת לחיפוש.'); return; }
    geocodeAddress(q);
  });
  addressInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') geocodeBtn.click();
  });
  useMyLocationBtn?.addEventListener('click', useMyLocation);

  radiusInput?.addEventListener('input', e => {
    radiusKm = parseInt(e.target.value, 10) || 10;
    radiusVal.textContent = radiusKm;
  });
  radiusInput?.addEventListener('change', renderNearby);
}

// ===== הפעלה =====
document.addEventListener('DOMContentLoaded', () => {
  // ודאי שה־DIV של המפה קיים
  const mapDiv = document.getElementById('map');
  if (!mapDiv) {
    console.error('לא נמצא אלמנט #map ב־index.html');
    return;
  }
  initMap();
  renderTelAvivList();
  wireUI();

  // רדיוס התחלתי
  radiusVal.textContent = radiusKm;

  // אפשר ניסוי מהיר: להגדיר ת״א כמרכז אם עוד לא נבחר
  setTimeout(() => {
    if (!userCenter) setCenter(32.0853, 34.7818, 'תל אביב (ברירת מחדל)');
  }, 200);
});
