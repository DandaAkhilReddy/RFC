// Points Calculation Service for ReddyFit Social Competition
// Calculates and tracks user points from fitness activities

import { doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Point values for different activities
export const POINTS = {
  DAILY_WORKOUT: 50,
  MEAL_LOGGED: 30,
  PROGRESS_PHOTO: 40,
  DAILY_STREAK: 20,
  GOAL_HIT: 100,
  WEIGHT_MILESTONE: 200,
  FRIEND_INVITE: 50,
  CHALLENGE_COMPLETE: 150,
  WEEK_STREAK: 100,
  MONTH_STREAK: 500
};

export interface UserPoints {
  userId: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastUpdated: string;
  // Breakdown
  workoutPoints: number;
  mealPoints: number;
  streakPoints: number;
  goalPoints: number;
  socialPoints: number;
}

export interface PointsTransaction {
  userId: string;
  points: number;
  reason: string;
  category: 'workout' | 'meal' | 'streak' | 'goal' | 'social';
  timestamp: string;
  period: string; // e.g., "2025-W01" for week 1, "2025-01" for January
}

/**
 * Get current week identifier (e.g., "2025-W01")
 */
function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Get current month identifier (e.g., "2025-01")
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * Award points to a user
 */
export async function awardPoints(
  userId: string,
  points: number,
  reason: string,
  category: PointsTransaction['category']
): Promise<void> {
  try {
    const pointsRef = doc(db, 'user_points', userId);
    const pointsDoc = await getDoc(pointsRef);

    const currentWeek = getCurrentWeek();
    const currentMonth = getCurrentMonth();
    const now = new Date().toISOString();

    if (pointsDoc.exists()) {
      const data = pointsDoc.data() as UserPoints;

      // Reset weekly points if new week
      const weeklyPoints = data.lastUpdated.startsWith(currentWeek.split('-W')[0])
        ? data.weeklyPoints + points
        : points;

      // Reset monthly points if new month
      const monthlyPoints = data.lastUpdated.startsWith(currentMonth.split('-')[0] + '-' + currentMonth.split('-')[1])
        ? data.monthlyPoints + points
        : points;

      // Update points
      await updateDoc(pointsRef, {
        totalPoints: increment(points),
        weeklyPoints,
        monthlyPoints,
        lastUpdated: now,
        [`${category}Points`]: increment(points)
      });
    } else {
      // Create new points record
      await setDoc(pointsRef, {
        userId,
        totalPoints: points,
        weeklyPoints: points,
        monthlyPoints: points,
        lastUpdated: now,
        workoutPoints: category === 'workout' ? points : 0,
        mealPoints: category === 'meal' ? points : 0,
        streakPoints: category === 'streak' ? points : 0,
        goalPoints: category === 'goal' ? points : 0,
        socialPoints: category === 'social' ? points : 0
      });
    }

    // Log transaction
    const transactionRef = doc(collection(db, 'points_transactions'));
    await setDoc(transactionRef, {
      userId,
      points,
      reason,
      category,
      timestamp: now,
      period: currentWeek
    });

    console.log(`✅ Awarded ${points} points to ${userId}: ${reason}`);
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

/**
 * Get user's total points
 */
export async function getUserPoints(userId: string): Promise<UserPoints | null> {
  try {
    const pointsRef = doc(db, 'user_points', userId);
    const pointsDoc = await getDoc(pointsRef);

    if (pointsDoc.exists()) {
      return pointsDoc.data() as UserPoints;
    }

    return null;
  } catch (error) {
    console.error('Error getting user points:', error);
    return null;
  }
}

/**
 * Calculate and award points for a workout
 */
export async function awardWorkoutPoints(userId: string, caloriesBurned: number): Promise<void> {
  let points = POINTS.DAILY_WORKOUT;

  // Bonus points for high-calorie workouts
  if (caloriesBurned >= 500) points += 25;
  if (caloriesBurned >= 1000) points += 50;

  await awardPoints(userId, points, `Workout completed (${caloriesBurned} calories)`, 'workout');
}

/**
 * Calculate and award points for a meal log
 */
export async function awardMealPoints(userId: string, withPhoto: boolean = false): Promise<void> {
  let points = POINTS.MEAL_LOGGED;

  // Bonus for photo
  if (withPhoto) points += 20;

  await awardPoints(userId, points, withPhoto ? 'Meal logged with photo' : 'Meal logged', 'meal');
}

/**
 * Award points for maintaining a daily streak
 */
export async function awardStreakPoints(userId: string, streakDays: number): Promise<void> {
  let points = POINTS.DAILY_STREAK;

  // Bonus for milestone streaks
  if (streakDays === 7) points = POINTS.WEEK_STREAK;
  if (streakDays === 30) points = POINTS.MONTH_STREAK;
  if (streakDays % 7 === 0 && streakDays > 7) points += 50;

  await awardPoints(userId, points, `${streakDays} day streak maintained`, 'streak');
}

/**
 * Award points for hitting daily goals
 */
export async function awardGoalPoints(userId: string, goalType: string): Promise<void> {
  await awardPoints(userId, POINTS.GOAL_HIT, `Hit ${goalType} goal`, 'goal');
}

/**
 * Award points for weight loss milestone
 */
export async function awardWeightMilestonePoints(userId: string, weightLost: number): Promise<void> {
  let points = POINTS.WEIGHT_MILESTONE;

  // Bonus for significant weight loss
  if (weightLost >= 10) points += 100;
  if (weightLost >= 20) points += 200;

  await awardPoints(userId, points, `Lost ${weightLost}kg milestone`, 'goal');
}

/**
 * Award points for social actions (inviting friends, etc.)
 */
export async function awardSocialPoints(userId: string, action: string): Promise<void> {
  const points = POINTS.FRIEND_INVITE;
  await awardPoints(userId, points, action, 'social');
}

/**
 * Get points leaderboard for a specific scope
 */
export async function getLeaderboard(
  scope: 'global' | 'friends',
  period: 'weekly' | 'monthly' | 'allTime',
  userId?: string,
  friendIds?: string[]
): Promise<UserPoints[]> {
  try {
    const pointsRef = collection(db, 'user_points');
    let pointsQuery;

    // Filter by scope
    if (scope === 'friends' && friendIds && friendIds.length > 0) {
      // Only include user's friends
      pointsQuery = query(pointsRef, where('userId', 'in', [...friendIds, userId || '']));
    } else {
      // Global leaderboard - no filter
      pointsQuery = query(pointsRef);
    }

    const snapshot = await getDocs(pointsQuery);
    const users: UserPoints[] = [];

    snapshot.forEach((doc) => {
      users.push(doc.data() as UserPoints);
    });

    // Sort by appropriate period
    if (period === 'weekly') {
      users.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    } else if (period === 'monthly') {
      users.sort((a, b) => b.monthlyPoints - a.monthlyPoints);
    } else {
      users.sort((a, b) => b.totalPoints - a.totalPoints);
    }

    return users;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
