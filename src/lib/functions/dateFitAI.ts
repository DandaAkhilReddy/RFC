/**
 * Cupid AI Functions
 * Feature 3: Daily Accountability Partner Matching
 * Matches users with opposite gender based on habits, schedules, and interests
 */

import { db, Collections } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

export interface UserMatchPreferences {
  userEmail: string;
  gender: 'male' | 'female' | 'other';
  loginTimes: string[]; // Array of time slots: 'morning', 'afternoon', 'evening', 'night'
  workoutTimes: string[]; // Preferred workout times
  mealTimes: string[]; // Typical meal times
  fitnessGoals: string[]; // Array of goals
  interests: string[]; // Hobbies and interests
  timezone: string;
  isActive: boolean;
  lastMatchDate?: string;
}

export interface MatchScore {
  userId: string;
  userEmail: string;
  name: string;
  gender: string;
  score: number; // 0-100
  commonInterests: string[];
  matchReasons: string[];
}

export interface DailyMatch {
  userEmail: string;
  matchedUserEmail: string;
  matchedUserName: string;
  matchScore: number;
  matchDate: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  commonInterests: string[];
}

export interface SwipeAction {
  userEmail: string;
  targetUserEmail: string;
  action: 'like' | 'pass';
  timestamp: Date;
}

/**
 * Save user match preferences
 */
export const saveMatchPreferences = async (preferences: UserMatchPreferences): Promise<void> => {
  try {
    const docRef = doc(db, 'match_preferences', preferences.userEmail);
    await setDoc(docRef, {
      ...preferences,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving match preferences:', error);
    throw error;
  }
};

/**
 * Get user match preferences
 */
export const getMatchPreferences = async (userEmail: string): Promise<UserMatchPreferences | null> => {
  try {
    const docRef = doc(db, 'match_preferences', userEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserMatchPreferences;
    }
    return null;
  } catch (error) {
    console.error('Error fetching match preferences:', error);
    return null;
  }
};

/**
 * Calculate match score between two users
 */
export const calculateMatchScore = (
  user1: UserMatchPreferences,
  user2: UserMatchPreferences
): MatchScore => {
  let score = 0;
  const matchReasons: string[] = [];
  const commonInterests: string[] = [];

  // Check login times overlap (20 points)
  const loginOverlap = user1.loginTimes.filter(time => user2.loginTimes.includes(time));
  if (loginOverlap.length > 0) {
    score += 20;
    matchReasons.push(`Active at similar times (${loginOverlap.join(', ')})`);
  }

  // Check workout times overlap (25 points)
  const workoutOverlap = user1.workoutTimes.filter(time => user2.workoutTimes.includes(time));
  if (workoutOverlap.length > 0) {
    score += 25;
    matchReasons.push(`Workout together (${workoutOverlap.join(', ')})`);
  }

  // Check meal times overlap (15 points)
  const mealOverlap = user1.mealTimes.filter(time => user2.mealTimes.includes(time));
  if (mealOverlap.length > 0) {
    score += 15;
    matchReasons.push(`Similar meal schedules`);
  }

  // Check fitness goals overlap (20 points)
  const goalsOverlap = user1.fitnessGoals.filter(goal => user2.fitnessGoals.includes(goal));
  if (goalsOverlap.length > 0) {
    score += 20;
    matchReasons.push(`Shared fitness goals: ${goalsOverlap.join(', ')}`);
  }

  // Check interests overlap (20 points)
  const interestsOverlap = user1.interests.filter(interest => user2.interests.includes(interest));
  if (interestsOverlap.length > 0) {
    score += 20;
    commonInterests.push(...interestsOverlap);
    matchReasons.push(`Common interests: ${interestsOverlap.join(', ')}`);
  }

  return {
    userId: user2.userEmail,
    userEmail: user2.userEmail,
    name: user2.userEmail.split('@')[0], // Placeholder, should get from user profile
    gender: user2.gender,
    score,
    commonInterests,
    matchReasons
  };
};

/**
 * Find potential matches for a user
 */
export const findPotentialMatches = async (userEmail: string): Promise<MatchScore[]> => {
  try {
    const userPrefs = await getMatchPreferences(userEmail);
    if (!userPrefs) {
      throw new Error('User preferences not found');
    }

    // Get opposite gender users only
    const oppositeGender = userPrefs.gender === 'male' ? 'female' : 'male';

    const prefsQuery = query(
      collection(db, 'match_preferences'),
      where('gender', '==', oppositeGender),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(prefsQuery);
    const potentialMatches: MatchScore[] = [];

    snapshot.docs.forEach(doc => {
      const otherUser = doc.data() as UserMatchPreferences;

      // Don't match with self
      if (otherUser.userEmail === userEmail) return;

      // Calculate match score
      const matchScore = calculateMatchScore(userPrefs, otherUser);

      // Only include matches with score > 20
      if (matchScore.score > 20) {
        potentialMatches.push(matchScore);
      }
    });

    // Sort by score (highest first)
    return potentialMatches.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error finding potential matches:', error);
    return [];
  }
};

/**
 * Get today's daily match for user
 */
export const getDailyMatch = async (userEmail: string): Promise<DailyMatch | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, Collections.MATCHES, `${userEmail}_${today}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as DailyMatch;
    }
    return null;
  } catch (error) {
    console.error('Error fetching daily match:', error);
    return null;
  }
};

/**
 * Create daily match for user
 */
export const createDailyMatch = async (userEmail: string): Promise<DailyMatch | null> => {
  try {
    // Check if already matched today
    const existingMatch = await getDailyMatch(userEmail);
    if (existingMatch) {
      return existingMatch;
    }

    // Find potential matches
    const potentialMatches = await findPotentialMatches(userEmail);

    if (potentialMatches.length === 0) {
      console.log('No potential matches found');
      return null;
    }

    // Get best match
    const bestMatch = potentialMatches[0];

    const today = new Date().toISOString().split('T')[0];
    const dailyMatch: DailyMatch = {
      userEmail,
      matchedUserEmail: bestMatch.userEmail,
      matchedUserName: bestMatch.name,
      matchScore: bestMatch.score,
      matchDate: today,
      status: 'pending',
      commonInterests: bestMatch.commonInterests
    };

    // Save match
    const docRef = doc(db, Collections.MATCHES, `${userEmail}_${today}`);
    await setDoc(docRef, {
      ...dailyMatch,
      createdAt: serverTimestamp()
    });

    return dailyMatch;
  } catch (error) {
    console.error('Error creating daily match:', error);
    return null;
  }
};

/**
 * Record swipe action
 */
export const recordSwipe = async (swipe: SwipeAction): Promise<void> => {
  try {
    await setDoc(doc(db, Collections.SWIPES, `${swipe.userEmail}_${swipe.targetUserEmail}`), {
      ...swipe,
      timestamp: serverTimestamp()
    });

    // If both users liked each other, create a match
    if (swipe.action === 'like') {
      const reverseSwipeDoc = await getDoc(
        doc(db, Collections.SWIPES, `${swipe.targetUserEmail}_${swipe.userEmail}`)
      );

      if (reverseSwipeDoc.exists() && reverseSwipeDoc.data().action === 'like') {
        // It's a match! Update match status
        const today = new Date().toISOString().split('T')[0];
        const matchDoc = doc(db, Collections.MATCHES, `${swipe.userEmail}_${today}`);
        await setDoc(matchDoc, {
          status: 'accepted'
        }, { merge: true });

        console.log('Match created!', swipe.userEmail, swipe.targetUserEmail);
      }
    }
  } catch (error) {
    console.error('Error recording swipe:', error);
    throw error;
  }
};

/**
 * Get user's swipe history
 */
export const getSwipeHistory = async (userEmail: string): Promise<SwipeAction[]> => {
  try {
    const swipesQuery = query(
      collection(db, Collections.SWIPES),
      where('userEmail', '==', userEmail)
    );

    const snapshot = await getDocs(swipesQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    } as SwipeAction));
  } catch (error) {
    console.error('Error fetching swipe history:', error);
    return [];
  }
};

/**
 * Check if users have mutually matched
 */
export const checkMutualMatch = async (user1Email: string, user2Email: string): Promise<boolean> => {
  try {
    const swipe1 = await getDoc(doc(db, Collections.SWIPES, `${user1Email}_${user2Email}`));
    const swipe2 = await getDoc(doc(db, Collections.SWIPES, `${user2Email}_${user1Email}`));

    return swipe1.exists() &&
           swipe2.exists() &&
           swipe1.data().action === 'like' &&
           swipe2.data().action === 'like';
  } catch (error) {
    console.error('Error checking mutual match:', error);
    return false;
  }
};

/**
 * Get all active matches for user
 */
export const getActiveMatches = async (userEmail: string): Promise<DailyMatch[]> => {
  try {
    const matchesQuery = query(
      collection(db, Collections.MATCHES),
      where('userEmail', '==', userEmail),
      where('status', '==', 'accepted')
    );

    const snapshot = await getDocs(matchesQuery);
    return snapshot.docs.map(doc => doc.data() as DailyMatch);
  } catch (error) {
    console.error('Error fetching active matches:', error);
    return [];
  }
};
