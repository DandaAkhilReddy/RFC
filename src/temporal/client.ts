/**
 * Temporal Client Singleton
 *
 * Provides a single, reusable Temporal client connection
 * for triggering workflows from the React application
 */

import { Client, Connection } from '@temporalio/client';
import TEMPORAL_CONFIG from './config';

let clientInstance: Client | null = null;
let connectionInstance: Connection | null = null;

/**
 * Get or create Temporal client connection
 * Uses singleton pattern to reuse connection across app
 */
export async function getTemporalClient(): Promise<Client> {
  if (clientInstance) {
    return clientInstance;
  }

  try {
    // Create connection if it doesn't exist
    if (!connectionInstance) {
      console.log('[Temporal] Connecting to Temporal Cloud...');
      connectionInstance = await Connection.connect({
        address: TEMPORAL_CONFIG.address,
        tls: TEMPORAL_CONFIG.tls,
        apiKey: TEMPORAL_CONFIG.apiKey,
      });
      console.log('[Temporal] Connection established');
    }

    // Create client
    clientInstance = new Client({
      connection: connectionInstance,
      namespace: TEMPORAL_CONFIG.namespace,
    });

    console.log('[Temporal] Client initialized');
    return clientInstance;
  } catch (error) {
    console.error('[Temporal] Failed to connect:', error);
    throw new Error(`Temporal connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Close Temporal client connection
 * Call this during app cleanup
 */
export async function closeTemporalClient(): Promise<void> {
  if (connectionInstance) {
    console.log('[Temporal] Closing connection...');
    await connectionInstance.close();
    connectionInstance = null;
    clientInstance = null;
    console.log('[Temporal] Connection closed');
  }
}

/**
 * Check if client is connected
 */
export function isClientConnected(): boolean {
  return clientInstance !== null && connectionInstance !== null;
}
