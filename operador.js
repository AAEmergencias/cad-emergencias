import { db } from "./firebase.js";
import { collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 🚨 Crear emergencia
window.crearEmergencia = async () => {
  await addDoc(collection(db, "incidentes"), {
    tipo: "Medica",
    ubicacion: "Planta",
    estado: "Pendiente",
    timestamp: new Date()
  });
};

// 🔄 Escuchar en tiempo real
const lista = document.getElementById("lista");

onSnapshot(collection(db, "incidentes"), (snapshot) => {
  lista.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const li = document.createElement("li");
    li.textContent = `${data.tipo} - ${data.ubicacion} (${data.estado})`;

    lista.appendChild(li);
  });
});

// 🗺️ Crear mapa
const map = L.map('map').setView([-33.4, -70.6], 10);

// 🌍 CAPA CLARA
const light = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
});

// 🌙 CAPA OSCURA
const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© CartoDB'
});

// 🛰️ CAPA SATÉLITE
const satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  subdomains:['mt0','mt1','mt2','mt3']
});

// 👉 capa por defecto
light.addTo(map);

// 🎛️ CONTROL DE CAPAS
const baseMaps = {
  "Claro": light,
  "Oscuro": dark,
  "Satélite": satellite
};

L.control.layers(baseMaps).addTo(map);
