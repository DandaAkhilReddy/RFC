import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  BarChart3,
  Utensils,
  Dumbbell,
  Moon,
  Droplet,
  Target,
  Weight,
  Ruler,
  Cake,
  Flame,
  ChevronRight,
  Camera,
  Clock,
  Lock
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from './AuthProvider';
import EnhancedChat from './EnhancedChat';
import { db, Collections } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  targetWeight: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  bmr: number;
  tdee: number;
  dailyCalories: number;
  dailyProtein: number;
  fitnessGoal: string;
}

interface DailyPlan {
  date: string;
  meals: {
    breakfast: { items: string[]; calories: number; protein: number };
    lunch: { items: string[]; calories: number; protein: number };
    dinner: { items: string[]; calories: number; protein: number };
    snacks: { items: string[]; calories: number; protein: number };
  };
  workout: {
    type: string;
    duration: number;
    exercises: string[];
  };
  totalCalories: number;
  totalProtein: number;
}

export default function ModernDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'plan' | 'dashboard' | 'photos' | 'settings'>('chat');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fitness_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new fields exist
      return {
        ...parsed,
        gender: parsed.gender || 'male',
        activityLevel: parsed.activityLevel || 'moderate',
        tdee: parsed.tdee || 2400
      };
    }
    return {
      name: user?.displayName || 'User',
      age: 25,
      weight: 75,
      height: 175,
      targetWeight: 70,
      gender: 'male',
      activityLevel: 'moderate',
      bmr: 1745,
      tdee: 2407,
      dailyCalories: 1907,
      dailyProtein: 150,
      fitnessGoal: 'Weight Loss'
    };
  });


  // Dashboard data
  const [weightHistory, setWeightHistory] = useState([
    { date: '2025-09-01', weight: 78 },
    { date: '2025-09-08', weight: 77 },
    { date: '2025-09-15', weight: 76.5 },
    { date: '2025-09-22', weight: 75.5 },
    { date: '2025-09-29', weight: 75 },
  ]);

  const [calorieData, setCalorieData] = useState([
    { day: 'Mon', eaten: 1450, target: 1500 },
    { day: 'Tue', eaten: 1520, target: 1500 },
    { day: 'Wed', eaten: 1480, target: 1500 },
    { day: 'Thu', eaten: 1400, target: 1500 },
    { day: 'Fri', eaten: 1550, target: 1500 },
    { day: 'Sat', eaten: 1600, target: 1500 },
    { day: 'Sun', eaten: 1490, target: 1500 },
  ]);

  const [macrosData, setMacrosData] = useState([
    { name: 'Protein', value: 35, color: '#3b82f6' },
    { name: 'Carbs', value: 40, color: '#10b981' },
    { name: 'Fats', value: 25, color: '#f59e0b' },
  ]);

  // Daily plan
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>({
    date: new Date().toISOString().split('T')[0],
    meals: {
      breakfast: {
        items: ['Oatmeal with berries', '2 scrambled eggs', 'Green tea'],
        calories: 380,
        protein: 25
      },
      lunch: {
        items: ['Grilled chicken breast', 'Quinoa', 'Mixed vegetables', 'Olive oil'],
        calories: 520,
        protein: 45
      },
      dinner: {
        items: ['Baked salmon', 'Sweet potato', 'Broccoli', 'Side salad'],
        calories: 480,
        protein: 38
      },
      snacks: {
        items: ['Protein shake', 'Apple', 'Almonds (20g)'],
        calories: 280,
        protein: 30
      }
    },
    workout: {
      type: 'Upper Body Strength',
      duration: 45,
      exercises: ['Bench Press 4x8', 'Pull-ups 3x10', 'Shoulder Press 3x12', 'Bicep Curls 3x12', 'Tricep Dips 3x12']
    },
    totalCalories: 1660,
    totalProtein: 138
  });

  // Calculate BMR (Mifflin-St Jeor Equation) - Most Accurate
  const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female') => {
    if (gender === 'male') {
      // For men: BMR = 10W + 6.25H - 5A + 5
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      // For women: BMR = 10W + 6.25H - 5A - 161
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (bmr: number, activityLevel: string) => {
    const multipliers = {
      sedentary: 1.2,        // Little/no exercise
      light: 1.375,          // Light exercise 1-3 days/week
      moderate: 1.55,        // Moderate exercise 3-5 days/week
      active: 1.725,         // Heavy exercise 6-7 days/week
      very_active: 1.9       // Very heavy exercise, physical job
    };
    return Math.round(bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.55));
  };

  // Calculate recommended daily calories based on goal
  const calculateDailyCalories = (tdee: number, goal: string) => {
    if (goal.toLowerCase().includes('loss') || goal.toLowerCase().includes('cut')) {
      return Math.round(tdee * 0.8); // 20% deficit for weight loss
    } else if (goal.toLowerCase().includes('gain') || goal.toLowerCase().includes('bulk')) {
      return Math.round(tdee * 1.1); // 10% surplus for muscle gain
    }
    return tdee; // Maintenance
  };

  // Load profile from Firestore on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;

      try {
        const userDocRef = doc(db, Collections.USERS, user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({
            name: data.name || user.displayName || 'User',
            age: data.age || 25,
            weight: data.weight || 75,
            height: data.height || 175,
            targetWeight: data.targetWeight || 70,
            gender: data.gender || 'male',
            activityLevel: data.activityLevel || 'moderate',
            bmr: data.bmr || 1745,
            tdee: data.tdee || 2407,
            dailyCalories: data.dailyCalories || 1907,
            dailyProtein: data.dailyProtein || 150,
            fitnessGoal: data.fitnessGoal || 'Weight Loss'
          });
          console.log('✅ Profile loaded from Firestore');
        } else {
          console.log('⚠️ No profile in Firestore - using defaults');
        }
      } catch (error) {
        console.error('Error loading profile from Firestore:', error);
      }
    };

    loadProfile();
  }, [user]);

  // Save profile to Firestore AND localStorage
  const handleProfileUpdate = async () => {
    if (!user?.uid) {
      alert('You must be logged in to save profile');
      return;
    }

    const newBMR = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const newTDEE = calculateTDEE(newBMR, profile.activityLevel);
    const newDailyCalories = calculateDailyCalories(newTDEE, profile.fitnessGoal);
    const newProtein = Math.round(profile.weight * 2); // 2g per kg bodyweight

    const updatedProfile = {
      ...profile,
      bmr: newBMR,
      tdee: newTDEE,
      dailyCalories: newDailyCalories,
      dailyProtein: newProtein
    };

    setProfile(updatedProfile);

    try {
      // Save to Firestore
      const userDocRef = doc(db, Collections.USERS, user.uid);
      await setDoc(userDocRef, {
        userId: user.uid,
        email: user.email || '',
        ...updatedProfile,
        updatedAt: serverTimestamp(),
        hasCompletedProfile: true
      }, { merge: true });

      console.log('✅ Profile saved to Firestore!');
      alert('✅ Profile saved successfully!');
    } catch (error) {
      console.error('❌ Error saving to Firestore:', error);
      alert('Failed to save profile. Check console for errors.');
    }

    // Also save to localStorage as backup
    localStorage.setItem('fitness_profile', JSON.stringify(updatedProfile));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content - Full Width */}
      <div className="flex-1 flex flex-col">
        {/* Top Tabs with Logout */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setActiveTab('plan')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'plan'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📋 Daily Plan
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'photos'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📸 Progress Photos
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ⚙️ Settings
              </button>
            </div>

            {/* Logout Button in Header */}
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Chat View */}
          {activeTab === 'chat' && (
            <EnhancedChat
              profile={profile}
              userEmail={user?.email || ''}
            />
          )}

          {/* Daily Plan View */}
          {activeTab === 'plan' && (
            <div className="h-full overflow-y-auto px-8 py-6">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Today's Plan</h2>
                  <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <Flame className="w-8 h-8 mb-2 opacity-80" />
                    <p className="text-sm opacity-90">Total Calories</p>
                    <p className="text-3xl font-bold">{dailyPlan.totalCalories}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <Activity className="w-8 h-8 mb-2 opacity-80" />
                    <p className="text-sm opacity-90">Total Protein</p>
                    <p className="text-3xl font-bold">{dailyPlan.totalProtein}g</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <Dumbbell className="w-8 h-8 mb-2 opacity-80" />
                    <p className="text-sm opacity-90">Workout</p>
                    <p className="text-3xl font-bold">{dailyPlan.workout.duration}min</p>
                  </div>
                </div>

                {/* Meals */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Meals</h3>

                  {Object.entries(dailyPlan.meals).map(([mealType, meal]) => (
                    <div key={mealType} className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 capitalize">{mealType}</h4>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-600 font-medium">{meal.calories} kcal</span>
                          <span className="text-purple-600 font-medium">{meal.protein}g protein</span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {meal.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Workout */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{dailyPlan.workout.type}</h3>
                      <p className="text-sm text-gray-600">{dailyPlan.workout.duration} minutes</p>
                    </div>
                    <Dumbbell className="w-10 h-10 text-orange-600" />
                  </div>
                  <div className="space-y-2">
                    {dailyPlan.workout.exercises.map((exercise, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        {exercise}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Photos View */}
          {activeTab === 'photos' && (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
              <div className="max-w-2xl mx-auto text-center p-12">
                {/* Coming Soon Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-semibold mb-8 animate-pulse">
                  <Clock className="w-4 h-4" />
                  Coming Soon
                </div>

                {/* Icon */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-30"></div>
                  <div className="relative bg-white rounded-full p-8 shadow-2xl inline-block">
                    <Camera className="w-24 h-24 text-purple-600" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Daily Progress Photos
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 mb-6">
                  Upload your daily progress photos and let our AI analyze your body composition, track changes, and provide insights.
                </p>

                {/* Features List */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-left space-y-4 mb-8">
                  <h3 className="font-semibold text-gray-900 text-center mb-4">✨ What's Coming</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">AI Body Analysis</p>
                        <p className="text-sm text-gray-500">Get estimated body fat %, muscle mass, and posture analysis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Progress Tracking</p>
                        <p className="text-sm text-gray-500">Side-by-side comparisons of your transformation journey</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Face & Posture Analysis</p>
                        <p className="text-sm text-gray-500">Track facial changes and posture improvements</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">AI Recommendations</p>
                        <p className="text-sm text-gray-500">Personalized tips based on your progress</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Locked Badge */}
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full text-gray-500 font-medium">
                  <Lock className="w-5 h-5" />
                  <span>Feature in Development</span>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="h-full overflow-y-auto px-8 py-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

                {/* Weight Trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weightHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Calories */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Calorie Intake</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={calorieData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="eaten" fill="#3b82f6" name="Eaten" />
                      <Bar dataKey="target" fill="#10b981" name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Macros Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Macros Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={macrosData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {macrosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Settings View - Profile & BMR Calculator */}
          {activeTab === 'settings' && (
            <div className="h-full overflow-y-auto px-8 py-6 bg-gray-50">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                      <input
                        type="number"
                        value={profile.height}
                        onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Weight (kg)</label>
                      <input
                        type="number"
                        value={profile.weight}
                        onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg)</label>
                      <input
                        type="number"
                        value={profile.targetWeight}
                        onChange={(e) => setProfile({ ...profile, targetWeight: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                      <select
                        value={profile.activityLevel}
                        onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="sedentary">Sedentary (Little/no exercise)</option>
                        <option value="light">Light (1-3 days/week)</option>
                        <option value="moderate">Moderate (3-5 days/week)</option>
                        <option value="active">Active (6-7 days/week)</option>
                        <option value="very_active">Very Active (Physical job)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goal</label>
                      <select
                        value={profile.fitnessGoal}
                        onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option>Weight Loss</option>
                        <option>Muscle Gain</option>
                        <option>Maintenance</option>
                        <option>Six-Pack</option>
                        <option>Endurance</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BMR Calculator Results */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Metabolic Metrics</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">BMR</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{profile.bmr}</p>
                      <p className="text-xs text-gray-500 mt-1">Basal Metabolic Rate</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-600">TDEE</span>
                      </div>
                      <p className="text-3xl font-bold text-green-600">{profile.tdee}</p>
                      <p className="text-xs text-gray-500 mt-1">Total Daily Energy</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-gray-600">Daily Calories</span>
                      </div>
                      <p className="text-3xl font-bold text-orange-600">{profile.dailyCalories}</p>
                      <p className="text-xs text-gray-500 mt-1">For {profile.fitnessGoal}</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Utensils className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-600">Protein</span>
                      </div>
                      <p className="text-3xl font-bold text-purple-600">{profile.dailyProtein}g</p>
                      <p className="text-xs text-gray-500 mt-1">Daily Target</p>
                    </div>
                  </div>

                  <button
                    onClick={handleProfileUpdate}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Settings className="w-5 h-5" />
                    <span>📊 Recalculate Metrics</span>
                  </button>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">💡 Understanding Your Metrics</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p><strong>BMR</strong> - Calories your body burns at rest (sleeping, breathing)</p>
                    <p><strong>TDEE</strong> - Total calories burned daily including activity</p>
                    <p><strong>Daily Calories</strong> - Recommended intake based on your goal</p>
                    <p><strong>Protein</strong> - Essential for muscle maintenance and recovery</p>
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
