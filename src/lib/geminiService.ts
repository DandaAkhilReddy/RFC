// Google Gemini Vision API for Body Analysis - ReddyFit

// Support both browser (Vite) and Node.js (Worker) environments
const GEMINI_API_KEY = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_GEMINI_API_KEY || ''
  : process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface BodyAnalysis {
  bodyFat: number;
  muscleMass: string;
  posture: string;
  recommendations: string[];
  comparison?: string;
  faceAnalysis?: string;
}

export interface MealAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  quality: number;
  foods: string[];
  recommendations: string[];
}

export interface WorkoutAnalysis {
  exercise: string;
  calories: number;
  duration: number; // minutes
  distance?: number; // km
  intensity: 'Low' | 'Medium' | 'High';
  equipment?: string;
  notes: string;
  recommendations: string[];
}

export interface UserContext {
  name: string;
  email: string;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  fitnessGoal: string;
  currentLevel: string;
  dailyCalories: number;
  dailyProtein: number;
}

// Analyze progress photo using Gemini Vision
export async function analyzeProgressPhotoWithGemini(
  imageBase64: string,
  userContext: UserContext,
  previousAnalysis?: any
): Promise<BodyAnalysis> {
  try {
    // Remove data URL prefix if present
    const base64Image = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are an expert fitness coach and body composition analyst. Analyze this progress photo for ${userContext.name}.

**User Context:**
- Current Weight: ${userContext.currentWeight}kg
- Target Weight: ${userContext.targetWeight}kg
- Goal: ${userContext.fitnessGoal}
- Fitness Level: ${userContext.currentLevel}
- Progress: ${((userContext.startWeight - userContext.currentWeight) / (userContext.startWeight - userContext.targetWeight) * 100).toFixed(1)}%

**Analysis Required:**
1. **Body Fat Percentage**: Estimate realistic body fat % (10-35% range) based on:
   - Abdominal definition
   - Muscle striations visibility
   - Vascularity
   - Overall muscle definition
   - Face analysis (cheekbones, jawline definition)

2. **Muscle Mass Assessment**: Describe muscle development level with specific observations

3. **Posture Evaluation**: Analyze spine alignment, shoulder position, hip alignment

4. **Face Analysis**: Assess facial leanness, water retention, overall health indicators

5. **Specific Recommendations**: Provide 3-5 actionable tips for improvement

${previousAnalysis ? `\n**Previous Analysis**: Body fat was ${previousAnalysis.bodyFat}%. Compare and note changes.` : ''}

**Response Format (JSON only):**
{
  "bodyFat": <number between 10-35>,
  "muscleMass": "<detailed description>",
  "posture": "<posture analysis>",
  "faceAnalysis": "<face and overall health assessment>",
  "recommendations": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "comparison": "<if previous data available, note changes>"
}

Return ONLY valid JSON, no additional text.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        bodyFat: analysis.bodyFat || 20,
        muscleMass: analysis.muscleMass || 'Analysis in progress',
        posture: analysis.posture || 'Good alignment',
        faceAnalysis: analysis.faceAnalysis,
        recommendations: analysis.recommendations || ['Keep up the great work!'],
        comparison: analysis.comparison
      };
    }

    // Fallback if JSON parsing fails
    return {
      bodyFat: 20,
      muscleMass: 'Analysis in progress',
      posture: 'Good alignment',
      recommendations: ['Keep up the great work!'],
    };

  } catch (error) {
    console.error('Error analyzing photo with Gemini:', error);
    throw error;
  }
}

// Analyze meal photo using Gemini Vision
export async function analyzeMealPhotoWithGemini(
  imageBase64: string,
  userContext: UserContext
): Promise<MealAnalysis> {
  try {
    // Remove data URL prefix if present
    const base64Image = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are an expert nutritionist. Analyze this meal photo and estimate nutritional content.

**User Targets:**
- Daily Calories: ${userContext.dailyCalories} cal
- Daily Protein: ${userContext.dailyProtein}g
- Goal: ${userContext.fitnessGoal}

**Analysis Required:**
1. Identify all visible foods
2. Estimate portion sizes
3. Calculate total macros:
   - Calories (kcal)
   - Protein (grams)
   - Carbs (grams)
   - Fats (grams)
4. Rate meal quality (1-5 stars) based on:
   - Macro balance
   - Nutrient density
   - Portion control
   - Alignment with fitness goals
5. Provide 2-3 specific recommendations

**Response Format (JSON only):**
{
  "calories": <number>,
  "protein": <number>,
  "carbs": <number>,
  "fats": <number>,
  "quality": <1-5>,
  "foods": ["<food 1>", "<food 2>", ...],
  "recommendations": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

Return ONLY valid JSON, no additional text.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        calories: analysis.calories || 400,
        protein: analysis.protein || 30,
        carbs: analysis.carbs || 40,
        fats: analysis.fats || 15,
        quality: analysis.quality || 3,
        foods: analysis.foods || ['Analysis in progress'],
        recommendations: analysis.recommendations || ['Good meal choice!']
      };
    }

    // Fallback
    return {
      calories: 400,
      protein: 30,
      carbs: 40,
      fats: 15,
      quality: 3,
      foods: ['Analysis in progress'],
      recommendations: ['Nutritional breakdown coming soon']
    };

  } catch (error) {
    console.error('Error analyzing meal with Gemini:', error);
    throw error;
  }
}

// Analyze meal from voice/text description (no photo)
export async function analyzeMealFromText(
  mealDescription: string,
  userContext: UserContext
): Promise<MealAnalysis> {
  try {
    const prompt = `You are an expert nutritionist. A user said: "${mealDescription}"

**User Targets:**
- Daily Calories: ${userContext.dailyCalories} cal
- Daily Protein: ${userContext.dailyProtein}g
- Goal: ${userContext.fitnessGoal}

**Task:**
1. Identify all mentioned foods
2. Estimate realistic portion sizes based on typical servings
3. Calculate total macros:
   - Calories (kcal)
   - Protein (grams)
   - Carbs (grams)
   - Fats (grams)
4. Rate meal quality (1-5 stars) based on nutrition and goals
5. Provide 2-3 specific recommendations

**Examples:**
- "burger and fries" → Burger (1), French Fries (medium)
- "scrambled eggs and toast" → Eggs (2), Toast (2 slices), Butter
- "chicken salad" → Grilled Chicken Breast (150g), Mixed Greens, Dressing

**Response Format (JSON only):**
{
  "calories": <number>,
  "protein": <number>,
  "carbs": <number>,
  "fats": <number>,
  "quality": <1-5>,
  "foods": ["<food 1 with portion>", "<food 2 with portion>", ...],
  "recommendations": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

Return ONLY valid JSON, no additional text.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        calories: analysis.calories || 400,
        protein: analysis.protein || 30,
        carbs: analysis.carbs || 40,
        fats: analysis.fats || 15,
        quality: analysis.quality || 3,
        foods: analysis.foods || [mealDescription],
        recommendations: analysis.recommendations || ['Good meal choice!']
      };
    }

    // Fallback
    return {
      calories: 400,
      protein: 30,
      carbs: 40,
      fats: 15,
      quality: 3,
      foods: [mealDescription],
      recommendations: ['Nutritional breakdown estimated']
    };

  } catch (error) {
    console.error('Error analyzing meal text with Gemini:', error);
    throw error;
  }
}

// Analyze workout photo with Gemini Vision
export async function analyzeWorkoutPhotoWithGemini(
  imageBase64: string,
  userContext: UserContext
): Promise<WorkoutAnalysis> {
  try {
    // Remove data URL prefix if present
    const base64Image = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are an expert fitness trainer. Analyze this workout photo and extract workout data.

**User Context:**
- Goal: ${userContext.fitnessGoal}
- Current Weight: ${userContext.currentWeight}kg
- Fitness Level: ${userContext.currentLevel}

**Photo Analysis Task:**
1. **Identify Exercise Type**: What workout is shown?
   - Treadmill/Cardio machine display → Extract visible metrics
   - Gym equipment → Identify exercise (bench press, squats, etc.)
   - Person exercising → Identify activity
   - Fitness app screenshot → Parse workout data

2. **Extract Metrics** (if visible on display/screen):
   - Calories burned
   - Duration (minutes)
   - Distance (km, if applicable)
   - Speed/Pace (if shown)

3. **Estimate Missing Data** (if display not visible):
   - Estimate calories based on exercise type and typical duration
   - Estimate duration based on user's fitness level
   - Rate intensity: Low/Medium/High

4. **Equipment Identification**: What equipment/machine is used?

5. **Provide 2-3 recommendations** for improvement or variation

**Examples:**
- Treadmill display showing "450 CAL, 30:00, 5.2 KM" → Running, 450 cal, 30 min, 5.2 km
- Person doing bench press → Bench Press, ~200 cal, ~20 min (estimated), High intensity
- Cycling machine → Cycling, extract metrics from display

**Response Format (JSON only):**
{
  "exercise": "<exercise name>",
  "calories": <number>,
  "duration": <minutes as number>,
  "distance": <km as number or null>,
  "intensity": "Low" | "Medium" | "High",
  "equipment": "<equipment name or null>",
  "notes": "<brief description of what you see>",
  "recommendations": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

Return ONLY valid JSON, no additional text.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        exercise: analysis.exercise || 'Workout',
        calories: analysis.calories || 200,
        duration: analysis.duration || 30,
        distance: analysis.distance || undefined,
        intensity: analysis.intensity || 'Medium',
        equipment: analysis.equipment || undefined,
        notes: analysis.notes || 'Workout completed',
        recommendations: analysis.recommendations || ['Great job!']
      };
    }

    // Fallback
    return {
      exercise: 'Workout',
      calories: 200,
      duration: 30,
      intensity: 'Medium',
      notes: 'Workout analysis in progress',
      recommendations: ['Keep up the good work!']
    };

  } catch (error) {
    console.error('Error analyzing workout with Gemini:', error);
    throw error;
  }
}
