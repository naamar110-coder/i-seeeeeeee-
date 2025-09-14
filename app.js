/************************************************
 * Exhibitions – App.js (v120)
 * מפה (Leaflet) + מיקום, רדיוס, חיפוש כתובת,
 * חיפוש אמן עם מודל, סינון לפי תאריכים + מוזיאון,
 * כפתור "הוסף ליומן Google" לכל תערוכה.
 ************************************************/

/* ---------- נתוני דמו (ת"א) ---------- */
const EXHIBITIONS = [
  { id:"tlv-01", title:"ציור ישראלי עכשווי", venue:"מוזיאון תל אביב לאמנות", city:"תל אביב-יפו", address:"שד' שאול המלך 27", lat:32.077686, lng:34.786043, start:"2025-01-15", end:"2025-12-31", artists:["לאה ניקל","אברהם אופק","עדי נס"] },
  { id:"tlv-02", title:"הדפס וצילום – קצוות", venue:"הגלריה האוניברסיטאית לאמנות ע״ש גניה שרייבר", city:"תל אביב-יפו", address:"חיים לבנון 55", lat:32.113396, lng:34.804232, start:"2025-03-01", end:"2025-09-30", artists:["רותי שלוס","עדי נס","זויה צ׳רקסקי"] },
  { id:"tlv-03", title:"Material Matters", venue:"בית ליבלינג – מרכז העיר הלבנה", city:"תל אביב-יפו", address:"אידלסון 29", lat:32.07252, lng:34.77393, start:"2025-02-10", end:"2025-08-10", artists:["טליה קינן","יוחאי מטוס"] },
  { id:"tlv-04", title:"מבט מקומי", venue:"CCA – מרכז לאמנות עכשווית", city:"תל אביב-יפו", address:"צדוק הכהן 2", lat:32.06086, lng:34.77265, start:"2025-04-05", end:"2025-10-20", artists:["סיגלית לנדאו","דניאלה שלו"] },
  { id:"tlv-05", title:"Light & Space TLV", venue:"מוזיאון בית ביאליק", city:"תל אביב-יפו", address:"ביאליק 22", lat:32.07177, lng:34.77201, start:"2025-05-01", end:"2025-11-15", artists:["ג׳יימס טורל","אורלי ריבק","אורי ניר"] },
  { id:"tlv-06", title:"הסטודיו הפתוח", venue:"גלריה רו-ארט", city:"תל אביב-יפו", address:"החשמל 13", lat:32.06391, lng:34.77283, start:"2025-06-10", end:"2025-09-10", artists:["מושון זר-אביב","מאיה גלפנד"] },
  { id:"tlv-07", title:"צילום רחוב – ת״א", venue:"בית אריאלה – הסיפור החזותי", city:"תל אביב-יפו", address:"שד׳ שאול המלך 25", lat:32.07745, lng:34.78388, start:"2025-02-01", end:"2025-07-30", artists:["יוסי לוי","עדי נס"] },
  { id:"tlv-08", title:"עיצוב וחומר", venue:"MUZA – מוזאון ארץ ישראל, תל אביב", city:"תל אביב-יפו", address:"חיים לבנון 2", lat:32.10461, lng:34.80453, start:"2025-03-20", end:"2025-12-20", artists:["רון ארד","יעל פרידמן"] },
  { id:"tlv-09", title:"קולות מן הים", venue:"גלריה גורדון", city:"תל אביב-יפו", address:"הירקון 95", lat:32.08087, lng:34.76872, start:"2025-01-10", end:"2025-06-10", artists:["אנה ים","דפנה שלום"] },
  { id:"tlv-10", title:"שחור על לבן", venue:"מוזיאון נחום גוטמן לאמנות", city:"תל אביב-יפו", address:"שביל הפסגה 21, נווה צדק", lat:32.06128, lng:34.76451, start:"2025-04-12", end:"2025-09-12", artists:["נחום גוטמן","דינה קונסטנט"] }
];

/* ---------- Utils ---------- */
const $ = s => document.querySelector(s);
const norm = (s="") => s.toString().trim().toLowerCase();
const toISODate = s => new Date(s+"T00:00:00Z");
function distanceKm(a,b){
  const R=6371, toR=d=>d*Math.PI/180;
  const dLat=toR(b.lat-a.lat), dLng=toR(b.lng-a.lng);
  const h=Math.sin(dLat/2)**2 + Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}
function gcalUrl(ev){
  // אירוע "לילה שלם" (תאריכים בלבד) בפורמט YYYYMMDD/YYYYMMDD
  const fmt = d => d.replaceAll('-','');
  const dates = `${fmt(ev.start)}/${fmt(ev.end)}`;
  const text = encodeURIComponent(ev.title);
  const loc  = encodeURIComponent(`${ev.venue} ${ev.address||''}`.trim());
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&location=${loc}&dates=${dates}`;
}

/* ---------- Map & State ---------- */
let map, markersLayer;
let userCenter = null;     // {lat,lng}
let radiusKm = 10;
let filters = { from:null, to:null, venue:'ALL' };

/* ---------- Ensure UI blocks if missing ---------- */
function ensureFilterUI(){
  if ($('#exFilters')) return;
  const host = $('#results')?.parentNode || document.body;
  const card = document.createElement('section');
  card.id = 'exFilters';
  card.className = 'card';
  card.style.cssText = 'margin:12px 16px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#fff';
  const venues = ['ALL', ...Array.from(new Set(EXHIBITIONS.map(x=>x.venue)))];
  card.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">
      <div style="display:flex;flex-direction:column;gap:6px">
        <label class="muted small">מתאריך</label>
        <input id="dateFrom" type="date" />
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <label class="muted small">עד תאריך</label>
        <input id="dateTo" type="date" />
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <label class="muted small">מוזיאון/גלריה</label>
        <select id="venueSelect">${venues.map(v=>`<option value="${v}">${v==='ALL'?'הכול':v}</option>`).join('')}</select>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <label class="muted small">רדיוס (ק״מ)</label>
        <input id="radiusRange" type="range" min="1" max="50" value="10" />
        <div class="small"><span id="radiusValue">10</span> ק״מ</div>
      </div>
      <div style="margin-inline-start:auto;display:flex;gap:6px">
        <input id="artistSearchInput" placeholder="חיפוש אמן (למשל: עדי נס)" style="padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;min-width:220px"/>
        <button id="artistSearchBtn" class="primary" style="border:1px solid #111827;background:#111827;color:#fff;border-radius:10px;padding:10px 14px">חפשי אמן</button>
      </div>
    </div>
  `;
  host.insertBefore(card, $('#results') || host.firstChild);

  // Bind
  $('#dateFrom')?.addEventListener('change', e => { filters.from = e.target.value || null; renderAll(); });
  $('#dateTo')?.addEventListener('change',   e => { filters.to   = e.target.value || null; renderAll(); });
  $('#venueSelect')?.addEventListener('change', e => { filters.venue = e.target.value || 'ALL'; renderAll(); });
  $('#radiusRange')?.addEventListener('input', e => {
    radiusKm = Number(e.target.value||10);
    const rv = $('#radiusValue'); if (rv) rv.textContent = radiusKm;
  });
  $('#radiusRange')?.addEventListener('change', renderAll);

  $('#artistSearchBtn')?.addEventListener('click', ()=>{
    const name = $('#artistSearchInput')?.value || '';
    searchByArtist(name);
  });
  $('#artistSearchInput')?.addEventListener('keydown', e=>{
    if(e.key==='Enter'){ e.preventDefault(); $('#artistSearchBtn')?.click(); }
  });
}

function initMap(){
  let mapDiv = $('#map');
  if(!mapDiv){
    const host = $('#results') || document.body;
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div id="map" style="height:360px;border:1px solid #e5e7eb;border-radius:12px;margin:12px 16px;background:#f4f5f8"></div>`;
    host.parentNode?.insertBefore(wrap, host);
    mapDiv = $('#map');
  }
  map = L.map(mapDiv).setView([32.0853,34.7818], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'&copy; OpenStreetMap' }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

/* ---------- Filters ---------- */
function eventPassesFilters(ev){
  // Venue
  if (filters.venue !== 'ALL' && ev.venue !== filters.venue) return false;
  // Dates overlap: (ev.end >= from) && (ev.start <= to)
  if (filters.from){
    if (toISODate(ev.end) < toISODate(filters.from)) return false;
  }
  if (filters.to){
    if (toISODate(ev.start) > toISODate(filters.to)) return false;
  }
  return true;
}
function getFilteredList(){
  let list = EXHIBITIONS.filter(eventPassesFilters);
  if (userCenter){
    list = list
      .map(x=>({...x, d: distanceKm(userCenter,{lat:x.lat,lng:x.lng})}))
      .filter(x=> x.d <= radiusKm)
      .sort((a,b)=> a.d - b.d);
  } else {
    list = list.sort((a,b)=> (a.city||'').localeCompare(b.city||'','he') || (a.title||'').localeCompare(b.title||'','he'));
  }
  return list;
}

/* ---------- Rendering ---------- */
function renderList(list){
  // markers
  markersLayer.clearLayers();
  list.forEach(x=>{
    const m = L.marker([x.lat,x.lng]).addTo(markersLayer);
    m.bindPopup(`<b>${x.title}</b><br>${x.venue}<br><span class="muted small">${x.city}</span>`);
  });
  if(list.length){
    try{
      const group = L.featureGroup(list.map(x=>L.marker([x.lat,x.lng])));
      map.fitBounds(group.getBounds().pad(0.2));
    }catch{}
  }

  // cards
  const box = $('#results');
  if(!box) return;
  if(!list.length){ box.innerHTML = `<div class="muted" style="margin:12px 16px">אין תוצאות לסינון הנוכחי.</div>`; return; }

  box.innerHTML = list.map(x=>{
    const dist = (userCenter && x.d!=null) ? ` · ${x.d.toFixed(1)} ק״מ` : '';
    const gcal = gcalUrl(x);
    const maps = `https://www.google.com/maps?q=${encodeURIComponent(x.venue+' '+(x.address||''))}`;
    return `
      <div class="card" style="margin:12px 16px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#fff">
        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div>
            <div style="font-weight:700">${x.title}</div>
            <div class="muted small">${x.venue} · ${x.city}${dist}</div>
            <div class="muted small">${x.start} – ${x.end}</div>
            <div class="muted small">${x.address||''}</div>
            <div class="muted small">אמנים: ${x.artists.join(' · ')}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn" data-jump="${x.id}" style="border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;background:#fff">תמקד במפה</button>
            <a class="btn" target="_blank" href="${maps}" style="border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;background:#fff">נווט</a>
            <a class="btn" target="_blank" href="${gcal}" style="border:1px solid #111827;border-radius:10px;padding:8px 10px;background:#111827;color:#fff">הוסף ליומן Google</a>
          </div>
        </div>
      </div>`;
  }).join('');

  box.querySelectorAll('[data-jump]').forEach(b=>{
    b.addEventListener('click',()=>{
      const item = (userCenter ? getFilteredList() : EXHIBITIONS).find(x=>x.id===b.getAttribute('data-jump')) || EXHIBITIONS.find(x=>x.id===b.getAttribute('data-jump'));
      if(!item) return;
      map.setView([item.lat,item.lng], 15);
      L.popup().setLatLng([item.lat,item.lng]).setContent(`<b>${item.title}</b><br>${item.venue}`).openOn(map);
    });
  });
}
function renderAll(){ renderList(getFilteredList()); }

/* ---------- Location / Address ---------- */
function setUserCenter(lat,lng,label='המיקום שלך'){
  userCenter = {lat,lng};
  renderAll();
}
async function geocodeAddress(q){
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
  const res = await fetch(url,{headers:{'Accept-Language':'he'}});
  const arr = await res.json();
  if(!arr?.length) throw new Error('לא נמצאה כתובת');
  return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
}
function wireLocationUI(){
  // כפתורים אם קיימים ב-HTML המקורי
  $('#useMyLocationBtn')?.addEventListener('click', ()=>{
    if(!navigator.geolocation){ alert('הדפדפן לא תומך במיקום'); return; }
    navigator.geolocation.getCurrentPosition(
      p => setUserCenter(p.coords.latitude,p.coords.longitude),
      e => alert('נכשל לזהות מיקום: '+e.message),
      {enableHighAccuracy:true, timeout:10000}
    );
  });
  $('#geocodeBtn')?.addEventListener('click', async ()=>{
    const q = $('#addressInput')?.value || '';
    if(!q){ alert('כתבי כתובת'); return; }
    try{
      const p = await geocodeAddress(q);
      setUserCenter(p.lat, p.lng);
      map.setView([p.lat,p.lng], 13);
    }catch{ alert('לא נמצאה כתובת.'); }
  });
  $('#addressInput')?.addEventListener('keydown', e=>{ if(e.key==='Enter') $('#geocodeBtn')?.click(); });
}

/* ---------- Modal for Artist Search ---------- */
function ensureModalUI(){
  if ($('#artistModal')) return;
  const style = document.createElement('style');
  style.textContent = `
    .modal__backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999}
    .modal{background:#0e0e10;color:#f5f7fb;max-width:760px;width:92vw;max-height:80vh;border:1px solid #16171a;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.35);display:flex;flex-direction:column}
    .modal header{padding:14px 16px;border-bottom:1px solid #16171a;display:flex;justify-content:space-between;gap:10px;align-items:center}
    .modal header .title{font-weight:800;font-size:1.05rem}
    .modal .content{padding:12px 16px;overflow:auto}
    .modal .card{background:#111214;border:1px solid #16171a;border-radius:10px;padding:10px;margin:0 0 10px 0}
    .modal .muted{opacity:.75} .modal .small{font-size:.85rem}
    .modal .btn{appearance:none;border:1px solid #2b2c30;background:#1b1c20;color:#f5f7fb;border-radius:8px;padding:8px 10px;cursor:pointer}
    .modal .btn.primary{background:#6f5df6;border-color:#6f5df6}
  `;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = 'artistModal';
  el.className = 'modal__backdrop';
  el.style.display = 'none';
  el.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="artistModalTitle">
      <header>
        <div class="title" id="artistModalTitle"></div>
        <button class="btn" id="artistModalClose">סגירה</button>
      </header>
      <div class="content" id="artistModalContent"></div>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', (e)=>{ if(e.target.id==='artistModal') closeArtistModal(); });
  $('#artistModalClose').addEventListener('click', closeArtistModal);
}
function openArtistModal(title, html){
  ensureModalUI();
  $('#artistModalTitle').textContent = title;
  $('#artistModalContent').innerHTML = html;
  $('#artistModal').style.display = 'flex';
}
function closeArtistModal(){ const el = $('#artistModal'); if(el) el.style.display='none'; }

/* ---------- Artist Search ---------- */
function searchByArtist(name){
  const key = norm(name);
  if(!key){ alert('כתבי שם אמן.'); return; }
  const raw = EXHIBITIONS.filter(x => (x.artists||[]).some(a=> norm(a).includes(key)));
  if(!raw.length){
    openArtistModal(`אין תוצאות עבור: ${name}`, `<div class="muted">לא נמצאו תערוכות לאמן הזה.</div>`);
    return;
  }
  // כבד את מסנני התאריכים/מוזיאון
  const filtered = raw.filter(eventPassesFilters);
  if(!filtered.length){
    openArtistModal(`אין תוצאות עבור: ${name}`, `<div class="muted">יש תוצאות לאמן, אך הן מחוץ לטווח התאריכים/המוזיאון שנבחר.</div>`);
    return;
  }
  const list = userCenter
    ? filtered.map(x=>({...x, d: distanceKm(userCenter,{lat:x.lat,lng:x.lng})})).sort((a,b)=>a.d-b.d)
    : filtered.sort((a,b)=> (a.city||'').localeCompare(b.city||'','he') || (a.title||'').localeCompare(b.title||'','he'));

  const cards = list.map(x=>{
    const dist = (userCenter && x.d!=null) ? `<span class="muted small"> · ${x.d.toFixed(1)} ק״מ</span>` : '';
    const maps = `https://www.google.com/maps?q=${encodeURIComponent(x.venue+' '+(x.address||''))}`;
    const gcal = gcalUrl(x);
    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div>
            <div><b>${x.title}</b> — ${x.venue}<span class="muted small"> · ${x.city}</span>${dist}</div>
            <div class="muted small">${x.start} – ${x.end}</div>
            ${x.address ? `<div class="muted small">${x.address}</div>` : ''}
            <div class="muted small">אמנים: ${x.artists.join(' · ')}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn" data-jump="${x.id}">תמקד במפה</button>
            <a class="btn" target="_blank" href="${maps}">נווט</a>
            <a class="btn primary" target="_blank" href="${gcal}">הוסף ליומן Google</a>
          </div>
        </div>
      </div>`;
  }).join('');
  openArtistModal(`תערוכות של: ${name}`, cards);

  // חיווט כפתורי "תמקד במפה"
  document.querySelectorAll('[data-jump]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-jump');
      const x = list.find(i=>i.id===id); if(!x) return;
      closeArtistModal();
      map.setView([x.lat,x.lng], 15);
      L.popup().setLatLng([x.lat,x.lng]).setContent(`<b>${x.title}</b><br>${x.venue}`).openOn(map);
    });
  });

  // ציור התוצאות על המפה
  markersLayer.clearLayers();
  list.forEach(x=>{
    L.marker([x.lat,x.lng]).addTo(markersLayer)
      .bindPopup(`<b>${x.title}</b><br>${x.venue}<br>${x.city}`);
  });
  try{
    const group = L.featureGroup(list.map(x=>L.marker([x.lat,x.lng])));
    map.fitBounds(group.getBounds().pad(0.2));
  }catch{}
}

/* ---------- Init ---------- */
window.addEventListener('DOMContentLoaded', ()=>{
  ensureFilterUI();
  initMap();
  wireLocationUI();
  renderAll();

  // אם יש מיקום אוטומטי – אפשר לנסות לאתר
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      p => { userCenter = {lat:p.coords.latitude, lng:p.coords.longitude}; renderAll(); },
      ()=>{}, {enableHighAccuracy:true, timeout:6000}
    );
  }
});
