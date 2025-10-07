import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Helper to get env var from either Vite or Node.js environment
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  return process.env[key];
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
};

const app = initializeApp(firebaseConfig);
export { app }; // Export app for Firebase Functions
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
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
  COMMUNITY_POSTS: 'community_posts',
  // New collections for Rapid AI
  BODY_FAT_REFERENCES: 'body_fat_references',
  BODY_ANALYSIS: 'body_analysis',
  RAPID_AI_ASSESSMENTS: 'rapid_ai_assessments',
  MEAL_PLANS: 'meal_plans',
  WORKOUT_PLANS: 'workout_plans',
  // New collections for Cupid AI accountability matching
  ACCOUNTABILITY_PARTNERS: 'accountability_partners',
  CHECK_INS: 'check_ins',
  PARTNER_REQUESTS: 'partner_requests',
  // Community feature
  COMMUNITY_USERS: 'community_users',
  USER_LOCATIONS: 'user_locations',
  // Daily Scan system
  SCANS: 'scans',
  DAY_LOGS: 'dayLogs'
};
