הנה app.js מלא, להדבקה אחת-לאחת. הוא כולל: זיהוי מיקום אוטומטי, חיפוש כתובת, רדיוס, מפה, כרטיסים עם תמונה/תיאור/כפתורים, וגם מקטע “כל התערוכות בתל-אביב”.

// =========== Helpers ===========
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

// =========== Demo Data: Exhibitions (with TLV list) ===========
const EVENTS = [
  // --- תל אביב ---
  { id:'ta-a', title:'אמנות דיגיטלית על החוף', place:'נמל תל אביב', lat:32.0972, lng:34.7748, start:'2025-10-01T18:00:00', end:'2025-10-01T21:00:00', desc:'מיצבים אינטראקטיביים לאורך הרציף.', img:'https://source.unsplash.com/900x600/?installation,art' },
  { id:'ta-b', title:'ציור עכשווי במרכז', place:'מתחם הבימה, תל אביב', lat:32.0724, lng:34.7799, start:'2025-10-03T19:00:00', end:'2025-10-03T22:00:00', desc:'ציורים גדולי־מימד של אמנים מקומיים.', img:'https://source.unsplash.com/900x600/?painting,art' },
  { id:'ta-c', title:'צילום רחוב', place:'שוק הכרמל, תל אביב', lat:32.0677, lng:34.7695, start:'2025-10-05T17:30:00', end:'2025-10-05T20:30:00', desc:'תצלומי רחוב וחיי יום־יום בעיר.', img:'https://source.unsplash.com/900x600/?street,photo' },
  { id:'ta-d', title:'אמנות אור', place:'שדרות רוטשילד, תל אביב', lat:32.0635, lng:34.7740, start:'2025-10-07T20:00:00', end:'2025-10-07T22:00:00', desc:'אור, ניאון ופרפורמנס לילי.', img:'https://source.unsplash.com/900x600/?neon,art' },
  { id:'ta-e', title:'מינימליזם לבן', place:'מוזיאון תל אביב', lat:32.0779, lng:34.7860, start:'2025-10-10T18:30:00', end:'2025-10-10T21:00:00', desc:'תערוכת מינימליזם בחלל לבן.', img:'https://source.unsplash.com/900x600/?minimal,art' },
  { id:'ta-f', title:'פופ-אפ קראפט', place:'מתחם שרונה, תל אביב', lat:32.0711, lng:34.7866, start:'2025-10-12T16:00:00', end:'2025-10-12T19:00:00', desc:'אובייקטים בעבודת יד ואמנות שימושית.', img:'https://source.unsplash.com/900x600/?craft,art' },
  { id:'ta-g', title:'פרינטים ו-Zines', place:'פלורנטין, תל אביב', lat:32.0566, lng:34.7700, start:'2025-10-14T18:00:00', end:'2025-10-14T21:00:00', desc:'תרבות דפוס עצמאית והפקות קטנות.', img:'https://source.unsplash.com/900x600/?zine,print' },
  { id:'ta-h', title:'אמנות ומוזיקה', place:'כיכר דיזנגוף, תל אביב', lat:32.0787, lng:34.7749, start:'2025-10-16T20:00:00', end:'2025-10-16T22:30:00', desc:'שיתופי פעולה של אמנים ומוזיקאים.', img:'https://source.unsplash.com/900x600/?music,art' },
  { id:'ta-i', title:'פסלים בטבע העירוני', place:'פארק הירקון, תל אביב', lat:32.1025, lng:34.8126, start:'2025-10-18T10:00:00', end:'2025-10-18T13:00:00', desc:'סיור פסלים לאורך הנחל.', img:'https://source.unsplash.com/900x600/?sculpture,park' },
  { id:'ta-j', title:'גלריות פתוחות', place:'רחוב גורדון, תל אביב', lat:32.0858, lng:34.7718, start:'2025-10-20T18:00:00', end:'2025-10-20T21:30:00', desc:'ערב פתוח בגלריות השכונה.', img:'https://source.unsplash.com/900x600/?gallery,art' },

  // --- מחוץ לת״א (לבדיקת מרחק/מפה)
  { id:'jrs1', title:'אמנות אור בירושלים', place:'מוזיאון ישראל, ירושלים', lat:31.7722, lng:35.2043, start:'2025-09-25T20:00:00', end:'2025-09-25T22:00:00', desc:'מיצבים סביב נושא האור.', img:'https://source.unsplash.com/900x600/?light,installation' },
  { id:'hfa1', title:'הדפס עכשווי', place:'מוזיאון חיפה לאמנות', lat:32.8150, lng:34.9896, start:'2025-09-28T18:00:00', end:'2025-09-28T20:00:00', desc:'אמני הדפס ישראלים.', img:'https://source.unsplash.com/900x600/?printmaking,art' }
];

// =========== State ===========
const state = {
  userLoc: null,          // {lat,lng,label}
  radiusKm: 10,
  map: null,
  markers: { you:null, events:[] }
};

// =========== Map ===========
function initMap(){
  const center = state.userLoc || {lat:32.08, lng:34.78}; // תל אביב כברירת מחדל
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

// =========== Render: events + markers ===========
function renderEvents(){
  const list = $('#results');
  if (!state.userLoc){ list.innerHTML = ''; renderTelAvivList(); return; }

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
    // פעולות
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
        const text = `${ev.title} • ${ev.place}${state.userLoc ? ' • '+toKm(ev.d)+' ק״מ ממני' : ''}`;
        if (navigator.share) navigator.share({title:ev.title, text, url: location.href});
        else { navigator.clipboard?.writeText(text); alert('הפרטים הועתקו ללוח'); }
      }
    });
    list.appendChild(card);

    // סמן על המפה
    const m = L.marker([ev.lat, ev.lng], {title: ev.title})
      .addTo(state.map)
      .bindPopup(`<b>${ev.title}</b><br/>${ev.place}${state.userLoc ? `<br/>${toKm(ev.d)} ק״מ` : ''}`);
    state.markers.events.push(m);
  });

  // התאמת תצוגה
  const bounds = state.markers.events.map(m=>m.getLatLng());
  if (state.userLoc) bounds.push([state.userLoc.lat, state.userLoc.lng]);
  if (bounds.length>1) state.map.fitBounds(bounds, {padding:[40,40]});

  // מרעננים גם את רשימת תל אביב
  renderTelAvivList();
}

// =========== Tel-Aviv block ===========
function renderTelAvivList(){
  const ul = $('#telAvivList');
  if (!ul) return;
  const tlv = EVENTS.filter(e => /תל ?אביב/.test(e.place));
  ul.innerHTML = tlv.map(e => {
    const when = new Date(e.start).toLocaleString('he-IL');
    const maps = `https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`;
    return `
      <li style="margin:10px 0; list-style:none;">
        <div style="display:flex;gap:10px;align-items:center;">
          <img src="${e.img}" alt="${e.title}" style="width:84px;height:56px;object-fit:cover;border-radius:8px;border:1px solid #eee">
          <div>
            <div style="font-weight:700">${e.title}</div>
            <div class="muted small">${e.place} · ${when}</div>
            <div class="row wrap" style="margin-top:6px">
              <button class="primary" onclick="window.open('${maps}','_blank')">מפות</button>
              <button class="accent" onclick="(function(){
                const dt=s=>s.replace(/[-:]/g,'').replace('.000','');
                const ics=['BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
                  'UID:${e.id}@i-seeeeeeee','SUMMARY:${e.title}',
                  'DTSTART:'+dt('${e.start}'),'DTEND:'+dt('${e.end}'),'LOCATION:${e.place}',
                  'END:VEVENT','END:VCALENDAR'].join('\\r\\n');
                const b=new Blob([ics],{type:'text/calendar;charset=utf-8'}),u=URL.createObjectURL(b);
                const a=document.createElement('a'); a.href=u; a.download='${e.id}.ics'; a.click(); URL.revokeObjectURL(u);
              })()">הוסף ליומן</button>
              <button class="secondary" onclick="(navigator.share?navigator.share({title:'${e.title}',text:'${e.title} · ${e.place}',url:location.href}):navigator.clipboard.writeText('${e.title} · ${e.place}'))">שיתוף</button>
            </div>
          </div>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:10px 0 0;">
      </li>
    `;
  }).join('');
}

// =========== Geocoding & Location ===========
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
  $('#chosenPlace')?.textContent = loc.label || `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
  if (!state.map) initMap();
  setYouMarker();
  renderEvents();
}
function getGeolocation(isAuto=false){
  if (!navigator.geolocation){ if(!isAuto) alert('הדפדפן לא תומך במיקום'); return; }
  navigator.geolocation.getCurrentPosition(
    pos=> setUserLoc({lat:pos.coords.latitude, lng:pos.coords.longitude, label:'המיקום שלי'}),
    _err=> {
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

// =========== DOM Bindings ===========
document.addEventListener('DOMContentLoaded', ()=>{
  // מפה + מיקום אוטומטי
  initMap();
  getGeolocation(true);

  // רדיוס
  const r = $('#radiusInput'), rv = $('#radiusVal');
  if (r){ 
    r.addEventListener('input', ()=>{ state.radiusKm=+r.value; rv.textContent=r.value; renderEvents(); });
    rv.textContent=r.value; state.radiusKm=+r.value;
  }

  // חיפוש כתובת ידני
  $('#geocodeBtn')?.addEventListener('click', async ()=>{
    const addr = $('#addressInput').value.trim();
    if (!addr) return alert('כתבי כתובת…');
    try{
      const loc = await geocodeAddress(addr);
      setUserLoc({lat:loc.lat, lng:loc.lng, label:addr});
      state.map.setView([loc.lat, loc.lng], 13);
    } catch { alert('לא הצלחתי לאתר את הכתובת'); }
  });

  // “השתמש במיקומי”
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

  // רנדר ראשוני (למקרה שאין עדיין מיקום)
  renderEvents();
});
