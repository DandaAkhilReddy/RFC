/**
 * Temporal Activities for Daily Scan 7-Agent Architecture
 *
 * These activities orchestrate the complete daily scan processing:
 * 1. ScanStore - Photo storage and validation
 * 2. VisionQC - Quality control (pose, lighting, same-dress)
 * 3. BFEstimator - Body fat estimation using Gemini AI
 * 4. MetaBinder - Attach nutrition/workout context
 * 5. DeltaComparator - Day-over-day analysis
 * 6. InsightWriter - Generate markdown insights
 * 7. PrivacyPublisher - Update dashboard and QR profile
 */

import {
  getScan,
  getPreviousScans,
  updateScanWithEstimation,
  updateScanWithDeltas,
  updateScanWithInsight,
  updateScanWithQC,
} from '../../lib/firestore/scans';
import { getDayLog } from '../../lib/firestore/dayLogs';
import { getUserProfile } from '../../lib/firestore/users';
import { analyzeBodyCompositionWithGemini } from '../../lib/geminiService';
import type {
  Scan,
  QCResult,
  DeltaComparison,
  InsightData,
  AngleUrls,
} from '../../types/scan';

// ============================================================================
// AGENT 1: SCANSTORE - Photo Storage & Validation
// ============================================================================

export interface ScanStoreInput {
  scanId: string;
  userId: string;
}

export interface ScanStoreOutput {
  scanId: string;
  angleUrls: AngleUrls;
  valid: boolean;
  errors: string[];
}

/**
 * Agent 1: ScanStore
 * Validates that all 4 photos are uploaded and accessible
 */
export async function scanStoreActivity(input: ScanStoreInput): Promise<ScanStoreOutput> {
  const { scanId, userId } = input;

  console.log(`[ScanStore] Validating scan: ${scanId}`);

  try {
    const scan = await getScan(scanId);
    if (!scan) {
      throw new Error(`Scan not found: ${scanId}`);
    }

    if (scan.userId !== userId) {
      throw new Error('Unauthorized access');
    }

    const errors: string[] = [];
    const requiredAngles: (keyof AngleUrls)[] = ['front', 'back', 'left', 'right'];

    // Check all angles are present
    for (const angle of requiredAngles) {
      if (!scan.angleUrls[angle]) {
        errors.push(`Missing ${angle} photo`);
      }
    }

    const valid = errors.length === 0;

    console.log(`[ScanStore] Validation ${valid ? 'passed' : 'failed'}. Errors:`, errors);

    return {
      scanId,
      angleUrls: scan.angleUrls,
      valid,
      errors,
    };
  } catch (error) {
    console.error('[ScanStore] Error:', error);
    throw error;
  }
}

// ============================================================================
// AGENT 2: VISIONQC - Quality Control
// ============================================================================

export interface VisionQCInput {
  scanId: string;
  angleUrls: AngleUrls;
}

export interface VisionQCOutput {
  scanId: string;
  qc: QCResult;
  passed: boolean;
}

/**
 * Agent 2: VisionQC
 * Performs quality checks on photos (pose, lighting, same-dress)
 */
export async function visionQCActivity(input: VisionQCInput): Promise<VisionQCOutput> {
  const { scanId, angleUrls } = input;

  console.log(`[VisionQC] Checking quality for scan: ${scanId}`);

  try {
    // TODO: Implement advanced QC checks
    // For now, basic validation
    const notes: string[] = [];

    // Simulated QC scores (in production, analyze actual images)
    const lightingScore = 0.85; // 0.0-1.0
    const sameDressScore = 0.92; // 0.0-1.0 (compare to Day 1 baseline)
    const poseOK = true;

    if (lightingScore < 0.5) {
      notes.push('Lighting too dark');
    } else if (lightingScore > 0.9) {
      notes.push('Lighting too bright');
    }

    if (sameDressScore < 0.8) {
      notes.push('Different clothing detected');
    }

    const qc: QCResult = {
      poseOK,
      lightingScore,
      sameDressScore,
      notes,
    };

    // Save QC results
    await updateScanWithQC(scanId, qc);

    const passed = poseOK && lightingScore > 0.4 && lightingScore < 0.95;

    console.log(`[VisionQC] QC ${passed ? 'passed' : 'failed'}. Scores:`, qc);

    return {
      scanId,
      qc,
      passed,
    };
  } catch (error) {
    console.error('[VisionQC] Error:', error);
    throw error;
  }
}

// ============================================================================
// AGENT 3: BFESTIMATOR - Body Fat Estimation
// ============================================================================

export interface BFEstimatorInput {
  scanId: string;
  userId: string;
  angleUrls: AngleUrls;
  weightLb: number | null;
}

export interface BFEstimatorOutput {
  scanId: string;
  bfPercent: number;
  bfConfidence: number;
  lbmLb: number | null;
  waistMetric: number;
}

/**
 * Agent 3: BFEstimator
 * Estimates body fat percentage using Gemini AI vision model
 */
export async function bfEstimatorActivity(input: BFEstimatorInput): Promise<BFEstimatorOutput> {
  const { scanId, userId, angleUrls, weightLb } = input;

  console.log(`[BFEstimator] Analyzing body composition for scan: ${scanId}`);

  try {
    // Get user profile for context
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Call Gemini AI to analyze body composition
    // For now, we'll use a simulated value. In production, pass angleUrls to Gemini
    // const analysis = await analyzeBodyCompositionWithGemini(angleUrls, userProfile);

    // Simulated values (replace with actual Gemini call)
    const bfPercent = 0.18; // 18%
    const bfConfidence = 0.92; // 92% confidence
    const waistMetric = 0.76; // Normalized waist measurement

    // Calculate Lean Body Mass if weight is available
    const lbmLb = weightLb ? weightLb * (1 - bfPercent) : null;

    // Save estimation results
    await updateScanWithEstimation(scanId, {
      bfPercent,
      bfConfidence,
      lbmLb,
      waistMetric,
    });

    console.log(`[BFEstimator] BF%: ${(bfPercent * 100).toFixed(1)}%, LBM: ${lbmLb?.toFixed(1)} lb`);

    return {
      scanId,
      bfPercent,
      bfConfidence,
      lbmLb,
      waistMetric,
    };
  } catch (error) {
    console.error('[BFEstimator] Error:', error);
    throw error;
  }
}

// ============================================================================
// AGENT 4: METABINDER - Context Attachment
// ============================================================================

export interface MetaBinderInput {
  scanId: string;
  userId: string;
  date: string;
}

export interface MetaBinderOutput {
  scanId: string;
  hasNutrition: boolean;
  hasWorkout: boolean;
}

/**
 * Agent 4: MetaBinder
 * Attaches nutrition and workout context from dayLogs
 */
export async function metaBinderActivity(input: MetaBinderInput): Promise<MetaBinderOutput> {
  const { scanId, userId, date } = input;

  console.log(`[MetaBinder] Binding context for scan: ${scanId}`);

  try {
    // Get day log for this date
    const dayLog = await getDayLog(userId, date);

    const hasNutrition = !!dayLog && dayLog.kcal > 0;
    const hasWorkout = !!dayLog && !!dayLog.workout;

    console.log(`[MetaBinder] Context: Nutrition=${hasNutrition}, Workout=${hasWorkout}`);

    // Note: dayLog is already stored separately; this activity just validates it exists
    // Scans and dayLogs are linked via userId + date

    return {
      scanId,
      hasNutrition,
      hasWorkout,
    };
  } catch (error) {
    console.error('[MetaBinder] Error:', error);
    throw error;
  }
}

// ============================================================================
// AGENT 5: DELTACOMPARATOR - Progress Analysis
// ============================================================================

export interface DeltaComparatorInput {
  scanId: string;
  userId: string;
  date: string;
}

export interface DeltaComparatorOutput {
  scanId: string;
  deltas: DeltaComparison;
  hasPrevious: boolean;
}

/**
 * Agent 5: DeltaComparator
 * Compares current scan vs Day-1 and Day-2
 */
export async function deltaComparatorActivity(
  input: DeltaComparatorInput
): Promise<DeltaComparatorOutput> {
  const { scanId, userId, date } = input;

  console.log(`[DeltaComparator] Computing deltas for scan: ${scanId}`);

  try {
    // Get current scan
    const currentScan = await getScan(scanId);
    if (!currentScan) {
      throw new Error('Current scan not found');
    }

    // Get previous 2 scans
    const previousScans = await getPreviousScans(userId, date, 2);

    const hasPrevious = previousScans.length > 0;

    let deltas: DeltaComparison = {
      bf_d1: null,
      bf_d2: null,
      slope_7day: null,
      lbm_d1: null,
      weight_d1: null,
    };

    if (hasPrevious) {
      const prev1 = previousScans[0];
      const prev2 = previousScans.length > 1 ? previousScans[1] : null;

      // Calculate deltas
      if (currentScan.bfPercent !== null && prev1.bfPercent !== null) {
        deltas.bf_d1 = currentScan.bfPercent - prev1.bfPercent;
      }

      if (currentScan.bfPercent !== null && prev2 && prev2.bfPercent !== null) {
        deltas.bf_d2 = currentScan.bfPercent - prev2.bfPercent;
      }

      if (currentScan.lbmLb !== null && prev1.lbmLb !== null) {
        deltas.lbm_d1 = currentScan.lbmLb - prev1.lbmLb;
      }

      if (currentScan.weightLb !== null && prev1.weightLb !== null) {
        deltas.weight_d1 = currentScan.weightLb - prev1.weightLb;
      }

      // TODO: Calculate 7-day slope if enough data
    }

    // Save deltas
    await updateScanWithDeltas(
      scanId,
      deltas,
      previousScans[0]?.id,
      previousScans[1]?.id
    );

    console.log(`[DeltaComparator] Deltas:`, deltas);

    return {
      scanId,
      deltas,
      hasPrevious,
    };
  } catch (error) {
    console.error('[DeltaComparator] Error:', error);
    throw error;
  }
}

// ============================================================================
// AGENT 6: INSIGHTWRITER - Generate Insights
// ============================================================================

export interface InsightWriterInput {
  scanId: string;
  userId: string;
  date: string;
}

export interface InsightWriterOutput {
  scanId: string;
  insight: Omit<InsightData, 'generatedAt'>;
}

/**
 * Agent 6: InsightWriter
 * Generates human-readable insights using Gemini AI
 */
export async function insightWriterActivity(input: InsightWriterInput): Promise<InsightWriterOutput> {
  const { scanId, userId, date } = input;

  console.log(`[InsightWriter] Generating insights for scan: ${scanId}`);

  try {
    // Get current scan with all data
    const scan = await getScan(scanId);
    if (!scan) {
      throw new Error('Scan not found');
    }

    // Get day log for nutrition/workout context
    const dayLog = await getDayLog(userId, date);

    // Generate insight summary
    const parts: string[] = [];
    const flags: ('ok' | 'warning' | 'danger')[] = [];

    if (!scan.deltas || scan.deltas.bf_d1 === null) {
      parts.push('🎉 **First scan day!** Your baseline is set.');
      flags.push('ok');
    } else {
      const bfChange = scan.deltas.bf_d1 * 100; // Convert to percentage points

      if (bfChange < -0.2) {
        parts.push(`✅ **BF% ${bfChange.toFixed(1)}%** vs yesterday — excellent progress!`);
        flags.push('ok');
      } else if (bfChange > 0.3) {
        parts.push(`⚠️ **BF% +${bfChange.toFixed(1)}%** vs yesterday — check sodium/carbs.`);
        flags.push('warning');
      } else {
        parts.push(`📊 **BF% ${bfChange >= 0 ? '+' : ''}${bfChange.toFixed(1)}%** vs yesterday.`);
        flags.push('ok');
      }

      // LBM analysis
      if (scan.deltas.lbm_d1 !== null) {
        const lbmChange = scan.deltas.lbm_d1;
        if (lbmChange < -0.5) {
          parts.push(`⚠️ **Muscle loss detected** (${lbmChange.toFixed(1)} lb) — increase protein & reduce deficit.`);
          flags.push('warning');
        } else if (lbmChange > 0.2) {
          parts.push(`💪 **LBM +${lbmChange.toFixed(1)} lb** — muscle retention excellent!`);
        }
      }

      // Weight change
      if (scan.deltas.weight_d1 !== null) {
        const weightChange = scan.deltas.weight_d1;
        if (Math.abs(weightChange) > 2.0) {
          parts.push(`⚠️ **Rapid weight change** (${weightChange.toFixed(1)} lb) — may be water retention.`);
          flags.push('warning');
        }
      }
    }

    // Nutrition context
    if (dayLog) {
      if (dayLog.kcal > 0) {
        parts.push(`\n📊 **Yesterday:** ${dayLog.kcal} kcal, ${dayLog.proteinG}g protein`);
      }
      if (dayLog.workout) {
        parts.push(`💪 **Workout:** ${dayLog.workout.type}, ${dayLog.workout.steps} steps`);
      }
    }

    const summary = parts.join('\n\n');

    // Determine overall flag
    const overallFlag: ('ok' | 'warning' | 'danger')[] = flags.includes('danger')
      ? ['danger']
      : flags.includes('warning')
      ? ['warning']
      : ['ok'];

    const insight: Omit<InsightData, 'generatedAt'> = {
      summary,
      flags: overallFlag,
      version: 1,
    };

    // Save insight
    await updateScanWithInsight(scanId, insight);

    console.log(`[InsightWriter] Insight generated`);

    return {
      scanId,
      insight,
    };
  } catch (error) {
    console.error('[InsightWriter] Error:', error);
    throw error;
  }
}

// ============================================================================
// AGENT 7: PRIVACYPUBLISHER - Dashboard & QR Update
// ============================================================================

export interface PrivacyPublisherInput {
  scanId: string;
  userId: string;
}

export interface PrivacyPublisherOutput {
  scanId: string;
  dashboardUpdated: boolean;
  qrUpdated: boolean;
}

/**
 * Agent 7: PrivacyPublisher
 * Updates dashboard cache and QR profile (respecting privacy settings)
 */
export async function privacyPublisherActivity(
  input: PrivacyPublisherInput
): Promise<PrivacyPublisherOutput> {
  const { scanId, userId } = input;

  console.log(`[PrivacyPublisher] Publishing scan: ${scanId}`);

  try {
    // Get user profile to check privacy settings
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // TODO: Update dashboard cache (Redis or Firestore)
    const dashboardUpdated = true;

    // TODO: Update QR public card data (if qrEnabled)
    const qrUpdated = userProfile.privacy.qrEnabled;

    console.log(`[PrivacyPublisher] Dashboard: ${dashboardUpdated}, QR: ${qrUpdated}`);

    return {
      scanId,
      dashboardUpdated,
      qrUpdated,
    };
  } catch (error) {
    console.error('[PrivacyPublisher] Error:', error);
    throw error;
  }
}
