import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDLCU-rJluOcvMI3pMV6iEzE0uUqR6g34Q",
    authDomain: "nutriscan-7970f.firebaseapp.com",
    projectId: "nutriscan-7970f",
    storageBucket: "nutriscan-7970f.firebasestorage.app",
    messagingSenderId: "514500525813",
    appId: "1:514500525813:web:0d996e9e4fba33b8460fbc",
    measurementId: "G-SXY99NKPZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);