/*************** app.js – v45 (full) ****************/
dayjs.locale('he');

// ===== נתוני דמו (ת"א) =====
const exhibitions = [
  { id:'tlv-01', title:'צללים על הים', artists:['נועה ברוש'], venue:'מוזיאון תל אביב לאמנות',
    address:'שד׳ שאול המלך 27, תל אביב', city:'תל אביב', lat:32.07759, lng:34.78934,
    startDate:'2025-09-10', endDate:'2025-12-20',
    description:'מבט עכשווי על צילום ים-תיכוני, בין חוף עירוני לתיעוד אישי.' },
  { id:'tlv-02', title:'גופים בתנועה', artists:['יונתן כץ','תמר גל'], venue:'הגלריה האוניברסיטאית – אונ׳ תל אביב',
    address:'חיים לבנון 55, תל אביב', city:'תל אביב', lat:32.1149, lng:34.8043,
    startDate:'2025-09-01', endDate:'2025-10-30',
    description:'פיסול, וידאו ורישום סביב תנועה אנושית במרחב.' },
  { id:'tlv-03', title:'בין קירות', artists:['גיא שלו'], venue:'בית בנימיני – מרכז לקרמיקה',
    address:'העמל 17, תל אביב', city:'תל אביב', lat:32.0629, lng:34.7777,
    startDate:'2025-08-20', endDate:'2025-11-10',
    description:'קרמיקה אדריכלית: מרקמים, זיכרון וחומר.' },
  { id:'tlv-04', title:'קו ראשון', artists:['מאיה לוי'], venue:'גלריה נגא',
    address:'אילת 60, תל אביב', city:'תל אביב', lat:32.0589, lng:34.7688,
    startDate:'2025-09-12', endDate:'2025-10-25',
    description:'ציור עכשווי מינימליסטי, שכבות של קווים ושקט.' },
  { id:'tlv-05', title:'עיר/צליל', artists:['איתי רז'], venue:'CCA – המרכז לאמנות עכשווית',
    address:'תל גיבורים 5, תל אביב', city:'תל אביב', lat:32.0596, lng:34.7847,
    startDate:'2025-09-05', endDate:'2025-11-30',
    description:'מיצב סאונד-וידאו על הקצב האורבני והאזנה כפעולה.' },
  { id:'tlv-06', title:'שכבות של זיכרון', artists:['נטע צור'], venue:'מוזיאון נחום גוטמן לאמנות',
    address:'שד״ר שמעון רוקח 21, תל אביב', city:'תל אביב', lat:32.0647, lng:34.7682,
    startDate:'2025-08-15', endDate:'2025-10-31',
    description:'איור, ארכיונים אישיים ומפות דמיון של העיר.' }
];

// ===== עזר =====
const $ = s => document.querySelector(s);
const km = m => (m/1000).toFixed(2);
const haversine = (a,b)=>{
  const R=6371e3, toR=d=>d*Math.PI/180;
  const φ1=toR(a.lat), φ2=toR(b.lat), dφ=toR(b.lat-a.lat), dλ=toR(b.lng-a.lng);
  const h=Math.sin(dφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dλ/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
};
const overlaps = (ex, from, to)=>{
  const s = from ? dayjs(from) : null;
  const e = to   ? dayjs(to)   : null;
  const exS = dayjs(ex.startDate), exE = dayjs(ex.endDate);
  const startOk = !s || s.isSame(exE) || s.isBefore(exE);
  const endOk   = !e || e.isSame(exS) || e.isAfter(exS);
  return startOk && endOk;
};

// ===== מפה + מיקום =====
let map, markersLayer, userMarker, userLatLng=null;
const catIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#8b5cf6"/>
      <path d="M8 10c0-2 1.5-3.5 4-3.5S16 8 16 10v3c0 1.7-1.3 3-3 3h-2c-1.7 0-3-1.3-3-3v-3z" fill="#fff"/>
      <circle cx="10" cy="11" r="1" fill="#111"/>
      <circle cx="14" cy="11" r="1" fill="#111"/>
      <path d="M9 14c1 .7 2 .7 3 0" stroke="#111" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M6.5 7l2 2M17.5 7l-2 2" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `),
  iconSize:[34,34], iconAnchor:[17,17]
});

function initMap(){
  map = L.map('map', {zoomControl:false}).setView([32.0853,34.7818], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
  L.control.zoom({position:'topleft'}).addTo(map);
  markersLayer = L.layerGroup().addTo(map);

  // כפתור מיקום 🐱
  const LocateCtrl = L.Control.extend({
    onAdd(){
      const b=L.DomUtil.create('button','leaflet-bar');
      b.title='מרכז למיקומי'; b.style.cssText='width:34px;height:34px;border:0;border-radius:4px;background:#8b5cf6;cursor:pointer';
      b.textContent='🐱'; b.onclick=centerOnUser; return b;
    }, onRemove() {}
  });
  (new LocateCtrl({position:'topleft'})).addTo(map);
}
function centerOnUser(){
  if(userLatLng){ map.setView(userLatLng, 14, {animate:true}); return; }
  if(!navigator.geolocation){ alert('אין תמיכת מיקום בדפדפן'); return; }
  navigator.geolocation.getCurrentPosition(setUserLocation, ()=>alert('לא הצלחנו לקבל מיקום'));
}
function setUserLocation(pos){
  userLatLng = {lat:pos.coords.latitude, lng:pos.coords.longitude};
  $('#locationStatus')?.textContent = `נבחר מיקום: ${userLatLng.lat.toFixed(4)}, ${userLatLng.lng.toFixed(4)}`;
  if(!userMarker){ userMarker = L.marker(userLatLng,{icon:catIcon}).addTo(map).bindPopup('זה המיקום שלך 🐱'); }
  else { userMarker.setLatLng(userLatLng); }
  map.setView(userLatLng, 13);
  refresh();
}

// ===== גיאוקוד כתובת =====
async function geocodeAddress(q){
  const url=`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res=await fetch(url,{headers:{'Accept-Language':'he'}});
  const arr=await res.json();
  if(!arr.length) throw new Error('לא נמצאה כתובת');
  return { lat:+arr[0].lat, lng:+arr[0].lon, label:arr[0].display_name };
}

// ===== FOLLOW & NOTIFICATIONS =====
const FOLLOW_KEY='followed_artists', NOTIFIED_KEY='notified_exhibits', NOTIFY_EVERY_MIN=5, ONLY_FOLLOWED_KEY='only_followed';
const store = {
  get(k,f){ try{return JSON.parse(localStorage.getItem(k))??f;}catch{return f;} },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
};
let followedArtists = new Set(store.get(FOLLOW_KEY, []));
let notifiedExhibits = new Set(store.get(NOTIFIED_KEY, []));
let onlyFollowed = !!store.get(ONLY_FOLLOWED_KEY, false);

function toast(msg){
  const el=document.createElement('div');
  el.textContent=msg;
  el.style.cssText='position:fixed;inset-inline:0;bottom:16px;margin:auto;background:#111;color:#fff;padding:10px 14px;border-radius:10px;z-index:9999;width:max-content;max-width:90%';
  document.body.appendChild(el); setTimeout(()=>el.remove(), 2000);
}

// כפתור "התראות דפדפן" + "❤️ במעקב (N)" + מתג "רק במעקב" – נוצרים אוטומטית
function ensureTopbarButtons(){
  const topbar = document.querySelector('header.topbar');
  if(!topbar) return;
  // התראות
  if(!$('#notifyToggle')){
    const btn=document.createElement('button');
    btn.id='notifyToggle'; btn.className='pill'; btn.textContent='התראות דפדפן';
    btn.style.marginInlineStart='8px';
    btn.onclick = async ()=>{
      if(!('Notification' in window)) return alert('הדפדפן לא תומך בהתראות');
      if(Notification.permission==='granted'){ toast('התראות כבר מאופשרות ✔️'); return; }
      const p = await Notification.requestPermission();
      toast(p==='granted' ? 'התראות הופעלו 🎉' : 'התראות נדחו');
    };
    topbar.appendChild(btn);
  }
  // ❤️ במעקב (מונה)
  if(!$('#followedBtn')){
    const btn=document.createElement('button');
    btn.id='followedBtn'; btn.className='secondary';
    btn.onclick = openFollowedDialog;
    topbar.appendChild(btn);
  }
  updateFollowedCount();

  // מתג "הצג רק אמנים במעקב" ליד הסינון (אם יש אזור סינון)
  if(!$('#onlyFollowedWrap')){
    const wrap=document.createElement('div');
    wrap.id='onlyFollowedWrap';
    wrap.className='row';
    wrap.style.margin='8px 0';
    wrap.innerHTML=`
      <label class="muted" style="display:flex;gap:6px;align-items:center;cursor:pointer">
        <input id="onlyFollowed" type="checkbox" ${onlyFollowed?'checked':''}>
        הצג רק תערוכות של אמנים במעקב
      </label>
    `;
    // ננסה לשים מתחת לקטע הסינון הראשי (לפני המפה). אם אין – נוסיף ל-main.
    const main = document.querySelector('main .card');
    (main || document.body).appendChild(wrap);
    $('#onlyFollowed').addEventListener('change', (e)=>{
      onlyFollowed = e.target.checked;
      store.set(ONLY_FOLLOWED_KEY, onlyFollowed);
      refresh();
    });
  }
}
function updateFollowedCount(){
  const btn=$('#followedBtn');
  if(!btn) return;
  const n = followedArtists.size;
  btn.textContent = n ? `❤️ במעקב (${n})` : '❤️ במעקב (0)';
}

// חלון ניהול אמנים במעקב – נוצר דינמית אם לא קיים
function ensureFollowedDialog(){
  if($('#followedDialog')) return;
  const dlg=document.createElement('dialog');
  dlg.id='followedDialog';
  dlg.innerHTML=`
    <div style="padding:12px 16px;border-bottom:1px solid #2a2a2a;display:flex;justify-content:space-between;align-items:center">
      <strong>אמנים במעקב</strong>
      <button id="followedClose" class="icon" style="background:transparent;color:#fff;border:1px solid #333;border-radius:8px;padding:6px 10px">✕</button>
    </div>
    <div id="followedBody" style="padding:14px"></div>
  `;
  document.body.appendChild(dlg);
  $('#followedClose').onclick = ()=> dlg.close();
}
function openFollowedDialog(){
  ensureFollowedDialog();
  const body=$('#followedBody');
  const list=[...followedArtists].sort((a,b)=>a.localeCompare(b,'he'));
  if(!list.length){
    body.innerHTML = `<div class="muted">לא מעוקב/ת אחרי אמנים עדיין. לחצ/י “עקוב/י אחרי …” בכרטיסי התערוכות.</div>`;
  }else{
    body.innerHTML = list.map(a=>`
      <div style="display:flex;justify-content:space-between;align-items:center;border:1px solid #2a2a2a;border-radius:10px;padding:8px 10px;margin:6px 0;background:#121317">
        <div>${a}</div>
        <div style="display:flex;gap:8px">
          <button class="ghost" data-remove="${a}">הסר/י מעקב</button>
        </div>
      </div>
    `).join('');
    body.querySelectorAll('[data-remove]').forEach(b=>{
      b.onclick=()=>{
        followedArtists.delete(b.getAttribute('data-remove'));
        store.set(FOLLOW_KEY, Array.from(followedArtists));
        updateFollowedCount();
        refresh(); // יעדכן תגיות/סינון
        openFollowedDialog(); // רענון החלון
        toast('הוסר מעקב');
      };
    });
  }
  $('#followedDialog').showModal();
}

// הוספת/הסרת מעקב מכרטיס + תגית “במעקב”
function augmentCards(){
  document.querySelectorAll('[data-exhibit-id]').forEach(card=>{
    // כפתור follow
    if(!card.querySelector('.followArtistBtn')){
      const artistsStr = card.getAttribute('data-artists')||'';
      if(artistsStr){
        const first = artistsStr.split('|')[0].trim();
        const btn=document.createElement('button');
        btn.className='pill followArtistBtn';
        btn.textContent = followedArtists.has(first) ? `מוסר/ת מעקב: ${first}` : `עקוב/י אחרי: ${first}`;
        btn.onclick = ()=>{
          if(followedArtists.has(first)){
            followedArtists.delete(first);
            toast(`הוסר מעקב אחרי ${first}`);
            btn.textContent=`עקוב/י אחרי: ${first}`;
          }else{
            followedArtists.add(first);
            toast(`כעת עוקב/ת אחרי ${first}`);
            btn.textContent=`מוסר/ת מעקב: ${first}`;
          }
          store.set(FOLLOW_KEY, Array.from(followedArtists));
          updateFollowedCount();
          // עדכון תגים אחרי שינוי
          updateFollowBadges();
          if(onlyFollowed) refresh();
        };
        (card.querySelector('.actions') || card).appendChild(btn);
      }
    }
  });
  updateFollowedCount();
  updateFollowBadges();
}

// מציג/מסתיר תגית “במעקב” על כרטיסים רלוונטיים
function updateFollowBadges(){
  document.querySelectorAll('[data-exhibit-id]').forEach(card=>{
    const artists = (card.getAttribute('data-artists')||'').split('|').map(s=>s.trim()).filter(Boolean);
    const followed = artists.some(a=> followedArtists.has(a));
    let badge = card.querySelector('.follow-badge');
    if(followed && !badge){
      badge = document.createElement('span');
      badge.className='follow-badge';
      badge.textContent='במעקב';
      badge.style.cssText='display:inline-block;margin-top:6px;background:#f0ecff;color:#5b4ccc;border:1px solid #d8dafe;border-radius:999px;padding:2px 10px;font-size:.8rem';
      (card.querySelector('.title') || card.firstElementChild).after(badge);
    }
    if(!followed && badge){ badge.remove(); }
  });
}

// התראות — כשיש תערוכה פעילה/עתידית לאמנים במעקב
const isActiveOrFuture = ex => dayjs(ex.endDate).endOf('day').isAfter(dayjs());
async function notify(title, body, data={}){
  try{
    const reg = await navigator.serviceWorker?.getRegistration();
    if(reg && Notification.permission==='granted'){
      return reg.showNotification(title, { body, icon:'/icons/icon-192.png', badge:'/icons/icon-192.png', data });
    }
  }catch{}
  if(Notification.permission==='granted'){ new Notification(title, { body, icon:'/icons/icon-192.png', data }); }
}
function scanFollowedAndNotify(){
  if(Notification.permission!=='granted') return;
  followedArtists = new Set(store.get(FOLLOW_KEY, []));
  notifiedExhibits = new Set(store.get(NOTIFIED_KEY, []));
  exhibitions.forEach(ex=>{
    if(!isActiveOrFuture(ex)) return;
    if(notifiedExhibits.has(ex.id)) return;
    const has = (ex.artists||[]).some(a=> followedArtists.has(a));
    if(!has) return;
    notify('אמן/ית במעקב מציג/ה 🎨', `${ex.artists.join(', ')} — ${ex.title} (${ex.venue})`, {exhibitId:ex.id});
    notifiedExhibits.add(ex.id);
  });
  store.set(NOTIFIED_KEY, Array.from(notifiedExhibits));
}
setInterval(scanFollowedAndNotify, NOTIFY_EVERY_MIN*60*1000);

// האזנה מ-SW (אופציונלי)
navigator.serviceWorker?.addEventListener?.('message', (e)=>{
  if(e?.data?.type==='OPEN_EXHIBIT' && e.data.exhibitId){
    const ex = exhibitions.find(x=>x.id===e.data.exhibitId);
    if(ex) openModal(ex);
  }
});

// ===== רינדור =====
function renderMarkers(items){
  markersLayer.clearLayers();
  items.forEach(ex=>{
    const m = L.marker([ex.lat,ex.lng]).addTo(markersLayer);
    m.bindPopup(`
      <b>${ex.title}</b><br>${ex.venue}<br>
      ${dayjs(ex.startDate).format('DD.MM')}–${dayjs(ex.endDate).format('DD.MM')}<br>
      <span style="text-decoration:underline;cursor:pointer" data-open="${ex.id}">קרא/י עוד</span>
    `);
    m.on('popupopen', ev=>{
      ev.popup.getElement().querySelector('[data-open]')?.addEventListener('click',()=>openModal(ex));
    });
  });
}

function renderList(items){
  const list=$('#list'); list.innerHTML='';
  if(!items.length){ list.innerHTML='<div class="muted">לא נמצאו תערוכות בתנאי הסינון.</div>'; return; }
  items.forEach(ex=>{
    const followed = (ex.artists||[]).some(a=> followedArtists.has(a));
    const card=document.createElement('div');
    card.className='card-item';
    // data-attributes
    card.setAttribute('data-exhibit-id', ex.id);
    card.setAttribute('data-artists', (ex.artists||[]).join('|'));
    card.innerHTML=`
      <div class="title">${ex.title}</div>
      ${followed ? `<span class="follow-badge" style="display:inline-block;margin-top:6px;background:#f0ecff;color:#5b4ccc;border:1px solid #d8dafe;border-radius:999px;padding:2px 10px;font-size:.8rem">במעקב</span>` : ``}
      <div class="meta">${ex.venue} · ${ex.address}</div>
      <div class="meta">אמנים: ${ex.artists.join(', ')}</div>
      <div class="meta">תאריכים: ${dayjs(ex.startDate).format('DD.MM.YYYY')} – ${dayjs(ex.endDate).format('DD.MM.YYYY')}</div>
      ${ex._distance? `<div class="meta">מרחק: ${km(ex._distance)} ק״מ</div>` : ''}
      <div class="actions" style="display:flex;gap:8px;margin-top:8px">
        <span class="link" data-id="${ex.id}">קרא/י עוד</span>
        <span class="link" data-pan="${ex.id}">הצג/י על המפה</span>
      </div>
    `;
    card.querySelector('[data-id]').onclick = ()=>openModal(ex);
    card.querySelector('[data-pan]').onclick = ()=>map.setView([ex.lat,ex.lng],15);
    list.appendChild(card);
  });
  augmentCards();
}

function openModal(ex){
  $('#modalTitle').textContent = `${ex.title} — ${ex.venue}`;
  $('#modalBody').innerHTML = `
    <div class="muted">${ex.address}</div>
    <div style="margin:.5rem 0">אמנים: <b>${ex.artists.join(', ')}</b></div>
    <div class="muted">תאריכים: ${dayjs(ex.startDate).format('DD.MM.YYYY')} – ${dayjs(ex.endDate).format('DD.MM.YYYY')}</div>
    <p style="margin-top:10px">${ex.description}</p>
  `;
  $('#exhibitModal').showModal();
}
$('#modalClose')?.addEventListener('click', ()=>$('#exhibitModal').close());

// ===== סינון ותרענון =====
function currentFilters(){
  return {
    artist: ($('#artistInput')?.value||'').trim().toLowerCase(),
    sDate: $('#startDateInput')?.value || null,
    eDate: $('#endDateInput')?.value || null,
    radiusKm: +($('#radiusInput')?.value || 10)
  };
}
function refresh(){
  const {artist,sDate,eDate,radiusKm} = currentFilters();
  let items = exhibitions.filter(ex => overlaps(ex, sDate, eDate));
  if(artist){
    items = items.filter(ex =>
      ex.title.toLowerCase().includes(artist) ||
      (ex.artists||[]).some(a=>a.toLowerCase().includes(artist))
    );
  }
  if(onlyFollowed){
    items = items.filter(ex => (ex.artists||[]).some(a=> followedArtists.has(a)));
  }
  if(userLatLng){
    items = items.map(ex=>({...ex, _distance:haversine(userLatLng,{lat:ex.lat,lng:ex.lng})}))
                 .filter(ex=> ex._distance/1000 <= radiusKm)
                 .sort((a,b)=>a._distance-b._distance);
  }
  renderMarkers(items);
  renderList(items);
  scanFollowedAndNotify();
}

// ===== אירועי UI =====
$('#geocodeBtn')?.addEventListener('click', async ()=>{
  const q = $('#addressInput')?.value?.trim();
  if(!q){ alert('הקלד/י כתובת'); return; }
  try{
    $('#locationStatus') && ($('#locationStatus').textContent = 'מחפש כתובת…');
    const loc = await geocodeAddress(q);
    userLatLng = {lat:loc.lat, lng:loc.lng};
    if(!userMarker) userMarker = L.marker(userLatLng,{icon:catIcon}).addTo(map).bindPopup('המיקום שבחרת 🐱');
    else userMarker.setLatLng(userLatLng);
    map.setView(userLatLng, 13);
    $('#locationStatus') && ($('#locationStatus').textContent = `נבחר מיקום: ${loc.label}`);
    refresh();
  }catch{ alert('לא נמצאה הכתובת'); $('#locationStatus') && ($('#locationStatus').textContent='לא נבחר מיקום עדיין'); }
});
$('#useMyLocationBtn')?.addEventListener('click', centerOnUser);
$('#filterBtn')?.addEventListener('click', refresh);
$('#radiusInput')?.addEventListener('input', e=>{ $('#radiusLabel') && ($('#radiusLabel').textContent=e.target.value); });
['artistInput','startDateInput','endDateInput'].forEach(id=>{
  $('#'+id)?.addEventListener('change', refresh);
  $('#'+id)?.addEventListener('keyup', e=>{ if(e.key==='Enter') refresh(); });
});

// ===== Init =====
function init(){
  initMap();
  ensureTopbarButtons();
  ensureFollowedDialog();
  refresh();
}
init();
/*************** END app.js ****************/
