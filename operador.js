import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  GeoPoint,
  getDoc
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
// 🗺️ ZONAS (MULTIPLES)
//////////////////////////////////////////////////////

const zonasGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "nombre": "Zona Mina" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[ -70.49,-33.36 ],[ -70.48,-33.35 ],[ -70.47,-33.36 ],[ -70.49,-33.36 ]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "nombre": "Zona Tortolas" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[ -70.70,-33.14 ],[ -70.69,-33.13 ],[ -70.68,-33.14 ],[ -70.70,-33.14 ]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "nombre": "Zona STP" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[ -70.56,-33.19 ],[ -70.55,-33.18 ],[ -70.54,-33.19 ],[ -70.56,-33.19 ]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "nombre": "Zona Ermita" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[ -70.39,-33.36 ],[ -70.38,-33.35 ],[ -70.37,-33.36 ],[ -70.39,-33.36 ]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "nombre": "Zona Bronces" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[ -70.28,-33.14 ],[ -70.27,-33.13 ],[ -70.26,-33.14 ],[ -70.28,-33.14 ]]]
      }
    }
  ]
};

L.geoJSON(zonasGeoJSON, {
  style: function(feature) {

    let color = "red";

    switch (feature.properties.nombre) {
      case "Zona Mina": color = "orange"; break;
      case "Zona Tortolas": color = "blue"; break;
      case "Zona STP": color = "purple"; break;
      case "Zona Ermita": color = "green"; break;
      case "Zona Bronces": color = "red"; break;
    }

    return {
      color: color,
      fillColor: color,
      fillOpacity: 0.05,
      weight: 2
    };
  },

  onEachFeature: function (feature, layer) {
    layer.bindPopup(feature.properties.nombre);
  }

}).addTo(map);

//////////////////////////////////////////////////////
// 🎨 COLORES VEHÍCULOS
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
// 🪟 PANEL
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
// ⚙️ LÓGICA CAD
//////////////////////////////////////////////////////

window.accion = async (vehiculoId, codigo) => {

  const ref = doc(db, "vehiculos", vehiculoId);
  const snapshot = await getDoc(ref);
  const vehiculo = snapshot.data();

  let estado = vehiculo.estado;
  let nuevaUbicacion = vehiculo.ubicacion;

  const tieneIncidente = vehiculo.incidente_asignado !== null;

  switch (codigo) {

    case "6-3":
      estado = "En Servicio";
      nuevaUbicacion = new GeoPoint(-33.4, -70.6);
      break;

    case "6-7":
      estado = "En Servicio";
      break;

    case "6-8":
      estado = "Disponible";
      if (tieneIncidente) {
        await updateDoc(ref, { incidente_asignado: null });
      }
      break;

    case "6-9":
      estado = "En Llamado";
      break;

    case "6-10":
      estado = "En base";
      break;

    case "6-11":
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
