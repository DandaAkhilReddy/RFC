/**
 * Temporal Activities for Firebase Integration
 *
 * Handle Firebase Storage uploads and Firestore writes
 * with automatic retries
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { storage, db, Collections } from '../../lib/firebase';
import type { BodyAnalysis } from '../../lib/geminiService';

export interface UploadPhotoInput {
  userId: string;
  imageBase64: string;
  timestamp: number;
}

export interface SaveAnalysisInput {
  userId: string;
  analysis: BodyAnalysis;
  photoUrl: string;
  timestamp: number;
}

/**
 * Activity: Upload photo to Firebase Storage
 *
 * Converts base64 image to blob and uploads to user's folder
 */
export async function uploadPhotoToStorageActivity(input: UploadPhotoInput): Promise<string> {
  const { userId, imageBase64, timestamp } = input;

  console.log(`[Activity] Uploading photo for user: ${userId}`);

  try {
    // Convert base64 to blob
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Create storage reference
    const filename = `progress/${userId}/${timestamp}.jpg`;
    const storageRef = ref(storage, filename);

    // Upload file
    console.log(`[Activity] Uploading to: ${filename}`);
    const snapshot = await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`[Activity] Photo uploaded successfully: ${downloadURL}`);

    return downloadURL;
  } catch (error) {
    console.error('[Activity] Photo upload failed:', error);
    throw new Error(`Firebase Storage error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Activity: Save analysis results to Firestore
 *
 * Stores body fat analysis in user's document for historical tracking
 */
export async function saveAnalysisToFirestoreActivity(input: SaveAnalysisInput): Promise<void> {
  const { userId, analysis, photoUrl, timestamp } = input;

  console.log(`[Activity] Saving analysis for user: ${userId}`);

  try {
    // Create document data
    const analysisDoc = {
      userId,
      timestamp,
      photoUrl,
      bodyFat: analysis.bodyFat,
      muscleMass: analysis.muscleMass,
      posture: analysis.posture,
      faceAnalysis: analysis.faceAnalysis || '',
      recommendations: analysis.recommendations,
      comparison: analysis.comparison || '',
      createdAt: new Date(timestamp).toISOString(),
    };

    // Save to body-analysis collection
    const docId = `${userId}-${timestamp}`;
    await setDoc(doc(db, Collections.BODY_ANALYSIS, docId), analysisDoc);

    console.log(`[Activity] Analysis saved to Firestore: ${docId}`);

    // Update user's latest analysis
    const userRef = doc(db, Collections.USERS, userId);
    await setDoc(
      userRef,
      {
        latestBodyFat: analysis.bodyFat,
        latestAnalysisDate: new Date(timestamp).toISOString(),
        latestPhotoUrl: photoUrl,
      },
      { merge: true }
    );

    console.log('[Activity] User profile updated with latest analysis');
  } catch (error) {
    console.error('[Activity] Firestore save failed:', error);
    throw new Error(`Firestore error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Activity: Get previous analysis for comparison
 *
 * Retrieves user's last body fat analysis from Firestore
 */
export async function getPreviousAnalysisActivity(userId: string): Promise<BodyAnalysis | null> {
  console.log(`[Activity] Fetching previous analysis for user: ${userId}`);

  try {
    const userRef = doc(db, Collections.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log('[Activity] No previous analysis found');
      return null;
    }

    const userData = userDoc.data();
    if (!userData.latestBodyFat) {
      console.log('[Activity] No previous body fat data');
      return null;
    }

    // Return previous analysis data
    const previousAnalysis: BodyAnalysis = {
      bodyFat: userData.latestBodyFat,
      muscleMass: userData.latestMuscleMass || '',
      posture: userData.latestPosture || '',
      faceAnalysis: userData.latestFaceAnalysis || '',
      recommendations: userData.latestRecommendations || [],
      comparison: '',
    };

    console.log(`[Activity] Previous analysis found - Body Fat: ${previousAnalysis.bodyFat}%`);
    return previousAnalysis;
  } catch (error) {
    console.error('[Activity] Failed to fetch previous analysis:', error);
    // Return null instead of throwing - previous analysis is optional
    return null;
  }
}
