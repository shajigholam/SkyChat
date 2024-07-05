// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

export const getFirebaseApp = () => {
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAiAEd5-sm8BquibSC9pz7BwIowVYJAniA",
    authDomain: "skychat-1870f.firebaseapp.com",
    projectId: "skychat-1870f",
    storageBucket: "skychat-1870f.appspot.com",
    messagingSenderId: "517992943594",
    appId: "1:517992943594:web:3878cbe4bc1fee83d1ac93",
    measurementId: "G-G8J8RNM8BH",
  };

  // Initialize Firebase
  return initializeApp(firebaseConfig);
};
