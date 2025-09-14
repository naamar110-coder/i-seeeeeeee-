// ---- seed fallback, in case EXHIBITIONS wasn't defined ----
window.EXHIBITIONS = window.EXHIBITIONS ?? [
  {
    id: "ta-1",
    title: "אור-צל – תערוכה קבוצתית",
    artists: ["יעקב אגם", "מיכל רובינשטיין"],
    venue: "מוזיאון תל אביב לאמנות",
    address: "שד' שאול המלך 27, תל אביב",
    lat: 32.0776, lon: 34.7890,
    startDate: "2025-09-01", endDate: "2025-10-31",
    hours: "א׳-ה׳ 10:00-18:00, ו׳ 10:00-14:00",
    price: "₪55",
    description: "אוסף עבודות חדש על יחסי אור וחומר.",
    image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
  },
  {
    id: "ta-2",
    title: "הקו הדק",
    artists: ["אורית כהן"],
    venue: "גלריה גורדון",
    address: "הירקון 95, תל אביב",
    lat: 32.0853, lon: 34.7732,
    startDate: "2025-09-10", endDate: "2025-10-15",
    hours: "א׳-ה׳ 11:00-19:00, ו׳ 10:00-14:00",
    price: "כניסה חופשית",
    description: "רישומים מינימליסטיים על גבול המופשט.",
    image: "https://images.unsplash.com/photo-1520697222862-51283cbcadc0"
  },
  {
    id: "ta-3",
    title: "ים וזמן",
    artists: ["נועה ברק", "רן שלו"],
    venue: "CCA – המרכז לאמנות עכשווית",
    address: "צ׳לנוב 2, תל אביב",
    lat: 32.0623, lon: 34.7819,
    startDate: "2025-08-25", endDate: "2025-11-05",
    hours: "א׳-ה׳ 12:00-20:00",
    price: "₪35",
    description: "וידאו-ארט ומיצב על זיכרון ומרחב.",
    image: "https://images.unsplash.com/photo-1530023367847-a683933f4179"
  },
  {
    id: "ta-4",
    title: "תל-אביב המצוירת",
    artists: ["דנה שלו"],
    venue: "גלריה נגא",
    address: "אחווה 60, תל אביב",
    lat: 32.0615, lon: 34.7699,
    startDate: "2025-09-05", endDate: "2025-10-20",
    hours: "א׳-ה׳ 12:00-18:00, ו׳ 11:00-14:00",
    price: "כניסה חופשית",
    description: "איור אורבני ומפות סיפוריות של העיר.",
    image: "https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1"
  }
];
/************************************************
 * Exhibitions – App.js (v210)
 * מפת Leaflet + כתובת/מיקום/רדיוס + חיפוש אמן ותאריכים
 * יוצר לבד את ה-UI אם חסר ב-HTML.
 ************************************************/

/* ---------- נתוני דמו (ת"א) ---------- */
const EXHIBITIONS = [
  { id:"tlv-01", title:"ציור ישראלי עכשווי", venue:"מוזיאון תל אביב לאמנות", city:"תל אביב-יפו",
    address:"שד' שאול המלך 27", lat:32.077686, lng:34.786043,
    start:"2025-01-15", end:"2025-12-31",
    artists:["לאה ניקל","אברהם אופק","עדי נס"], tags:["ציור","מודרני"],
    descShort:"מבחר עבודות מרכזיות בציור הישראלי העכשווי.",
    descLong:"התערוכה מציגה חתך רחב של ציור ישראלי משנות ה־90 ועד היום..." },
  { id:"tlv-02", title:"הדפס וצילום – קצוות", venue:"הגלריה האוניברסיטאית ע\"ש שרייבר", city:"תל אביב-יפו",
    address:"חיים לבנון 55", lat:32.113396, lng:34.804232,
    start:"2025-03-01", end:"2025-09-30",
    artists:["רותי שלוס","עדי נס","זויה צ׳רקסקי"], tags:["צילום","הדפס"],
    descShort:"דיאלוג בין הדפס וצילום סביב מושגי גבול וזהות.",
    descLong:"עבודות חדשות לצד ארכיון, מעבדת הדפס פתוחה לקהל בימי שישי." },
  { id:"tlv-03", title:"Material Matters", venue:"בית ליבלינג – העיר הלבנה", city:"תל אביב-יפו",
    address:"אידלסון 29", lat:32.07252, lng:34.77393,
    start:"2025-02-10", end:"2025-08-10",
    artists:["טליה קינן","יוחאי מטוס"], tags:["מיצב","חומר"],
    descShort:"חומר, זיכרון וחלל באדריכלות המודרניסטית של העיר.",
    descLong:"מסלול אינטראקטיבי דרך חללים שונים בבניין; סיורי שקיעה על הגג." },
  { id:"tlv-04", title:"מבט מקומי", venue:"CCA – מרכז לאמנות עכשווית", city:"תל אביב-יפו",
    address:"צדוק הכהן 2", lat:32.06086, lng:34.77265,
    start:"2025-04-05", end:"2025-10-20",
    artists:["סיגלית לנדאו","דניאלה שלו"], tags:["וידאו-ארט","מיצב"],
    descShort:"פרויקטים חדשים על קהילה ומרחב.", descLong:"אולמות הקרנה פתוחים ושיחות אמן מתחלפות." },
  { id:"tlv-05", title:"Light & Space TLV", venue:"מוזיאון בית ביאליק", city:"תל אביב-יפו",
    address:"ביאליק 22", lat:32.07177, lng:34.77201,
    start:"2025-05-01", end:"2025-11-15",
    artists:["ג׳יימס טורל","אורלי ריבק","אורי ניר"], tags:["אור","חלל"],
    descShort:"מיצבי אור וחלל בבניין ההיסטורי.", descLong:"מומלץ להגיע בשעות בין ערביים; הזמנה מראש." },
  { id:"tlv-06", title:"הסטודיו הפתוח", venue:"גלריה רו-ארט", city:"תל אביב-יפו",
    address:"החשמל 13", lat:32.06391, lng:34.77283,
    start:"2025-06-10", end:"2025-09-10",
    artists:["מושון זר-אביב","מאיה גלפנד"], tags:["תהליך","מחקר"],
    descShort:"צפייה בתהליך עבודה חי וסדנאות.", descLong:"בכל שבוע נושא חדש; הרשמה באתר." },
  { id:"tlv-07", title:"צילום רחוב – ת״א", venue:"בית אריאלה – הסיפור החזותי", city:"תל אביב-יפו",
    address:"שד׳ שאול המלך 25", lat:32.07745, lng:34.78388,
    start:"2025-02-01", end:"2025-07-30",
    artists:["יוסי לוי","עדי נס"], tags:["צילום","עיר"],
    descShort:"מבטים אישיים על העיר מתוכה.", descLong:"הדפסים במהדורה מוגבלת." },
  { id:"tlv-08", title:"עיצוב וחומר", venue:"MUZA – מוזאון ארץ ישראל", city:"תל אביב-יפו",
    address:"חיים לבנון 2", lat:32.10461, lng:34.80453,
    start:"2025-03-20", end:"2025-12-20",
    artists:["רון ארד","יעל פרידמן"], tags:["עיצוב","חומר"],
    descShort:"עיצוב כפרקטיקה תרבותית ומרחבית.", descLong:"אובייקטים היסטוריים לצד מיצבים עכשוויים." },
  { id:"tlv-09", title:"קולות מן הים", venue:"גלריה גורדון", city:"תל אביב-יפו",
    address:"הירקון 95", lat:32.08087, lng:34.76872,
    start:"2025-01-10", end:"2025-06-10",
    artists:["אנה ים","דפנה שלום"], tags:["צליל","צילום"],
    descShort:"צילום-סאונד וארכיון ימי.", descLong:"חדר האזנה והקרנות חוצות." },
  { id:"tlv-10", title:"שחור על לבן", venue:"מוזיאון נחום גוטמן", city:"תל אביב-יפו",
    address:"שביל הפסגה 21, נווה צדק", lat:32.06128, lng:34.76451,
    start:"2025-04-12", end:"2025-09-12",
    artists:["נחום גוטמן","דינה קונסטנט"], tags:["רישום","איור"],
    descShort:"מחברת רישומים והדפסים נדירים.", descLong:"פעילויות משפחתיות בשבת." },
];

/* ---------- Utils ---------- */
const $ = s => document.querySelector(s);
const toISO = s => new Date(s + "T00:00:00Z");
function distanceKm(a,b){
  const R=6371, toR=d=>d*Math.PI/180;
  const dLat=toR(b.lat-a.lat), dLng=toR(b.lng-a.lng);
  const h=Math.sin(dLat/2)**2 + Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}
function gcalUrl(ev){
  const fmt = d => d.replaceAll('-','');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&location=${encodeURIComponent(ev.venue+' '+(ev.address||''))}&dates=${fmt(ev.start)}/${fmt(ev.end)}`;
}

/* ---------- State ---------- */
let map, markersLayer;
let userCenter = null;
let radiusKm = 10;
let filters = { from:null, to:null, artist:'' };

/* ---------- Ensure DOM ---------- */
function ensureContainers(){
  // בלוק חיפוש (אם חסר – ניצור)
  if(!$('#searchPanel')){
    const wrap = document.createElement('div');
    wrap.id = 'searchPanel';
    wrap.style.cssText = 'margin:16px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px';
    wrap.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input id="artistInput" placeholder="חיפוש אמן / כותרת / מוסד" style="flex:1;min-width:210px;padding:10px;border:1px solid #e5e7eb;border-radius:10px" />
        <label class="small muted">מתאריך</label>
        <input id="dateFrom" type="date" style="padding:8px;border:1px solid #e5e7eb;border-radius:10px" />
        <label class="small muted">עד</label>
        <input id="dateTo" type="date" style="padding:8px;border:1px solid #e5e7eb;border-radius:10px" />
        <button id="clearFilters" class="btn" style="border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;background:#fff">נקה סינון</button>
      </div>
      <div class="small muted" id="filterNote" style="margin-top:6px"></div>
    `;
    // נכניס לפני המפה אם קיימת, אחרת ל-body
    const anchor = $('#map') || document.body.firstElementChild;
    document.body.insertBefore(wrap, anchor || null);
  }

  if(!$('#results')){
    const r = document.createElement('div');
    r.id='results';
    r.style.margin='12px 16px';
    document.body.appendChild(r);
  }
  if(!$('#map')){
    const mWrap = document.createElement('div');
    mWrap.innerHTML = `<div id="map" style="height:360px;border:1px solid #e5e7eb;border-radius:12px;margin:12px 16px;background:#f4f5f8"></div>`;
    document.body.insertBefore(mWrap, $('#results'));
  }
}

/* ---------- Map ---------- */
function initMap(){
  ensureContainers();
  map = L.map('map').setView([32.0853,34.7818], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'&copy; OpenStreetMap' }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

/* ---------- Location / Address ---------- */
async function geocodeAddress(q){
  const url=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
  const res=await fetch(url,{headers:{'Accept-Language':'he'}});
  const arr=await res.json();
  if(!arr?.length) throw new Error('לא נמצאה כתובת');
  return {lat:+arr[0].lat, lng:+arr[0].lon};
}
function setUserCenter(lat,lng){ userCenter={lat,lng}; renderAll(); }

/* ---------- Filters ---------- */
function matchesArtist(x, q){
  if(!q) return true;
  q = q.trim().toLowerCase();
  const hay = [
    x.title, x.venue, x.city, (x.address||''), ...(x.artists||[]), ...(x.tags||[])
  ].join(' • ').toLowerCase();
  return hay.includes(q);
}
function getFiltered(){
  let list = EXHIBITIONS.filter(x=>{
    if(filters.from && toISO(x.end)   < toISO(filters.from)) return false;
    if(filters.to   && toISO(x.start) > toISO(filters.to))   return false;
    if(!matchesArtist(x, filters.artist)) return false;
    return true;
  });
  if(userCenter){
    list = list.map(x=>({...x, d:distanceKm(userCenter,{lat:x.lat,lng:x.lng})}))
               .filter(x=>x.d<=radiusKm)
               .sort((a,b)=>a.d-b.d);
  }
  return list;
}

/* ---------- Render ---------- */
function renderAll(){
  const list = getFiltered();

  // markers
  markersLayer.clearLayers();
  list.forEach(x=>{
    L.marker([x.lat,x.lng]).addTo(markersLayer)
     .bindPopup(`<b>${x.title}</b><br>${x.venue}`);
  });
  if(list.length){
    try{
      const g = L.featureGroup(list.map(x=>L.marker([x.lat,x.lng])));
      map.fitBounds(g.getBounds().pad(0.2));
    }catch{}
  }

  // summary note
  const note = $('#filterNote');
  if(note){
    const chips = [];
    if(filters.artist) chips.push(`אמן/טקסט: “${filters.artist}”`);
    if(filters.from)   chips.push(`מ-${filters.from}`);
    if(filters.to)     chips.push(`עד ${filters.to}`);
    if(userCenter)     chips.push(`רדיוס ${radiusKm}ק״מ`);
    note.textContent = `נמצאו ${list.length} תערוכות${chips.length?` | סינון: ${chips.join(' · ')}`:''}`;
  }

  // cards
  const box = $('#results');
  if(!box) return;
  if(!list.length){ box.innerHTML = `<div class="muted">אין תוצאות לסינון הנוכחי.</div>`; return; }

  box.innerHTML = list.map(x=>{
    const dist = (userCenter && x.d!=null) ? ` · ${x.d.toFixed(1)} ק״מ` : '';
    const maps = `https://www.google.com/maps?q=${encodeURIComponent(x.venue+' '+(x.address||''))}`;
    const gcal = gcalUrl(x);
    return `
      <div class="card" style="margin:12px 0;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#fff">
        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div>
            <div style="font-weight:700">${x.title}</div>
            <div class="muted small">${x.venue} · ${x.city}${dist}</div>
            <div class="muted small">${x.start} – ${x.end}</div>
            <div class="muted small">${x.address||''}</div>
            <div class="muted small">אמנים: ${x.artists.join(' · ')}</div>
            <div class="muted small">תגיות: ${(x.tags||[]).join(' · ')}</div>
            <p class="small" style="margin:6px 0 0">${x.descShort||''}</p>

            <div class="expand" id="exp-${x.id}" style="display:none;margin-top:8px">
              <p class="small" style="margin:0 0 6px;white-space:pre-wrap">${x.descLong||''}</p>
              <div class="muted small">שעות פתיחה לדוגמה: א׳–ה׳ 10:00–20:00, ו׳ 10:00–14:00</div>
            </div>

            <button class="btn" data-toggle="${x.id}" style="margin-top:8px;border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;background:#fff">קרא עוד</button>
          </div>

          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn" data-jump="${x.id}" style="border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;background:#fff">תמקד במפה</button>
            <a class="btn" target="_blank" href="${maps}" style="border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;background:#fff">נווט</a>
            <a class="btn" target="_blank" href="${gcal}" style="border:1px solid #111827;border-radius:10px;padding:8px 10px;background:#111827;color:#fff">הוסף ליומן</a>
          </div>
        </div>
      </div>`;
  }).join('');

  // האזנות
  box.querySelectorAll('[data-jump]').forEach(b=>{
    b.addEventListener('click',()=>{
      const id=b.getAttribute('data-jump');
      const x=(userCenter?getFiltered():EXHIBITIONS).find(i=>i.id===id)||EXHIBITIONS.find(i=>i.id===id);
      if(!x) return;
      map.setView([x.lat,x.lng], 15);
      L.popup().setLatLng([x.lat,x.lng]).setContent(`<b>${x.title}</b><br>${x.venue}`).openOn(map);
    });
  });
  box.querySelectorAll('[data-toggle]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.getAttribute('data-toggle');
      const exp=$(`#exp-${id}`);
      if(!exp) return;
      const open=exp.style.display!=='none';
      exp.style.display=open?'none':'block';
      btn.textContent=open?'קרא עוד':'סגור';
    });
  });
}

/* ---------- Wire UI ---------- */
function wireUI(){
  // חיפוש אמן/טקסט
  $('#artistInput')?.addEventListener('input', e=>{
    filters.artist = e.target.value || '';
    renderAll();
  });
  // תאריכים
  $('#dateFrom')?.addEventListener('change', e=>{ filters.from=e.target.value||null; renderAll(); });
  $('#dateTo')  ?.addEventListener('change', e=>{ filters.to  =e.target.value||null; renderAll(); });
  $('#clearFilters')?.addEventListener('click', ()=>{
    filters = {...filters, from:null, to:null, artist:''};
    if($('#artistInput')) $('#artistInput').value='';
    if($('#dateFrom')) $('#dateFrom').value='';
    if($('#dateTo'))   $('#dateTo').value='';
    renderAll();
  });

  // כתובת ידנית (אם יש ב-HTML שלך)
  $('#geocodeBtn')?.addEventListener('click', async ()=>{
    const q = $('#addressInput')?.value || '';
    if(!q) { alert('כתבי כתובת'); return; }
    try{
      const p = await geocodeAddress(q);
      setUserCenter(p.lat,p.lng);
      map.setView([p.lat,p.lng], 13);
    }catch{ alert('לא נמצאה כתובת.'); }
  });
  $('#addressInput')?.addEventListener('keydown', e=>{ if(e.key==='Enter') $('#geocodeBtn')?.click(); });

  // מיקום אוטומטי
  $('#useMyLocationBtn')?.addEventListener('click', ()=>{
    if(!navigator.geolocation){ alert('הדפדפן לא תומך במיקום'); return; }
    navigator.geolocation.getCurrentPosition(
      p=>{ setUserCenter(p.coords.latitude,p.coords.longitude); map.setView([p.coords.latitude,p.coords.longitude], 13); },
      e=>alert('נכשל לזהות מיקום: '+e.message),
      {enableHighAccuracy:true, timeout:10000}
    );
  });

  // רדיוס
  const rr = $('#radiusRange'), rv = $('#radiusValue');
  if(rr){ rr.addEventListener('input', e=>{ radiusKm=+e.target.value; if(rv) rv.textContent=radiusKm; });
         rr.addEventListener('change', renderAll); if(rv) rv.textContent=rr.value; }
}

/* ---------- Init ---------- */
window.addEventListener('DOMContentLoaded', ()=>{
  try{
    ensureContainers();
    initMap();
    wireUI();
    renderAll();
  }catch(err){
    console.error(err);
    alert('שגיאת אתחול: '+err.message);
  }
});
