import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// A tua configuração da web app do Firebase, lida a partir do .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Exportar a instância do Firestore para ser usada noutros ficheiros
export const db = getFirestore(app);