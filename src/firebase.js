import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3IfCedwm7wrCl5HN8koyQUyr4QbKAq_4",
  authDomain: "aurasynk-1983.firebaseapp.com",
  projectId: "aurasynk-1983",
  storageBucket: "aurasynk-1983.firebasestorage.app",
  messagingSenderId: "847779577096",
  appId: "1:847779577096:web:ae7cea5b6a2f6e9f8a80bd",
  measurementId: "G-PQDSKZGWFX"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;