// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfODm6GR8ScCYxkdsNtirZZmHDLj-jcSM",
  authDomain: "sthirah-7ec44.firebaseapp.com",
  projectId: "sthirah-7ec44",
  storageBucket: "sthirah-7ec44.firebasestorage.app",
  messagingSenderId: "997095884742",
  appId: "1:997095884742:web:443447d527cdda225b94c7",
  measurementId: "G-D727YT7FTL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, RecaptchaVerifier, signInWithPhoneNumber, collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, orderBy };
