import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { db, Collections, verifyToken, getAuthToken, SwipeAction, Match } from '../lib/firebase';
import * as admin from 'firebase-admin';

/**
 * POST /api/matches/{userId}/swipe
 * Swipe right (like) or left (pass) on a potential match
 * If both users like each other, create a match
 */
export async function swipeMatch(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    // Parse request body
    const body = await request.json() as any;
    const { targetUserId, liked } = body;

    if (!targetUserId) {
      return {
        status: 400,
        jsonBody: { error: 'targetUserId is required' }
      };
    }

    if (typeof liked !== 'boolean') {
      return {
        status: 400,
        jsonBody: { error: 'liked must be a boolean' }
      };
    }

    // Record the swipe
    const swipeData: Omit<SwipeAction, 'id'> = {
      userId,
      targetUserId,
      liked,
      timestamp: admin.firestore.FieldValue.serverTimestamp() as any
    };

    await db.collection(Collections.SWIPES).add(swipeData);

    context.log(`User ${userId} ${liked ? 'liked' : 'passed'} on ${targetUserId}`);

    // If user liked, check if target user also liked them (mutual match)
    let isMatch = false;
    let matchId = null;

    if (liked) {
      const reciprocalSwipeSnapshot = await db
        .collection(Collections.SWIPES)
        .where('userId', '==', targetUserId)
        .where('targetUserId', '==', userId)
        .where('liked', '==', true)
        .limit(1)
        .get();

      if (!reciprocalSwipeSnapshot.empty) {
        // It's a match! Create match record
        isMatch = true;

        const matchData: Omit<Match, 'id'> = {
          user1Id: userId,
          user2Id: targetUserId,
          matchedAt: admin.firestore.FieldValue.serverTimestamp() as any,
          isActive: true
        };

        const matchDoc = await db.collection(Collections.MATCHES).add(matchData);
        matchId = matchDoc.id;

        context.log(`✨ Match created between ${userId} and ${targetUserId}`);
      }
    }

    return {
      status: 200,
      jsonBody: {
        success: true,
        liked,
        isMatch,
        matchId,
        message: isMatch ? '🎉 It\'s a match! You can now start chatting!' : 'Swipe recorded'
      }
    };
  } catch (error: any) {
    context.error('Error processing swipe:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to process swipe', details: error.message }
    };
  }
}

app.http('swipeMatch', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'matches/{userId}/swipe',
  handler: swipeMatch
});
