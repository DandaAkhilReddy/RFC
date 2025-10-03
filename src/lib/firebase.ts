import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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
  CUPID_MATCHES: 'cupid_matches',
  WORKOUT_BUDDIES: 'workout_buddies',
  SWIPES: 'swipes',
  CHAT_MESSAGES: 'chat_messages',
  VIDEOS: 'videos',
  DAILY_STREAKS: 'daily_streaks',
  COMMUNITY_POSTS: 'community_posts'
};
