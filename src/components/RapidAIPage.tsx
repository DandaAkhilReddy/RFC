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
import { analyzeProgressPhotoWithGemini } from '../lib/geminiService';

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
  const [photoAnalyses, setPhotoAnalyses] = useState<any[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const questions = [
    // Basic Info (4 questions)
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

    // Workout Habits (2 questions)
    {
      id: 'gymFrequency',
      question: 'How often do you go to the gym or workout?',
      type: 'select',
      options: ['Never', '1-2 times/week', '3-4 times/week', '5-6 times/week', 'Daily'],
      category: 'Workout'
    },
    {
      id: 'fitnessExperience',
      question: 'What is your fitness experience level?',
      type: 'select',
      options: ['Complete Beginner', 'Some Experience (< 6 months)', 'Intermediate (6 months - 2 years)', 'Advanced (2+ years)', 'Athlete/Pro'],
      category: 'Workout'
    },

    // Goals (2 questions)
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

    // Lifestyle (2 questions)
    {
      id: 'activityLevel',
      question: 'How would you describe your daily activity level (outside of exercise)?',
      type: 'select',
      options: ['Sedentary (desk job, minimal movement)', 'Lightly Active (some walking)', 'Moderately Active (on feet often)', 'Very Active (physical job)'],
      category: 'Lifestyle'
    },
    {
      id: 'sleepHours',
      question: 'How many hours do you sleep per night on average?',
      type: 'number',
      unit: 'hours',
      placeholder: '7',
      category: 'Lifestyle'
    }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedPhotos([file]); // Only keep the latest photo
    }
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

    try {
      // Prepare user context for Gemini API
      const userContext = {
        name: user?.displayName || 'User',
        email: user?.email || '',
        startWeight: assessmentData.currentWeight || 70,
        currentWeight: assessmentData.currentWeight || 70,
        targetWeight: assessmentData.targetWeight || 65,
        fitnessGoal: assessmentData.primaryGoal || 'General Health',
        currentLevel: assessmentData.fitnessExperience || 'Beginner',
        dailyCalories: 2000,
        dailyProtein: 150
      };

      // Analyze each photo with Gemini Vision API
      const analyses = [];
      const bodyFatEstimates = [];

      for (let i = 0; i < photoURLs.length; i++) {
        try {
          // Fetch the image and convert to base64
          const response = await fetch(photoURLs[i]);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          // Analyze with Gemini
          const analysis = await analyzeProgressPhotoWithGemini(base64, userContext);
          analyses.push({ photoIndex: i + 1, ...analysis });
          bodyFatEstimates.push(analysis.bodyFat);
        } catch (error) {
          console.error(`Error analyzing photo ${i + 1}:`, error);
          // Continue with other photos even if one fails
        }
      }

      // Calculate average body fat from all photos
      const avgBodyFat = bodyFatEstimates.length > 0
        ? Math.round(bodyFatEstimates.reduce((a, b) => a + b, 0) / bodyFatEstimates.length * 10) / 10
        : 20;

      setEstimatedBodyFat(avgBodyFat);
      setPhotoAnalyses(analyses);

      // Save assessment to Firestore
      if (user?.uid) {
        await setDoc(doc(db, Collections.RAPID_AI_ASSESSMENTS, user.uid), {
          ...assessmentData,
          estimatedBodyFat: avgBodyFat,
          photoAnalyses: analyses,
          createdAt: new Date().toISOString(),
          userId: user.uid
        });
      }

      setStep('results');
    } catch (error) {
      console.error('Error during analysis:', error);
      alert('Error analyzing photos. Please try again.');
      setStep('assessment');
    }
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
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">Body Fat Percentage Checker</h1>
                  <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full">BETA</span>
                </div>
                <p className="text-purple-100 text-lg">AI-Powered Body Composition Analysis</p>
              </div>
            </div>

            {/* Beta Disclaimer */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-semibold mb-1">🧪 Beta Version - Accuracy Notice</p>
                  <p className="text-purple-100">
                    This AI-powered body composition analysis tool provides estimates based on your photo and data. Results are for
                    informational purposes only and should not replace professional medical advice or body composition testing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Brain className="w-6 h-6 text-purple-600 mr-2" />
              How It Works
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Upload Your Photo</h3>
                  <p className="text-gray-600 text-sm">
                    Upload a clear photo of yourself (front view recommended). Our AI will analyze your body composition.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Quick Assessment</h3>
                  <p className="text-gray-600 text-sm">
                    Answer basic questions about your height, weight, age, and fitness background to help calibrate the AI analysis.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Get Body Fat Estimate</h3>
                  <p className="text-gray-600 text-sm">
                    Receive AI-estimated body fat percentage with analysis. Full meal & workout plans coming soon with our Llama-powered agent!
                  </p>
                </div>
              </div>
            </div>

            {/* Coming Soon Banner */}
            <div className="mt-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h4 className="font-bold text-orange-900">🚀 Coming Soon: Full AI Fitness Agent</h4>
              </div>
              <p className="text-sm text-orange-800">
                We're training custom Llama models on 10M+ fitness datasets to provide personalized meal plans, workout routines,
                and comprehensive fitness coaching. Stay tuned!
              </p>
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
            <p className="text-gray-600 mb-4">
              Upload 1-3 clear photos showing your current physique. Front, side, and back views work best for accurate body fat analysis.
            </p>

            {/* Photo Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-blue-900 mb-2 text-sm">📸 Photo Quality Tips:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Good lighting (natural light preferred)</li>
                <li>• Form-fitting clothing or shirtless for males</li>
                <li>• Stand 6-8 feet from camera</li>
                <li>• Neutral posture (relaxed, arms at sides)</li>
                <li>• Front view recommended for best results</li>
              </ul>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-purple-300 rounded-xl p-12 hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
            >
              <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:text-purple-600" />
              <p className="text-gray-600 group-hover:text-purple-600 font-semibold">
                Click to upload your photo
              </p>
              <p className="text-sm text-gray-400 mt-2">JPG, PNG (max 10MB)</p>
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
          {/* Beta Notice */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h4 className="font-bold text-yellow-900">Beta Results - For Informational Purposes Only</h4>
                <p className="text-sm text-yellow-800">These AI-generated estimates should not replace professional body composition analysis or medical advice.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mr-3" />
              Body Fat Analysis Complete!
            </h2>

            {/* Body Composition */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Body Composition Analysis</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Avg Body Fat Estimate</p>
                  <p className="text-4xl font-bold text-purple-600">{estimatedBodyFat}%</p>
                  <p className="text-xs text-gray-500 mt-1">From {photoAnalyses.length} photo{photoAnalyses.length !== 1 ? 's' : ''}</p>
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

              {/* Individual Photo Analysis */}
              {photoAnalyses.length > 1 && (
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">Per-Photo Analysis:</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {photoAnalyses.map((analysis, idx) => (
                      <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Photo {analysis.photoIndex}</p>
                        <p className="text-2xl font-bold text-purple-600">{analysis.bodyFat}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Analysis */}
            {photoAnalyses.length > 0 && (
              <div className="mb-6 space-y-4">
                {photoAnalyses.map((analysis, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-3">Photo {analysis.photoIndex} Analysis:</h4>
                    <div className="space-y-3 text-sm">
                      {analysis.muscleMass && (
                        <div>
                          <span className="font-semibold text-gray-700">Muscle Mass:</span>
                          <p className="text-gray-600 mt-1">{analysis.muscleMass}</p>
                        </div>
                      )}
                      {analysis.posture && (
                        <div>
                          <span className="font-semibold text-gray-700">Posture:</span>
                          <p className="text-gray-600 mt-1">{analysis.posture}</p>
                        </div>
                      )}
                      {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <div>
                          <span className="font-semibold text-gray-700">Recommendations:</span>
                          <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                            {analysis.recommendations.map((rec: string, i: number) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Coming Soon Banner */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-6 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <h3 className="font-bold text-orange-900 text-lg">🚀 Full AI Agent Coming Soon!</h3>
              </div>
              <p className="text-orange-800 mb-3">
                We're developing a comprehensive AI fitness agent powered by custom-trained Llama models with 10M+ datasets from Hugging Face and Tinker API.
              </p>
              <p className="text-sm text-orange-700 font-semibold">
                Future features: Personalized meal plans, custom workout routines, progress tracking, and real-time coaching!
              </p>
            </div>

            <button
              onClick={() => {
                setStep('intro');
                setCurrentQuestion(0);
                setUploadedPhotos([]);
                setPhotoURLs([]);
                setAssessmentData({});
                setPhotoAnalyses([]);
                setEstimatedBodyFat(null);
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
