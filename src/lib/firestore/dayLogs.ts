/**
 * Firestore Helper Functions - Day Logs Collection
 * Handles daily nutrition and workout tracking
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { DayLog, NutritionItem, WorkoutData } from '../../types/scan';

const DAYLOGS_COLLECTION = 'dayLogs';

/**
 * Generate day log ID
 */
function generateDayLogId(userId: string, date: string): string {
  return `${userId}_${date}`;
}

/**
 * Create or update day log
 */
export async function upsertDayLog(
  userId: string,
  date: string,
  logData: Partial<Omit<DayLog, 'id' | 'userId' | 'date' | 'createdAt' | 'updatedAt'>>
): Promise<string> {
  const logId = generateDayLogId(userId, date);
  const logRef = doc(db, DAYLOGS_COLLECTION, logId);

  // Check if exists
  const existing = await getDoc(logRef);

  if (existing.exists()) {
    // Update
    await updateDoc(logRef, {
      ...logData,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create
    await setDoc(logRef, {
      id: logId,
      userId,
      date,
      kcal: logData.kcal || 0,
      proteinG: logData.proteinG || 0,
      carbsG: logData.carbsG || 0,
      fatG: logData.fatG || 0,
      items: logData.items || [],
      hydrationL: logData.hydrationL || 0,
      sodiumMg: logData.sodiumMg || 0,
      workout: logData.workout || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return logId;
}

/**
 * Get day log for a specific date
 */
export async function getDayLog(userId: string, date: string): Promise<DayLog | null> {
  const logId = generateDayLogId(userId, date);
  const logRef = doc(db, DAYLOGS_COLLECTION, logId);
  const logSnap = await getDoc(logRef);

  if (!logSnap.exists()) {
    return null;
  }

  return { id: logSnap.id, ...logSnap.data() } as DayLog;
}

/**
 * Add nutrition item to day log
 */
export async function addNutritionItem(
  userId: string,
  date: string,
  item: NutritionItem
): Promise<void> {
  const logId = generateDayLogId(userId, date);
  const logRef = doc(db, DAYLOGS_COLLECTION, logId);

  // Get current log
  const current = await getDayLog(userId, date);

  if (current) {
    // Update existing
    const newItems = [...current.items, item];
    const newKcal = current.kcal + item.kcal;
    const newProtein = current.proteinG + item.proteinG;
    const newCarbs = current.carbsG + item.carbsG;
    const newFat = current.fatG + item.fatG;

    await updateDoc(logRef, {
      items: newItems,
      kcal: newKcal,
      proteinG: newProtein,
      carbsG: newCarbs,
      fatG: newFat,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create new log with this item
    await setDoc(logRef, {
      id: logId,
      userId,
      date,
      kcal: item.kcal,
      proteinG: item.proteinG,
      carbsG: item.carbsG,
      fatG: item.fatG,
      items: [item],
      hydrationL: 0,
      sodiumMg: 0,
      workout: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Update workout for a day
 */
export async function updateWorkout(
  userId: string,
  date: string,
  workout: WorkoutData
): Promise<void> {
  await upsertDayLog(userId, date, { workout });
}

/**
 * Update hydration
 */
export async function updateHydration(
  userId: string,
  date: string,
  hydrationL: number
): Promise<void> {
  await upsertDayLog(userId, date, { hydrationL });
}

/**
 * Get recent day logs (for trends)
 */
export async function getRecentDayLogs(
  userId: string,
  days: number = 7
): Promise<DayLog[]> {
  const logsRef = collection(db, DAYLOGS_COLLECTION);
  const q = query(
    logsRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(days)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DayLog));
}

/**
 * Get average macros for a date range
 */
export async function getAverageMacros(
  userId: string,
  days: number = 7
): Promise<{
  avgKcal: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
}> {
  const logs = await getRecentDayLogs(userId, days);

  if (logs.length === 0) {
    return { avgKcal: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 };
  }

  const totalKcal = logs.reduce((sum, log) => sum + log.kcal, 0);
  const totalProtein = logs.reduce((sum, log) => sum + log.proteinG, 0);
  const totalCarbs = logs.reduce((sum, log) => sum + log.carbsG, 0);
  const totalFat = logs.reduce((sum, log) => sum + log.fatG, 0);

  return {
    avgKcal: totalKcal / logs.length,
    avgProtein: totalProtein / logs.length,
    avgCarbs: totalCarbs / logs.length,
    avgFat: totalFat / logs.length,
  };
}

/**
 * Get total workout volume for a date range
 */
export async function getTotalWorkoutVolume(
  userId: string,
  days: number = 7
): Promise<{
  totalVolumeTon: number;
  totalCardioMin: number;
  totalSteps: number;
  workoutDays: number;
}> {
  const logs = await getRecentDayLogs(userId, days);

  let totalVolumeTon = 0;
  let totalCardioMin = 0;
  let totalSteps = 0;
  let workoutDays = 0;

  logs.forEach(log => {
    if (log.workout) {
      totalVolumeTon += log.workout.volumeTon;
      totalCardioMin += log.workout.cardioMin;
      totalSteps += log.workout.steps;
      workoutDays++;
    }
  });

  return {
    totalVolumeTon,
    totalCardioMin,
    totalSteps,
    workoutDays,
  };
}

/**
 * Delete day log
 */
export async function deleteDayLog(userId: string, date: string): Promise<void> {
  const logId = generateDayLogId(userId, date);
  const logRef = doc(db, DAYLOGS_COLLECTION, logId);
  await updateDoc(logRef, {
    kcal: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    items: [],
    hydrationL: 0,
    sodiumMg: 0,
    workout: null,
    updatedAt: serverTimestamp(),
  });
}
