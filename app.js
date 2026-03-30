import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log("Intentando login..."); // 👈 para debug

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Login OK");
    
    window.location.href = "./operador.html"; // 👈 redirección

  } catch (e) {
    console.error(e);
    alert(e.message);
  }
};
