import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAYbNCbiVjgkhY86hLz3LB68tN8IyvqJFs",
  authDomain: "skill-swap-37874.firebaseapp.com",
  projectId: "skill-swap-37874",
  storageBucket: "skill-swap-37874.appspot.com",
  messagingSenderId: "542224518584",
  appId: "1:542224518584:web:729eddd4dc0ae3eee8534d",
  measurementId: "G-VZS83MFW58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optionally enable analytics only in production
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
  analytics = getAnalytics(app);
}

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app, analytics }; 