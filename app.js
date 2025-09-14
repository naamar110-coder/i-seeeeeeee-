/* app.js — מפה + מיקום + חיפוש אמן + רשימות דמה (עצמאי, בלי Firebase) */

/* ===== נתוני דמה עם אמנים ===== */
const EXHIBITIONS = [
  // תל אביב
  { id:'ta1', city:'תל אביב', title:'אור וצל', venue:'מוזיאון תל אביב לאמנות',
    lat:32.0777, lng:34.7860, start:'2025-09-10', end:'2025-11-30',
    tags:['צילום','מודרני'], address:'שדרות שאול המלך 27, תל אביב',
    artists:['דנה לוי','איתי כהן'] },
  { id:'ta2', city:'תל אביב', title:'קווים משתנים', venue:'בית תמי',
    lat:32.0694, lng:34.7759, start:'2025-09-01', end:'2025-10-20',
    tags:['איור','עכשווי'], address:'שינקין 6, תל אביב',
    artists:['יעל פרידמן'] },
  { id:'ta3', city:'תל אביב', title:'ים של צבע', venue:'גלריה גורדון',
    lat:32.0913, lng:34.7727, start:'2025-09-05', end:'2025-12-01',
    tags:['ציור'], address:'הירקון 95, תל אביב',
    artists:['רוני ברק','יעל פרידמן'] },
  { id:'ta4', city:'תל אביב', title:'פני העיר', venue:'בית העיר',
    lat:32.0722, lng:34.7748, start:'2025-09-18', end:'2025-12-31',
    tags:['היסטורי','עירוניות'], address:'ביאליק 27, תל אביב',
    artists:['גיל אלון'] },
  { id:'ta5', city:'תל אביב', title:'תנועה בחומר', venue:'גלריה יפה כפיר',
    lat:32.0618, lng:34.7720, start:'2025-09-12', end:'2025-10-31',
    tags:['פיסול'], address:'אלנבי 114, תל אביב',
    artists:['נועה רז'] },
  { id:'ta6', city:'תל אביב', title:'דיאלוגים', venue:'סדנאות האמנים',
    lat:32.0685, lng:34.7800, start:'2025-09-20', end:'2025-11-10',
    tags:['עכשווי'], address:'הראשונים 9, תל אביב',
    artists:['איתי כהן','גיל אלון'] },
  { id:'ta7', city:'תל אביב', title:'מסכים זזים', venue:'CCA',
    lat:32.0699, lng:34.7815, start:'2025-09-07', end:'2025-11-25',
    tags:['וידאו ארט'], address:'תל גיבורים 3, תל אביב',
    artists:['קרן שלו'] },
  { id:'ta8', city:'תל אביב', title:'רישומים מהדרך', venue:'גלריה בסיס',
    lat:32.1002, lng:34.7751, start:'2025-09-03', end:'2025-10-28',
    tags:['רישום'], address:'בני דן 5, תל אביב',
    artists:['דנה לוי'] },
  // מחוץ לת״א
  { id:'hz1', city:'חיפה', title:'קווי רכס', venue:'מוזיאון חיפה',
    lat:32.8057, lng:34.9856, start:'2025-09-10', end:'2025-12-15',
    tags:['צילום'], artists:['איתי כהן'] },
  { id:'jr1', city:'ירושלים', title:'אבנים מדברות', venue:'מוזיאון ישראל',
    lat:31.7767, lng:35.2024, start:'2025-09-02', end:'2025-11-30',
    tags:['ארכיאולוגיה'], artists:['יעל פרידמן'] },
];

/* ===== עזר ===== */
const qs = s => document.querySelector(s);
function distanceKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI/180;
  const dLng = (b.lng - a.lng) * Math.PI/180;
  const sa = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(sa));
}
function norm(s){ return (s||'').toString().trim().toLowerCase(); }

/* ===== מצב גלובלי ===== */
let map, centerMarker, userCenter=null, radiusKm=10, markersLayer;

/* ===== DOM אלמנטים ===== */
const addressInput = qs('#addressInput');
const geocodeBtn = qs('#geocodeBtn');
const useMyLocationBtn = qs('#useMyLocationBtn');
const radiusInput = qs('#radiusInput');
const radiusVal = qs('#radiusVal');
const chosenPlaceEl = qs('#chosenPlace');
const resultsEl = qs('#results');
const telAvivListEl = qs('#telAvivList');

/* ===== הזרקת UI לחיפוש אמן אם חסר ב-HTML ===== */
function ensureArtistSearchUI() {
  let host = qs('#artistSearchHost');
  if (!host) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginTop = '8px';
    card.innerHTML = `
      <div id="artistSearchHost">
        <div style="font-weight:700;margin-bottom:8px">חיפוש לפי אמן</div>
        <div class="row wrap" style="gap:8px">
          <input id="artistInput" class="input" placeholder="הקלידי שם אמן (למשל: דנה לוי)" style="flex:1;min-width:200px">
          <button id="artistBtn" class="primary">חפשי אמן</button>
        </div>
        <div class="muted small" style="margin-top:6px">טיפ: אם כבר בחרת מיקום — התוצאות ימיינו לפי מרחק.</div>
      </div>`;
    // ננסה להוסיף מתחת לקופסת החיפוש הראשית אם קיימת, אחרת לפני תוצאות
    const searchCard = qs('.card'); // הראשונה בעמוד בד״כ
    (searchCard?.parentNode || document.body).insertBefore(card, searchCard?.nextSibling || resultsEl);
  }
}

/* ===== מפה ===== */
function initMap() {
  map = L.map('map', { zoomControl:true, scrollWheelZoom:true });
  const tlv = [32.0853, 34.7818];
  map.setView(tlv, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'&copy; OpenStreetMap contributors'
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

function setCenter(lat, lng, label='מיקום נבחר') {
  userCenter = {lat, lng};
  map.setView([lat,lng], 13);
  if (centerMarker) centerMarker.remove();
  centerMarker = L.marker([lat,lng], {title:label}).addTo(map);
  if (chosenPlaceEl) chosenPlaceEl.textContent = `${label} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  renderNearby();
}

/* ===== גיאוקוד כתובת ===== */
async function geocodeAddress(q){
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  try{
    const res = await fetch(url, {headers:{'Accept-Language':'he'}});
    const data = await res.json();
    if(data && data[0]){
      const {lat, lon, display_name} = data[0];
      setCenter(parseFloat(lat), parseFloat(lon), display_name);
    }else{
      alert('לא נמצאה כתובת תואמת.');
    }
  }catch(e){
    console.error(e); alert('שגיאה בגיאוקוד, נסי שוב.');
  }
}

/* ===== מיקום משתמש ===== */
function useMyLocation(){
  if(!navigator.geolocation){ alert('הדפדפן לא תומך במיקום.'); return; }
  navigator.geolocation.getCurrentPosition(
    p => setCenter(p.coords.latitude, p.coords.longitude, 'המיקום שלך'),
    e => { console.warn(e); alert('לא ניתן היה לקבל מיקום. בדקי הרשאות.'); },
    {enableHighAccuracy:true, timeout:10000}
  );
}

/* ===== ציור תערוכות קרובות ===== */
function renderNearby(){
  if(!resultsEl) return;
  resultsEl.innerHTML = '';
  markersLayer?.clearLayers();

  if(!userCenter){
    resultsEl.innerHTML = `<div class="muted">לא נבחר מיקום עדיין</div>`;
    return;
  }

  const near = EXHIBITIONS
    .map(x => ({...x, distance: distanceKm(userCenter, {lat:x.lat,lng:x.lng})}))
    .filter(x => x.distance <= radiusKm)
    .sort((a,b)=>a.distance-b.distance);

  if(near.length===0){
    resultsEl.innerHTML = `<div class="muted">לא נמצאו תערוכות בטווח ${radiusKm} ק״מ.</div>`;
    return;
  }

  near.forEach(x=>{
    const m = L.marker([x.lat,x.lng]).addTo(markersLayer);
    m.bindPopup(`<b>${x.title}</b><br>${x.venue}<br>${x.address ?? ''}`);

    const card = document.createElement('div');
    card.className='card';
    card.innerHTML = `
      <div class="row wrap" style="justify-content:space-between;gap:10px">
        <div>
          <div style="font-weight:700">${x.title}</div>
          <div class="muted small">${x.venue} · ${x.city}</div>
          <div class="muted small">${x.start} – ${x.end}</div>
          <div class="muted small">${x.address ?? ''}</div>
          <div class="muted small">אמנים: ${x.artists.join(' · ')}</div>
          <div class="muted small">${x.tags.join(' · ')}</div>
        </div>
        <div class="muted small" style="min-width:80px;text-align:center">
          ${x.distance.toFixed(1)} ק״מ
        </div>
      </div>`;
    card.addEventListener('click', ()=>{ map.setView([x.lat,x.lng],15); m.openPopup(); });
    resultsEl.appendChild(card);
  });
}

/* ===== רשימת תל אביב קבועה ===== */
function renderTelAvivList(){
  if(!telAvivListEl) return;
  telAvivListEl.innerHTML='';
  EXHIBITIONS.filter(x=>x.city==='תל אביב').forEach(x=>{
    const li = document.createElement('li');
    li.className='card'; li.style.listStyle='none';
    li.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:4px">
        <div><b>${x.title}</b> — ${x.venue}</div>
        <div class="muted small">${x.start} – ${x.end}</div>
        <div class="muted small">${x.address ?? ''}</div>
        <div class="muted small">אמנים: ${x.artists.join(' · ')}</div>
      </div>`;
    li.addEventListener('click', ()=>{
      map.setView([x.lat,x.lng],15);
      L.popup().setLatLng([x.lat,x.lng]).setContent(`<b>${x.title}</b><br>${x.venue}`).openOn(map);
    });
    telAvivListEl.appendChild(li);
  });
}

/* ===== חיפוש לפי אמן ===== */
function searchByArtist(name){
  const key = norm(name);
  if(!key){ alert('כתבי שם אמן.'); return; }

  const matches = EXHIBITIONS.filter(x =>
    (x.artists||[]).some(a => norm(a).includes(key))
  );

  // ניקוי תצוגות קודמות
  markersLayer?.clearLayers();
  resultsEl.innerHTML = '';

  if(matches.length===0){
    resultsEl.innerHTML = `<div class="muted">לא נמצאו תערוכות לאמן: ${name}</div>`;
    return;
  }

  // מיון: אם יש מרכז — לפי מרחק; אחרת לפי עיר/כותרת
  const list = userCenter
    ? matches.map(x=>({...x, distance:distanceKm(userCenter,{lat:x.lat,lng:x.lng})}))
             .sort((a,b)=>a.distance-b.distance)
    : matches.sort((a,b)=> (a.city||'').localeCompare(b.city||'', 'he') || (a.title||'').localeCompare(b.title||'', 'he'));

  // שרטוט
  list.forEach(x=>{
    const m = L.marker([x.lat,x.lng]).addTo(markersLayer);
    m.bindPopup(`<b>${x.title}</b><br>${x.venue}<br>${x.city}`);

    const card = document.createElement('div');
    card.className='card';
    const dist = userCenter ? `<div class="muted small" style="min-width:80px;text-align:center">${x.distance.toFixed(1)} ק״מ</div>` : '';
    card.innerHTML = `
      <div class="row wrap" style="justify-content:space-between;gap:10px">
        <div>
          <div style="font-weight:700">${x.title}</div>
          <div class="muted small">${x.venue} · ${x.city}</div>
          <div class="muted small">אמנים: ${x.artists.join(' · ')}</div>
          <div class="muted small">${x.start} – ${x.end}</div>
        </div>
        ${dist}
      </div>`;
    card.addEventListener('click', ()=>{ map.setView([x.lat,x.lng],15); m.openPopup(); });
    resultsEl.appendChild(card);
  });

  // זום לכל התוצאות
  const group = L.featureGroup(list.map(x=>L.marker([x.lat,x.lng])));
  try { map.fitBounds(group.getBounds().pad(0.2)); } catch {}
}

/* ===== חיבור אירועים ===== */
function wireUI(){
  // חיפוש כתובת
  geocodeBtn?.addEventListener('click', ()=>{
    const q = (addressInput?.value||'').trim();
    if(!q){ alert('כתבי כתובת לחיפוש.'); return; }
    geocodeAddress(q);
  });
  addressInput?.addEventListener('keydown', e=>{ if(e.key==='Enter') geocodeBtn.click(); });
  // מיקום שלי
  useMyLocationBtn?.addEventListener('click', useMyLocation);
  // רדיוס
  radiusInput?.addEventListener('input', e=>{
    radiusKm = parseInt(e.target.value,10) || 10;
    if (radiusVal) radiusVal.textContent = radiusKm;
  });
  radiusInput?.addEventListener('change', renderNearby);

  // חיפוש אמן
  ensureArtistSearchUI();
  const artistInput = qs('#artistInput');
  const artistBtn = qs('#artistBtn');
  artistBtn?.addEventListener('click', ()=> searchByArtist(artistInput.value));
  artistInput?.addEventListener('keydown', e=>{ if(e.key==='Enter') searchByArtist(artistInput.value); });
}

/* ===== הפעלה ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  // ודאי שיש DIV מפה עם גובה ב-CSS (min-height ~ 320px);
  const mapDiv = document.getElementById('map');
  if(!mapDiv){ console.error('לא נמצא #map'); return; }

  initMap();
  renderTelAvivList();
  wireUI();

  if (radiusVal) radiusVal.textContent = radiusKm;

  // ברירת מחדל: ת״א כמרכז אם לא נבחר
  setTimeout(()=>{ if(!userCenter) setCenter(32.0853,34.7818,'תל אביב (ברירת מחדל)'); }, 200);
});
