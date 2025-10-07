/**
 * Daily Scan System - TypeScript Type Definitions
 * Generated from DAILY_SCAN_SCHEMA.md
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// SCAN TYPES
// ============================================================================

export type ScanAngle = 'front' | 'back' | 'left' | 'right';

export interface AngleUrls {
  front: string;
  back: string;
  left: string;
  right: string;
}

export interface QCResult {
  poseOK: boolean;
  lightingScore: number; // 0.0 - 1.0
  sameDressScore: number; // 0.0 - 1.0
  notes: string[];
}

export interface DeltaComparison {
  bf_d1: number | null; // BF% change vs Day-1
  bf_d2: number | null; // BF% change vs Day-2
  slope_7day: number | null; // 7-day rolling average slope
  lbm_d1: number | null; // LBM change vs Day-1
  weight_d1: number | null; // Weight change vs Day-1
}

export interface InsightData {
  summary: string; // Markdown summary
  flags: ('ok' | 'warning' | 'danger')[]; // Safety flags
  version: number; // Insight version (for updates)
  generatedAt: Timestamp;
}

export interface Scan {
  id: string; // scanId: scn_YYYY-MM-DD_timestamp
  userId: string;
  date: string; // YYYY-MM-DD

  // Photos
  angleUrls: AngleUrls;

  // Measurements
  weightLb: number | null;
  bfPercent: number | null; // 0.0 - 1.0
  bfConfidence: number | null; // 0.0 - 1.0
  lbmLb: number | null; // Lean Body Mass in lbs
  waistMetric: number | null; // Normalized waist measurement

  // Quality Control
  qc: QCResult | null;

  // Comparisons
  deltas: DeltaComparison | null;
  prevScanId: string | null; // Link to previous scan
  prev2ScanId: string | null; // Link to 2-days-ago scan

  // Insights
  insight: InsightData | null;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// DAY LOG TYPES
// ============================================================================

export interface NutritionItem {
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize?: string;
}

export interface WorkoutData {
  type: string; // e.g., "upper", "lower", "cardio"
  durationMin: number;
  volumeTon: number; // Total weight lifted in tons
  cardioMin: number;
  steps: number;
  notes?: string;
}

export interface DayLog {
  id: string; // {userId}_{date}
  userId: string;
  date: string; // YYYY-MM-DD

  // Nutrition
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  items: NutritionItem[];
  hydrationL: number; // Liters
  sodiumMg: number;

  // Workout
  workout: WorkoutData | null;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// USER PRIVACY TYPES
// ============================================================================

export interface PrivacySettings {
  qrEnabled: boolean;
  slug: string; // Unique slug for QR profile URL
  allowedFields: {
    showWeek: boolean;
    showBfTrend: boolean;
    showLastInsight: boolean;
    showWeight: boolean;
    showBadges: boolean;
    showLBM: boolean;
  };
}

export interface UserProfile {
  id: string; // userId
  email: string;
  displayName: string;

  // Privacy & QR
  privacy: PrivacySettings;

  // Streak tracking
  currentStreak: number;
  bestStreak: number;
  lastScanDate: string | null; // YYYY-MM-DD

  // User context (for AI)
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  fitnessGoal: string;
  currentLevel: string;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// PUBLIC CARD TYPES
// ============================================================================

export interface PublicCardData {
  handle: string;
  weekNumber: number | null;
  bfTrend: { date: string; value: number }[] | null;
  lastInsight: string | null;
  weight: number | null;
  lbm: number | null;
  badges: string[];
}

// ============================================================================
// SCAN CREATION TYPES
// ============================================================================

export interface CreateScanInput {
  date: string;
  weightLb: number | null;
  angleUrls: AngleUrls;
}

export interface UpdateScanEstimation {
  bfPercent: number;
  bfConfidence: number;
  lbmLb: number | null;
  waistMetric: number;
}

export interface UpdateScanDeltas {
  deltas: DeltaComparison;
  prevScanId?: string;
  prev2ScanId?: string;
}
