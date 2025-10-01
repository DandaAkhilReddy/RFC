/**
 * ReddyFit Storage Architecture
 *
 * FIRESTORE (Database) - Structured Data
 * - User profiles, settings, feedback
 * - Meal logs, workout logs
 * - Match data, chat messages
 *
 * AZURE BLOB STORAGE (Media Files)
 * - Profile pictures, cover photos
 * - Meal photos, workout photos
 * - Progress photos
 */

import { BlobServiceClient } from '@azure/storage-blob';
import { db, Collections } from './firebase';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Azure Blob Storage Configuration
const AZURE_STORAGE_CONNECTION_STRING = import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING || '';
const AZURE_STORAGE_ACCOUNT_NAME = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME || 'reddyfitstorage';

// Container names for organized storage
export const BlobContainers = {
  PROFILE_PICTURES: 'profile-pictures',
  COVER_PHOTOS: 'cover-photos',
  MEAL_PHOTOS: 'meal-photos',
  WORKOUT_PHOTOS: 'workout-photos',
  PROGRESS_PHOTOS: 'progress-photos',
  CHAT_ATTACHMENTS: 'chat-attachments'
};

/**
 * Firestore Collections Structure:
 *
 * users/
 *   {userEmail}/
 *     - Basic auth info
 *     - Created/updated timestamps
 *
 * user_settings/
 *   {userEmail}/
 *     - Personal info (name, age, gender, height, weight, BMI, BMR)
 *     - Fitness preferences (goals, workout times, diet preferences)
 *     - Notification settings
 *     - FitBuddy personality settings
 *     - Profile/cover picture URLs (pointing to Azure Blob)
 *
 * user_feedback/
 *   {userEmail}/
 *     - Feature expectations
 *     - Feature ideas and suggestions
 *     - Notification preferences
 *     - FitBuddy behavior preferences
 *     - Recommendations and comments
 *
 * meals/
 *   {mealId}/
 *     - User email
 *     - Meal type (breakfast, lunch, dinner, snack)
 *     - Date and time
 *     - Calories, protein, carbs, fats
 *     - Food items
 *     - Photo URL (Azure Blob)
 *
 * workouts/
 *   {workoutId}/
 *     - User email
 *     - Workout type
 *     - Duration, exercises
 *     - Date and time
 *     - Photo URLs (Azure Blob)
 *
 * matches/
 *   {userEmail}_{date}/
 *     - Matched user info
 *     - Match score
 *     - Common interests
 *     - Match status
 *
 * chat_messages/
 *   {chatId}/
 *     messages/
 *       {messageId}/
 *         - Sender, receiver
 *         - Message content
 *         - Timestamp
 *         - Attachment URLs (Azure Blob)
 */

// Initialize Azure Blob Service Client
let blobServiceClient: BlobServiceClient | null = null;

export const initAzureBlobStorage = async () => {
  try {
    if (AZURE_STORAGE_CONNECTION_STRING) {
      blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    } else {
      // Use account name for anonymous access or SAS token
      const accountUrl = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;
      blobServiceClient = new BlobServiceClient(accountUrl);
    }

    // Create containers if they don't exist
    for (const containerName of Object.values(BlobContainers)) {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      await containerClient.createIfNotExists({ access: 'blob' });
    }

    console.log('Azure Blob Storage initialized successfully');
  } catch (error) {
    console.error('Error initializing Azure Blob Storage:', error);
  }
};

/**
 * Upload image to Azure Blob Storage with organized folder structure
 */
export const uploadImageToAzure = async (
  file: File,
  containerName: string,
  userEmail: string,
  fileName?: string
): Promise<string> => {
  if (!blobServiceClient) {
    await initAzureBlobStorage();
  }

  if (!blobServiceClient) {
    throw new Error('Azure Blob Storage not initialized');
  }

  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create organized folder structure: users/{userEmail}/{timestamp}_{filename}
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const blobName = fileName
      ? `users/${userEmail}/${fileName}`
      : `users/${userEmail}/${timestamp}.${fileExtension}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload with content type
    await blockBlobClient.uploadData(file, {
      blobHTTPHeaders: {
        blobContentType: file.type
      }
    });

    // Return the URL
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to Azure Blob:', error);
    throw error;
  }
};

/**
 * Save user profile with references to Azure Blob images
 */
export const saveUserProfile = async (userEmail: string, profileData: any) => {
  const docRef = doc(db, Collections.USER_SETTINGS, userEmail);
  await setDoc(docRef, {
    ...profileData,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

/**
 * Save user feedback
 */
export const saveUserFeedback = async (userEmail: string, feedbackData: any) => {
  const docRef = doc(db, Collections.USER_FEEDBACK, userEmail);
  await setDoc(docRef, {
    ...feedbackData,
    userEmail,
    submittedAt: serverTimestamp(),
    version: '1.0'
  });
};

/**
 * Log a meal with photo in Azure Blob
 */
export const logMeal = async (
  userEmail: string,
  mealData: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    items: string[];
    photo?: File;
  }
) => {
  let photoUrl = '';

  // Upload photo to Azure Blob if provided
  if (mealData.photo) {
    photoUrl = await uploadImageToAzure(
      mealData.photo,
      BlobContainers.MEAL_PHOTOS,
      userEmail
    );
  }

  // Save meal data to Firestore
  const mealsCollection = collection(db, Collections.MEALS);
  await addDoc(mealsCollection, {
    userEmail,
    type: mealData.type,
    name: mealData.name,
    calories: mealData.calories,
    protein: mealData.protein,
    carbs: mealData.carbs,
    fats: mealData.fats,
    items: mealData.items,
    photoUrl,
    date: new Date().toISOString().split('T')[0],
    timestamp: serverTimestamp()
  });
};

/**
 * Log a workout with photos in Azure Blob
 */
export const logWorkout = async (
  userEmail: string,
  workoutData: {
    type: string;
    duration: number;
    exercises: string[];
    photos?: File[];
  }
) => {
  const photoUrls: string[] = [];

  // Upload photos to Azure Blob if provided
  if (workoutData.photos && workoutData.photos.length > 0) {
    for (const photo of workoutData.photos) {
      const url = await uploadImageToAzure(
        photo,
        BlobContainers.WORKOUT_PHOTOS,
        userEmail
      );
      photoUrls.push(url);
    }
  }

  // Save workout data to Firestore
  const workoutsCollection = collection(db, Collections.WORKOUTS);
  await addDoc(workoutsCollection, {
    userEmail,
    type: workoutData.type,
    duration: workoutData.duration,
    exercises: workoutData.exercises,
    photoUrls,
    date: new Date().toISOString().split('T')[0],
    timestamp: serverTimestamp()
  });
};

/**
 * Save progress photos
 */
export const saveProgressPhoto = async (userEmail: string, photo: File, notes?: string) => {
  const photoUrl = await uploadImageToAzure(
    photo,
    BlobContainers.PROGRESS_PHOTOS,
    userEmail,
    `progress_${Date.now()}.jpg`
  );

  // Save reference in Firestore
  const progressCollection = collection(db, 'progress_photos');
  await addDoc(progressCollection, {
    userEmail,
    photoUrl,
    notes: notes || '',
    date: new Date().toISOString().split('T')[0],
    timestamp: serverTimestamp()
  });

  return photoUrl;
};

/**
 * Data Export Structure for Admin/Analytics
 */
export interface DataExportStructure {
  firestore: {
    users: string;
    userSettings: string;
    userFeedback: string;
    meals: string;
    workouts: string;
    matches: string;
    chatMessages: string;
  };
  azureBlob: {
    profilePictures: string;
    coverPhotos: string;
    mealPhotos: string;
    workoutPhotos: string;
    progressPhotos: string;
    chatAttachments: string;
  };
}

export const DATA_ARCHITECTURE: DataExportStructure = {
  firestore: {
    users: 'users/{userEmail}',
    userSettings: 'user_settings/{userEmail}',
    userFeedback: 'user_feedback/{userEmail}',
    meals: 'meals/{mealId}',
    workouts: 'workouts/{workoutId}',
    matches: 'matches/{userEmail}_{date}',
    chatMessages: 'chat_messages/{chatId}/messages/{messageId}'
  },
  azureBlob: {
    profilePictures: 'profile-pictures/users/{userEmail}/',
    coverPhotos: 'cover-photos/users/{userEmail}/',
    mealPhotos: 'meal-photos/users/{userEmail}/',
    workoutPhotos: 'workout-photos/users/{userEmail}/',
    progressPhotos: 'progress-photos/users/{userEmail}/',
    chatAttachments: 'chat-attachments/users/{userEmail}/'
  }
};
