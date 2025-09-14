dayjs.locale('he');

// ========= נתוני דמה – תל אביב =========
const exhibitions = [
  {
    id: 'tlv-01',
    title: 'צללים על הים',
    artists: ['נועה ברוש'],
    venue: 'מוזיאון תל אביב לאמנות',
    address: 'שד׳ שאול המלך 27, תל אביב',
    city: 'תל אביב',
    lat: 32.07759, lng: 34.78934,
    startDate: '2025-09-10', endDate: '2025-12-20',
    description: 'מבט עכשווי על צילום ים-תיכוני, בין חוף עירוני לתיעוד אישי.'
  },
  {
    id: 'tlv-02',
    title: 'גופים בתנועה',
    artists: ['יונתן כץ','תמר גל'],
    venue: 'הגלריה האוניברסיטאית – אונ׳ תל אביב',
    address: 'חיים לבנון 55, תל אביב',
    city: 'תל אביב',
    lat: 32.1149, lng: 34.8043,
    startDate: '2025-09-01', endDate: '2025-10-30',
    description: 'פיסול, וידאו ורישום סביב תנועה אנושית במרחב.'
  },
  {
    id: 'tlv-03',
    title: 'בין קירות',
    artists: ['גיא שלו'],
    venue: 'בית בנימיני – מרכז לקרמיקה',
    address: 'העמל 17, תל אביב',
    city: 'תל אביב',
    lat: 32.0629, lng: 34.7777,
    startDate: '2025-08-20', endDate: '2025-11-10',
    description: 'קרמיקה אדריכלית: מרקמים, זיכרון וחומר.'
  },
  {
    id: 'tlv-04',
    title: 'קו ראשון',
    artists: ['מאיה לוי'],
    venue: 'גלריה נגא',
    address: 'אילת 60, תל אביב',
    city: 'תל אביב',
    lat: 32.0589, lng: 34.7688,
    startDate: '2025-09-12', endDate: '2025-10-25',
    description: 'ציור עכשווי מינימליסטי, שכבות של קווים ושקט.'
  },
  {
    id: 'tlv-05',
    title: 'עיר/צליל',
    artists: ['איתי רז'],
    venue: 'CCA – המרכז לאמנות עכשווית',
    address: 'תל גיבורים 5, תל אביב',
    city: 'תל אביב',
    lat: 32.0596, lng: 34.7847,
    startDate: '2025-09-05', endDate: '2025-11-30',
    description: 'מיצב סאונד-וידאו על הקצב האורבני והאזנה כפעולה.'
  },
  {
    id: 'tlv-06',
    title: 'שכבות של זיכרון',
    artists: ['נטע צור'],
    venue: 'מוזיאון נחום גוטמן לאמנות',
    address: 'שד״ר שמעון רוקח 21, תל אביב',
    city: 'תל אביב',
    lat: 32.0647, lng: 34.7682,
    startDate: '2025-08-15', endDate: '2025-10-31',
    description: 'איור, ארכיונים אישיים ומפות דמיון של העיר.'
  }
];

// ========= מצב אפליקציה =========
let map, markersLayer, userMarker, userLatLng = null;
const catIcon = L.icon({
  // חתול קטן (SVG base64)
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#8b5cf6"/>
      <path d="M8 10c0-2 1.5-3.5 4-3.5S16 8 16 10v3c0 1.7-1.3 3-3 3h-2c-1.7 0-3-1.3-3-3v-3z" fill="#fff"/>
      <circle cx="10" cy="11" r="1" fill="#111"/>
      <circle cx="14" cy="11" r="1" fill="#111"/>
      <path d="M9 14c1 .7 2 .7 3 0" stroke="#111" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M6.5 7l2 2M17.5 7l-2 2" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`),
  iconSize: [34,34], iconAnchor: [17,17]
});

// ========= עזר =========
const $ = sel => document.querySelector(sel);
const km = (m)=> (m/1000).toFixed(2);
const haversine = (a,b)=>{
  const R=6371e3;
  const φ1=a.lat*Math.PI/180, φ2=b.lat*Math.PI/180;
  const Δφ=(b.lat-a.lat)*Math.PI/180;
  const Δλ=(b.lng-a.lng)*Math.PI/180;
  const s = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return 2*R*Math.atan2(Math.sqrt(s),Math.sqrt(1-s)); // במטרים
};
const inDateRange = (ex, startStr, endStr)=>{
  const s = startStr ? dayjs(startStr) : null;
  const e = endStr   ? dayjs(endStr)   : null;
  const exS = dayjs(ex.startDate), exE = dayjs(ex.endDate);
  // חיתוך טווחים: יש חפיפה אם start<=exEnd && end>=exStart
  const startOk = !s || s.isSame(exE) || s.isBefore(exE);
  const endOk   = !e || e.isSame(exS) || e.isAfter(exS);
  return startOk && endOk;
};

// ========= מפה =========
function initMap(){
  map = L.map('map', {zoomControl:false}).setView([32.0853,34.7818], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap'
  }).addTo(map);
  L.control.zoom({position:'topleft'}).addTo(map);

  // שכבת מרקרים
  markersLayer = L.layerGroup().addTo(map);

  // כפתור "הצג מיקום שלי" על המפה
  const LocateCtrl = L.Control.extend({
    onAdd: function(){
      const btn = L.DomUtil.create('button','leaflet-bar my-locate-btn');
      btn.title = 'מרכז למיקומי';
      btn.style.width='34px'; btn.style.height='34px'; btn.style.cursor='pointer';
      btn.style.background='#8b5cf6'; btn.style.border='0';
      btn.style.borderRadius='4px';
      btn.innerHTML = '🐱';
      btn.onclick = centerOnUser;
      return btn;
    },
    onRemove: ()=>{}
  });
  (new LocateCtrl({position:'topleft'})).addTo(map);
}
function centerOnUser(){
  if(userLatLng){
    map.setView(userLatLng, 14, {animate:true});
  }else{
    navigator.geolocation?.getCurrentPosition(setUserLocation, ()=>alert('לא הצלחנו לקבל את המיקום.'));
  }
}
function setUserLocation(pos){
  const {latitude, longitude} = pos.coords;
  userLatLng = {lat:latitude, lng:longitude};
  $('#locationStatus').textContent = `המיקום נבחר (≈ ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  if(!userMarker){
    userMarker = L.marker(userLatLng, {icon:catIcon}).addTo(map).bindPopup('זה המיקום שלך 🐱');
  }else{
    userMarker.setLatLng(userLatLng);
  }
  map.setView(userLatLng, 13);
  refresh();
}

// ========= גיאוקוד כתובת =========
async function geocodeAddress(q){
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {headers:{'Accept-Language':'he'}});
  const data = await res.json();
  if(!data.length) throw new Error('לא נמצאה הכתובת');
  const {lat, lon, display_name} = data[0];
  return {lat: +lat, lng: +lon, label: display_name};
}

// ========= רנדר =========
function renderList(items){
  const list = $('#list');
  list.innerHTML = '';
  if(!items.length){
    list.innerHTML = `<div class="muted">לא נמצאו תערוכות בתנאי הסינון.</div>`;
    return;
  }
  for(const ex of items){
    const el = document.createElement('div');
    el.className = 'card-item';
    el.innerHTML = `
      <div class="title">${ex.title}</div>
      <div class="meta">${ex.venue} · ${ex.address}</div>
      <div class="meta">אמנים: ${ex.artists.join(', ')}</div>
      <div class="meta">תאריכים: ${dayjs(ex.startDate).format('DD.MM.YYYY')} – ${dayjs(ex.endDate).format('DD.MM.YYYY')}</div>
      ${ex._distance ? `<div class="meta">מרחק: ${km(ex._distance)} ק״מ</div>` : ''}
      <div class="actions">
        <span class="link" data-id="${ex.id}">קרא/י עוד</span>
        <span class="link" data-pan="${ex.id}">הצג/י על המפה</span>
      </div>
    `;
    list.appendChild(el);
  }
  // מאזינים ללחיצות
  list.querySelectorAll('[data-id]').forEach(a=>{
    a.addEventListener('click', e=>{
      const ex = exhibitions.find(x=>x.id===e.target.dataset.id);
      openModal(ex);
    });
  });
  list.querySelectorAll('[data-pan]').forEach(a=>{
    a.addEventListener('click', e=>{
      const ex = exhibitions.find(x=>x.id===e.target.dataset.pan);
      map.setView([ex.lat,ex.lng], 15);
    });
  });
}

function renderMarkers(items){
  markersLayer.clearLayers();
  for(const ex of items){
    const m = L.marker([ex.lat, ex.lng]).addTo(markersLayer);
    m.bindPopup(`
      <b>${ex.title}</b><br/>
      ${ex.venue}<br/>
      ${dayjs(ex.startDate).format('DD.MM')}–${dayjs(ex.endDate).format('DD.MM')}<br/>
      <span style="text-decoration:underline;cursor:pointer" data-open="${ex.id}">קרא/י עוד</span>
    `);
    m.on('popupopen', (ev)=>{
      const node = ev.popup.getElement().querySelector('[data-open]');
      node?.addEventListener('click', ()=>{
        openModal(ex);
      });
    });
  }
}

function openModal(ex){
  $('#modalTitle').textContent = `${ex.title} — ${ex.venue}`;
  $('#modalBody').innerHTML = `
    <div class="muted">${ex.address}</div>
    <div style="margin:.5rem 0">אמנים: <b>${ex.artists.join(', ')}</b></div>
    <div class="muted">תאריכים: ${dayjs(ex.startDate).format('DD.MM.YYYY')} – ${dayjs(ex.endDate).format('DD.MM.YYYY')}</div>
    <p style="margin-top:10px">${ex.description}</p>
  `;
  const dlg = $('#exhibitModal');
  dlg.showModal();
}
$('#modalClose').addEventListener('click', ()=>$('#exhibitModal').close());

// ========= סינון ותרענון =========
function currentFilters(){
  const artist = $('#artistInput').value.trim();
  const sDate = $('#startDateInput').value || null;
  const eDate = $('#endDateInput').value || null;
  const radiusKm = +$('#radiusInput').value;
  return {artist, sDate, eDate, radiusKm};
}
function refresh(){
  const {artist, sDate, eDate, radiusKm} = currentFilters();
  let items = exhibitions.filter(ex=> inDateRange(ex, sDate, eDate));

  if(artist){
    const q = artist.toLowerCase();
    items = items.filter(ex =>
      ex.artists.some(a=>a.toLowerCase().includes(q)) ||
      ex.title.toLowerCase().includes(q)
    );
  }

  if(userLatLng){
    items = items.map(ex => ({...ex, _distance: haversine(userLatLng,{lat:ex.lat,lng:ex.lng})}))
                 .filter(ex => ex._distance/1000 <= radiusKm)
                 .sort((a,b)=>a._distance-b._distance);
  }

  renderMarkers(items);
  renderList(items);
}

// ========= אירועים =========
$('#useMyLocationBtn').addEventListener('click', ()=>{
  if(!navigator.geolocation) { alert('דפדפן ללא תמיכת מיקום'); return; }
  navigator.geolocation.getCurrentPosition(setUserLocation, ()=>alert('לא הצלחנו לקבל את המיקום.'));
});

$('#geocodeBtn').addEventListener('click', async ()=>{
  const q = $('#addressInput').value.trim();
  if(!q){ alert('הקלד/י כתובת לחיפוש'); return; }
  try{
    $('#locationStatus').textContent = 'מחפש כתובת…';
    const loc = await geocodeAddress(q);
    userLatLng = {lat:loc.lat, lng:loc.lng};
    $('#locationStatus').textContent = `נבחר מיקום: ${loc.label}`;
    if(!userMarker) userMarker = L.marker(userLatLng, {icon:catIcon}).addTo(map).bindPopup('זה המיקום שבחרת 🐱');
    else userMarker.setLatLng(userLatLng);
    map.setView(userLatLng, 13);
    refresh();
  }catch(err){
    alert('לא נמצאה הכתובת');
    $('#locationStatus').textContent = 'לא נבחר מיקום עדיין';
  }
});

$('#filterBtn').addEventListener('click', refresh);
$('#radiusInput').addEventListener('input', (e)=>{
  $('#radiusLabel').textContent = e.target.value;
});
['artistInput','startDateInput','endDateInput'].forEach(id=>{
  $('#'+id).addEventListener('change', refresh);
  $('#'+id).addEventListener('keyup', (e)=>{ if(e.key==='Enter') refresh(); });
});

// אתחול
initMap();
refresh();
