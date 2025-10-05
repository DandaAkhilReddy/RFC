// Gamification System - Points, Badges, and Rewards
// Based on Agent Rabbit Blueprint Section 5

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface PointsActivity {
  action: string;
  points: number;
  timestamp: Date;
}

// Points awarded for different actions
export const POINTS_SYSTEM = {
  COMPLETE_WORKOUT: 100,
  HIT_CALORIE_GOAL: 50,
  HIT_HYDRATION_GOAL: 25,
  LOG_WEIGHT: 10,
  STREAK_7_DAYS: 500,
  STREAK_30_DAYS: 2000,
  STREAK_93_DAYS: 10000,
  WEEKLY_MILESTONE: 250,
  PHOTO_UPLOAD: 20,
  CONSISTENCY_BONUS: 100, // For logging all daily data
};

// Badge definitions
export const BADGES: Record<string, Badge> = {
  FIRST_WORKOUT: {
    id: 'first_workout',
    name: 'First Step',
    description: 'Complete your first workout',
    icon: '🏃',
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7-day workout streak',
    icon: '🔥',
  },
  MONTH_MASTER: {
    id: 'month_master',
    name: 'Month Master',
    description: '30-day workout streak',
    icon: '💪',
  },
  TRANSFORMATION_COMPLETE: {
    id: 'transformation_complete',
    name: '93-Day Transformer',
    description: 'Complete the 93-day challenge',
    icon: '👑',
  },
  CALORIE_CRUSHER: {
    id: 'calorie_crusher',
    name: 'Calorie Crusher',
    description: 'Hit calorie goal 7 days in a row',
    icon: '🎯',
  },
  HYDRATION_HERO: {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    description: 'Hit water goal 7 days in a row',
    icon: '💧',
  },
  POINTS_ROOKIE: {
    id: 'points_rookie',
    name: 'Points Rookie',
    description: 'Earn 1,000 points',
    icon: '🌟',
  },
  POINTS_PRO: {
    id: 'points_pro',
    name: 'Points Pro',
    description: 'Earn 5,000 points',
    icon: '⭐',
  },
  POINTS_LEGEND: {
    id: 'points_legend',
    name: 'Points Legend',
    description: 'Earn 10,000 points',
    icon: '🏆',
  },
};

// Calculate points earned for today's activities
export function calculateDailyPoints(data: {
  workoutsCompleted: number;
  caloriesAte: number;
  calorieGoal: number;
  waterCups: number;
  waterGoal: number;
  weightLogged: boolean;
  photoUploaded: boolean;
  allDataLogged: boolean;
}): { points: number; breakdown: PointsActivity[] } {
  const breakdown: PointsActivity[] = [];
  let totalPoints = 0;

  // Workout completion
  if (data.workoutsCompleted > 0) {
    const points = POINTS_SYSTEM.COMPLETE_WORKOUT * data.workoutsCompleted;
    totalPoints += points;
    breakdown.push({
      action: `Complete ${data.workoutsCompleted} workout(s)`,
      points,
      timestamp: new Date(),
    });
  }

  // Calorie goal
  if (data.caloriesAte > 0 && data.caloriesAte <= data.calorieGoal) {
    totalPoints += POINTS_SYSTEM.HIT_CALORIE_GOAL;
    breakdown.push({
      action: 'Hit calorie goal',
      points: POINTS_SYSTEM.HIT_CALORIE_GOAL,
      timestamp: new Date(),
    });
  }

  // Hydration goal
  if (data.waterCups >= data.waterGoal) {
    totalPoints += POINTS_SYSTEM.HIT_HYDRATION_GOAL;
    breakdown.push({
      action: 'Hit hydration goal',
      points: POINTS_SYSTEM.HIT_HYDRATION_GOAL,
      timestamp: new Date(),
    });
  }

  // Weight logged
  if (data.weightLogged) {
    totalPoints += POINTS_SYSTEM.LOG_WEIGHT;
    breakdown.push({
      action: 'Log weight',
      points: POINTS_SYSTEM.LOG_WEIGHT,
      timestamp: new Date(),
    });
  }

  // Photo uploaded
  if (data.photoUploaded) {
    totalPoints += POINTS_SYSTEM.PHOTO_UPLOAD;
    breakdown.push({
      action: 'Upload progress photo',
      points: POINTS_SYSTEM.PHOTO_UPLOAD,
      timestamp: new Date(),
    });
  }

  // Consistency bonus - logged all data
  if (data.allDataLogged) {
    totalPoints += POINTS_SYSTEM.CONSISTENCY_BONUS;
    breakdown.push({
      action: 'Consistency bonus (all data logged)',
      points: POINTS_SYSTEM.CONSISTENCY_BONUS,
      timestamp: new Date(),
    });
  }

  return { points: totalPoints, breakdown };
}

// Check which badges should be unlocked
export function checkBadgeUnlocks(userData: {
  totalPoints: number;
  workoutStreak: number;
  calorieStreakDays: number;
  hydrationStreakDays: number;
  totalWorkouts: number;
  currentBadges: string[];
}): Badge[] {
  const newBadges: Badge[] = [];

  // Check each badge condition
  if (!userData.currentBadges.includes('first_workout') && userData.totalWorkouts >= 1) {
    newBadges.push(BADGES.FIRST_WORKOUT);
  }

  if (!userData.currentBadges.includes('week_warrior') && userData.workoutStreak >= 7) {
    newBadges.push(BADGES.WEEK_WARRIOR);
  }

  if (!userData.currentBadges.includes('month_master') && userData.workoutStreak >= 30) {
    newBadges.push(BADGES.MONTH_MASTER);
  }

  if (!userData.currentBadges.includes('transformation_complete') && userData.workoutStreak >= 93) {
    newBadges.push(BADGES.TRANSFORMATION_COMPLETE);
  }

  if (!userData.currentBadges.includes('calorie_crusher') && userData.calorieStreakDays >= 7) {
    newBadges.push(BADGES.CALORIE_CRUSHER);
  }

  if (!userData.currentBadges.includes('hydration_hero') && userData.hydrationStreakDays >= 7) {
    newBadges.push(BADGES.HYDRATION_HERO);
  }

  if (!userData.currentBadges.includes('points_rookie') && userData.totalPoints >= 1000) {
    newBadges.push(BADGES.POINTS_ROOKIE);
  }

  if (!userData.currentBadges.includes('points_pro') && userData.totalPoints >= 5000) {
    newBadges.push(BADGES.POINTS_PRO);
  }

  if (!userData.currentBadges.includes('points_legend') && userData.totalPoints >= 10000) {
    newBadges.push(BADGES.POINTS_LEGEND);
  }

  return newBadges;
}

// Generate motivational messages based on progress
export function getMotivationalMessage(data: {
  caloriesRemaining: number;
  daysIntoChallenge: number;
  targetDays: number;
  workoutStreak: number;
  bodyFatProgress: number; // percentage decrease
}): string {
  const messages: string[] = [];

  // Calorie-based motivation
  if (data.caloriesRemaining > 0 && data.caloriesRemaining < 500) {
    messages.push(`💪 You're only ${data.caloriesRemaining} calories away from your goal!`);
  }

  // Days ahead/behind target
  const expectedProgress = (data.daysIntoChallenge / data.targetDays) * 100;
  if (data.bodyFatProgress > expectedProgress) {
    const daysAhead = Math.round(((data.bodyFatProgress - expectedProgress) / 100) * data.targetDays);
    messages.push(`🚀 You're ${daysAhead} days ahead of target pace!`);
  }

  // Streak-based motivation
  if (data.workoutStreak === 7) {
    messages.push(`🔥 7-day streak! You're building unstoppable momentum!`);
  } else if (data.workoutStreak === 30) {
    messages.push(`👑 30-day streak! You're a transformation machine!`);
  } else if (data.workoutStreak >= 3 && data.workoutStreak < 7) {
    messages.push(`🔥 ${data.workoutStreak}-day streak! Keep going for 7-day badge!`);
  }

  // Progress-based motivation
  if (data.bodyFatProgress > 0) {
    messages.push(`📉 ${data.bodyFatProgress.toFixed(1)}% body fat down - Amazing progress!`);
  }

  // Days remaining
  const daysRemaining = data.targetDays - data.daysIntoChallenge;
  if (daysRemaining <= 30 && daysRemaining > 0) {
    messages.push(`⏱️ ${daysRemaining} days to visible abs - The finish line is near!`);
  }

  return messages.length > 0 ? messages[Math.floor(Math.random() * messages.length)] : '💪 Keep crushing it!';
}

// Unlock rewards at point thresholds
export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  icon: string;
}

export const REWARDS: Reward[] = [
  {
    id: 'custom_theme',
    name: 'Custom App Theme',
    description: 'Unlock custom color themes',
    pointsRequired: 5000,
    icon: '🎨',
  },
  {
    id: 'pro_video',
    name: 'Pro Training Video',
    description: 'Access premium workout tutorials',
    pointsRequired: 7500,
    icon: '🎬',
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed progress charts and insights',
    pointsRequired: 10000,
    icon: '📊',
  },
];

export function getAvailableRewards(totalPoints: number, unlockedRewards: string[]): Reward[] {
  return REWARDS.filter(reward =>
    totalPoints >= reward.pointsRequired && !unlockedRewards.includes(reward.id)
  );
}
