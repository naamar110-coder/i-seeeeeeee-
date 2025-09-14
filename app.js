/************************************************
 * Exhibitions – App.js (v121)
 * מפה, רדיוס, כתובת, חיפוש אמן (Modal), סינון,
 * Google Calendar, וכרטיסים עם "קרא עוד".
 ************************************************/

/* ---------- נתוני דמו (ת"א) ---------- */
const EXHIBITIONS = [
  {
    id:"tlv-01",
    title:"ציור ישראלי עכשווי",
    venue:"מוזיאון תל אביב לאמנות",
    city:"תל אביב-יפו",
    address:"שד' שאול המלך 27",
    lat:32.077686, lng:34.786043,
    start:"2025-01-15", end:"2025-12-31",
    artists:["לאה ניקל","אברהם אופק","עדי נס"],
    tags:["ציור","מודרני"],
    descShort:"מבחר עבודות מרכזיות בציור הישראלי העכשווי.",
    descLong:"התערוכה מציגה חתך רחב של ציור ישראלי משנות ה־90 ועד היום, עם התמקדות בחומרים, זיכרון חזותי ומרחב עירוני. מדריכים מודרכים פעמיים בשבוע, וערבי אמן אחת לחודש."
  },
  {
    id:"tlv-02",
    title:"הדפס וצילום – קצוות",
    venue:"הגלריה האוניברסיטאית לאמנות ע״ש גניה שרייבר",
    city:"תל אביב-יפו",
    address:"חיים לבנון 55",
    lat:32.113396, lng:34.804232,
    start:"2025-03-01", end:"2025-09-30",
    artists:["רותי שלוס","עדי נס","זויה צ׳רקסקי"],
    tags:["צילום","הדפס"],
    descShort:"דיאלוג בין הדפס וצילום סביב מושגי גבול וזהות.",
    descLong:"עבודות חדשות לצד ארכיון, תהליכי עבודה חושפים, ומעבדת הדפס פתוחה לצופים בימי שישי. קטלוג מקוון זמין באתר הגלריה."
  },
  {
    id:"tlv-03",
    title:"Material Matters",
    venue:"בית ליבלינג – מרכז העיר הלבנה",
    city:"תל אביב-יפו",
    address:"אידלסון 29",
    lat:32.07252, lng:34.77393,
    start:"2025-02-10", end:"2025-08-10",
    artists:["טליה קינן","יוחאי מטוס"],
    tags:["מיצב","חומר"],
    descShort:"חומר, זיכרון וחלל באדריכלות המודרניסטית של העיר.",
    descLong:"מסלול אינטראקטיבי דרך חללים שונים בבניין; בכל תחנה פעולה חומרית אחרת (בטון, עץ, מתכת, בד). כולל סיורי שקיעה על הגג."
  },
  {
    id:"tlv-04",
    title:"מבט מקומי",
    venue:"CCA – מרכז לאמנות עכשווית",
    city:"תל אביב-יפו",
    address:"צדוק הכהן 2",
    lat:32.06086, lng:34.77265,
    start:"2025-04-05", end:"2025-10-20",
    artists:["סיגלית לנדאו","דניאלה שלו"],
    tags:["וידאו-ארט","מיצב"],
    descShort:"פרויקטים חדשים של אמניות על קהילה ומרחב.",
    descLong:"אולמות הסרטה פתוחים, לוחות זמנים להקרנות מתחלפות, ושיחות אמן בשיתוף הקהל. חלק מהעבודות מתייחסות לאקלים העירוני."
  },
  {
    id:"tlv-05",
    title:"Light & Space TLV",
    venue:"מוזיאון בית ביאליק",
    city:"תל אביב-יפו",
    address:"ביאליק 22",
    lat:32.07177, lng:34.77201,
    start:"2025-05-01", end:"2025-11-15",
    artists:["ג׳יימס טורל","אורלי ריבק","אורי ניר"],
    tags:["אור","חלל"],
    descShort:"התערבותי אור וחלל בבניין ההיסטורי של בית ביאליק.",
    descLong:"מיצבים תלויי־חלל המגיבים לאור טבעי ולארכיטקטורה הפנימית; מומלץ להגיע בשעות בין ערביים. יש להזמין כרטיסים מראש."
  },
  {
    id:"tlv-06",
    title:"הסטודיו הפתוח",
    venue:"גלריה רו-ארט",
    city:"תל אביב-יפו",
    address:"החשמל 13",
    lat:32.06391, lng:34.77283,
    start:"2025-06-10", end:"2025-09-10",
    artists:["מושון זר-אביב","מאיה גלפנד"],
    tags:["תהליך","מחקר"],
    descShort:"צפייה בתהליך עבודה חי, סדנאות ומפגשי קהל.",
    descLong:"האמנים עובדים בחלל הגלריה מול קהל; בכל שבוע נושא חדש. מס’ מקומות לסדנאות מוגבל, הרשמה באתר."
  },
  {
    id:"tlv-07",
    title:"צילום רחוב – ת״א",
    venue:"בית אריאלה – הסיפור החזותי",
    city:"תל אביב-יפו",
    address:"שד׳ שאול המלך 25",
    lat:32.07745, lng:34.78388,
    start:"2025-02-01", end:"2025-07-30",
    artists:["יוסי לוי","עדי נס"],
    tags:["צילום","עיר"],
    descShort:"מבטים אישיים על העיר מתוכה.",
    descLong:"ארכיון תמונות רחוב נדיר + עבודות חדשות; הדפסים במהדורה מוגבלת למכירה."
  },
  {
    id:"tlv-08",
    title:"עיצוב וחומר",
    venue:"MUZA – מוזאון ארץ ישראל, תל אביב",
    city:"תל אביב-יפו",
    address:"חיים לבנון 2",
    lat:32.10461, lng:34.80453,
    start:"2025-03-20", end:"2025-12-20",
    artists:["רון ארד","יעל פרידמן"],
    tags:["עיצוב","חומר"],
    descShort:"עיצוב כפרקטיקה תרבותית ומרחבית.",
    descLong:"דיאלוג בין אובייקטים היסטוריים למיצבים עכשוויים; אולם הדגמות חיות בסופי שבוע."
  },
  {
    id:"tlv-09",
    title:"קולות מן הים",
    venue:"גלריה גורדון",
    city:"תל אביב-יפו",
    address:"הירקון 95",
    lat:32.08087, lng:34.76872,
    start:"2025-01-10", end:"2025-06-10",
    artists:["אנה ים","דפנה שלום"],
    tags:["צליל","צילום"],
    descShort:"עבודות על גבול צילום־סאונד וארכיון ימי.",
    descLong:"חדר האזנה, הקרנות חוצות על קיר הגלריה, ושיתופי פעולה עם מוזיקאים מקומיים."
  },
  {
    id:"tlv-10",
    title:"שחור על לבן",
    venue:"מוזיאון נחום גוטמן לאמנות",
    city:"תל אביב-יפו",
    address:"שביל הפסגה 21, נווה צדק",
    lat:32.06128, lng:34.76451,
    start:"2025-04-12", end:"2025-09-12",
    artists:["נחום גוטמן","דינה קונסטנט"],
    tags:["רישום","איור"],
    descShort:"מחברת רישומים, ספרי אמן והדפסים נדירים.",
    descLong:"תצוגה תימאטית סביב נווה צדק והים; פעילויות משפחתיות בשבת."
  }
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

/* ---------- Ensure UI (filters bar) ---------- */
function ensureFilterUI(){
  if ($('#exFilters')) return;
  const host = $('#results')?.parentNode || document.body;
  const venues = ['ALL', ...Array.from(new Set(EXHIBITIONS.map(x=>x.venue)))];
  const card = document.createElement('section');
  card.id='exFilters';
  card.className='card';
  card.style.cssText='margin:12px 16px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#fff';
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

  // Bind filters
  $('#dateFrom')?.addEventListener('change', e=>{ filters.from=e.target.value||null; renderAll(); });
  $('#dateTo')?.addEventListener('change',   e=>{ filters.to  =e.target.value||null; renderAll(); });
  $('#venueSelect')?.addEventListener('change', e=>{ filters.venue=e.target.value||'ALL'; renderAll(); });
  $('#radiusRange')?.addEventListener('input', e=>{
    radiusKm = Number(e.target.value||10);
    const rv=$('#radiusValue'); if(rv) rv.textContent = radiusKm;
  });
  $('#radiusRange')?.addEventListener('change', renderAll);

  // Artist search
  $('#artistSearchBtn')?.addEventListener('click', ()=>{
    const name = $('#artistSearchInput')?.value || '';
    searchByArtist(name);
  });
  $('#artistSearchInput')?.addEventListener('keydown', e=>{
    if(e.key==='Enter'){ e.preventDefault(); $('#artistSearchBtn')?.click(); }
  });
}

/* ---------- Map ---------- */
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

/* ---------- Filters logic ---------- */
function eventPassesFilters(ev){
  if (filters.venue !== 'ALL' && ev.venue !== filters.venue) return false;
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
    list = list.map(x=>({...x, d:distanceKm(userCenter,{lat:x.lat,lng:x.lng})}))
               .filter(x=> x.d <= radiusKm)
               .sort((a,b)=> a.d - b.d);
  } else {
    list = list.sort((a,b)=> (a.city||'').localeCompare(b.city||'','he') || (a.title||'').localeCompare(b.title||'','he'));
  }
  return list;
}

/* ---------- Rendering (עם "קרא עוד") ---------- */
function renderList(list){
  // markers
  markersLayer.clearLayers();
  list.forEach(x=>{
    L.marker([x.lat,x.lng]).addTo(markersLayer)
      .bindPopup(`<b>${x.title}</b><br>${x.venue}<br><span class="muted small">${x.city}</span>`);
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
    // בלוק "קרא עוד" מוסתר מראש
    return `
      <div class="card" style="margin:12px 16px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#fff">
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
              <div class="muted small">אתר המקום: <a href="${maps}" target="_blank">ניווט במפות</a></div>
            </div>

            <button class="btn" data-toggle="${x.id}" style="margin-top:8px;border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;background:#fff">קרא עוד</button>
          </div>

          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn" data-jump="${x.id}" style="border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;background:#fff">תמקד במפה</button>
            <a class="btn" target="_blank" href="${maps}" style="border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;background:#fff">נווט</a>
            <a class="btn" target="_blank" href="${gcal}" style="border:1px solid #111827;border-radius:10px;padding:8px 10px;background:#111827;color:#fff">הוסף ליומן Google</a>
          </div>
        </div>
      </div>`;
  }).join('');

  // האזנות: "תמקד במפה"
  box.querySelectorAll('[data-jump]').forEach(b=>{
    b.addEventListener('click',()=>{
      const id=b.getAttribute('data-jump');
      const item=(userCenter?getFilteredList():EXHIBITIONS).find(x=>x.id===id) || EXHIBITIONS.find(x=>x.id===id);
      if(!item) return;
      map.setView([item.lat,item.lng], 15);
      L.popup().setLatLng([item.lat,item.lng]).setContent(`<b>${item.title}</b><br>${item.venue}`).openOn(map);
    });
  });

  // האזנות: "קרא עוד" (toggle)
  box.querySelectorAll('[data-toggle]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-toggle');
      const exp = document.getElementById(`exp-${id}`);
      if(!exp) return;
      const open = exp.style.display !== 'none';
      exp.style.display = open ? 'none' : 'block';
      btn.textContent = open ? 'קרא עוד' : 'סגור';
    });
  });
}
function renderAll(){ renderList(getFilteredList()); }

/* ---------- Location / Address ---------- */
function setUserCenter(lat,lng){ userCenter={lat,lng}; renderAll(); }
async function geocodeAddress(q){
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
  const res = await fetch(url,{headers:{'Accept-Language':'he'}});
  const arr = await res.json();
  if(!arr?.length) throw new Error('לא נמצאה כתובת');
  return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
}
function wireLocationUI(){
  $('#useMyLocationBtn')?.addEventListener('click', ()=>{
    if(!navigator.geolocation){ alert('הדפדפן לא תומך במיקום'); return; }
    navigator.geolocation.getCurrentPosition(
      p => setUserCenter(p.coords.latitude,p.coords.longitude),
      e => alert('נכשל לזהות מיקום: '+e.message),
      {enableHighAccuracy:true, timeout:10000}
    );
  });
  $('#geocodeBtn')?.addEventListener('click', async ()=>{
