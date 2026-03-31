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

// 🔴 ZONA GEOJSON
const zonaGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "nombre": "Jurisdiccion Anglo"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-70.49570953588514,-33.365514128760296],
          [-70.49455503041689,-33.36669748011438],
          [-70.4811207849663,-33.365667527066115],
          [-70.46218214514253,-33.37379231660535],
          [-70.4143748475144,-33.37451263368333],
          [-70.39090913451274,-33.37264095459292],
          [-70.36043970495521,-33.351895130841704],
          [-70.35223134125835,-33.30086224889438],
          [-70.34041390837132,-33.25134967847707],
          [-70.33316186892536,-33.18713213462048],
          [-70.33200924790681,-33.17592765384217],
          [-70.30639280189578,-33.178512526267454],
          [-70.26769673373411,-33.171113470405736],
          [-70.27672123943472,-33.133055837157606],
          [-70.30686248880417,-33.13194368158262],
          [-70.34309863619002,-33.10517051862088],
          [-70.36019136306035,-33.10752206526852],
          [-70.35989648403202,-33.20222393921215],
          [-70.63425123306948,-33.175577567226824],
          [-70.64761653449172,-33.159038053648025],
          [-70.69751544622952,-33.09833175746034],
          [-70.7161441328666,-33.09237600266995],
          [-70.76174307628696,-33.10057956470037],
          [-70.79564539668316,-33.152830039837106],
          [-70.75708854636973,-33.16838608634597],
          [-70.64602794220171,-33.17931013148511],
          [-70.56944881358636,-33.20696392447407],
          [-70.36199836298348,-33.226397029358324],
          [-70.39597361431038,-33.332213534172084],
          [-70.45267719986954,-33.35842361874061],
          [-70.49578091729094,-33.365513033386115]
        ]]
      }
    }
  ]
};

L.geoJSON(zonaGeoJSON, {
  style: {
    color: "red",
    fillColor: "red",
    fillOpacity: 0.1,
    weight: 2
  }
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
