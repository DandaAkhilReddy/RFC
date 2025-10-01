import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { db, Collections, verifyToken, getAuthToken, UserProfile } from '../lib/firebase';

/**
 * GET /api/profile/{userId}
 * Get user profile by userId
 * Returns hasProfile: false if user hasn't completed onboarding
 */
export async function getUserProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Verify authentication
    const token = getAuthToken(request);
    if (!token) {
      return {
        status: 401,
        jsonBody: { error: 'Unauthorized - No token provided' }
      };
    }

    const decodedToken = await verifyToken(token);
    const userId = request.params.userId;

    // Security: Users can only access their own profile
    if (decodedToken.uid !== userId) {
      return {
        status: 403,
        jsonBody: { error: 'Forbidden - Cannot access other user profiles' }
      };
    }

    // Get profile from Firestore
    const userDoc = await db.collection(Collections.USERS).doc(userId).get();

    if (!userDoc.exists) {
      return {
        status: 200,
        jsonBody: {
          hasProfile: false,
          message: 'Profile not found - user needs to complete onboarding'
        }
      };
    }

    const profile = userDoc.data() as UserProfile;

    return {
      status: 200,
      jsonBody: {
        hasProfile: true,
        profile
      }
    };
  } catch (error: any) {
    context.error('Error fetching profile:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to fetch profile', details: error.message }
    };
  }
}

app.http('getUserProfile', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'profile/{userId}',
  handler: getUserProfile
});
