import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBFhGoxAAR4vLYLXNn8nDlKabiqhCPnWJk",
  authDomain: "reddyfit-dcf41.firebaseapp.com",
  projectId: "reddyfit-dcf41",
  storageBucket: "reddyfit-dcf41.firebasestorage.app",
  messagingSenderId: "123730832729",
  appId: "1:123730832729:web:16ce63a0f2d5401f60b048",
  measurementId: "G-ECC4W6B3JN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const storage = getStorage(app);

// Collection names (easy to find in Firebase Console)
export const Collections = {
  USERS: 'users',
  USER_SETTINGS: 'user_settings',
  USER_FEEDBACK: 'user_feedback',
  MEALS: 'meals',
  WEIGHT_LOGS: 'weight_logs',
  WORKOUTS: 'workouts',
  MATCHES: 'matches',
  SWIPES: 'swipes',
  CHAT_MESSAGES: 'chat_messages'
};
