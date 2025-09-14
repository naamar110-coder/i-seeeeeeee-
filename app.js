// ------- כלים קצרים -------
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// אירוע ברירת מחדל לכפתורים הכלליים
const defaultEvent = {
  title: 'תערוכה: קווים של אור',
  start: '2025-09-20T19:00:00',
  end:   '2025-09-20T21:00:00',
  location: 'המוזיאון תל אביב',
  lat: 32.0779, lng: 34.7860
};

// ------- Login/Logout (דמה) -------
const loginBtn  = $('#loginBtn');
const logoutBtn = $('#logoutBtn');

loginBtn?.addEventListener('click', () => {
  loginBtn.style.display = 'none';
  logoutBtn.style.display = 'inline-block';
  alert('מחוברת! (דמו)');
});
logoutBtn?.addEventListener('click', () => {
  logoutBtn.style.display = 'none';
  loginBtn.style.display = 'inline-block';
  alert('התנתקת (דמו)');
});

// ------- Add to Calendar (ICS) -------
function downloadICS(ev) {
  const dt = s => s.replace(/[-:]/g,'').replace('.000','');
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//i_seeeeeeee//Exhibitions//HE',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@i-seeeeeeee`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(ev.start)}`,
    `DTEND:${dt(ev.end || ev.start)}`,
    `SUMMARY:${ev.title}`,
    `LOCATION:${ev.location || ''}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'event.ics'; a.click();
  URL.revokeObjectURL(url);
}

// ------- Open Maps -------
function openMaps(ev) {
  const hasLL = ev.lat && ev.lng;
  const url = hasLL
    ? `https://www.google.com/maps/search/?api=1&query=${ev.lat},${ev.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location||'המוזיאון תל אביב')}`;
  window.open(url, '_blank');
}

// ------- Share -------
async function shareEvent(ev) {
  const text = `${ev.title} · ${ev.location||''}`;
  const url  = window.location.href;
  if (navigator.share) {
    try { await navigator.share({ title: ev.title, text, url }); }
    catch(_) { /* user cancelled */ }
  } else {
    try { await navigator.clipboard.writeText(`${text}\n${url}`); alert('קישור הועתק 👍'); }
    catch(_) { alert('לא ניתן לשתף אוטומטית, נא להעתיק ידנית'); }
  }
}

// כפתורים כלליים
$('#addToCalendarBtn')?.addEventListener('click', ()=> downloadICS(defaultEvent));
$('#openMapsBtn')?.addEventListener('click', ()=> openMaps(defaultEvent));
$('#shareBtn')?.addEventListener('click', ()=> shareEvent(defaultEvent));
$('#submitEventBtn')?.addEventListener('click', ()=> alert('טופס “הוסף אירוע” יתווסף בהמשך'));

// כפתורים בכל כרטיס (data-action)
$('#results')?.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-action]');
  if(!btn) return;
  const card = btn.closest('.card');
  const ev = {
    title: card?.dataset.title || defaultEvent.title,
    start: card?.dataset.start || defaultEvent.start,
    end:   card?.dataset.end   || defaultEvent.end,
    location: card?.dataset.location || defaultEvent.location,
    lat: parseFloat(card?.dataset.lat) || defaultEvent.lat,
    lng: parseFloat(card?.dataset.lng) || defaultEvent.lng
  };
  const action = btn.dataset.action;
  if (action === 'add-to-calendar') return downloadICS(ev);
  if (action === 'open-maps')      return openMaps(ev);
  if (action === 'share')          return shareEvent(ev);
});

// ------- מפה (Leaflet) -------
(function initMap() {
  const mapEl = $('#map');
  if (!mapEl || !window.L) return;

  const center = [defaultEvent.lat, defaultEvent.lng];
  const map = L.map(mapEl, { zoomControl: true }).setView(center, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  const marker = L.marker(center).addTo(map);
  marker.bindPopup(defaultEvent.location || 'מיקום התערוכה');

  // מיקום משתמש (אם מאשרים)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const you = [pos.coords.latitude, pos.coords.longitude];
        L.circleMarker(you, { radius: 6, color: '#a78bfa' }).addTo(map).bindPopup('את/ה כאן');
      },
      () => {}, { enableHighAccuracy: true, timeout: 5000 }
    );
  }
})();
