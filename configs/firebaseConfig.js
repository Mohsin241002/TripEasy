// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3OibZMyDuTbNZitNW-y1NH9uB1RfA_mE",
  authDomain: "aitravelplanner-1607a.firebaseapp.com",
  projectId: "aitravelplanner-1607a",
  storageBucket: "aitravelplanner-1607a.firebasestorage.app",
  messagingSenderId: "1075829852055",
  appId: "1:1075829852055:web:0e7ad0f9f78f46b26be6d2",
  measurementId: "G-NYCYTTT7K1"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
