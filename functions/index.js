const functions = require('firebase-functions');
const admin = require('firebase-admin');
const vision = require('@google-cloud/vision');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Vision API client
const visionClient = new vision.ImageAnnotatorClient();

/**
 * Cloud Function to label food images using Google Cloud Vision API
 * This function is secured - only authenticated users can call it
 */
exports.labelFoodImage = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use this function.'
    );
  }

  // Validate input
  if (!data.image) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Image data is required.'
    );
  }

  try {
    // Prepare the request for Cloud Vision API
    const request = {
      image: { content: data.image },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'TEXT_DETECTION', maxResults: 5 },
      ],
    };

    // Call Cloud Vision API
    const [result] = await visionClient.annotateImage(request);
    const labels = result.labelAnnotations || [];
    const texts = result.textAnnotations || [];

    // Extract food-related labels
    const foodKeywords = ['food', 'dish', 'meal', 'cuisine', 'ingredient', 'snack',
                          'breakfast', 'lunch', 'dinner', 'dessert', 'drink', 'beverage',
                          'fruit', 'vegetable', 'meat', 'dairy', 'bread', 'pasta',
                          'rice', 'salad', 'soup', 'sandwich', 'pizza', 'burger'];

    const isFoodDetected = labels.some(label =>
      foodKeywords.some(keyword =>
        label.description.toLowerCase().includes(keyword)
      )
    );

    // Get confidence score for food detection
    const foodLabels = labels.filter(label =>
      foodKeywords.some(keyword =>
        label.description.toLowerCase().includes(keyword)
      )
    );

    const maxConfidence = foodLabels.length > 0
      ? Math.max(...foodLabels.map(l => l.score))
      : 0;

    // Extract nutrition information from text (e.g., from nutrition labels)
    const nutritionText = texts.length > 0 ? texts[0].description : '';
    const hasNutritionLabel = /calories|protein|carb|fat/i.test(nutritionText);

    return {
      success: true,
      isFoodDetected,
      confidence: maxConfidence,
      labels: labels.map(label => ({
        description: label.description,
        score: label.score,
        isFoodRelated: foodKeywords.some(keyword =>
          label.description.toLowerCase().includes(keyword)
        ),
      })),
      hasNutritionLabel,
      nutritionText: hasNutritionLabel ? nutritionText : null,
      message: isFoodDetected
        ? `Detected: ${foodLabels.map(l => l.description).slice(0, 3).join(', ')}`
        : 'No food detected in this image',
    };
  } catch (error) {
    console.error('Vision API Error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to analyze image. Please try again.',
      error.message
    );
  }
});

/**
 * Additional function for nutrition label text extraction
 * Useful for packaged foods
 */
exports.extractNutritionLabel = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use this function.'
    );
  }

  if (!data.image) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Image data is required.'
    );
  }

  try {
    const request = {
      image: { content: data.image },
      features: [{ type: 'TEXT_DETECTION' }],
    };

    const [result] = await visionClient.annotateImage(request);
    const textAnnotations = result.textAnnotations || [];

    if (textAnnotations.length === 0) {
      return {
        success: false,
        message: 'No text detected in image',
      };
    }

    const fullText = textAnnotations[0].description;

    // Extract nutrition values using regex
    const extractValue = (pattern) => {
      const match = fullText.match(pattern);
      return match ? parseInt(match[1]) : null;
    };

    const nutrition = {
      calories: extractValue(/calories?\s*:?\s*(\d+)/i),
      protein: extractValue(/protein\s*:?\s*(\d+)/i),
      carbs: extractValue(/carb(?:ohydrate)?s?\s*:?\s*(\d+)/i),
      fat: extractValue(/(?:total\s+)?fat\s*:?\s*(\d+)/i),
      sodium: extractValue(/sodium\s*:?\s*(\d+)/i),
      fiber: extractValue(/fiber\s*:?\s*(\d+)/i),
    };

    const hasNutrition = Object.values(nutrition).some(v => v !== null);

    return {
      success: hasNutrition,
      nutrition,
      fullText,
      message: hasNutrition
        ? 'Nutrition information extracted successfully'
        : 'No nutrition information found in text',
    };
  } catch (error) {
    console.error('Text Extraction Error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to extract text from image.',
      error.message
    );
  }
});
