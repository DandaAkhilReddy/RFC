import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { db, Collections, verifyToken, getAuthToken, UserProfile, SwipeAction } from '../lib/firebase';

/**
 * GET /api/matches/{userId}/potential
 * Get potential accountability partners to swipe on
 * Uses smart matching algorithm based on:
 * - Fitness goals
 * - Activity level
 * - Age range
 * - Gender preference
 * - Excludes already swiped users
 */
export async function getPotentialMatches(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    if (decodedToken.uid !== userId) {
      return {
        status: 403,
        jsonBody: { error: 'Forbidden' }
      };
    }

    // Get user's profile
    const userDoc = await db.collection(Collections.USERS).doc(userId).get();
    if (!userDoc.exists) {
      return {
        status: 404,
        jsonBody: { error: 'User profile not found' }
      };
    }

    const userProfile = userDoc.data() as UserProfile;

    // Get users already swiped on
    const swipesSnapshot = await db
      .collection(Collections.SWIPES)
      .where('userId', '==', userId)
      .get();

    const swipedUserIds = new Set(
      swipesSnapshot.docs.map(doc => (doc.data() as SwipeAction).targetUserId)
    );
    swipedUserIds.add(userId); // Don't show self

    // Build query for potential matches
    let query = db.collection(Collections.USERS)
      .where('hasCompletedProfile', '==', true)
      .limit(50); // Get 50 potential matches

    // Apply gender filter if specified
    if (userProfile.lookingFor && userProfile.lookingFor !== 'any') {
      query = query.where('gender', '==', userProfile.lookingFor);
    }

    const potentialMatchesSnapshot = await query.get();

    // Filter and score matches
    const matches = potentialMatchesSnapshot.docs
      .filter(doc => !swipedUserIds.has(doc.id))
      .map(doc => {
        const profile = doc.data() as UserProfile;
        const matchScore = calculateMatchScore(userProfile, profile);
        return {
          userId: doc.id,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          photoUrl: profile.photoUrl || '',
          bio: profile.bio || '',
          fitnessGoal: profile.fitnessGoal,
          activityLevel: profile.activityLevel,
          interests: profile.interests || [],
          location: profile.location || '',
          matchScore
        };
      })
      .filter(match => {
        // Filter by age range
        if (userProfile.ageRange) {
          return match.age >= userProfile.ageRange.min && match.age <= userProfile.ageRange.max;
        }
        return true;
      })
      .sort((a, b) => b.matchScore - a.matchScore) // Highest score first
      .slice(0, 20); // Return top 20 matches

    return {
      status: 200,
      jsonBody: {
        success: true,
        matches
      }
    };
  } catch (error: any) {
    context.error('Error fetching potential matches:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to fetch matches', details: error.message }
    };
  }
}

/**
 * Calculate match score (0-100) based on compatibility
 */
function calculateMatchScore(user1: UserProfile, user2: UserProfile): number {
  let score = 0;

  // Same fitness goal: +30 points
  if (user1.fitnessGoal === user2.fitnessGoal) {
    score += 30;
  }

  // Similar activity level: +25 points
  const activityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
  const user1Level = activityLevels.indexOf(user1.activityLevel);
  const user2Level = activityLevels.indexOf(user2.activityLevel);
  const levelDiff = Math.abs(user1Level - user2Level);
  if (levelDiff === 0) {
    score += 25;
  } else if (levelDiff === 1) {
    score += 15;
  }

  // Similar age: +20 points
  const ageDiff = Math.abs(user1.age - user2.age);
  if (ageDiff <= 3) {
    score += 20;
  } else if (ageDiff <= 7) {
    score += 10;
  }

  // Shared interests: +25 points
  const user1Interests = new Set(user1.interests || []);
  const user2Interests = user2.interests || [];
  const sharedInterests = user2Interests.filter(interest => user1Interests.has(interest));
  score += Math.min(25, sharedInterests.length * 5);

  return Math.min(100, score);
}

app.http('getPotentialMatches', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'matches/{userId}/potential',
  handler: getPotentialMatches
});
