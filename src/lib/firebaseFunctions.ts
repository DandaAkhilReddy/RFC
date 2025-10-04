import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Types for function responses
export interface FoodLabelResult {
  success: boolean;
  isFoodDetected: boolean;
  confidence: number;
  labels: Array<{
    description: string;
    score: number;
    isFoodRelated: boolean;
  }>;
  hasNutritionLabel: boolean;
  nutritionText: string | null;
  message: string;
}

export interface NutritionLabelResult {
  success: boolean;
  nutrition?: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    sodium: number | null;
    fiber: number | null;
  };
  fullText?: string;
  message: string;
}

/**
 * Call Cloud Vision API to check if image contains food
 * @param base64Image - Base64 encoded image string
 * @returns Food detection results with labels and confidence
 */
export async function labelFoodImage(base64Image: string): Promise<FoodLabelResult> {
  const labelFoodImageFn = httpsCallable<{ image: string }, FoodLabelResult>(
    functions,
    'labelFoodImage'
  );

  try {
    const result = await labelFoodImageFn({ image: base64Image });
    return result.data;
  } catch (error: any) {
    console.error('Error calling labelFoodImage:', error);
    throw new Error(error.message || 'Failed to analyze image');
  }
}

/**
 * Extract nutrition information from a nutrition label image
 * @param base64Image - Base64 encoded image string
 * @returns Nutrition information extracted from text
 */
export async function extractNutritionLabel(base64Image: string): Promise<NutritionLabelResult> {
  const extractNutritionLabelFn = httpsCallable<{ image: string }, NutritionLabelResult>(
    functions,
    'extractNutritionLabel'
  );

  try {
    const result = await extractNutritionLabelFn({ image: base64Image });
    return result.data;
  } catch (error: any) {
    console.error('Error calling extractNutritionLabel:', error);
    throw new Error(error.message || 'Failed to extract nutrition label');
  }
}

/**
 * Optimized workflow: First check if food, then analyze nutrition
 * @param base64Image - Base64 encoded image string
 * @returns Combined results from both checks
 */
export async function analyzeFoodPhoto(base64Image: string): Promise<{
  isFood: boolean;
  confidence: number;
  labels: string[];
  nutritionFromLabel?: NutritionLabelResult['nutrition'];
}> {
  // Step 1: Quick food detection with Cloud Vision
  const labelResult = await labelFoodImage(base64Image);

  if (!labelResult.isFoodDetected) {
    return {
      isFood: false,
      confidence: labelResult.confidence,
      labels: labelResult.labels.map(l => l.description),
    };
  }

  // Step 2: If nutrition label detected, extract it
  let nutritionFromLabel;
  if (labelResult.hasNutritionLabel) {
    try {
      const nutritionResult = await extractNutritionLabel(base64Image);
      if (nutritionResult.success) {
        nutritionFromLabel = nutritionResult.nutrition;
      }
    } catch (error) {
      console.warn('Failed to extract nutrition label, will use Gemini instead');
    }
  }

  return {
    isFood: true,
    confidence: labelResult.confidence,
    labels: labelResult.labels
      .filter(l => l.isFoodRelated)
      .map(l => l.description),
    nutritionFromLabel,
  };
}
