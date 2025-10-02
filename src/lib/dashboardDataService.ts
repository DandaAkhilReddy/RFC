// Dashboard Data Service - Auto-populate data from AI conversations
import { db, Collections } from './firebase';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';

export interface DashboardUpdate {
  userId: string;
  calories?: number;
  workouts?: number;
  weight?: number;
  waterIntake?: number;
}

/**
 * Update user's current calorie count for the day
 */
export async function updateCalories(userId: string, calories: number) {
  try {
    await setDoc(doc(db, Collections.USERS, userId), {
      currentCalories: calories,
      lastCalorieUpdate: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating calories:', error);
    return false;
  }
}

/**
 * Add calories to current count
 */
export async function addCalories(userId: string, calories: number) {
  try {
    const userRef = doc(db, Collections.USERS, userId);
    await updateDoc(userRef, {
      currentCalories: increment(calories),
      lastCalorieUpdate: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error adding calories:', error);
    return false;
  }
}

/**
 * Update user's workout count for the week
 */
export async function updateWorkouts(userId: string, workouts: number) {
  try {
    await setDoc(doc(db, Collections.USERS, userId), {
      currentWorkouts: workouts,
      lastWorkoutUpdate: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating workouts:', error);
    return false;
  }
}

/**
 * Increment workout count (when user completes a workout)
 */
export async function incrementWorkouts(userId: string) {
  try {
    const userRef = doc(db, Collections.USERS, userId);
    await updateDoc(userRef, {
      currentWorkouts: increment(1),
      lastWorkoutUpdate: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error incrementing workouts:', error);
    return false;
  }
}

/**
 * Update user's current weight
 */
export async function updateWeight(userId: string, weight: number) {
  try {
    await setDoc(doc(db, Collections.USERS, userId), {
      weight: weight,
      lastWeightUpdate: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating weight:', error);
    return false;
  }
}

/**
 * Parse AI message for data updates
 * This function extracts numerical data from AI conversations
 */
export function parseAIMessageForData(message: string): {
  calories?: number;
  workouts?: number;
  weight?: number;
} | null {
  const data: any = {};

  // Parse calories (e.g., "I ate 500 calories", "consumed 1200 kcal")
  const calorieMatch = message.match(/(\d+)\s*(calories|kcal|cal)/i);
  if (calorieMatch) {
    data.calories = parseInt(calorieMatch[1]);
  }

  // Parse workouts (e.g., "completed 3 workouts", "did 2 sessions")
  const workoutMatch = message.match(/(\d+)\s*(workout|workouts|session|sessions|exercise)/i);
  if (workoutMatch) {
    data.workouts = parseInt(workoutMatch[1]);
  }

  // Parse weight (e.g., "I weigh 75kg", "my weight is 80 kg")
  const weightMatch = message.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (weightMatch) {
    data.weight = parseFloat(weightMatch[1]);
  }

  return Object.keys(data).length > 0 ? data : null;
}

/**
 * Auto-update dashboard from AI conversation
 * Call this after user sends a message to Reddy AI
 */
export async function autoUpdateFromConversation(
  userId: string,
  userMessage: string,
  aiResponse: string
) {
  try {
    // Parse both user message and AI response
    const userData = parseAIMessageForData(userMessage);
    const aiData = parseAIMessageForData(aiResponse);

    // Combine data
    const combinedData = { ...userData, ...aiData };

    // Update dashboard
    if (combinedData.calories) {
      await addCalories(userId, combinedData.calories);
    }

    if (combinedData.workouts) {
      await updateWorkouts(userId, combinedData.workouts);
    }

    if (combinedData.weight) {
      await updateWeight(userId, combinedData.weight);
    }

    return combinedData;
  } catch (error) {
    console.error('Error auto-updating dashboard:', error);
    return null;
  }
}

/**
 * Reset daily/weekly counters
 */
export async function resetDailyCalories(userId: string) {
  try {
    await setDoc(doc(db, Collections.USERS, userId), {
      currentCalories: 0,
      lastCalorieReset: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error resetting calories:', error);
    return false;
  }
}

export async function resetWeeklyWorkouts(userId: string) {
  try {
    await setDoc(doc(db, Collections.USERS, userId), {
      currentWorkouts: 0,
      lastWorkoutReset: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error resetting workouts:', error);
    return false;
  }
}
