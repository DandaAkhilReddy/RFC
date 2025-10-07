// Leaderboard Service for ReddyFit Social Competition
// Fetches and ranks users across different scopes (friends, city, country, global)

import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { getUserFriends } from './friendsService';
import { UserPoints, getLeaderboard as getPointsLeaderboard } from './pointsService';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  photoUrl?: string;
  city?: string;
  country?: string;
  points: number;
  isCurrentUser?: boolean;
}

export type LeaderboardScope = 'friends' | 'city' | 'country' | 'global' | 'group';
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'allTime';

/**
 * Get user profile data from Firestore
 */
async function getUserProfile(userId: string): Promise<any> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data();
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Get user location data
 */
async function getUserLocation(userId: string): Promise<{ city: string; country: string } | null> {
  try {
    const locationRef = doc(db, 'user_locations', userId);
    const locationDoc = await getDoc(locationRef);

    if (locationDoc.exists()) {
      const data = locationDoc.data();
      return {
        city: data.city || '',
        country: data.country || ''
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
}

/**
 * Convert UserPoints to LeaderboardEntry with profile data
 */
async function enrichLeaderboardEntry(
  userPoints: UserPoints,
  period: LeaderboardPeriod,
  currentUserId?: string
): Promise<LeaderboardEntry> {
  const profile = await getUserProfile(userPoints.userId);
  const location = await getUserLocation(userPoints.userId);

  let points = userPoints.totalPoints;
  if (period === 'weekly') points = userPoints.weeklyPoints;
  if (period === 'monthly') points = userPoints.monthlyPoints;

  return {
    rank: 0, // Will be set later
    userId: userPoints.userId,
    name: profile?.displayName || 'Anonymous',
    photoUrl: profile?.photoURL || undefined,
    city: location?.city,
    country: location?.country,
    points,
    isCurrentUser: userPoints.userId === currentUserId
  };
}

/**
 * Get Friends Leaderboard
 */
export async function getFriendsLeaderboard(
  userId: string,
  period: LeaderboardPeriod = 'weekly',
  limitCount: number = 50
): Promise<LeaderboardEntry[]> {
  try {
    // Get user's friends
    const friendIds = await getUserFriends(userId);

    if (friendIds.length === 0) {
      // No friends yet - just show current user
      const currentUserPoints = await getDoc(doc(db, 'user_points', userId));
      if (currentUserPoints.exists()) {
        const entry = await enrichLeaderboardEntry(
          currentUserPoints.data() as UserPoints,
          period,
          userId
        );
        return [{ ...entry, rank: 1 }];
      }
      return [];
    }

    // Get points for all friends + current user
    const pointsData = await getPointsLeaderboard('friends', period, userId, friendIds);

    // Enrich with profile data
    const entries = await Promise.all(
      pointsData.slice(0, limitCount).map((p) => enrichLeaderboardEntry(p, period, userId))
    );

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  } catch (error) {
    console.error('Error getting friends leaderboard:', error);
    return [];
  }
}

/**
 * Get City Leaderboard
 */
export async function getCityLeaderboard(
  userId: string,
  period: LeaderboardPeriod = 'weekly',
  limitCount: number = 50
): Promise<LeaderboardEntry[]> {
  try {
    // Get current user's city
    const userLocation = await getUserLocation(userId);
    if (!userLocation?.city) {
      console.warn('User city not found');
      return [];
    }

    // Get all users in the same city
    const locationsRef = collection(db, 'user_locations');
    const cityQuery = query(locationsRef, where('city', '==', userLocation.city));
    const citySnapshot = await getDocs(cityQuery);

    const cityUserIds: string[] = [];
    citySnapshot.forEach((doc) => {
      cityUserIds.push(doc.id);
    });

    if (cityUserIds.length === 0) {
      return [];
    }

    // Get points for all users in city
    const pointsRef = collection(db, 'user_points');
    const pointsQuery = query(pointsRef, where('userId', 'in', cityUserIds.slice(0, 30))); // Firestore limit
    const pointsSnapshot = await getDocs(pointsQuery);

    const pointsData: UserPoints[] = [];
    pointsSnapshot.forEach((doc) => {
      pointsData.push(doc.data() as UserPoints);
    });

    // Sort by period
    pointsData.sort((a, b) => {
      if (period === 'weekly') return b.weeklyPoints - a.weeklyPoints;
      if (period === 'monthly') return b.monthlyPoints - a.monthlyPoints;
      return b.totalPoints - a.totalPoints;
    });

    // Enrich with profile data
    const entries = await Promise.all(
      pointsData.slice(0, limitCount).map((p) => enrichLeaderboardEntry(p, period, userId))
    );

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  } catch (error) {
    console.error('Error getting city leaderboard:', error);
    return [];
  }
}

/**
 * Get Country Leaderboard
 */
export async function getCountryLeaderboard(
  userId: string,
  period: LeaderboardPeriod = 'weekly',
  limitCount: number = 50
): Promise<LeaderboardEntry[]> {
  try {
    // Get current user's country
    const userLocation = await getUserLocation(userId);
    if (!userLocation?.country) {
      console.warn('User country not found');
      return [];
    }

    // Get all users in the same country
    const locationsRef = collection(db, 'user_locations');
    const countryQuery = query(locationsRef, where('country', '==', userLocation.country));
    const countrySnapshot = await getDocs(countryQuery);

    const countryUserIds: string[] = [];
    countrySnapshot.forEach((doc) => {
      countryUserIds.push(doc.id);
    });

    if (countryUserIds.length === 0) {
      return [];
    }

    // Get points for users in country (batch in chunks of 30 due to Firestore 'in' limit)
    const pointsData: UserPoints[] = [];
    for (let i = 0; i < countryUserIds.length; i += 30) {
      const batch = countryUserIds.slice(i, i + 30);
      const pointsRef = collection(db, 'user_points');
      const pointsQuery = query(pointsRef, where('userId', 'in', batch));
      const pointsSnapshot = await getDocs(pointsQuery);

      pointsSnapshot.forEach((doc) => {
        pointsData.push(doc.data() as UserPoints);
      });
    }

    // Sort by period
    pointsData.sort((a, b) => {
      if (period === 'weekly') return b.weeklyPoints - a.weeklyPoints;
      if (period === 'monthly') return b.monthlyPoints - a.monthlyPoints;
      return b.totalPoints - a.totalPoints;
    });

    // Enrich with profile data
    const entries = await Promise.all(
      pointsData.slice(0, limitCount).map((p) => enrichLeaderboardEntry(p, period, userId))
    );

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  } catch (error) {
    console.error('Error getting country leaderboard:', error);
    return [];
  }
}

/**
 * Get Global Leaderboard
 */
export async function getGlobalLeaderboard(
  userId: string,
  period: LeaderboardPeriod = 'weekly',
  limitCount: number = 100
): Promise<LeaderboardEntry[]> {
  try {
    // Get all user points
    const pointsData = await getPointsLeaderboard('global', period);

    // Enrich with profile data
    const entries = await Promise.all(
      pointsData.slice(0, limitCount).map((p) => enrichLeaderboardEntry(p, period, userId))
    );

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  } catch (error) {
    console.error('Error getting global leaderboard:', error);
    return [];
  }
}

/**
 * Get leaderboard by scope
 */
export async function getLeaderboardByScope(
  scope: LeaderboardScope,
  userId: string,
  period: LeaderboardPeriod = 'weekly',
  limitCount: number = 50
): Promise<LeaderboardEntry[]> {
  switch (scope) {
    case 'friends':
      return getFriendsLeaderboard(userId, period, limitCount);
    case 'city':
      return getCityLeaderboard(userId, period, limitCount);
    case 'country':
      return getCountryLeaderboard(userId, period, limitCount);
    case 'global':
      return getGlobalLeaderboard(userId, period, limitCount);
    default:
      return getGlobalLeaderboard(userId, period, limitCount);
  }
}

/**
 * Get user's rank in a specific scope
 */
export async function getUserRank(
  userId: string,
  scope: LeaderboardScope,
  period: LeaderboardPeriod = 'weekly'
): Promise<{ rank: number; total: number; points: number } | null> {
  try {
    const leaderboard = await getLeaderboardByScope(scope, userId, period, 1000);
    const userEntry = leaderboard.find((entry) => entry.userId === userId);

    if (userEntry) {
      return {
        rank: userEntry.rank,
        total: leaderboard.length,
        points: userEntry.points
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
}
