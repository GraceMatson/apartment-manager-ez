// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1mDSRkdGOkB8PTPhsgBWXxy2vxZp-9Ug",
  authDomain: "apartment-manager-ez.firebaseapp.com",
  projectId: "apartment-manager-ez",
  storageBucket: "apartment-manager-ez.firebasestorage.app",
  messagingSenderId: "1088895351368",
  appId: "1:1088895351368:web:88057feaa83c1f1b3d367d",
  measurementId: "G-NQ8MR40QF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);