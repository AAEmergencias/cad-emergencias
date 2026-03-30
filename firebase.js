import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCyiJHm68MhXC_2BmeH-KbRMeA3CYTEvko",
  authDomain: "cad-emergencias-d793a.firebaseapp.com",
  projectId: "cad-emergencias-d793a",
  storageBucket: "cad-emergencias-d793a.firebasestorage.app",
  messagingSenderId: "1051475306664",
  appId: "1:1051475306664:web:6f1d43e296077930367a9d"
};

const app = initializeApp(firebaseConfig);

// 🔥 Exportamos lo que vas a usar
export const auth = getAuth(app);
export const db = getFirestore(app);
