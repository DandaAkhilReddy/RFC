/**
 * Body Fat Analysis Workflow
 *
 * Orchestrates the complete body composition analysis process:
 * 1. Upload photo to Firebase Storage
 * 2. Get previous analysis for comparison
 * 3. Analyze body fat using Gemini AI
 * 4. Validate results
 * 5. Save to Firestore
 *
 * This workflow is durable - if any step fails, it will automatically retry
 */

import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from '../activities';

// Proxy activities with retry configuration
const {
  uploadPhotoToStorageActivity,
  getPreviousAnalysisActivity,
  analyzeBodyFatActivity,
  validateAnalysisActivity,
  saveAnalysisToFirestoreActivity,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumInterval: '1 minute',
    maximumAttempts: 5,
  },
});

export interface BodyFatAnalysisInput {
  userId: string;
  email: string;
  name: string;
  imageBase64: string;
  userContext: {
    name: string;
    email: string;
    startWeight: number;
    currentWeight: number;
    targetWeight: number;
    fitnessGoal: string;
    currentLevel: string;
    dailyCalories: number;
    dailyProtein: number;
  };
}

export interface BodyFatAnalysisResult {
  success: boolean;
  bodyFat: number;
  muscleMass: string;
  posture: string;
  faceAnalysis?: string;
  recommendations: string[];
  comparison?: string;
  photoUrl: string;
  error?: string;
}

/**
 * Main workflow: Analyze body fat from user photo
 */
export async function bodyFatAnalysisWorkflow(
  input: BodyFatAnalysisInput
): Promise<BodyFatAnalysisResult> {
  const { userId, imageBase64, userContext } = input;
  const timestamp = Date.now();

  console.log(`[Workflow] Starting body fat analysis for user: ${userId}`);

  try {
    // Step 1: Upload photo to Firebase Storage
    console.log('[Workflow] Step 1/5: Uploading photo...');
    const photoUrl = await uploadPhotoToStorageActivity({
      userId,
      imageBase64,
      timestamp,
    });

    // Step 2: Get previous analysis for comparison
    console.log('[Workflow] Step 2/5: Fetching previous analysis...');
    const previousAnalysis = await getPreviousAnalysisActivity(userId);

    // Step 3: Analyze body fat using Gemini AI
    console.log('[Workflow] Step 3/5: Running AI analysis...');
    const analysis = await analyzeBodyFatActivity({
      imageBase64,
      userContext,
      previousAnalysis: previousAnalysis || undefined,
    });

    // Step 4: Validate analysis results
    console.log('[Workflow] Step 4/5: Validating results...');
    await validateAnalysisActivity(analysis);

    // Step 5: Save to Firestore
    console.log('[Workflow] Step 5/5: Saving to Firestore...');
    await saveAnalysisToFirestoreActivity({
      userId,
      analysis,
      photoUrl,
      timestamp,
    });

    console.log('[Workflow] Analysis complete!');

    // Return success result
    return {
      success: true,
      bodyFat: analysis.bodyFat,
      muscleMass: analysis.muscleMass,
      posture: analysis.posture,
      faceAnalysis: analysis.faceAnalysis,
      recommendations: analysis.recommendations,
      comparison: analysis.comparison,
      photoUrl,
    };
  } catch (error) {
    console.error('[Workflow] Analysis failed:', error);

    // Return error result
    return {
      success: false,
      bodyFat: 0,
      muscleMass: '',
      posture: '',
      recommendations: [],
      photoUrl: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
