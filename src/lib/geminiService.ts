// Google Gemini Vision API for Body Analysis - ReddyFit

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
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
