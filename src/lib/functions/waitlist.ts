import { collection, getDocs } from 'firebase/firestore';
import { db, Collections } from '../firebase';

/**
 * Calculate waitlist number for a user
 * Formula: 4x the number of registered users who submitted feedback
 *
 * @returns {Promise<number>} The waitlist position number
 */
export async function calculateWaitlistNumber(): Promise<number> {
  try {
    const feedbackCollection = collection(db, Collections.USER_FEEDBACK);
    const feedbackSnapshot = await getDocs(feedbackCollection);
    const actualCount = feedbackSnapshot.size + 1;
    const waitlistNumber = actualCount * 4;

    console.log('Waitlist calculation:', {
      actualCount,
      waitlistNumber,
      formula: 'actualCount * 4'
    });

    return waitlistNumber;
  } catch (error) {
    console.error('Error calculating waitlist number:', error);
    // Fallback to a default number if calculation fails
    return 1000;
  }
}
