import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyCYkWiAks40eJglEcSQQXiZb3OBaaDYCZw",
    authDomain: "sd2025law.firebaseapp.com",
    projectId: "sd2025law",
    storageBucket: "sd2025law.firebasestorage.app",
    messagingSenderId: "813089506227",
    appId: "1:813089506227:web:b473a0eaee4337a83b41c6",
    measurementId: "G-8ECGH3WP77"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'us-central1');

if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, functions };



