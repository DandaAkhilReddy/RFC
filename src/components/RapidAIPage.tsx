import { useState, useRef } from 'react';
import {
  Upload, Camera, X, CheckCircle2, ArrowRight, ArrowLeft,
  Zap, Brain, Dumbbell, Utensils, TrendingUp, Clock, Target,
  Home as HomeIcon, AlertCircle, Sparkles, Activity, Apple
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { storage, db, Collections } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AssessmentData {
  // Photos
  photos: string[];

  // Basic Info
  height: number;
  currentWeight: number;
  age: number;
  gender: string;

  // Workout Habits
  gymFrequency: string;
  preferredWorkoutTime: string;
  workHoursPerDay: number;
  workoutLocation: string;
  currentWorkoutRoutine: string;
  fitnessExperience: string;

  // Nutrition
  typicalFoods: string;
  breakfastDescription: string;
  lunchDescription: string;
  dinnerDescription: string;
  snacksDescription: string;
  proteinIntake: string;
  dietaryRestrictions: string;
  waterIntake: number;

  // Goals & Lifestyle
  primaryGoal: string;
  targetWeight: number;
  timeframe: string;
  sleepHours: number;
  activityLevel: string;
  injuries: string;
  medications: string;
}

export default function RapidAIPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<'intro' | 'upload' | 'assessment' | 'analyzing' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoURLs, setPhotoURLs] = useState<string[]>([]);
  const [assessmentData, setAssessmentData] = useState<Partial<AssessmentData>>({});
  const [estimatedBodyFat, setEstimatedBodyFat] = useState<number | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const questions = [
    // Basic Info (5 questions)
    {
      id: 'height',
      question: 'What is your height?',
      type: 'number',
      unit: 'cm',
      placeholder: '170',
      category: 'Basic Info'
    },
    {
      id: 'currentWeight',
      question: 'What is your current weight?',
      type: 'number',
      unit: 'kg',
      placeholder: '75',
      category: 'Basic Info'
    },
    {
      id: 'age',
      question: 'How old are you?',
      type: 'number',
      unit: 'years',
      placeholder: '30',
      category: 'Basic Info'
    },
    {
      id: 'gender',
      question: 'What is your gender?',
      type: 'select',
      options: ['Male', 'Female', 'Other'],
      category: 'Basic Info'
    },

    // Workout Habits (6 questions)
    {
      id: 'gymFrequency',
      question: 'How often do you go to the gym or workout?',
      type: 'select',
      options: ['Never', '1-2 times/week', '3-4 times/week', '5-6 times/week', 'Daily'],
      category: 'Workout Habits'
    },
    {
      id: 'preferredWorkoutTime',
      question: 'What time do you usually prefer to workout?',
      type: 'select',
      options: ['Early Morning (5-7 AM)', 'Morning (7-10 AM)', 'Afternoon (12-3 PM)', 'Evening (5-8 PM)', 'Night (8-11 PM)'],
      category: 'Workout Habits'
    },
    {
      id: 'workHoursPerDay',
      question: 'How many hours do you work per day?',
      type: 'number',
      unit: 'hours',
      placeholder: '8',
      category: 'Workout Habits'
    },
    {
      id: 'workoutLocation',
      question: 'Where do you prefer to workout?',
      type: 'select',
      options: ['Home - No Equipment', 'Home - Basic Equipment', 'Commercial Gym', 'Outdoor/Park', 'Flexible/Anywhere'],
      category: 'Workout Habits'
    },
    {
      id: 'fitnessExperience',
      question: 'What is your fitness experience level?',
      type: 'select',
      options: ['Complete Beginner', 'Some Experience (< 6 months)', 'Intermediate (6 months - 2 years)', 'Advanced (2+ years)', 'Athlete/Pro'],
      category: 'Workout Habits'
    },
    {
      id: 'currentWorkoutRoutine',
      question: 'Describe your current workout routine (if any)',
      type: 'textarea',
      placeholder: 'E.g., I do 30 minutes of cardio 3 times a week, some pushups and squats...',
      category: 'Workout Habits'
    },

    // Nutrition (8 questions)
    {
      id: 'typicalFoods',
      question: 'Describe the foods you eat most regularly',
      type: 'textarea',
      placeholder: 'E.g., I usually eat rice, chicken, vegetables, eggs, yogurt, fruits like apples and bananas...',
      category: 'Nutrition'
    },
    {
      id: 'breakfastDescription',
      question: 'What do you typically eat for breakfast?',
      type: 'textarea',
      placeholder: 'E.g., Oatmeal with banana and coffee, or eggs with toast...',
      category: 'Nutrition'
    },
    {
      id: 'lunchDescription',
      question: 'What do you typically eat for lunch?',
      type: 'textarea',
      placeholder: 'E.g., Chicken salad, rice with curry, sandwich...',
      category: 'Nutrition'
    },
    {
      id: 'dinnerDescription',
      question: 'What do you typically eat for dinner?',
      type: 'textarea',
      placeholder: 'E.g., Grilled fish with vegetables, pasta, soup...',
      category: 'Nutrition'
    },
    {
      id: 'snacksDescription',
      question: 'What snacks do you eat throughout the day?',
      type: 'textarea',
      placeholder: 'E.g., Nuts, protein bars, fruits, cookies...',
      category: 'Nutrition'
    },
    {
      id: 'proteinIntake',
      question: 'How would you describe your daily protein intake?',
      type: 'select',
      options: ['Very Low (rarely eat protein)', 'Low (1 serving/day)', 'Moderate (2-3 servings/day)', 'High (4+ servings/day)', 'Not sure'],
      category: 'Nutrition'
    },
    {
      id: 'dietaryRestrictions',
      question: 'Do you have any dietary restrictions or preferences?',
      type: 'textarea',
      placeholder: 'E.g., Vegetarian, vegan, lactose intolerant, allergic to nuts, halal, kosher, etc.',
      category: 'Nutrition'
    },
    {
      id: 'waterIntake',
      question: 'How many glasses of water do you drink daily?',
      type: 'number',
      unit: 'glasses',
      placeholder: '8',
      category: 'Nutrition'
    },

    // Goals & Lifestyle (7 questions)
    {
      id: 'primaryGoal',
      question: 'What is your primary fitness goal?',
      type: 'select',
      options: ['Lose Weight/Fat', 'Build Muscle/Strength', 'Improve Endurance', 'General Health', 'Athletic Performance', 'Maintain Current Fitness'],
      category: 'Goals'
    },
    {
      id: 'targetWeight',
      question: 'What is your target weight?',
      type: 'number',
      unit: 'kg',
      placeholder: '70',
      category: 'Goals'
    },
    {
      id: 'timeframe',
      question: 'What is your target timeframe?',
      type: 'select',
      options: ['1 month', '2-3 months', '3-6 months', '6-12 months', '1+ year', 'No specific timeframe'],
      category: 'Goals'
    },
    {
      id: 'sleepHours',
      question: 'How many hours do you sleep per night on average?',
      type: 'number',
      unit: 'hours',
      placeholder: '7',
      category: 'Lifestyle'
    },
    {
      id: 'activityLevel',
      question: 'How would you describe your daily activity level (outside of exercise)?',
      type: 'select',
      options: ['Sedentary (desk job, minimal movement)', 'Lightly Active (some walking)', 'Moderately Active (on feet often)', 'Very Active (physical job)'],
      category: 'Lifestyle'
    },
    {
      id: 'injuries',
      question: 'Do you have any current or past injuries we should know about?',
      type: 'textarea',
      placeholder: 'E.g., Bad knee, lower back pain, shoulder injury, etc. Or type "None"',
      category: 'Health'
    },
    {
      id: 'medications',
      question: 'Are you currently taking any medications or supplements?',
      type: 'textarea',
      placeholder: 'E.g., Protein powder, creatine, multivitamins, prescription meds, etc. Or type "None"',
      category: 'Health'
    }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartAssessment = async () => {
    if (uploadedPhotos.length === 0) {
      alert('Please upload at least one photo to continue');
      return;
    }

    // Upload photos to Firebase Storage
    const urls: string[] = [];
    for (const photo of uploadedPhotos) {
      const storageRef = ref(storage, `rapid_ai_photos/${user?.uid}/${Date.now()}_${photo.name}`);
      await uploadBytes(storageRef, photo);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    setPhotoURLs(urls);
    setAssessmentData(prev => ({ ...prev, photos: urls }));
    setStep('assessment');
  };

  const handleAnswerChange = (value: string | number) => {
    const question = questions[currentQuestion];
    setAssessmentData(prev => ({
      ...prev,
      [question.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // All questions answered, analyze
      analyzeAndGenerate();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const analyzeAndGenerate = async () => {
    setStep('analyzing');

    // TODO: Call Gemini Vision API to estimate body fat from photos
    // For now, mock the analysis
    setTimeout(async () => {
      const mockBodyFat = 18.5; // This should come from AI analysis
      setEstimatedBodyFat(mockBodyFat);

      // Save assessment to Firestore
      if (user?.uid) {
        await setDoc(doc(db, Collections.RAPID_AI_ASSESSMENTS, user.uid), {
          ...assessmentData,
          estimatedBodyFat: mockBodyFat,
          createdAt: new Date().toISOString(),
          userId: user.uid
        });
      }

      // Generate mock plan (should be AI-generated)
      const mockPlan = {
        mealPlan: 'Your personalized meal plan will be generated here based on your food preferences...',
        workoutPlan: 'Your personalized workout plan will be generated here based on your schedule and location...'
      };
      setGeneratedPlan(mockPlan);
      setStep('results');
    }, 3000);
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Intro Screen
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white mb-8 shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Rapid AI Fitness Planner</h1>
                <p className="text-purple-100 text-lg">Comprehensive Body Analysis & Personalized Plans</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Brain className="w-6 h-6 text-purple-600 mr-2" />
              How Rapid Works
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Upload Your Photos</h3>
                  <p className="text-gray-600 text-sm">
                    Upload photos of your current physique. Our AI will analyze your body composition to estimate body fat percentage.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Complete Comprehensive Assessment</h3>
                  <p className="text-gray-600 text-sm">
                    Answer 26 detailed questions covering your habits, nutrition, goals, and lifestyle. This takes about 5-7 minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Receive Your Personalized Plans</h3>
                  <p className="text-gray-600 text-sm">
                    Get a custom meal plan using the foods you already eat, and a workout plan designed for your schedule, location, and experience level.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('upload')}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Camera className="w-6 h-6" />
            <span>Start Assessment</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  // Photo Upload Screen
  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setStep('intro')}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Camera className="w-6 h-6 text-purple-600 mr-2" />
              Upload Your Photos
            </h2>
            <p className="text-gray-600 mb-6">
              Upload clear photos showing your current physique. Front, side, and back views work best for accurate body fat analysis.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-purple-300 rounded-xl p-12 hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
            >
              <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:text-purple-600" />
              <p className="text-gray-600 group-hover:text-purple-600 font-semibold">
                Click to upload photos
              </p>
              <p className="text-sm text-gray-400 mt-2">or drag and drop</p>
            </button>

            {uploadedPhotos.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-3">Uploaded Photos ({uploadedPhotos.length})</h3>
                <div className="grid grid-cols-3 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleStartAssessment}
              disabled={uploadedPhotos.length === 0}
              className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue to Assessment</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Assessment Questions
  if (step === 'assessment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600">{currentQ.category}</span>
              <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentQ.question}
            </h2>

            {currentQ.type === 'number' && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={assessmentData[currentQ.id as keyof AssessmentData] || ''}
                    onChange={(e) => handleAnswerChange(parseFloat(e.target.value))}
                    placeholder={currentQ.placeholder}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
                  />
                  {currentQ.unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {currentQ.unit}
                    </span>
                  )}
                </div>
              </div>
            )}

            {currentQ.type === 'select' && (
              <div className="space-y-3">
                {currentQ.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerChange(option)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      assessmentData[currentQ.id as keyof AssessmentData] === option
                        ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'textarea' && (
              <textarea
                value={assessmentData[currentQ.id as keyof AssessmentData] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={currentQ.placeholder}
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg resize-none"
              />
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-30 flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!assessmentData[currentQ.id as keyof AssessmentData]}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>{currentQuestion === questions.length - 1 ? 'Generate Plan' : 'Next'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analyzing Screen
  if (step === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl p-12 shadow-xl text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Analyzing Your Data...</h2>
          <p className="text-gray-600 mb-6">
            Our AI is analyzing your photos and responses to create your personalized fitness plan.
          </p>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Estimating body fat percentage from photos...</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Calculating your caloric and macro needs...</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Generating meal plan with your favorite foods...</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 animate-pulse">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>Creating personalized workout routine...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (step === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mr-3" />
              Your Personalized Fitness Plan is Ready!
            </h2>

            {/* Body Composition */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Body Composition Analysis</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Estimated Body Fat</p>
                  <p className="text-3xl font-bold text-purple-600">{estimatedBodyFat}%</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Current Weight</p>
                  <p className="text-3xl font-bold text-blue-600">{assessmentData.currentWeight} kg</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Target Weight</p>
                  <p className="text-3xl font-bold text-green-600">{assessmentData.targetWeight} kg</p>
                </div>
              </div>
            </div>

            {/* Meal Plan */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Utensils className="w-6 h-6 text-green-500 mr-2" />
                Your Personalized Meal Plan
              </h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700">{generatedPlan?.mealPlan}</p>
              </div>
            </div>

            {/* Workout Plan */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Dumbbell className="w-6 h-6 text-orange-500 mr-2" />
                Your Personalized Workout Plan
              </h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700">{generatedPlan?.workoutPlan}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setStep('intro');
                setCurrentQuestion(0);
                setUploadedPhotos([]);
                setAssessmentData({});
              }}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start New Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
