// ================== Helpers ==================
const $  = (s, c=document)=>c.querySelector(s);
const $$ = (s, c=document)=>Array.from(c.querySelectorAll(s));
const toKm = m => (m/1000).toFixed(1);
const haversine = (a,b)=>{
  const R=6371e3, d2r=x=>x*Math.PI/180;
  const dφ=d2r(b.lat-a.lat), dλ=d2r(b.lng-a.lng);
  const φ1=d2r(a.lat), φ2=d2r(b.lat);
  const h=Math.sin(dφ/2)**2+Math.cos(φ1)*Math.cos(φ2)*Math.sin(dλ/2)**2;
  return 2*R*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
};

// ================== Demo data ==================
const EVENTS = [
  {id:'ta1', title:'תערוכה: קווים של אור', place:'מוזיאון תל אביב', lat:32.0779, lng:34.7860, start:'2025-09-20T19:00:00', end:'2025-09-20T21:00:00'},
  {id:'tlv2', title:'פופ־אפ צילום עכשווי', place:'גלריה גורדון, תל אביב', lat:32.0865, lng:34.7747, start:'2025-09-22T20:00:00', end:'2025-09-22T22:00:00'},
  {id:'jrs1', title:'אמנות ואור בירושלים', place:'העיר העתיקה, ירושלים', lat:31.7783, lng:35.2339, start:'2025-09-25T18:30:00', end:'2025-09-25T20:30:00'},
  {id:'hfa1', title:'הדפס עכשווי', place:'מוזיאון חיפה', lat:32.8150, lng:34.9896, start:'2025-09-28T19:30:00', end:'2025-09-28T21:30:00'}
];

// ================== State ==================
const state = {
  userLoc: null, // {lat,lng,label}
  radiusKm: 10,
  map: null,
  markers: {you:null, events:[]}
};

// ================== Map ==================
function initMap(){
  const center = state.userLoc || {lat:32.08,lng:34.78};
  state.map = L.map($('#map')).setView([center.lat, center.lng], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(state.map);
  setYouMarker();
}

function setYouMarker(){
  if (!state.map || !state.userLoc) return;
  if (state.markers.you) state.map.removeLayer(state.markers.you);
  state.markers.you = L.marker([state.userLoc.lat, state.userLoc.lng], {title:'המיקום שלי'})
    .addTo(state.map).bindPopup('את/ה כאן').openPopup();
}

function clearEventMarkers(){
  state.markers.events.forEach(m=>state.map.removeLayer(m));
  state.markers.events = [];
}

// ================== Render ==================
function renderEvents(){
  const list = $('#results');
  if (!state.userLoc){ list.innerHTML = ''; return; }

  // decorate with distance
  const withDist = EVENTS.map(e=>{
    const d = haversine(state.userLoc, {lat:e.lat,lng:e.lng});
    return {...e, distanceMeters: d};
  })
  .filter(e=> e.distanceMeters <= state.radiusKm*1000 )
  .sort((a,b)=> a.distanceMeters - b.distanceMeters);

  list.innerHTML = withDist.length ? '' : `<div class="card">לא נמצאו תערוכות ברדיוס ${state.radiusKm} ק״מ.</div>`;

  clearEventMarkers();

  withDist.forEach(ev=>{
    // card
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${ev.title}</h3>
      <div class="muted small">${ev.place}</div>
      <div class="muted small">מרחק: ${toKm(ev.distanceMeters)} ק״מ</div>
      <div class="row wrap">
        <button class="primary" data-act="maps">פתח מפות</button>
        <button class="accent"  data-act="gcal">הוסף ליומן</button>
        <button class="secondary" data-act="share">שיתוף</button>
      </div>
    `;
    // actions
    card.addEventListener('click', (e)=>{
      const btn = e.target.closest('button'); if(!btn) return;
      const act = btn.dataset.act;
      if (act==='maps'){
        const q = encodeURIComponent(`${ev.title} ${ev.place}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${ev.lat},${ev.lng} (${q})`, '_blank');
      } else if (act==='gcal'){
        // ICS download
        const ics = [
          'BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','METHOD:PUBLISH',
          'BEGIN:VEVENT',
          `UID:${ev.id}@i-seeeeeeee`,
          `SUMMARY:${ev.title}`,
          `DTSTART:${ev.start.replace(/[-:]/g,'').replace('.000','').replace('T','T')}`,
          `DTEND:${ev.end.replace(/[-:]/g,'').replace('.000','').replace('T','T')}`,
          `LOCATION:${ev.place}`,
          'END:VEVENT','END:VCALENDAR'
        ].join('\r\n');
        const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${ev.id}.ics`; a.click();
        URL.revokeObjectURL(url);
      } else if (act==='share'){
        const text = `${ev.title} • ${ev.place} • ${toKm(ev.distanceMeters)} ק״מ ממני`;
        if (navigator.share) navigator.share({title:ev.title,text, url: location.href});
        else {
          navigator.clipboard?.writeText(text);
          alert('הפרטים הועתקו ללוח.');
        }
      }
    });

    list.appendChild(card);

    // marker
    const m = L.marker([ev.lat, ev.lng], {title: ev.title})
      .addTo(state.map)
      .bindPopup(`<b>${ev.title}</b><br/>${ev.place}<br/>${toKm(ev.distanceMeters)} ק״מ`);
    state.markers.events.push(m);
  });

  // fit bounds
  const points = [
    [state.userLoc.lat, state.userLoc.lng],
    ...state.markers.events.map(m=>m.getLatLng())
  ];
  if (points.length>1){
    state.map.fitBounds(points, {padding:[40,40]});
  }
}

// ================== Geolocation (auto + manual) ==================
async function geocodeAddress(addr){
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&accept-language=he`;
  const res = await fetch(url, {headers:{'User-Agent':'exhibitions-app-demo'}});
  const data = await res.json();
  if (!data.length) throw new Error('כתובת לא נמצאה');
  const item = data[0];
  return {lat: parseFloat(item.lat), lng: parseFloat(item.lon), label: item.display_name};
}

function setUserLoc(loc){
  state.userLoc = loc;
  $('#chosenPlace').textContent = loc.label || `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
  if (!state.map) initMap();
  setYouMarker();
  renderEvents();
}

// ================== DOM bindings ==================
document.addEventListener('DOMContentLoaded', ()=>{
  // radius slider
  const radius = $('#radiusInput'), radiusVal = $('#radiusVal');
  if (radius){
    radius.addEventListener('input', ()=>{
      state.radiusKm = +radius.value;
      radiusVal.textContent = radius.value;
      renderEvents();
    });
    state.radiusKm = +radius.value;
    radiusVal.textContent = radius.value;
  }

  // manual address search
  $('#geocodeBtn')?.addEventListener('click', async ()=>{
    const addr = $('#addressInput').value.trim();
    if (!addr) return alert('כתבי כתובת…');
    try{
      const loc = await geocodeAddress(addr);
      setUserLoc({lat:loc.lat, lng:loc.lng, label: addr});
      state.map.setView([loc.lat, loc.lng], 13);
    }catch(e){ alert('לא הצלחתי לאתר את הכתובת'); }
  });

  // “use my location” button
  $('#useMyLocationBtn')?.addEventListener('click', ()=> getGeolocation());

  // global controls (דמו כללי)
  $('#openMapsBtn')?.addEventListener('click', ()=>{
    if (!state.userLoc) return alert('בחרי מיקום קודם');
    window.open(`https://www.google.com/maps/search/?api=1&query=${state.userLoc.lat},${state.userLoc.lng}`,'_blank');
  });

  $('#addToCalendarBtn')?.addEventListener('click', ()=>{
    // לוקח את האירוע הקרוב ביותר כרגע
    if (!state.userLoc) return alert('בחרי מיקום קודם');
    const nearest = EVENTS
      .map(e=>({...e, d:haversine(state.userLoc,{lat:e.lat,lng:e.lng})}))
      .sort((a,b)=>a.d-b.d)[0];
    if (!nearest) return alert('אין אירועים קרובים');
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${nearest.id}@i-seeeeeeee`,
      `SUMMARY:${nearest.title}`,
      `DTSTART:${nearest.start.replace(/[-:]/g,'')}`,
      `DTEND:${nearest.end.replace(/[-:]/g,'')}`,
      `LOCATION:${nearest.place}`,
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${nearest.id}.ics`; a.click();
    URL.revokeObjectURL(url);
  });

  $('#shareBtn')?.addEventListener('click', ()=>{
    if (navigator.share) navigator.share({title:'i_seeeeeeee — Exhibitions', url: location.href});
    else { navigator.clipboard?.writeText(location.href); alert('קישור הועתק.'); }
  });

  $('#submitEventBtn')?.addEventListener('click', ()=>{
    alert('טופס “הוסף אירוע” יגיע בשלב הבא 🙂');
  });

  // init map immediately (so שיש קנבס), ואז ננסה מיקום אוטומטי
  initMap();
  getGeolocation(true);
});

// ================== Auto Geolocation ==================
function getGeolocation(isAuto=false){
  if (!navigator.geolocation){
    if (isAuto) console.warn('Geolocation לא נתמך');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      setUserLoc({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        label: 'המיקום שלי'
      });
    },
    err=>{
      if (isAuto){
        console.warn('שגיאת מיקום אוטומטי:', err.message);
        // ברירת מחדל נעימה
        setUserLoc({lat:32.08,lng:34.78,label:'תל אביב (ברירת מחדל)'});
      }else{
        alert('לא ניתן לאתר מיקום כרגע');
      }
    },
    {enableHighAccuracy:true, timeout:8000, maximumAge:60000}
  );
}
