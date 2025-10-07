/**
 * Azure Function: Process Daily Scan
 *
 * Triggers the Temporal workflow to process a daily scan
 * Called after photos are uploaded and scan record is created
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Client, Connection } from '@temporalio/client';
import type {
  DailyScanWorkflowInput,
} from '../../temporal/workflows/dailyScanWorkflow';

// Temporal Cloud configuration
const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || '';
const TEMPORAL_NAMESPACE = process.env.TEMPORAL_NAMESPACE || '';
const TEMPORAL_API_KEY = process.env.TEMPORAL_API_KEY || '';

let temporalClient: Client | null = null;

/**
 * Get or create Temporal client
 */
async function getTemporalClient(): Promise<Client> {
  if (temporalClient) {
    return temporalClient;
  }

  const connection = await Connection.connect({
    address: TEMPORAL_ADDRESS,
    tls: {
      clientCertPair: undefined,
    },
    apiKey: TEMPORAL_API_KEY,
  });

  temporalClient = new Client({
    connection,
    namespace: TEMPORAL_NAMESPACE,
  });

  return temporalClient;
}

/**
 * HTTP Trigger: Process Daily Scan
 */
export async function processDailyScan(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('[ProcessDailyScan] Function triggered');

  try {
    // Parse request body
    const body = await request.json() as {
      scanId?: string;
      userId?: string;
      date?: string;
    };

    const { scanId, userId, date } = body;

    // Validate input
    if (!scanId || !userId || !date) {
      return {
        status: 400,
        jsonBody: {
          error: 'Missing required fields: scanId, userId, date',
        },
      };
    }

    context.log('[ProcessDailyScan] Processing scan', { scanId, userId, date });

    // Get Temporal client
    const client = await getTemporalClient();

    // Create workflow ID (idempotent)
    const workflowId = `daily-scan-${userId}-${date}`;

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
      // Workflow will be idempotent - if already running, this will return existing handle
      workflowIdReusePolicy: 'ALLOW_DUPLICATE_FAILED_ONLY',
    });

    context.log('[ProcessDailyScan] Workflow started', {
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        workflowId: handle.workflowId,
        runId: handle.firstExecutionRunId,
        message: 'Daily scan processing started',
      },
    };
  } catch (error) {
    context.error('[ProcessDailyScan] Error:', error);

    return {
      status: 500,
      jsonBody: {
        error: 'Failed to process daily scan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Register function
app.http('processDailyScan', {
  methods: ['POST'],
  authLevel: 'function',
  handler: processDailyScan,
});
