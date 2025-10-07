/**
 * Daily Scan Service
 *
 * High-level functions for triggering and monitoring daily scans
 */

import { getTemporalClient } from '../temporal/client';
import { getDailyScanWorkflowId } from '../temporal/workflows/dailyScanWorkflow';
import type {
  DailyScanWorkflowInput,
  DailyScanWorkflowOutput,
} from '../temporal/workflows/dailyScanWorkflow';

/**
 * Trigger Daily Scan Workflow via Temporal
 *
 * This starts the 7-agent processing pipeline for a scan
 */
export async function triggerDailyScanProcessing(
  scanId: string,
  userId: string,
  date: string
): Promise<{
  workflowId: string;
  runId: string;
}> {
  try {
    console.log('[DailyScanService] Triggering workflow', { scanId, userId, date });

    const client = await getTemporalClient();

    const workflowId = getDailyScanWorkflowId(userId, date);

    const input: DailyScanWorkflowInput = {
      scanId,
      userId,
      date,
    };

    // Start workflow
    const handle = await client.workflow.start('dailyScanWorkflow', {
      workflowId,
      taskQueue: 'daily-scan-queue',
      args: [input],
    });

    console.log('[DailyScanService] Workflow started', {
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
    });

    return {
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
    };
  } catch (error) {
    console.error('[DailyScanService] Failed to start workflow:', error);
    throw error;
  }
}

/**
 * Get Daily Scan Workflow Result
 *
 * Poll for workflow completion and return results
 */
export async function getDailyScanResult(
  userId: string,
  date: string
): Promise<DailyScanWorkflowOutput | null> {
  try {
    const client = await getTemporalClient();
    const workflowId = getDailyScanWorkflowId(userId, date);

    const handle = client.workflow.getHandle(workflowId);

    // Wait for result (with timeout)
    const result = await Promise.race([
      handle.result(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 30000)), // 30s timeout
    ]);

    return result as DailyScanWorkflowOutput | null;
  } catch (error) {
    console.error('[DailyScanService] Failed to get workflow result:', error);
    return null;
  }
}

/**
 * Check if workflow is still running
 */
export async function isDailyScanProcessing(
  userId: string,
  date: string
): Promise<boolean> {
  try {
    const client = await getTemporalClient();
    const workflowId = getDailyScanWorkflowId(userId, date);

    const handle = client.workflow.getHandle(workflowId);
    const description = await handle.describe();

    return description.status.name === 'RUNNING';
  } catch (error) {
    // Workflow doesn't exist or failed to describe
    return false;
  }
}
