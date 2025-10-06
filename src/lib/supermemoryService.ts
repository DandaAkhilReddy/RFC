// Supermemory AI Integration for ReddyFit
// Universal Memory API that gives AI apps long-term memory

import { Supermemory } from 'supermemory';

// Initialize Supermemory client
const SUPERMEMORY_API_KEY = import.meta.env.VITE_SUPERMEMORY_API_KEY || '';
const SUPERMEMORY_BASE_URL = import.meta.env.VITE_SUPERMEMORY_BASE_URL || 'https://api.supermemory.ai/';

let supermemoryClient: Supermemory | null = null;

// Initialize client
function getClient(): Supermemory {
  if (!supermemoryClient) {
    if (!SUPERMEMORY_API_KEY) {
      throw new Error('Supermemory API key not configured. Please add VITE_SUPERMEMORY_API_KEY to .env file');
    }

    supermemoryClient = new Supermemory({
      apiKey: SUPERMEMORY_API_KEY,
      baseURL: SUPERMEMORY_BASE_URL
    });
  }

  return supermemoryClient;
}

// ===== MEMORY TYPES =====

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  currentWeight: number;
  targetWeight: number;
  height?: number;
  fitnessGoal: string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  fitnessLevel: string;
  preferredWorkouts?: string[];
  startDate: string;
}

export interface MealMemory {
  userId: string;
  date: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  foods: string[];
  mealType?: string; // breakfast, lunch, dinner, snack
  userNotes?: string;
}

export interface WorkoutMemory {
  userId: string;
  date: string;
  exercise: string;
  duration: number; // minutes
  caloriesBurned: number;
  intensity: string;
  workoutType?: string; // cardio, strength, flexibility
  userNotes?: string;
}

export interface ProgressMemory {
  userId: string;
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: string;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
  };
  photoUrl?: string;
  userNotes?: string;
}

export interface ConversationMemory {
  userId: string;
  date: string;
  userMessage: string;
  aiResponse: string;
  context?: string;
}

// ===== STORE MEMORIES =====

/**
 * Store user profile information
 */
export async function storeUserProfile(profile: UserProfile): Promise<void> {
  try {
    const client = getClient();

    const content = `User Profile for ${profile.name}:
- User ID: ${profile.userId}
- Email: ${profile.email}
- Current Weight: ${profile.currentWeight}kg
- Target Weight: ${profile.targetWeight}kg
- Height: ${profile.height || 'Not specified'}cm
- Fitness Goal: ${profile.fitnessGoal}
- Fitness Level: ${profile.fitnessLevel}
- Dietary Restrictions: ${profile.dietaryRestrictions?.join(', ') || 'None'}
- Allergies: ${profile.allergies?.join(', ') || 'None'}
- Preferred Workouts: ${profile.preferredWorkouts?.join(', ') || 'Not specified'}
- Started on: ${profile.startDate}`;

    await client.memories.add({
      content,
      metadata: {
        type: 'profile',
        userId: profile.userId,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ User profile stored in Supermemory');
  } catch (error) {
    console.error('Error storing user profile:', error);
    throw error;
  }
}

/**
 * Store meal/food entry
 * @returns Memory ID for later deletion
 */
export async function storeMealMemory(meal: MealMemory): Promise<string | null> {
  try {
    const client = getClient();

    const content = `Meal Entry on ${meal.date}:
- User: ${meal.userId}
- Meal: ${meal.mealName}
- Foods: ${meal.foods.join(', ')}
- Nutrition: ${meal.calories} cal, ${meal.protein}g protein, ${meal.carbs}g carbs, ${meal.fats}g fat
- Type: ${meal.mealType || 'Not specified'}
${meal.userNotes ? `- Notes: ${meal.userNotes}` : ''}`;

    const response = await client.memories.add({
      content,
      metadata: {
        type: 'meal',
        userId: meal.userId,
        date: meal.date,
        calories: meal.calories,
        protein: meal.protein,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Meal stored in Supermemory with ID:', response.id);
    return response.id;
  } catch (error) {
    console.error('Error storing meal:', error);
    // Don't throw - we don't want to break the UI if memory storage fails
    return null;
  }
}

/**
 * Store workout entry
 * @returns Memory ID for later deletion
 */
export async function storeWorkoutMemory(workout: WorkoutMemory): Promise<string | null> {
  try {
    const client = getClient();

    const content = `Workout Entry on ${workout.date}:
- User: ${workout.userId}
- Exercise: ${workout.exercise}
- Duration: ${workout.duration} minutes
- Calories Burned: ${workout.caloriesBurned}
- Intensity: ${workout.intensity}
- Type: ${workout.workoutType || 'Not specified'}
${workout.userNotes ? `- Notes: ${workout.userNotes}` : ''}`;

    const response = await client.memories.add({
      content,
      metadata: {
        type: 'workout',
        userId: workout.userId,
        date: workout.date,
        duration: workout.duration,
        calories: workout.caloriesBurned,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Workout stored in Supermemory with ID:', response.id);
    return response.id;
  } catch (error) {
    console.error('Error storing workout:', error);
    return null;
  }
}

/**
 * Store progress update (weight, body fat, photos)
 */
export async function storeProgressMemory(progress: ProgressMemory): Promise<void> {
  try {
    const client = getClient();

    const content = `Progress Update on ${progress.date}:
- User: ${progress.userId}
- Weight: ${progress.weight}kg
- Body Fat: ${progress.bodyFat ? progress.bodyFat + '%' : 'Not measured'}
- Muscle Mass: ${progress.muscleMass || 'Not measured'}
${progress.measurements ? `- Measurements: Chest ${progress.measurements.chest}cm, Waist ${progress.measurements.waist}cm, Hips ${progress.measurements.hips}cm` : ''}
${progress.photoUrl ? `- Photo: ${progress.photoUrl}` : ''}
${progress.userNotes ? `- Notes: ${progress.userNotes}` : ''}`;

    await client.memories.add({
      content,
      metadata: {
        type: 'progress',
        userId: progress.userId,
        date: progress.date,
        weight: progress.weight,
        bodyFat: progress.bodyFat,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Progress stored in Supermemory');
  } catch (error) {
    console.error('Error storing progress:', error);
  }
}

/**
 * Store AI conversation
 */
export async function storeConversationMemory(conversation: ConversationMemory): Promise<void> {
  try {
    const client = getClient();

    const content = `Conversation on ${conversation.date}:
- User: ${conversation.userId}
- User asked: "${conversation.userMessage}"
- AI responded: "${conversation.aiResponse}"
${conversation.context ? `- Context: ${conversation.context}` : ''}`;

    await client.memories.add({
      content,
      metadata: {
        type: 'conversation',
        userId: conversation.userId,
        date: conversation.date,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Conversation stored in Supermemory');
  } catch (error) {
    console.error('Error storing conversation:', error);
  }
}

// ===== QUERY MEMORIES =====

/**
 * Search memories for a user
 */
export async function searchMemories(userId: string, query: string): Promise<any> {
  try {
    const client = getClient();

    const response = await client.search.execute({
      q: `${query} for user ${userId}`,
    });

    return response.results || [];
  } catch (error) {
    console.error('Error searching memories:', error);
    return [];
  }
}

/**
 * Get user's recent meals
 */
export async function getRecentMeals(userId: string, days: number = 7): Promise<string> {
  const query = `What meals has user ${userId} eaten in the last ${days} days? List foods and nutrition.`;
  const results = await searchMemories(userId, query);

  if (results.length === 0) {
    return 'No recent meal data found.';
  }

  return results.map((r: any) => r.content).join('\n\n');
}

/**
 * Get user's recent workouts
 */
export async function getRecentWorkouts(userId: string, days: number = 7): Promise<string> {
  const query = `What workouts has user ${userId} done in the last ${days} days? List exercises and duration.`;
  const results = await searchMemories(userId, query);

  if (results.length === 0) {
    return 'No recent workout data found.';
  }

  return results.map((r: any) => r.content).join('\n\n');
}

/**
 * Get user's dietary preferences and restrictions
 */
export async function getUserDietaryInfo(userId: string): Promise<string> {
  const query = `What are user ${userId}'s dietary restrictions, allergies, and food preferences?`;
  const results = await searchMemories(userId, query);

  if (results.length === 0) {
    return 'No dietary information found.';
  }

  return results[0].content;
}

/**
 * Get user's fitness preferences
 */
export async function getUserFitnessPreferences(userId: string): Promise<string> {
  const query = `What are user ${userId}'s workout preferences, fitness level, and exercise habits?`;
  const results = await searchMemories(userId, query);

  if (results.length === 0) {
    return 'No fitness preferences found.';
  }

  return results[0].content;
}

/**
 * Get user's progress summary
 */
export async function getProgressSummary(userId: string): Promise<string> {
  const query = `What is user ${userId}'s weight progress, body fat changes, and overall fitness journey?`;
  const results = await searchMemories(userId, query);

  if (results.length === 0) {
    return 'No progress data found.';
  }

  return results.map((r: any) => r.content).join('\n\n');
}

/**
 * Get full context for AI conversations
 * This provides ALL relevant user information for personalized AI responses
 */
export async function getFullUserContext(userId: string): Promise<string> {
  try {
    const [profile, meals, workouts, progress] = await Promise.all([
      searchMemories(userId, `user ${userId} profile information`),
      getRecentMeals(userId, 7),
      getRecentWorkouts(userId, 7),
      getProgressSummary(userId)
    ]);

    let context = '=== USER CONTEXT ===\n\n';

    if (profile.length > 0) {
      context += '**Profile:**\n' + profile[0].content + '\n\n';
    }

    if (meals !== 'No recent meal data found.') {
      context += '**Recent Meals (Last 7 Days):**\n' + meals + '\n\n';
    }

    if (workouts !== 'No recent workout data found.') {
      context += '**Recent Workouts (Last 7 Days):**\n' + workouts + '\n\n';
    }

    if (progress !== 'No progress data found.') {
      context += '**Progress:**\n' + progress + '\n\n';
    }

    return context;
  } catch (error) {
    console.error('Error getting user context:', error);
    return 'No user context available.';
  }
}

// ===== DELETE MEMORIES =====

/**
 * Delete a meal memory by ID
 */
export async function deleteMealMemory(memoryId: string): Promise<boolean> {
  try {
    const client = getClient();
    await client.memories.delete(memoryId);
    console.log('✅ Meal memory deleted from Supermemory:', memoryId);
    return true;
  } catch (error) {
    console.error('Error deleting meal memory:', error);
    return false;
  }
}

/**
 * Delete a workout memory by ID
 */
export async function deleteWorkoutMemory(memoryId: string): Promise<boolean> {
  try {
    const client = getClient();
    await client.memories.delete(memoryId);
    console.log('✅ Workout memory deleted from Supermemory:', memoryId);
    return true;
  } catch (error) {
    console.error('Error deleting workout memory:', error);
    return false;
  }
}

/**
 * Delete a conversation memory by ID
 */
export async function deleteConversationMemory(memoryId: string): Promise<boolean> {
  try {
    const client = getClient();
    await client.memories.delete(memoryId);
    console.log('✅ Conversation memory deleted from Supermemory:', memoryId);
    return true;
  } catch (error) {
    console.error('Error deleting conversation memory:', error);
    return false;
  }
}

/**
 * Delete a progress memory by ID
 */
export async function deleteProgressMemory(memoryId: string): Promise<boolean> {
  try {
    const client = getClient();
    await client.memories.delete(memoryId);
    console.log('✅ Progress memory deleted from Supermemory:', memoryId);
    return true;
  } catch (error) {
    console.error('Error deleting progress memory:', error);
    return false;
  }
}

// Export client getter for advanced usage
export { getClient };
