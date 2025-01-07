// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB62MS1TuChBdPKueOED2AA0KbsHCIMVI0",
  authDomain: "fulltodo-dd7db.firebaseapp.com",
  databaseURL: "https://fulltodo-dd7db-default-rtdb.firebaseio.com",
  projectId: "fulltodo-dd7db",
  storageBucket: "fulltodo-dd7db.firebasestorage.app",
  messagingSenderId: "73644016354",
  appId: "1:73644016354:web:7f6d1e3a5e770759ec94bb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);