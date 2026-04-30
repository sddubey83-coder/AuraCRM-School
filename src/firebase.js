import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Ye tumhare project ki settings hain
const firebaseConfig = {
  apiKey: "AIzaSyD3IfCedwm7wrCl5HN8koyQUyr4QbKAq_4", // Ye tumhein Firebase Console -> Project Settings mein milega
  authDomain: "aurasynk-1983.firebaseapp.com",
  projectId: "aurasynk-1983",
  storageBucket: "aurasynk-1983.firebasestorage.app",
  messagingSenderId: "847779577096",
  appId: "1:847779577096:web:ae7cea5b6a2f6e9f8a80bd"

};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);