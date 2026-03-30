import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  GeoPoint,
  getDoc // 👈 AGREGAR AQUÍ
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

//////////////////////////////////////////////////////
// 🗺️ MAPA
//////////////////////////////////////////////////////

const map = L.map('map').setView([-33.4, -70.6], 10);

const light = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
const satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  subdomains:['mt0','mt1','mt2','mt3']
});

light.addTo(map);

L.control.layers({
  "Claro": light,
  "Oscuro": dark,
  "Satélite": satellite
}).addTo(map);

//////////////////////////////////////////////////////
// 🎨 COLORES
//////////////////////////////////////////////////////

function getColor(estado) {
  if (estado === "Disponible") return "green";
  if (estado === "En Llamado") return "orange";
  if (estado === "En Servicio") return "blue";
  if (estado === "Fuera de servicio") return "gray";
  if (estado === "En base") return "black";
  return "black";
}

//////////////////////////////////////////////////////
// 🚑 VEHÍCULOS
//////////////////////////////////////////////////////

const vehiculosMarkers = {};

onSnapshot(collection(db, "vehiculos"), (snapshot) => {

  snapshot.forEach(docSnap => {
    const v = docSnap.data();
    const id = docSnap.id;

    const lat = v.ubicacion.latitude;
    const lng = v.ubicacion.longitude;

    if (vehiculosMarkers[id]) {
      vehiculosMarkers[id].setLatLng([lat, lng]);
      vehiculosMarkers[id].setStyle({ color: getColor(v.estado) });

    } else {
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        color: getColor(v.estado)
      }).addTo(map);

      marker.on("click", () => abrirPanel(v, id));

      vehiculosMarkers[id] = marker;
    }
  });
});

//////////////////////////////////////////////////////
// 🪟 PANEL VEHÍCULO
//////////////////////////////////////////////////////

let panel = document.createElement("div");
panel.style.position = "absolute";
panel.style.right = "10px";
panel.style.top = "10px";
panel.style.background = "white";
panel.style.padding = "10px";
panel.style.border = "1px solid black";
panel.style.zIndex = "1000";
panel.style.display = "none";

document.body.appendChild(panel);

function abrirPanel(v, id) {
  panel.style.display = "block";

  panel.innerHTML = `
    <h3>${v.nombre}</h3>
    <p>${v.descripcion}</p>
    <p>Estado: ${v.estado}</p>

    <button onclick="accion('${id}', '6-3')">6-3</button>
    <button onclick="accion('${id}', '6-7')">6-7</button>
    <button onclick="accion('${id}', '6-8')">6-8</button>
    <button onclick="accion('${id}', '6-9')">6-9</button>
    <button onclick="accion('${id}', '6-10')">6-10</button>
    <button onclick="accion('${id}', '6-11')">6-11</button>
    <button onclick="accion('${id}', '6-13')">6-13</button>
    <button onclick="accion('${id}', '6-14')">6-14</button>
    <button onclick="accion('${id}', '6-15')">6-15</button>

    <br><br>
    <button onclick="cerrarPanel()">Cerrar</button>
  `;
}

window.cerrarPanel = () => {
  panel.style.display = "none";
};

//////////////////////////////////////////////////////
// ⚙️ LÓGICA DE CLAVES
//////////////////////////////////////////////////////

window.accion = async (vehiculoId, codigo) => {

  const ref = doc(db, "vehiculos", vehiculoId);

  // 🔍 Obtener datos actuales del vehículo
  const snapshot = await getDoc(ref);
  const vehiculo = snapshot.data();

  let estado = vehiculo.estado;
  let nuevaUbicacion = vehiculo.ubicacion;

  const tieneIncidente = vehiculo.incidente_asignado !== null;

  switch (codigo) {

    case "6-3": // En el lugar
      estado = "En Servicio";

      // 🔒 queda bloqueado si tiene incidente
      if (tieneIncidente) {
        estado = "En Servicio";
      }

      // (temporal) mover a punto
      nuevaUbicacion = new GeoPoint(-33.4, -70.6);
      break;

    case "6-7": // Controlado
      estado = "En Servicio";
      break;

    case "6-8": // Disponible
      estado = "Disponible";

      // 🔓 liberar incidente
      if (tieneIncidente) {
        await updateDoc(ref, {
          incidente_asignado: null
        });
      }
      break;

    case "6-9": // Se retira
      estado = "En Llamado";
      break;

    case "6-10": // En base
      estado = "En base";
      break;

    case "6-11": // En panne
      estado = "Fuera de servicio";
      break;

    case "6-13":
      estado = "En Servicio";
      break;

    case "6-14":
      estado = "En Llamado";
      break;

    case "6-15":
      estado = "En Servicio";
      break;
  }

  await updateDoc(ref, {
    estado: estado,
    codigo_estado: codigo,
    ubicacion: nuevaUbicacion
  });
};
