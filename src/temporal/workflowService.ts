/**
 * Workflow Service
 *
 * Helper functions to trigger Temporal workflows from React components
 * Provides easy-to-use async functions with proper error handling
 */

import { getTemporalClient } from './client';
import TEMPORAL_CONFIG from './config';
import type { BodyFatAnalysisInput, BodyFatAnalysisResult } from './workflows/bodyFatAnalysisWorkflow';

/**
 * Trigger body fat analysis workflow
 *
 * @param input - User data and photo for analysis
 * @returns Promise with analysis results
 */
export async function triggerBodyFatAnalysis(
  input: BodyFatAnalysisInput
): Promise<BodyFatAnalysisResult> {
  try {
    console.log('[WorkflowService] Starting body fat analysis workflow...');

    const client = await getTemporalClient();
    const workflowId = TEMPORAL_CONFIG.workflowIds.bodyFatAnalysis(input.userId);

    console.log(`[WorkflowService] Workflow ID: ${workflowId}`);

    // Start workflow execution
    const handle = await client.workflow.start('bodyFatAnalysisWorkflow', {
      taskQueue: TEMPORAL_CONFIG.taskQueues.bodyFatAnalysis,
      workflowId,
      args: [input],
    });

    console.log('[WorkflowService] Workflow started, waiting for result...');

    // Wait for workflow to complete
    const result = await handle.result();

    console.log('[WorkflowService] Workflow completed:', {
      success: result.success,
      bodyFat: result.bodyFat,
    });

    return result;
  } catch (error) {
    console.error('[WorkflowService] Workflow execution failed:', error);

    // Return error result
    return {
      success: false,
      bodyFat: 0,
      muscleMass: '',
      posture: '',
      recommendations: [],
      photoUrl: '',
      error: error instanceof Error ? error.message : 'Workflow execution failed',
    };
  }
}

/**
 * Get status of a running workflow
 *
 * @param userId - User ID to construct workflow ID
 * @returns Workflow status or null if not found
 */
export async function getWorkflowStatus(userId: string): Promise<{
  running: boolean;
  result?: BodyFatAnalysisResult;
  error?: string;
}> {
  try {
    const client = await getTemporalClient();
    const workflowId = TEMPORAL_CONFIG.workflowIds.bodyFatAnalysis(userId);

    const handle = client.workflow.getHandle(workflowId);
    const result = await handle.result();

    return {
      running: false,
      result,
    };
  } catch (error) {
    return {
      running: false,
      error: error instanceof Error ? error.message : 'Failed to get workflow status',
    };
  }
}

/**
 * Cancel a running workflow
 *
 * @param userId - User ID to construct workflow ID
 */
export async function cancelWorkflow(userId: string): Promise<void> {
  try {
    const client = await getTemporalClient();
    const workflowId = TEMPORAL_CONFIG.workflowIds.bodyFatAnalysis(userId);

    const handle = client.workflow.getHandle(workflowId);
    await handle.cancel();

    console.log(`[WorkflowService] Workflow ${workflowId} cancelled`);
  } catch (error) {
    console.error('[WorkflowService] Failed to cancel workflow:', error);
    throw error;
  }
}
