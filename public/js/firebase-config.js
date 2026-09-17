/**
 * ApexLiving Apartment Management Suite
 * Firebase Configuration & Service Layer
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyD1mDSRkdGOkB8PTPhsgBWXxy2vxZp-9Ug",
  authDomain: "apartment-manager-ez.firebaseapp.com",
  projectId: "apartment-manager-ez",
  storageBucket: "apartment-manager-ez.firebasestorage.app",
  messagingSenderId: "1088895351368",
  appId: "1:1088895351368:web:88057feaa83c1f1b3d367d",
  measurementId: "G-NQ8MR40QF7"
};

let app = null;
let auth = null;
let db = null;
let isFirebaseOnline = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseOnline = true;
  console.log("🔥 Firebase initialized successfully with project apartment-manager-ez");
} catch (error) {
  console.warn("⚠️ Firebase live connection warning (using offline/demo resilient store):", error);
  isFirebaseOnline = false;
}

export { 
  app, 
  auth, 
  db, 
  isFirebaseOnline,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
};
