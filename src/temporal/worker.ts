/**
 * Temporal Worker
 *
 * This worker processes workflows and activities from task queues
 * Run this separately from your React app (e.g., with ts-node or in production)
 *
 * Usage:
 *   Development: npm run worker
 *   Production: Deploy as separate service
 */

// CRITICAL: Load environment variables FIRST before any other imports
import './loadEnv';

// Now safe to import modules that depend on environment variables
import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities';
import TEMPORAL_CONFIG from './config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ESM compatibility - create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runWorker() {
  console.log('='.repeat(60));
  console.log('🚀 ReddyFit Temporal Worker Starting...');
  console.log('='.repeat(60));

  try {
    // Create connection to Temporal Cloud
    console.log(`\n📡 Connecting to Temporal Cloud: ${TEMPORAL_CONFIG.address}`);
    const connection = await NativeConnection.connect({
      address: TEMPORAL_CONFIG.address,
      tls: TEMPORAL_CONFIG.tls,
      apiKey: TEMPORAL_CONFIG.apiKey,
    });
    console.log('✅ Connected to Temporal Cloud');

    // Create and start worker
    console.log(`\n⚙️  Creating worker...`);
    console.log(`   Namespace: ${TEMPORAL_CONFIG.namespace}`);
    console.log(`   Task Queue: ${TEMPORAL_CONFIG.taskQueues.bodyFatAnalysis}`);

    const worker = await Worker.create({
      connection,
      namespace: TEMPORAL_CONFIG.namespace,
      taskQueue: TEMPORAL_CONFIG.taskQueues.bodyFatAnalysis,
      workflowsPath: resolve(__dirname, './workflows'),
      activities,
    });

    console.log('✅ Worker created successfully');
    console.log('\n🎯 Worker is now polling for tasks...\n');
    console.log('Press Ctrl+C to stop\n');

    // Run the worker
    await worker.run();
  } catch (error) {
    console.error('\n❌ Worker failed to start:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down worker...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down worker...');
  process.exit(0);
});

// Start the worker
runWorker().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
