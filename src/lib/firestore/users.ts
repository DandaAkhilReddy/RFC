/**
 * Firestore Helper Functions - Users Collection
 * Handles user profiles, privacy settings, and streaks
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { UserProfile, PrivacySettings } from '../../types/scan';

const USERS_COLLECTION = 'users';

/**
 * Generate a unique slug for QR profile
 */
function generateSlug(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return slug;
}

/**
 * Create or update user profile
 */
export async function createUserProfile(
  userId: string,
  email: string,
  displayName: string,
  initialData?: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);

  const defaultPrivacy: PrivacySettings = {
    qrEnabled: true,
    slug: generateSlug(),
    allowedFields: {
      showWeek: true,
      showBfTrend: true,
      showLastInsight: true,
      showWeight: false,
      showBadges: true,
      showLBM: false,
    },
  };

  await setDoc(
    userRef,
    {
      id: userId,
      email,
      displayName,
      privacy: defaultPrivacy,
      currentStreak: 0,
      bestStreak: 0,
      lastScanDate: null,
      startWeight: initialData?.startWeight || 0,
      currentWeight: initialData?.currentWeight || 0,
      targetWeight: initialData?.targetWeight || 0,
      fitnessGoal: initialData?.fitnessGoal || '',
      currentLevel: initialData?.currentLevel || 'beginner',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return { id: userSnap.id, ...userSnap.data() } as UserProfile;
}

/**
 * Update user privacy settings
 */
export async function updatePrivacySettings(
  userId: string,
  privacy: Partial<PrivacySettings>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    privacy,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update specific privacy field (convenience method)
 */
export async function updateUserPrivacy(
  userId: string,
  allowedFields: Partial<PrivacySettings['allowedFields']>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const updates: any = {
    updatedAt: serverTimestamp(),
  };

  // Update nested fields
  Object.keys(allowedFields).forEach((key) => {
    updates[`privacy.allowedFields.${key}`] = allowedFields[key as keyof PrivacySettings['allowedFields']];
  });

  await updateDoc(userRef, updates);
}

/**
 * Rotate QR slug (for security)
 */
export async function rotateQRSlug(userId: string): Promise<string> {
  const newSlug = generateSlug();
  const userRef = doc(db, USERS_COLLECTION, userId);

  await updateDoc(userRef, {
    'privacy.slug': newSlug,
    updatedAt: serverTimestamp(),
  });

  return newSlug;
}

/**
 * Alias for rotateQRSlug for consistency
 */
export async function rotateQrSlug(userId: string): Promise<string> {
  return rotateQRSlug(userId);
}

/**
 * Get user by QR slug (alias for getUserBySlug)
 */
export async function getUserByQrSlug(slug: string): Promise<UserProfile | null> {
  return getUserBySlug(slug);
}

/**
 * Update streak data
 */
export async function updateStreak(
  userId: string,
  currentStreak: number,
  bestStreak: number,
  lastScanDate: string
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    currentStreak,
    bestStreak,
    lastScanDate,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get user by QR slug (for public profile)
 */
export async function getUserBySlug(slug: string): Promise<UserProfile | null> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(
    usersRef,
    where('privacy.slug', '==', slug),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as UserProfile;
}

/**
 * Update user weight
 */
export async function updateUserWeight(
  userId: string,
  currentWeight: number
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    currentWeight,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update user fitness context
 */
export async function updateFitnessContext(
  userId: string,
  updates: {
    startWeight?: number;
    currentWeight?: number;
    targetWeight?: number;
    fitnessGoal?: string;
    currentLevel?: string;
  }
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
