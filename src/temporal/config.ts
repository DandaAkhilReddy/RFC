/**
 * Temporal.io Configuration for ReddyFit
 *
 * This file contains connection settings for Temporal Cloud
 * Environment: ap-northeast-1 (Asia Pacific)
 */

// Helper to get env var from either Vite or Node.js environment
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  return process.env[key];
};

export const TEMPORAL_CONFIG = {
  // Temporal Cloud endpoint
  address: 'ap-northeast-1.aws.api.temporal.io:7233',

  // Namespace for this application
  namespace: 'quickstart-areddyhh-70f499a0.tjhly',

  // API Key for authentication (load from environment variable)
  apiKey: getEnv('VITE_TEMPORAL_API_KEY') || getEnv('TEMPORAL_API_KEY') || '',

  // TLS enabled for secure connection
  tls: true,

  // Task Queue names
  taskQueues: {
    bodyFatAnalysis: 'body-fat-analysis-queue',
    dailyStreaks: 'daily-streaks-queue',
    matchmaking: 'matchmaking-queue',
    notifications: 'notifications-queue',
  },

  // Workflow IDs
  workflowIds: {
    bodyFatAnalysis: (userId: string) => `body-fat-analysis-${userId}-${Date.now()}`,
    dailyStreakCalculation: (date: string) => `daily-streak-calculation-${date}`,
    matchmaking: (userId: string) => `matchmaking-${userId}`,
  },
} as const;

export default TEMPORAL_CONFIG;
