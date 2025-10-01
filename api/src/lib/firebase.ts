import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'reddyfit-e5b50',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Firestore Collections (easy to view in Firebase Console)
export const Collections = {
  USERS: 'users',
  MEALS: 'meals',
  WEIGHT_LOGS: 'weight_logs',
  WORKOUTS: 'workouts',
  MATCHES: 'matches',
  SWIPES: 'swipes',
  CHAT_MESSAGES: 'chat_messages'
};

// TypeScript Interfaces for Firestore documents
export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal: string;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  dailyProtein: number;

  // Profile fields (for matching)
  photoUrl?: string;
  bio?: string;
  interests?: string[];
  location?: string;

  // Matching preferences
  lookingFor?: 'male' | 'female' | 'any';
  ageRange?: { min: number; max: number };

  // Timestamps
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  hasCompletedProfile: boolean;
}

export interface MealLog {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: admin.firestore.Timestamp;
}

export interface WeightLog {
  id?: string;
  userId: string;
  weight: number; // kg
  date: string; // YYYY-MM-DD
  timestamp: admin.firestore.Timestamp;
}

export interface WorkoutLog {
  id?: string;
  userId: string;
  date: string;
  type: string;
  duration: number; // minutes
  caloriesBurned: number;
  exercises: string[];
  timestamp: admin.firestore.Timestamp;
}

export interface SwipeAction {
  id?: string;
  userId: string; // Who swiped
  targetUserId: string; // Who was swiped on
  liked: boolean; // true = like, false = pass
  timestamp: admin.firestore.Timestamp;
}

export interface Match {
  id?: string;
  user1Id: string;
  user2Id: string;
  matchedAt: admin.firestore.Timestamp;
  lastMessageAt?: admin.firestore.Timestamp;
  isActive: boolean;
}

export interface ChatMessage {
  id?: string;
  matchId: string;
  senderId: string;
  message: string;
  timestamp: admin.firestore.Timestamp;
  read: boolean;
}

// Helper functions for auth
export async function verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
  return await auth.verifyIdToken(token);
}

export function getAuthToken(request: any): string | null {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split('Bearer ')[1];
}
