/**
 * Daily Scan Workflow
 *
 * Orchestrates the 7-agent architecture for processing daily body scans:
 * 1. ScanStore - Validate photos
 * 2. VisionQC - Quality control
 * 3. BFEstimator - Body fat estimation
 * 4. MetaBinder - Attach nutrition/workout context
 * 5. DeltaComparator - Day-over-day analysis
 * 6. InsightWriter - Generate insights
 * 7. PrivacyPublisher - Update dashboard & QR
 *
 * This workflow is durable and will retry failed steps automatically.
 */

import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from '../activities';

// Proxy all activities with retry configuration
const {
  // Daily Scan Activities (7 agents)
  scanStoreActivity,
  visionQCActivity,
  bfEstimatorActivity,
  metaBinderActivity,
  deltaComparatorActivity,
  insightWriterActivity,
  privacyPublisherActivity,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumInterval: '30 seconds',
    maximumAttempts: 3,
  },
});

// ============================================================================
// WORKFLOW INPUT / OUTPUT
// ============================================================================

export interface DailyScanWorkflowInput {
  scanId: string;
  userId: string;
  date: string; // YYYY-MM-DD
}

export interface DailyScanWorkflowOutput {
  success: boolean;
  scanId: string;
  bfPercent: number | null;
  lbmLb: number | null;
  insight: string | null;
  error?: string;
}

// ============================================================================
// MAIN WORKFLOW
// ============================================================================

/**
 * Daily Scan Workflow
 *
 * Processes a daily scan through 7 agents sequentially
 */
export async function dailyScanWorkflow(
  input: DailyScanWorkflowInput
): Promise<DailyScanWorkflowOutput> {
  const { scanId, userId, date } = input;

  log.info(`[Workflow] Starting Daily Scan processing`, { scanId, userId, date });

  try {
    // ========================================================================
    // AGENT 1: SCANSTORE - Photo Validation
    // ========================================================================
    log.info(`[Workflow] Step 1/7: ScanStore - Validating photos`);

    const scanStoreResult = await scanStoreActivity({
      scanId,
      userId,
    });

    if (!scanStoreResult.valid) {
      throw new Error(`Scan validation failed: ${scanStoreResult.errors.join(', ')}`);
    }

    log.info(`[Workflow] ✓ ScanStore completed`, { angleUrls: scanStoreResult.angleUrls });

    // ========================================================================
    // AGENT 2: VISIONQC - Quality Control
    // ========================================================================
    log.info(`[Workflow] Step 2/7: VisionQC - Quality control`);

    const visionQCResult = await visionQCActivity({
      scanId,
      angleUrls: scanStoreResult.angleUrls,
    });

    if (!visionQCResult.passed) {
      log.warn(`[Workflow] ⚠️ QC checks failed but continuing`, { qc: visionQCResult.qc });
      // Continue anyway - QC is advisory
    }

    log.info(`[Workflow] ✓ VisionQC completed`, { qc: visionQCResult.qc });

    // ========================================================================
    // AGENT 3: BFESTIMATOR - Body Fat Estimation
    // ========================================================================
    log.info(`[Workflow] Step 3/7: BFEstimator - Analyzing body composition`);

    // Get weight from scan (we need to fetch it)
    // For now, we'll pass the angleUrls and let the activity fetch the scan
    const bfEstimatorResult = await bfEstimatorActivity({
      scanId,
      userId,
      angleUrls: scanStoreResult.angleUrls,
      weightLb: null, // Activity will fetch from scan document
    });

    log.info(`[Workflow] ✓ BFEstimator completed`, {
      bfPercent: (bfEstimatorResult.bfPercent * 100).toFixed(1) + '%',
      lbmLb: bfEstimatorResult.lbmLb,
    });

    // ========================================================================
    // AGENT 4: METABINDER - Context Attachment
    // ========================================================================
    log.info(`[Workflow] Step 4/7: MetaBinder - Attaching nutrition/workout context`);

    const metaBinderResult = await metaBinderActivity({
      scanId,
      userId,
      date,
    });

    log.info(`[Workflow] ✓ MetaBinder completed`, {
      hasNutrition: metaBinderResult.hasNutrition,
      hasWorkout: metaBinderResult.hasWorkout,
    });

    // ========================================================================
    // AGENT 5: DELTACOMPARATOR - Progress Analysis
    // ========================================================================
    log.info(`[Workflow] Step 5/7: DeltaComparator - Computing deltas`);

    const deltaComparatorResult = await deltaComparatorActivity({
      scanId,
      userId,
      date,
    });

    log.info(`[Workflow] ✓ DeltaComparator completed`, {
      hasPrevious: deltaComparatorResult.hasPrevious,
      deltas: deltaComparatorResult.deltas,
    });

    // ========================================================================
    // AGENT 6: INSIGHTWRITER - Generate Insights
    // ========================================================================
    log.info(`[Workflow] Step 6/7: InsightWriter - Generating insights`);

    const insightWriterResult = await insightWriterActivity({
      scanId,
      userId,
      date,
    });

    log.info(`[Workflow] ✓ InsightWriter completed`, {
      flags: insightWriterResult.insight.flags,
    });

    // ========================================================================
    // AGENT 7: PRIVACYPUBLISHER - Dashboard & QR Update
    // ========================================================================
    log.info(`[Workflow] Step 7/7: PrivacyPublisher - Publishing results`);

    const privacyPublisherResult = await privacyPublisherActivity({
      scanId,
      userId,
    });

    log.info(`[Workflow] ✓ PrivacyPublisher completed`, {
      dashboardUpdated: privacyPublisherResult.dashboardUpdated,
      qrUpdated: privacyPublisherResult.qrUpdated,
    });

    // ========================================================================
    // WORKFLOW COMPLETE
    // ========================================================================
    log.info(`[Workflow] ✅ Daily Scan processing complete!`, { scanId });

    return {
      success: true,
      scanId,
      bfPercent: bfEstimatorResult.bfPercent,
      lbmLb: bfEstimatorResult.lbmLb,
      insight: insightWriterResult.insight.summary,
    };
  } catch (error) {
    log.error(`[Workflow] ❌ Daily Scan processing failed`, { error });

    return {
      success: false,
      scanId,
      bfPercent: null,
      lbmLb: null,
      insight: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper: Get workflow ID for a scan
 * Format: daily-scan-{userId}-{date}
 */
export function getDailyScanWorkflowId(userId: string, date: string): string {
  return `daily-scan-${userId}-${date}`;
}
