import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGgVId-ip7kazAYXePFpKjX1hrcsI0bMU",
  authDomain: "clinic-app-d4498.firebaseapp.com",
  projectId: "clinic-app-d4498",
  storageBucket: "clinic-app-d4498.firebasestorage.app",
  messagingSenderId: "1019803178300",
  appId: "1:1019803178300:web:d5bc38e9cefe4474b83a39",
  measurementId: "G-GZBGFPQ2RD",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
