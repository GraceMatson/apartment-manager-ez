/**
 * Sreeja Fantasy Apartments - Resident & Property Management Suite
 * Firebase Configuration & Service Layer (Vite/React)
 */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut, 
  onAuthStateChanged
} from "firebase/auth";
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
} from "firebase/firestore";

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
let googleProvider = null;
let isFirebaseOnline = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  isFirebaseOnline = true;
  console.log("🔥 Firebase initialized successfully for Sreeja Fantasy Apartments");
} catch (error) {
  console.warn("⚠️ Firebase live connection note (demo store active):", error);
  isFirebaseOnline = false;
}

export async function loginWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error("Firebase Auth is not available. Check configuration.");
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export { 
  app, 
  auth, 
  db, 
  googleProvider,
  isFirebaseOnline,
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
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
