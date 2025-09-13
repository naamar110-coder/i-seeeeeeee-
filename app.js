// app.js

// מייבאים את ה־config שלך
import { firebaseConfig } from "./firebase-config.js";

// מייבאים פונקציות מ־Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// מפעילים את Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// יוצרים מפה עם Leaflet
const map = L.map('map').setView([32.0853, 34.7818], 12); // תל אביב כברירת מחדל
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// פונקציה שמביאה תערוכות מה־Firestore
async function loadExhibitions() {
  const querySnapshot = await getDocs(collection(db, "exhibitions"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.lat && data.lng) {
      L.marker([data.lat, data.lng]).addTo(map)
        .bindPopup(`<b>${data.title}</b><br>${data.artist}<br>${data.gallery}`);
    }
  });
}

// פונקציה להוספת תערוכה לדאטאבייס
async function addExhibition(event) {
  event.preventDefault();

  const title = document.querySelector('[name="title"]').value;
  const artist = document.querySelector('[name="artist"]').value;
  const gallery = document.querySelector('[name="gallery"]').value;
  const lat = parseFloat(document.querySelector('[name="lat"]').value);
  const lng = parseFloat(document.querySelector('[name="lng"]').value);
  const start = document.querySelector('[name="start"]').value;
  const end = document.querySelector('[name="end"]').value;

  try {
    await addDoc(collection(db, "exhibitions"), {
      title, artist, gallery, lat, lng, start, end
    });
    alert("התערוכה נשמרה בהצלחה!");
    loadExhibitions(); // טוען מחדש
  } catch (e) {
    console.error("Error adding document: ", e);
    alert("שגיאה בשמירה");
  }
}

// מאזינים לכפתור הוספה
document.getElementById("eventForm")?.addEventListener("submit", addExhibition);

// טוענים את התערוכות בהתחלה
loadExhibitions();
