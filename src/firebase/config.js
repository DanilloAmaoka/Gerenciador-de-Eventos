import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcJwysgmco_tej3chhQwaORjEcLd3Q_Mk",
  authDomain: "gerenciador-de-eventos-a1390.firebaseapp.com",
  projectId: "gerenciador-de-eventos-a1390",
  storageBucket: "gerenciador-de-eventos-a1390.firebasestorage.app",
  messagingSenderId: "108809330918",
  appId: "1:108809330918:web:2baf71482022790c605b27"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
