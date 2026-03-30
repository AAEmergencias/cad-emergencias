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
