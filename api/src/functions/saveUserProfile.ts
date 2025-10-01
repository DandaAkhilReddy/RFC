import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { db, Collections, verifyToken, getAuthToken } from '../lib/firebase';
import * as admin from 'firebase-admin';

/**
 * POST /api/profile/{userId}
 * Create or update user profile
 * This is called after onboarding form completion
 */
export async function saveUserProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Verify authentication
    const token = getAuthToken(request);
    if (!token) {
      return {
        status: 401,
        jsonBody: { error: 'Unauthorized' }
      };
    }

    const decodedToken = await verifyToken(token);
    const userId = request.params.userId;

    // Security check
    if (decodedToken.uid !== userId) {
      return {
        status: 403,
        jsonBody: { error: 'Forbidden' }
      };
    }

    // Parse request body
    const body = await request.json() as any;

    // Validate required fields
    const requiredFields = ['name', 'age', 'gender', 'height', 'weight', 'targetWeight', 'activityLevel', 'fitnessGoal'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return {
          status: 400,
          jsonBody: { error: `Missing required field: ${field}` }
        };
      }
    }

    // Calculate BMR and TDEE
    const bmr = calculateBMR(body.weight, body.height, body.age, body.gender);
    const tdee = calculateTDEE(bmr, body.activityLevel);
    const dailyCalories = calculateDailyCalories(tdee, body.fitnessGoal);
    const dailyProtein = Math.round(body.weight * 2); // 2g per kg

    // Prepare profile data
    const profileData = {
      userId,
      email: decodedToken.email || '',
      name: body.name,
      age: Number(body.age),
      gender: body.gender,
      height: Number(body.height),
      weight: Number(body.weight),
      targetWeight: Number(body.targetWeight),
      activityLevel: body.activityLevel,
      fitnessGoal: body.fitnessGoal,
      bmr,
      tdee,
      dailyCalories,
      dailyProtein,
      photoUrl: body.photoUrl || '',
      bio: body.bio || '',
      interests: body.interests || [],
      location: body.location || '',
      lookingFor: body.lookingFor || 'any',
      ageRange: body.ageRange || { min: 18, max: 65 },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      hasCompletedProfile: true
    };

    // Check if profile exists
    const userDoc = await db.collection(Collections.USERS).doc(userId).get();

    if (userDoc.exists) {
      // Update existing profile (preserve createdAt)
      await db.collection(Collections.USERS).doc(userId).update(profileData);
    } else {
      // Create new profile
      await db.collection(Collections.USERS).doc(userId).set({
        ...profileData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    context.log(`Profile saved for user: ${userId}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        message: 'Profile saved successfully',
        profile: {
          ...profileData,
          bmr,
          tdee,
          dailyCalories,
          dailyProtein
        }
      }
    };
  } catch (error: any) {
    context.error('Error saving profile:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to save profile', details: error.message }
    };
  }
}

// Helper functions for calculations
function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
}

function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

function calculateDailyCalories(tdee: number, goal: string): number {
  const lowerGoal = goal.toLowerCase();
  if (lowerGoal.includes('loss') || lowerGoal.includes('cut')) {
    return Math.round(tdee * 0.8); // 20% deficit
  } else if (lowerGoal.includes('gain') || lowerGoal.includes('bulk')) {
    return Math.round(tdee * 1.1); // 10% surplus
  }
  return tdee; // Maintenance
}

app.http('saveUserProfile', {
  methods: ['POST', 'PUT'],
  authLevel: 'anonymous',
  route: 'profile/{userId}',
  handler: saveUserProfile
});
