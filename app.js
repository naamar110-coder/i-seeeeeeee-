// ===== עזר מהיר =====
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

// ===== דמו: תערוכות עם תיאור ותמונה =====
const EVENTS = [
  {
    id:'tlv1', title:'אמנות רחוב בתל אביב',
    place:'גלריה גורדון, תל אביב', lat:32.0853, lng:34.7818,
    start:'2025-09-20T18:00:00', end:'2025-09-20T21:00:00',
    desc:'תערוכה קבוצתית של אמני רחוב צעירים מהמרכז, בהשראת החיים העירוניים.',
    img:'https://source.unsplash.com/900x600/?street-art,graffiti'
  },
  {
    id:'tlv2', title:'צילום עכשווי',
    place:'מוזיאון תל אביב', lat:32.0779, lng:34.7860,
    start:'2025-09-22T19:30:00', end:'2025-09-22T22:00:00',
    desc:'תערוכת צילום המציגה אמנים בינלאומיים לצד יוצרים מקומיים.',
    img:'https://source.unsplash.com/900x600/?photography,art'
  },
  {
    id:'jrs1', title:'אמנות אור בירושלים',
    place:'מוזיאון ישראל, ירושלים', lat:31.7722, lng:35.2043,
    start:'2025-09-25T20:00:00', end:'2025-09-25T22:00:00',
    desc:'מיצבים אינטראקטיביים סביב נושא האור, בחללים פנימיים וחיצוניים.',
    img:'https://source.unsplash.com/900x600/?light,installation'
  },
  {
    id:'hfa1', title:'הדפס עכשווי',
    place:'מוזיאון חיפה לאמנות', lat:32.8150, lng:34.9896,
    start:'2025-09-28T18:00:00', end:'2025-09-28T20:00:00',
    desc:'סקירה רחבה של אמני הדפס ישראלים עם טכניקות חדשות.',
    img:'https://source.unsplash.com/900x600/?printmaking,art'
  },
  {
    id:'bsh1', title:'פסלים בים',
    place:'אשדוד ארט מוזיאום', lat:31.7928, lng:34.6497,
    start:'2025-09-30T17:00:00', end:'2025-09-30T19:30:00',
    desc:'תערוכה חיצונית של פסלים מול הים, עם אמנים בינ״ל.',
    img:'https://source.unsplash.com/900x600/?sculpture,sea'
  },
  {
    id:'nat1', title:'תערוכת וידאו ארט',
    place:'גלריה העיר, נתניה', lat:32.3215, lng:34.8532,
    start:'2025-10-02T19:00:00', end:'2025-10-02T21:00:00',
    desc:'וידאו-ארט חדשני של אמנים צעירים, בשילוב הקרנות חוץ.',
    img:'https://source.unsplash.com/900x600/?video,art'
  },
  {
    id:'b7-1', title:'עבודות חדשות בבאר שבע',
    place:'מרכז לאמנות דיגיטלית, באר שבע', lat:31.2520, lng:34.7915,
    start:'2025-10-05T18:30:00', end:'2025-10-05T21:00:00',
    desc:'קבוצתית בתחום האמנות הדיגיטלית, חוויה אינטראקטיבית.',
    img:'https://source.unsplash.com/900x600/?digital,art'
  }
];

// ===== מצב =====
const state = {
  userLoc: null,          // {lat,lng,label}
  radiusKm: 10,
  map: null,
  markers: { you:null, events:[] }
};

// ===== מפה =====
function initMap(){
  const center = state.userLoc || {lat:32.08, lng:34.78}; // תל אביב ברירת מחדל
  state.map = L.map($('#map')).setView([center.lat, center.lng], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19, attribution:'&copy; OpenStreetMap'
  }).addTo(state.map);
  setYouMarker();
}
function setYouMarker(){
  if (!state.map || !state.userLoc) return;
  if (state.markers.you) state.map.removeLayer(state.markers.you);
  state.markers.you = L.circleMarker([state.userLoc.lat, state.userLoc.lng], {
    radius:7, color:'#a78bfa', fillColor:'#a78bfa', fillOpacity:.9
  }).addTo(state.map).bindPopup('את/ה כאן');
}
function clearEventMarkers(){
  state.markers.events.forEach(m=>state.map.removeLayer(m));
  state.markers.events = [];
}

// ===== רנדר תערוכות =====
function renderEvents(){
  const list = $('#results');
  if (!state.userLoc){ list.innerHTML = ''; return; }

  const withDist = EVENTS
    .map(e=>({...e, d: haversine(state.userLoc, {lat:e.lat,lng:e.lng})}))
    .filter(e=> e.d <= state.radiusKm*1000)
    .sort((a,b)=> a.d - b.d);

  list.innerHTML = withDist.length ? '' :
    `<div class="card">לא נמצאו תערוכות ברדיוס ${state.radiusKm} ק״מ.</div>`;

  clearEventMarkers();

  withDist.forEach(ev=>{
    // כרטיס
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${ev.img}" alt="${ev.title}">
      <h3>${ev.title}</h3>
      <div class="muted small">${ev.place}</div>
      <div class="muted small">${new Date(ev.start).toLocaleString('he-IL')}</div>
      <p class="small" style="margin:.4rem 0">${ev.desc}</p>
      <div class="row wrap">
        <button class="primary"  data-act="maps">פתח מפות</button>
        <button class="accent"   data-act="ics">הוסף ליומן</button>
        <button class="secondary" data-act="share">שיתוף</button>
      </div>
    `;
    card.addEventListener('click', (e)=>{
      const btn = e.target.closest('button'); if(!btn) return;
      const act = btn.dataset.act;
      if (act==='maps'){
        const q = encodeURIComponent(`${ev.title} ${ev.place}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${ev.lat},${ev.lng} (${q})`, '_blank');
      } else if (act==='ics'){
        const dt = s=> s.replace(/[-:]/g,'').replace('.000','');
        const ics = [
          'BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','METHOD:PUBLISH',
          'BEGIN:VEVENT',
          `UID:${ev.id}@i-seeeeeeee`,
          `SUMMARY:${ev.title}`,
          `DTSTART:${dt(ev.start)}`,
          `DTEND:${dt(ev.end)}`,
          `LOCATION:${ev.place}`,
          'END:VEVENT','END:VCALENDAR'
        ].join('\r\n');
        const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${ev.id}.ics`; a.click();
        URL.revokeObjectURL(url);
      } else if (act==='share'){
        const text = `${ev.title} • ${ev.place} • ${toKm(ev.d)} ק״מ ממני`;
        if (navigator.share) navigator.share({title:ev.title, text, url: location.href});
        else { navigator.clipboard?.writeText(text); alert('הפרטים הועתקו ללוח'); }
      }
    });
    list.appendChild(card);

    // סמן על המפה
    const m = L.marker([ev.lat, ev.lng], {title: ev.title})
      .addTo(state.map)
      .bindPopup(`<b>${ev.title}</b><br/>${ev.place}<br/>${toKm(ev.d)} ק״מ`);
    state.markers.events.push(m);
  });

  // התאמת תצוגה
  const bounds = [
    [state.userLoc.lat, state.userLoc.lng],
    ...state.markers.events.map(m=>m.getLatLng())
  ];
  if (bounds.length>1) state.map.fitBounds(bounds, {padding:[40,40]});
}

// ===== גאולוקציה =====
async function geocodeAddress(addr){
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&accept-language=he`;
  const res = await fetch(url, {headers:{'User-Agent':'exhibitions-app-demo'}});
  const data = await res.json();
  if (!data.length) throw new Error('כתובת לא נמצאה');
  const item = data[0];
  return {lat:+item.lat, lng:+item.lon, label:item.display_name};
}
function setUserLoc(loc){
  state.userLoc = loc;
  $('#chosenPlace').textContent = loc.label || `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
  if (!state.map) initMap();
  setYouMarker();
  renderEvents();
}
function getGeolocation(isAuto=false){
  if (!navigator.geolocation){ if(!isAuto) alert('הדפדפן לא תומך במיקום'); return; }
  navigator.geolocation.getCurrentPosition(
    pos=> setUserLoc({lat:pos.coords.latitude, lng:pos.coords.longitude, label:'המיקום שלי'}),
    err=> {
      if (isAuto){
        // ברירת מחדל נעימה
        setUserLoc({lat:32.08, lng:34.78, label:'תל אביב (ברירת מחדל)'});
      } else {
        alert('לא ניתן לאתר מיקום כרגע');
      }
    },
    {enableHighAccuracy:true, timeout:8000, maximumAge:60000}
  );
}

// ===== DOM =====
document.addEventListener('DOMContentLoaded', ()=>{
  // מפה + מיקום אוטומטי
  initMap();
  getGeolocation(true);

  // רדיוס
  const r = $('#radiusInput'), rv = $('#radiusVal');
  if (r){ r.addEventListener('input', ()=>{ state.radiusKm=+r.value; rv.textContent=r.value; renderEvents(); }); rv.textContent=r.value; state.radiusKm=+r.value; }

  // חיפוש כתובת ידני
  $('#geocodeBtn')?.addEventListener('click', async ()=>{
    const addr = $('#addressInput').value.trim();
    if (!addr) return alert('כתבי כתובת…');
    try{
      const loc = await geocodeAddress(addr);
      setUserLoc({lat:loc.lat, lng:loc.lng, label:addr});
      state.map.setView([loc.lat, loc.lng], 13);
    } catch(e){ alert('לא הצלחתי לאתר את הכתובת'); }
  });

  // כפתור “השתמש במיקומי”
  $('#useMyLocationBtn')?.addEventListener('click', ()=> getGeolocation(false));

  // “התחברות/התנתקות” — דמו UI
  $('#loginBtn')?.addEventListener('click', ()=>{
    $('#loginBtn').style.display='none';
    $('#logoutBtn').style.display='inline-block';
    alert('מחוברת! (דמו)');
  });
  $('#logoutBtn')?.addEventListener('click', ()=>{
    $('#logoutBtn').style.display='none';
    $('#loginBtn').style.display='inline-block';
    alert('התנתקת (דמו)');
  });
});
