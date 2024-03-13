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
  apiKey: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  authDomain: "bbbbbbbbbbbbbb.firebaseapp.com",
  projectId: "cccccccccccc",
  storageBucket: "dddddddddd.appspot.com",
  messagingSenderId: "12345789012345",
  appId: "9:8775432109:web:eeeeeeee11111111", // enter your own credentials after creating firebase project
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
