import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDqAfuTm_-sdbxzfhGAcJv_MNlIIoyl7PY",
  authDomain: "reddyfit-website.firebaseapp.com",
  projectId: "reddyfit-website",
  storageBucket: "reddyfit-website.firebasestorage.app",
  messagingSenderId: "384999892537",
  appId: "1:384999892537:web:9b0e95fd677b7e36aa8fe8",
  measurementId: "G-BV755BPQW7"
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
