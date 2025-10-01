import React, { useState, useEffect } from 'react';
import {
  User,
  Camera,
  Save,
  ArrowLeft,
  Weight,
  Ruler,
  Cake,
  Activity,
  Target,
  Dumbbell,
  Utensils,
  Heart,
  TrendingUp,
  AlertCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db, Collections } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { uploadImageToAzure, BlobContainers } from '../lib/storage';

interface UserSettings {
  // Personal Info
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // in kg
  height: number; // in cm
  profilePicture: string;
  coverPicture: string;

  // Body Metrics
  bmr: number;
  bmi: number;
  bodyFat?: number;
  muscleMass?: number;

  // Fitness Questionnaire (Core 50% usage questions)
  fitnessGoal: string;
  currentFitnessLevel: string;
  workoutFrequency: string;
  preferredWorkoutTime: string;
  workoutLocation: string;

  // Diet & Nutrition
  dietaryPreference: string;
  allergies: string;
  mealsPerDay: number;
  waterIntake: number;
  nutritionGoal: string;

  // Health & Lifestyle
  sleepHours: number;
  stressLevel: string;
  medicalConditions: string;
  injuries: string;
  activityLevel: string;

  // Motivation & Commitment
  primaryMotivation: string;
  biggestChallenge: string;
  commitmentLevel: string;
  previousExperience: string;

  // Target Goals
  targetWeight: number;
  targetBodyFat?: number;
  timeframe: string;
  specificGoals: string[];
}

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'fitness' | 'nutrition' | 'health' | 'goals'>('personal');
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    fullName: user?.displayName || '',
    age: 25,
    gender: 'male',
    weight: 70,
    height: 170,
    profilePicture: user?.photoURL || '',
    coverPicture: '',
    bmr: 0,
    bmi: 0,
    fitnessGoal: '',
    currentFitnessLevel: '',
    workoutFrequency: '',
    preferredWorkoutTime: '',
    workoutLocation: '',
    dietaryPreference: '',
    allergies: '',
    mealsPerDay: 3,
    waterIntake: 8,
    nutritionGoal: '',
    sleepHours: 7,
    stressLevel: '',
    medicalConditions: '',
    injuries: '',
    activityLevel: '',
    primaryMotivation: '',
    biggestChallenge: '',
    commitmentLevel: '',
    previousExperience: '',
    targetWeight: 65,
    timeframe: '',
    specificGoals: []
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  useEffect(() => {
    // Calculate BMR and BMI when weight/height/age/gender changes
    calculateMetrics();
  }, [settings.weight, settings.height, settings.age, settings.gender]);

  const loadSettings = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const docRef = doc(db, Collections.USER_SETTINGS, user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSettings({ ...settings, ...docSnap.data() });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const { weight, height, age, gender } = settings;

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    setSettings(prev => ({
      ...prev,
      bmi: parseFloat(bmi.toFixed(1)),
      bmr: Math.round(bmr)
    }));
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
    console.log(`[SettingsPage] Starting ${type} image upload:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    if (!user?.email) {
      console.error('[SettingsPage] No user email - cannot upload');
      alert('❌ User not authenticated. Please sign in again.');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.error('[SettingsPage] Invalid file type:', file.type);
      alert('❌ Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      console.error('[SettingsPage] File too large:', file.size);
      alert(`❌ File size must be under 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
      return;
    }

    const setUploading = type === 'profile' ? setUploadingProfile : setUploadingCover;
    setUploading(true);

    try {
      console.log(`[SettingsPage] Step 1: Determining container for ${type} photo`);
      const containerName = type === 'profile'
        ? BlobContainers.PROFILE_PICTURES
        : BlobContainers.COVER_PHOTOS;

      console.log(`[SettingsPage] Step 2: Uploading to container:`, containerName);
      const fileName = `${type}_${Date.now()}.jpg`;
      const downloadURL = await uploadImageToAzure(file, containerName, user.email, fileName);

      console.log(`[SettingsPage] Step 3: Upload successful, URL:`, downloadURL);

      if (type === 'profile') {
        setSettings(prev => ({ ...prev, profilePicture: downloadURL }));
      } else {
        setSettings(prev => ({ ...prev, coverPicture: downloadURL }));
      }

      console.log(`[SettingsPage] ✅ ${type} photo updated successfully`);
      alert(`✅ ${type === 'profile' ? 'Profile' : 'Cover'} photo uploaded successfully!`);
    } catch (error: any) {
      console.error(`[SettingsPage] ❌ Error uploading ${type} image:`, error);
      console.error('[SettingsPage] Error code:', error.code);
      console.error('[SettingsPage] Error message:', error.message);

      let errorMessage = 'An unexpected error occurred.';
      if (error.message?.includes('Failed to upload')) {
        errorMessage = 'Failed to upload to storage. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`❌ Failed to upload ${type} photo\n\n${errorMessage}\n\nPlease try again or contact support.`);
    } finally {
      setUploading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.email) return;

    setSaving(true);
    try {
      const docRef = doc(db, Collections.USER_SETTINGS, user.email);
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGoalToggle = (goal: string) => {
    setSettings(prev => ({
      ...prev,
      specificGoals: prev.specificGoals.includes(goal)
        ? prev.specificGoals.filter(g => g !== goal)
        : [...prev.specificGoals, goal]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Cover Photo */}
        <div className="relative mb-8">
          <div className="h-48 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl overflow-hidden">
            {settings.coverPicture ? (
              <img src={settings.coverPicture} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-white opacity-50" />
              </div>
            )}
          </div>
          <label className="absolute bottom-4 right-4 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
              disabled={uploadingCover}
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <Camera className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">
                {uploadingCover ? 'Uploading...' : 'Change Cover'}
              </span>
            </div>
          </label>

          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
                {settings.profilePicture ? (
                  <img src={settings.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-100">
                    <User className="w-16 h-16 text-orange-600" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                  disabled={uploadingProfile}
                />
                <div className="p-2 bg-orange-600 rounded-full shadow-lg hover:bg-orange-700 transition-colors">
                  {uploadingProfile ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-20">
          {/* Section Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'fitness', label: 'Fitness Profile', icon: Dumbbell },
              { id: 'nutrition', label: 'Nutrition', icon: Utensils },
              { id: 'health', label: 'Health & Lifestyle', icon: Heart },
              { id: 'goals', label: 'Goals & Targets', icon: Target }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeSection === id
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>

          {/* Personal Info Section */}
          {activeSection === 'personal' && (
            <div className="bg-white rounded-xl p-6 shadow-lg space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={settings.fullName}
                    onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={settings.age}
                      onChange={(e) => setSettings({ ...settings, age: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={settings.gender}
                    onChange={(e) => setSettings({ ...settings, gender: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={settings.weight}
                      onChange={(e) => setSettings({ ...settings, weight: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={settings.height}
                      onChange={(e) => setSettings({ ...settings, height: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">BMI (Body Mass Index)</p>
                  <p className="text-2xl font-bold text-orange-600">{settings.bmi}</p>
                  <p className="text-xs text-gray-500">
                    {settings.bmi < 18.5 ? 'Underweight' : settings.bmi < 25 ? 'Normal' : settings.bmi < 30 ? 'Overweight' : 'Obese'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">BMR (Basal Metabolic Rate)</p>
                  <p className="text-2xl font-bold text-orange-600">{settings.bmr} cal/day</p>
                  <p className="text-xs text-gray-500">Calories burned at rest</p>
                </div>
              </div>
            </div>
          )}

          {/* Fitness Profile Section */}
          {activeSection === 'fitness' && (
            <div className="bg-white rounded-xl p-6 shadow-lg space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Fitness Profile</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Fitness Goal</label>
                  <select
                    value={settings.fitnessGoal}
                    onChange={(e) => setSettings({ ...settings, fitnessGoal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select your goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="athletic_performance">Athletic Performance</option>
                    <option value="general_fitness">General Fitness</option>
                    <option value="body_recomposition">Body Recomposition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Fitness Level</label>
                  <select
                    value={settings.currentFitnessLevel}
                    onChange={(e) => setSettings({ ...settings, currentFitnessLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select your level</option>
                    <option value="beginner">Beginner (0-6 months experience)</option>
                    <option value="intermediate">Intermediate (6 months - 2 years)</option>
                    <option value="advanced">Advanced (2+ years)</option>
                    <option value="athlete">Athlete/Competitive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workout Frequency (per week)</label>
                  <select
                    value={settings.workoutFrequency}
                    onChange={(e) => setSettings({ ...settings, workoutFrequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select frequency</option>
                    <option value="1-2">1-2 days per week</option>
                    <option value="3-4">3-4 days per week</option>
                    <option value="5-6">5-6 days per week</option>
                    <option value="daily">Daily (7 days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Workout Time</label>
                  <select
                    value={settings.preferredWorkoutTime}
                    onChange={(e) => setSettings({ ...settings, preferredWorkoutTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    <option value="early_morning">Early Morning (5-7 AM)</option>
                    <option value="morning">Morning (7-10 AM)</option>
                    <option value="afternoon">Afternoon (12-3 PM)</option>
                    <option value="evening">Evening (5-8 PM)</option>
                    <option value="night">Night (8-11 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workout Location</label>
                  <select
                    value={settings.workoutLocation}
                    onChange={(e) => setSettings({ ...settings, workoutLocation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select location</option>
                    <option value="gym">Gym</option>
                    <option value="home">Home</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="mixed">Mixed (Gym + Home)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                  <select
                    value={settings.activityLevel}
                    onChange={(e) => setSettings({ ...settings, activityLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary (little to no exercise)</option>
                    <option value="light">Lightly Active (1-3 days/week)</option>
                    <option value="moderate">Moderately Active (3-5 days/week)</option>
                    <option value="very_active">Very Active (6-7 days/week)</option>
                    <option value="extra_active">Extra Active (physical job + exercise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Exercise Experience</label>
                  <textarea
                    value={settings.previousExperience}
                    onChange={(e) => setSettings({ ...settings, previousExperience: e.target.value })}
                    rows={3}
                    placeholder="Tell us about your fitness background, sports you've played, exercises you've done..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Nutrition Section */}
          {activeSection === 'nutrition' && (
            <div className="bg-white rounded-xl p-6 shadow-lg space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nutrition & Diet</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
                  <select
                    value={settings.dietaryPreference}
                    onChange={(e) => setSettings({ ...settings, dietaryPreference: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select preference</option>
                    <option value="omnivore">Omnivore (All foods)</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="keto">Keto</option>
                    <option value="paleo">Paleo</option>
                    <option value="low_carb">Low Carb</option>
                    <option value="mediterranean">Mediterranean</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Food Allergies / Restrictions</label>
                  <textarea
                    value={settings.allergies}
                    onChange={(e) => setSettings({ ...settings, allergies: e.target.value })}
                    rows={2}
                    placeholder="List any allergies, intolerances, or foods you avoid..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meals Per Day</label>
                  <select
                    value={settings.mealsPerDay}
                    onChange={(e) => setSettings({ ...settings, mealsPerDay: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="2">2 meals</option>
                    <option value="3">3 meals</option>
                    <option value="4">4 meals</option>
                    <option value="5">5 meals</option>
                    <option value="6">6 meals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Water Intake (glasses)</label>
                  <input
                    type="number"
                    value={settings.waterIntake}
                    onChange={(e) => setSettings({ ...settings, waterIntake: parseInt(e.target.value) || 8 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 8-10 glasses per day</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nutrition Goal</label>
                  <select
                    value={settings.nutritionGoal}
                    onChange={(e) => setSettings({ ...settings, nutritionGoal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select goal</option>
                    <option value="calorie_deficit">Calorie Deficit (Weight Loss)</option>
                    <option value="calorie_surplus">Calorie Surplus (Muscle Gain)</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="lean_bulk">Lean Bulk</option>
                    <option value="cutting">Cutting (Fat Loss)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Health & Lifestyle Section */}
          {activeSection === 'health' && (
            <div className="bg-white rounded-xl p-6 shadow-lg space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Health & Lifestyle</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Average Sleep Hours</label>
                  <input
                    type="number"
                    value={settings.sleepHours}
                    onChange={(e) => setSettings({ ...settings, sleepHours: parseFloat(e.target.value) || 7 })}
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 7-9 hours per night</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stress Level</label>
                  <select
                    value={settings.stressLevel}
                    onChange={(e) => setSettings({ ...settings, stressLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select level</option>
                    <option value="low">Low (Minimal stress)</option>
                    <option value="moderate">Moderate (Manageable stress)</option>
                    <option value="high">High (Significant stress)</option>
                    <option value="very_high">Very High (Overwhelming stress)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                  <textarea
                    value={settings.medicalConditions}
                    onChange={(e) => setSettings({ ...settings, medicalConditions: e.target.value })}
                    rows={3}
                    placeholder="List any medical conditions, medications, or health concerns..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    This helps us provide safer recommendations
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Injuries or Limitations</label>
                  <textarea
                    value={settings.injuries}
                    onChange={(e) => setSettings({ ...settings, injuries: e.target.value })}
                    rows={3}
                    placeholder="List any injuries, pain points, or physical limitations..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Motivation</label>
                  <textarea
                    value={settings.primaryMotivation}
                    onChange={(e) => setSettings({ ...settings, primaryMotivation: e.target.value })}
                    rows={3}
                    placeholder="What drives you? Why do you want to improve your fitness?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biggest Challenge</label>
                  <textarea
                    value={settings.biggestChallenge}
                    onChange={(e) => setSettings({ ...settings, biggestChallenge: e.target.value })}
                    rows={3}
                    placeholder="What's your biggest obstacle to achieving your fitness goals?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commitment Level</label>
                  <select
                    value={settings.commitmentLevel}
                    onChange={(e) => setSettings({ ...settings, commitmentLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select level</option>
                    <option value="casual">Casual (When I have time)</option>
                    <option value="moderate">Moderate (Several times a week)</option>
                    <option value="serious">Serious (Fitness is a priority)</option>
                    <option value="extreme">Extreme (Fitness is a lifestyle)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Goals & Targets Section */}
          {activeSection === 'goals' && (
            <div className="bg-white rounded-xl p-6 shadow-lg space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Goals & Targets</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg)</label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={settings.targetWeight}
                        onChange={(e) => setSettings({ ...settings, targetWeight: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {settings.weight} kg | Difference: {Math.abs(settings.targetWeight - settings.weight).toFixed(1)} kg
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Body Fat % (optional)</label>
                    <input
                      type="number"
                      value={settings.targetBodyFat || ''}
                      onChange={(e) => setSettings({ ...settings, targetBodyFat: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g., 15"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                  <select
                    value={settings.timeframe}
                    onChange={(e) => setSettings({ ...settings, timeframe: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select timeframe</option>
                    <option value="1_month">1 Month</option>
                    <option value="3_months">3 Months</option>
                    <option value="6_months">6 Months</option>
                    <option value="1_year">1 Year</option>
                    <option value="long_term">Long Term (1+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Specific Goals (select all that apply)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Lose Fat',
                      'Build Muscle',
                      'Improve Strength',
                      'Increase Endurance',
                      'Better Flexibility',
                      'Improve Posture',
                      'Build Core Strength',
                      'Improve Athletic Performance',
                      'Better Sleep',
                      'Reduce Stress',
                      'Increase Energy',
                      'Improve Mobility'
                    ].map(goal => (
                      <label key={goal} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={settings.specificGoals.includes(goal)}
                          onChange={() => handleGoalToggle(goal)}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Progress Journey</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Weight</span>
                      <span className="font-semibold">{settings.weight} kg</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-600 transition-all"
                        style={{
                          width: `${Math.min(100, ((settings.weight - settings.targetWeight) / settings.weight) * 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target Weight</span>
                      <span className="font-semibold">{settings.targetWeight} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
