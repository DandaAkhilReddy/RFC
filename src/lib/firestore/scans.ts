/**
 * Firestore Helper Functions - Scans Collection
 * Clean API for all scan-related database operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Scan,
  CreateScanInput,
  UpdateScanEstimation,
  DeltaComparison,
  InsightData,
  QCResult,
} from '../../types/scan';

const SCANS_COLLECTION = 'scans';

/**
 * Create a new scan document
 */
export async function createScan(
  userId: string,
  scanData: CreateScanInput
): Promise<string> {
  const scanId = `scn_${scanData.date}_${Date.now()}`;
  const scanRef = doc(db, SCANS_COLLECTION, scanId);

  await setDoc(scanRef, {
    id: scanId,
    userId,
    date: scanData.date,
    angleUrls: scanData.angleUrls,
    weightLb: scanData.weightLb,

    // Initialize null fields
    bfPercent: null,
    bfConfidence: null,
    lbmLb: null,
    waistMetric: null,
    qc: null,
    deltas: null,
    insight: null,
    prevScanId: null,
    prev2ScanId: null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return scanId;
}

/**
 * Get scan by ID
 */
export async function getScan(scanId: string): Promise<Scan | null> {
  const scanRef = doc(db, SCANS_COLLECTION, scanId);
  const scanSnap = await getDoc(scanRef);

  if (!scanSnap.exists()) {
    return null;
  }

  return { id: scanSnap.id, ...scanSnap.data() } as Scan;
}

/**
 * Get user's scans for a specific date
 */
export async function getScansForDate(userId: string, date: string): Promise<Scan[]> {
  const scansRef = collection(db, SCANS_COLLECTION);
  const q = query(
    scansRef,
    where('userId', '==', userId),
    where('date', '==', date),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scan));
}

/**
 * Get previous scans for delta comparison (last 2 scans before given date)
 */
export async function getPreviousScans(
  userId: string,
  beforeDate: string,
  limitCount: number = 2
): Promise<Scan[]> {
  const scansRef = collection(db, SCANS_COLLECTION);
  const q = query(
    scansRef,
    where('userId', '==', userId),
    where('date', '<', beforeDate),
    orderBy('date', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scan));
}

/**
 * Update scan with body fat estimation results
 */
export async function updateScanWithEstimation(
  scanId: string,
  estimation: UpdateScanEstimation
): Promise<void> {
  const scanRef = doc(db, SCANS_COLLECTION, scanId);
  await updateDoc(scanRef, {
    bfPercent: estimation.bfPercent,
    bfConfidence: estimation.bfConfidence,
    lbmLb: estimation.lbmLb,
    waistMetric: estimation.waistMetric,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update scan with delta comparison results
 */
export async function updateScanWithDeltas(
  scanId: string,
  deltas: DeltaComparison,
  prevScanId?: string,
  prev2ScanId?: string
): Promise<void> {
  const scanRef = doc(db, SCANS_COLLECTION, scanId);
  await updateDoc(scanRef, {
    deltas,
    prevScanId: prevScanId || null,
    prev2ScanId: prev2ScanId || null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update scan with insight
 */
export async function updateScanWithInsight(
  scanId: string,
  insight: Omit<InsightData, 'generatedAt'>
): Promise<void> {
  const scanRef = doc(db, SCANS_COLLECTION, scanId);
  await updateDoc(scanRef, {
    insight: {
      ...insight,
      generatedAt: Timestamp.now(),
    },
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update scan with QC results
 */
export async function updateScanWithQC(
  scanId: string,
  qc: QCResult
): Promise<void> {
  const scanRef = doc(db, SCANS_COLLECTION, scanId);
  await updateDoc(scanRef, {
    qc,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get user's scan history (last N scans)
 */
export async function getScanHistory(
  userId: string,
  limitCount: number = 30
): Promise<Scan[]> {
  const scansRef = collection(db, SCANS_COLLECTION);
  const q = query(
    scansRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scan));
}

/**
 * Calculate streak days (consecutive daily scans)
 */
export async function calculateStreak(userId: string): Promise<{
  currentStreak: number;
  bestStreak: number;
}> {
  const scans = await getScanHistory(userId, 90); // Last 90 days

  if (scans.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Sort by date descending
  const sortedDates = scans
    .map(s => s.date)
    .sort((a, b) => b.localeCompare(a));

  let currentStreak = 1;
  let bestStreak = 1;
  let tempStreak = 1;

  const today = new Date().toISOString().split('T')[0];

  // Check if there's a scan today or yesterday (grace period)
  const latestScan = sortedDates[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (latestScan !== today && latestScan !== yesterday) {
    currentStreak = 0;
  }

  // Calculate streaks
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    const diffDays = Math.floor((current.getTime() - next.getTime()) / 86400000);

    if (diffDays === 1) {
      tempStreak++;
      if (i === 0) currentStreak = tempStreak;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, bestStreak };
}

/**
 * Get trend data for charts (BF% and LBM over time)
 */
export async function getTrendData(
  userId: string,
  days: number = 30
): Promise<{
  dates: string[];
  bfPercents: (number | null)[];
  lbms: (number | null)[];
  weights: (number | null)[];
}> {
  const scans = await getScanHistory(userId, days);

  // Sort by date ascending for charts
  const sorted = scans.sort((a, b) => a.date.localeCompare(b.date));

  return {
    dates: sorted.map(s => s.date),
    bfPercents: sorted.map(s => s.bfPercent),
    lbms: sorted.map(s => s.lbmLb),
    weights: sorted.map(s => s.weightLb),
  };
}

/**
 * Get latest scan for a user
 */
export async function getLatestScan(userId: string): Promise<Scan | null> {
  const scans = await getScanHistory(userId, 1);
  return scans[0] || null;
}

/**
 * Check if user has scanned today
 */
export async function hasScannedToday(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const todayScans = await getScansForDate(userId, today);
  return todayScans.length > 0;
}
