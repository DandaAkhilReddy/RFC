/**
 * Temporal Activities for Gemini AI Integration
 *
 * These activities handle AI-powered body composition analysis
 * with automatic retries and error handling
 */

import { analyzeProgressPhotoWithGemini, type BodyAnalysis, type UserContext } from '../../lib/geminiService';

export interface AnalyzeBodyFatInput {
  imageBase64: string;
  userContext: UserContext;
  previousAnalysis?: BodyAnalysis;
}

/**
 * Activity: Analyze body fat percentage using Gemini Vision API
 *
 * This activity is retriable - if Gemini API fails, Temporal will automatically retry
 * with exponential backoff
 */
export async function analyzeBodyFatActivity(input: AnalyzeBodyFatInput): Promise<BodyAnalysis> {
  const { imageBase64, userContext, previousAnalysis } = input;

  console.log(`[Activity] Analyzing body fat for user: ${userContext.email}`);
  console.log(`[Activity] Image size: ${imageBase64.length} bytes`);

  try {
    const analysis = await analyzeProgressPhotoWithGemini(
      imageBase64,
      userContext,
      previousAnalysis
    );

    console.log(`[Activity] Analysis complete - Body Fat: ${analysis.bodyFat}%`);
    return analysis;
  } catch (error) {
    console.error('[Activity] Gemini analysis failed:', error);

    // Re-throw error so Temporal can retry
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Activity: Validate body fat analysis results
 *
 * Ensures the AI response is within acceptable ranges
 */
export async function validateAnalysisActivity(analysis: BodyAnalysis): Promise<boolean> {
  console.log('[Activity] Validating analysis results...');

  // Validate body fat percentage is realistic
  if (analysis.bodyFat < 3 || analysis.bodyFat > 50) {
    throw new Error(`Invalid body fat percentage: ${analysis.bodyFat}%`);
  }

  // Ensure recommendations exist
  if (!analysis.recommendations || analysis.recommendations.length === 0) {
    throw new Error('No recommendations provided');
  }

  // Ensure muscle mass description exists
  if (!analysis.muscleMass || analysis.muscleMass.length < 10) {
    throw new Error('Invalid muscle mass description');
  }

  console.log('[Activity] Validation passed');
  return true;
}
