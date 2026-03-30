import { db } from "./firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

//////////////////////////////////////////////////////
// 🗺️ MAPA CON CAPAS
//////////////////////////////////////////////////////

const map = L.map('map').setView([-33.4, -70.6], 10);

// 🌍 Claro
const light = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
});

// 🌙 Oscuro
const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© CartoDB'
});

// 🛰️ Satélite (puede fallar a veces)
const satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  subdomains:['mt0','mt1','mt2','mt3']
});

// Capa por defecto
light.addTo(map);

// Control de capas
L.control.layers({
  "Claro": light,
  "Oscuro": dark,
  "Satélite": satellite
}).addTo(map);

//////////////////////////////////////////////////////
// 🎨 COLORES SEGÚN ESTADO
//////////////////////////////////////////////////////

function getColor(estado) {
  if (estado === "Disponible") return "green";
  if (estado === "En Llamado") return "orange";
  if (estado === "En Servicio") return "blue";
  if (estado === "Fuera de servicio") return "gray";
  return "black";
}

//////////////////////////////////////////////////////
// 🚑 VEHÍCULOS EN TIEMPO REAL (GeoPoint)
//////////////////////////////////////////////////////

const vehiculosMarkers = {};

onSnapshot(collection(db, "vehiculos"), (snapshot) => {

  snapshot.forEach(doc => {
    const v = doc.data();
    const id = doc.id;

    // 📍 Obtener coordenadas desde GeoPoint
    const lat = v.ubicacion.latitude;
    const lng = v.ubicacion.longitude;

    // 🔄 Si ya existe → actualizar
    if (vehiculosMarkers[id]) {
      vehiculosMarkers[id].setLatLng([lat, lng]);

      vehiculosMarkers[id].setStyle({
        color: getColor(v.estado)
      });

      vehiculosMarkers[id].setPopupContent(`
        <b>${v.nombre}</b><br>
        ${v.descripcion}<br>
        Estado: ${v.estado}
      `);

    } else {
      // 🆕 Crear marcador
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        color: getColor(v.estado)
      }).addTo(map);

      marker.bindPopup(`
        <b>${v.nombre}</b><br>
        ${v.descripcion}<br>
        Estado: ${v.estado}
      `);

      // 👉 Click para futuro panel
      marker.on("click", () => {
        console.log("Vehículo seleccionado:", v.nombre);
        // aquí después conectamos tu panel lateral 🔥
      });

      vehiculosMarkers[id] = marker;
    }

  });

});
