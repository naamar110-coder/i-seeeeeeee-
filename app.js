// ===== שירותי עזר =====
const $ = (sel) => document.querySelector(sel);

const km = (m) => (m / 1000).toFixed(1);
function haversine(lat1, lon1, lat2, lon2){
  const toRad = d => d * Math.PI/180;
  const R = 6371; // ק"מ
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}
function fmtDate(d){ return new Date(d).toLocaleDateString('he-IL', {year:'numeric', month:'2-digit', day:'2-digit'}); }
function withinRange(dateISO, fromISO, toISO){
  const t = new Date(dateISO).getTime();
  if (fromISO && t < new Date(fromISO).getTime()) return false;
  if (toISO && t > new Date(toISO).getTime()) return false;
  return true;
}

// ===== נתונים פיקטיביים (ת"א והסביבה) =====
const exhibitions = [
  {
    id:'ta1',
    title:'מראות העיר',
    artists:['דני לוי','נועה כהן'],
    gallery:'מוזיאון תל אביב לאמנות',
    lat:32.0787, lng:34.7860,
    start:'2025-09-01', end:'2025-10-31',
    desc:'תערוכה קבוצתית על יחסי עיר/אדם.',
    url:'https://www.tamuseum.org.il/'
  },
  {
    id:'ta2',
    title:'גווני ים',
    artists:['יעל רז'],
    gallery:'גלריה גורדון',
    lat:32.0897, lng:34.7744,
    start:'2025-09-10', end:'2025-11-01',
    desc:'ציורים חדשים בהשראת הים התיכון.',
    url:'https://gordongallery.co.il/'
  },
  {
    id:'ta3',
    title:'קו ואור',
    artists:['איתי אלון'],
    gallery:'גלריה אלון שגב',
    lat:32.0813, lng:34.7722,
    start:'2025-09-05', end:'2025-10-20',
    desc:'עבודות אור ומיצב חדשות.',
    url:'https://www.alonsegev.com/'
  },
  {
    id:'ta4',
    title:'שכבות של זמן',
    artists:['נועה כהן'],
    gallery:'בית בנימיני – מרכז לקרמיקה',
    lat:32.0617, lng:34.7771,
    start:'2025-08-20', end:'2025-10-15',
    desc:'קרמיקה עכשווית ותהליכי חיפוש חומרי.',
    url:'https://www.benyamine.org/'
  },
  {
    id:'ta5',
    title:'מסלולי לילה',
    artists:['דנה ברק','אלכס פומר'],
    gallery:'CCA תל אביב',
    lat:32.0647, lng:34.7743,
    start:'2025-09-12', end:'2025-11-30',
    desc:'וידאו-ארט ותיעוד העיר בלילה.',
    url:'https://www.cca.org.il/'
  }
];

// ===== מצב אפליקציה =====
let userPos = null;     // { lat, lng }
let map, userMarker, groupLayer;

// ===== אתחול מפה =====
function initMap(){
  map = L.map('map', { zoomControl:true }).setView([32.0853, 34.7818], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  groupLayer = L.layerGroup().addTo(map);
}
initMap();

// ===== UI אלמנטים =====
const addressInput = $('#addressInput');
const addressBtn   = $('#addressBtn');
const locateBtn    = $('#locateBtn');
const radiusInput  = $('#radiusInput');
const radiusLabel  = $('#radiusLabel');
const statusEl     = $('#status');
const resultsEl    = $('#results');

const artistInput  = $('#artistInput');
const fromDate     = $('#fromDate');
const toDate       = $('#toDate');
const artistBtn    = $('#artistBtn');

const dlg          = $('#exhibitDialog');
const dlgTitle     = $('#dlgTitle');
const dlgBody      = $('#dlgBody');
const dlgLink      = $('#dlgLink');
$('#dlgClose').onclick = () => dlg.close();

const aDlg         = $('#artistDialog');
$('#artistDlgClose').onclick = () => aDlg.close();

// ===== בחירת מיקום =====
async function geocodeAddress(q){
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&accept-language=he`;
  const res = await fetch(url, { headers:{ 'User-Agent':'isee-exhibitions-demo' }});
  const data = await res.json();
  return data?.[0] ? { lat:+data[0].lat, lng:+data[0].lon, display:data[0].display_name } : null;
}

function setUserPos({lat,lng}, label='מיקום נבחר'){
  userPos = {lat,lng};
  statusEl.textContent = `${label}: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  if (!userMarker) userMarker = L.marker([lat,lng], {title:'את/ה כאן'}).addTo(map);
  userMarker.setLatLng([lat,lng]);
  map.setView([lat,lng], 13);
  render();
}

addressBtn.onclick = async () => {
  const q = addressInput.value.trim();
  if (!q) return;
  statusEl.textContent = 'מחפש כתובת...';
  const pos = await geocodeAddress(q);
  if (!pos){ statusEl.textContent = 'כתובת לא נמצאה'; return; }
  setUserPos(pos, pos.display);
};

locateBtn.onclick = () => {
  if (!navigator.geolocation){ statusEl.textContent = 'דפדפן לא תומך במיקום'; return; }
  statusEl.textContent = 'מאתר מיקום...';
  navigator.geolocation.getCurrentPosition(
    (p)=> setUserPos({lat:p.coords.latitude, lng:p.coords.longitude}, 'מיקום נוכחי'),
    ()=> statusEl.textContent = 'לא הצלחנו לאתר מיקום'
  );
};

radiusInput.oninput = () => {
  radiusLabel.textContent = radiusInput.value;
  render();
};

// ===== סינון לפי אמן/תאריכים =====
function filterByArtistAndDates(list){
  const artist = artistInput.value.trim();
  const from = fromDate.value || null;
  const to = toDate.value || null;

  let filtered = list;
  if (artist){
    const q = artist.toLowerCase();
    filtered = filtered.filter(ex => ex.artists.some(a => a.toLowerCase().includes(q)));
  }
  if (from || to){
    filtered = filtered.filter(ex => {
      // תערוכה מוצגת אם טווח התערוכה חופף לטווח המבוקש
      const s = ex.start, e = ex.end;
      const ovl =
        (!from || new Date(e) >= new Date(from)) &&
        (!to   || new Date(s) <= new Date(to));
      // בנוסף, לבדיקה פרטנית של withinRange לכל יום מרכזי (פשוט יותר):
      return ovl && (withinRange(s, from, to) || withinRange(e, from, to) || withinRange((new Date((new Date(s).getTime()+new Date(e).getTime())/2)).toISOString(), from, to));
    });
  }
  return filtered;
}

// ===== רינדור =====
function render(){
  groupLayer.clearLayers();
  resultsEl.innerHTML = '';

  let list = [...exhibitions];

  // סינון לפי טקסט/תאריכים
  list = filterByArtistAndDates(list);

  // מרחק ורדיוס
  if (userPos){
    list = list.map(ex => ({...ex, distance: haversine(userPos.lat, userPos.lng, ex.lat, ex.lng)}))
               .filter(ex => ex.distance <= +radiusInput.value)
               .sort((a,b)=>a.distance - b.distance);
  } else {
    list = list.sort((a,b)=> new Date(a.start) - new Date(b.start));
  }

  // סמנים במפה
  list.forEach(ex => {
    const m = L.marker([ex.lat,ex.lng], {title: ex.title});
    m.bindPopup(`<b>${ex.title}</b><br>${ex.gallery}<br>${ex.artists.join(', ')}`);
    m.addTo(groupLayer);
  });
  if (userPos && list.length){ 
    const bounds = L.latLngBounds(list.map(ex => [ex.lat,ex.lng]).concat([[userPos.lat,userPos.lng]]));
    map.fitBounds(bounds, {padding:[30,30]});
  }

  // רשימה
  if (!list.length){
    resultsEl.innerHTML = `<div class="muted">לא נמצאו תערוכות בהתאם למסננים.</div>`;
    return;
  }

  list.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'exhibit';
    card.innerHTML = `
      <div style="flex:1">
        <div class="title">${ex.title}</div>
        <div class="meta">${ex.gallery} · ${ex.artists.join(' • ')}</div>
        <div class="meta">תאריכים: ${fmtDate(ex.start)} – ${fmtDate(ex.end)}</div>
        ${userPos ? `<div class="pill">כ-${ex.distance.toFixed(1)} ק״מ ממך</div>` : ``}
      </div>
      <div><button class="ghost" data-id="${ex.id}">קרא/י עוד</button></div>
    `;
    card.querySelector('button').onclick = () => openExhibit(ex.id);
    resultsEl.appendChild(card);
  });
}

// דיאלוג פרטי תערוכה
function openExhibit(id){
  const ex = exhibitions.find(x => x.id === id);
  if (!ex) return;
  dlgTitle.textContent = ex.title;
  dlgBody.innerHTML = `
    <div class="meta"><b>גלריה:</b> ${ex.gallery}</div>
    <div class="meta"><b>אמנים:</b> ${ex.artists.join(', ')}</div>
    <div class="meta"><b>תאריכים:</b> ${fmtDate(ex.start)} – ${fmtDate(ex.end)}</div>
    <p style="margin-top:8px">${ex.desc}</p>
  `;
  dlgLink.href = ex.url || '#';
  dlg.showModal();
}

// דיאלוג תוצאות אמן
artistBtn.onclick = () => {
  const q = artistInput.value.trim();
  const from = fromDate.value || null;
  const to = toDate.value || null;
  const list = filterByArtistAndDates(exhibitions);
  const html = list.length
    ? list.map(ex => `
        <div class="exhibit">
          <div style="flex:1">
            <div class="title">${ex.title}</div>
            <div class="meta">${ex.gallery} · ${ex.artists.join(' • ')}</div>
            <div class="meta">תאריכים: ${fmtDate(ex.start)} – ${fmtDate(ex.end)}</div>
          </div>
          <div><button class="ghost" data-id="${ex.id}">פרטים</button></div>
        </div>
      `).join('')
    : `<div class="muted">לא נמצאו תערוכות עבור "${q || 'כל האמנים'}"${(from||to)?' בטווח התאריכים המבוקש':''}.</div>`;
  const holder = $('#artistDlgBody');
  holder.innerHTML = html;
  holder.querySelectorAll('button[data-id]').forEach(btn => {
    btn.onclick = (e)=>{ aDlg.close(); openExhibit(btn.dataset.id); };
  });
  aDlg.showModal();
};

// רענון ראשון
render();
