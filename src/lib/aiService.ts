// AI Service for ReddyFit - OpenAI Integration & Make.com Webhooks

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL || '';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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

// OpenAI Chat Completion
export async function sendChatMessage(
  message: string,
  userContext: UserContext,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // If Make.com webhook is configured, use that first
    if (MAKE_WEBHOOK_URL) {
      return await sendToMakeWebhook(message, userContext, conversationHistory);
    }

    // Otherwise use OpenAI directly
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert AI fitness coach for ReddyFit. You're helping ${userContext.name} reach their fitness goal.

**User Profile:**
- Name: ${userContext.name}
- Current Weight: ${userContext.currentWeight}kg
- Start Weight: ${userContext.startWeight}kg
- Target Weight: ${userContext.targetWeight}kg
- Goal: ${userContext.fitnessGoal}
- Fitness Level: ${userContext.currentLevel}
- Daily Calorie Target: ${userContext.dailyCalories} cal
- Daily Protein Target: ${userContext.dailyProtein}g

**Your Responsibilities:**
1. Provide personalized fitness and nutrition advice
2. Track progress and celebrate wins
3. Motivate and encourage during difficult times
4. Answer questions about workouts, meals, and recovery
5. Analyze progress photos and meal photos
6. Help with daily logging and accountability

**Response Style:**
- Be friendly, motivating, and supportive
- Use emojis appropriately 💪🔥
- Give actionable, specific advice
- Keep responses concise (2-4 paragraphs max)
- Use bullet points for lists
- Reference their specific goals and progress

**Current Progress:**
- Lost: ${(userContext.startWeight - userContext.currentWeight).toFixed(1)}kg
- Remaining: ${(userContext.currentWeight - userContext.targetWeight).toFixed(1)}kg
- Progress: ${(((userContext.startWeight - userContext.currentWeight) / (userContext.startWeight - userContext.targetWeight)) * 100).toFixed(1)}%`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for faster/cheaper
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-10), // Last 10 messages for context
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error calling AI service:', error);
    throw error;
  }
}

// Make.com Webhook Integration
async function sendToMakeWebhook(
  message: string,
  userContext: UserContext,
  conversationHistory: ChatMessage[]
): Promise<string> {
  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userContext,
        conversationHistory: conversationHistory.slice(-5), // Last 5 messages
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Make.com webhook error');
    }

    const data = await response.json();
    return data.response || data.message || 'Response received';

  } catch (error) {
    console.error('Error calling Make.com webhook:', error);
    throw error;
  }
}

// Audio transcription using Whisper API
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Whisper API error');
    }

    const data = await response.json();
    return data.text;

  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

// Image analysis using GPT-4 Vision
export async function analyzeProgressPhoto(
  imageBase64: string,
  userContext: UserContext,
  previousAnalysis?: any
): Promise<{
  bodyFat: number;
  muscleMass: string;
  posture: string;
  recommendations: string[];
  comparison?: string;
}> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this fitness progress photo for ${userContext.name}.

**Context:**
- Goal: ${userContext.fitnessGoal}
- Current Weight: ${userContext.currentWeight}kg
- Target Weight: ${userContext.targetWeight}kg
- Progress: ${(((userContext.startWeight - userContext.currentWeight) / (userContext.startWeight - userContext.targetWeight)) * 100).toFixed(1)}%

**Analyze:**
1. Estimated body fat percentage (be realistic)
2. Muscle mass/definition level (Beginner/Intermediate/Advanced)
3. Posture and alignment
4. Visible progress indicators (if comparing to previous)
5. 3 specific recommendations for improvement

**Response Format (JSON):**
{
  "bodyFat": 18,
  "muscleMass": "Intermediate - visible definition in shoulders and arms",
  "posture": "Good - straight spine, shoulders back",
  "recommendations": [
    "Focus on core exercises for abs definition",
    "Increase protein to 180g for better muscle retention",
    "Add HIIT cardio 2x per week"
  ],
  "comparison": "Noticeable reduction in midsection compared to previous photo"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Vision API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      bodyFat: 20,
      muscleMass: 'Analysis in progress',
      posture: 'Good alignment',
      recommendations: ['Keep up the great work!'],
    };

  } catch (error) {
    console.error('Error analyzing photo:', error);
    throw error;
  }
}

// Meal photo analysis
export async function analyzeMealPhoto(
  imageBase64: string,
  userContext: UserContext
): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  quality: number;
  foods: string[];
  recommendations: string[];
}> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this meal photo and estimate nutritional content.

**User Targets:**
- Daily Calories: ${userContext.dailyCalories} cal
- Daily Protein: ${userContext.dailyProtein}g

**Estimate:**
1. Total calories
2. Protein (grams)
3. Carbs (grams)
4. Fats (grams)
5. Meal quality rating (1-5)
6. List of foods identified
7. 2-3 recommendations

**Response Format (JSON):**
{
  "calories": 450,
  "protein": 35,
  "carbs": 40,
  "fats": 18,
  "quality": 4,
  "foods": ["Grilled chicken breast", "Brown rice", "Broccoli", "Olive oil"],
  "recommendations": [
    "Great protein source!",
    "Consider adding more vegetables",
    "Watch portion size on rice"
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Vision API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      calories: 400,
      protein: 30,
      carbs: 40,
      fats: 15,
      quality: 3,
      foods: ['Analysis in progress'],
      recommendations: ['Nutritional breakdown coming soon'],
    };

  } catch (error) {
    console.error('Error analyzing meal:', error);
    throw error;
  }
}

// Generate personalized workout plan
export async function generateWorkoutPlan(
  userContext: UserContext,
  preferences: {
    daysPerWeek: number;
    equipment: string[];
    focusAreas: string[];
  }
): Promise<{
  plan: Array<{
    day: string;
    focus: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      rest: string;
    }>;
  }>;
}> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Create a ${preferences.daysPerWeek}-day workout plan for ${userContext.name}.

**User Profile:**
- Goal: ${userContext.fitnessGoal}
- Level: ${userContext.currentLevel}
- Available Equipment: ${preferences.equipment.join(', ')}
- Focus Areas: ${preferences.focusAreas.join(', ')}

**Requirements:**
- Progressive overload
- Proper rest periods
- Balanced muscle groups
- Suitable for ${userContext.currentLevel} level

**Response Format (JSON):**
{
  "plan": [
    {
      "day": "Monday",
      "focus": "Push (Chest, Shoulders, Triceps)",
      "exercises": [
        {"name": "Bench Press", "sets": 4, "reps": "8-10", "rest": "2 min"},
        {"name": "Overhead Press", "sets": 3, "reps": "10-12", "rest": "90 sec"}
      ]
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse workout plan');

  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
}
