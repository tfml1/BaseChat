//-------------------------------------------------------------------------------------------------------

// auth imports
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

// firestore db import
import { getFirestore } from "firebase/firestore";

//------------------------------------------------------------------------
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfigg = {
  apiKey: "AIzaSyCAJ3zHrDCE-vaLCqc8Lq_jnKEi-lF9tA0",
  authDomain: "basechat-5fbeb.firebaseapp.com",
  projectId: "basechat-5fbeb",
  storageBucket: "basechat-5fbeb.appspot.com",
  messagingSenderId: "631742680140",
  appId: "1:631742680140:web:dfd273b28dd47287c4f8e9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfigg);
//------------------------------------------------------------------------

// initialise firestore database
export const db = getFirestore(app);
// initialise authantication
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
// console.log("frbsbknd testing");
