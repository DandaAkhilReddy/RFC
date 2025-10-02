import React, { useState, useEffect } from 'react';
import {
  Bot,
  Utensils,
  Dumbbell,
  Settings,
  LogOut,
  Lock,
  Menu,
  X,
  ChevronRight,
  Heart,
  Activity,
  Camera,
  MessageCircle,
  TrendingUp,
  Users,
  Edit2
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import ReddyAIAgent from './ReddyAIAgent';
import FitBuddyAIAgent from './FitBuddyAIAgent';
import CupidAIAgent from './CupidAIAgent';
import SettingsPage from './SettingsPage';
import { db, Collections } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type PageView = 'home' | 'reddy' | 'fitbuddy' | 'cupid' | 'settings';

interface UserSettings {
  calorieGoal?: number;
  weeklyWorkoutGoal?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  bmr?: number;
}

export default function MainDashboard() {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    calorieGoal: 2000,
    weeklyWorkoutGoal: 5
  });
  const [editingCalories, setEditingCalories] = useState(false);
  const [editingWorkouts, setEditingWorkouts] = useState(false);
  const [tempCalorieGoal, setTempCalorieGoal] = useState('2000');
  const [tempWorkoutGoal, setTempWorkoutGoal] = useState('5');

  // Fetch user settings from Firestore
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user?.email) return;

      try {
        const userSettingsDoc = await getDoc(doc(db, Collections.USER_SETTINGS, user.email));
        if (userSettingsDoc.exists()) {
          const data = userSettingsDoc.data();
          setUserSettings({
            calorieGoal: data.calorieGoal || 2000,
            weeklyWorkoutGoal: data.weeklyWorkoutGoal || 5,
            weight: data.weight,
            height: data.height,
            bmi: data.bmi,
            bmr: data.bmr
          });
          setTempCalorieGoal(String(data.calorieGoal || 2000));
          setTempWorkoutGoal(String(data.weeklyWorkoutGoal || 5));
        }
      } catch (error) {
        console.error('[MainDashboard] Error fetching user settings:', error);
      }
    };

    fetchUserSettings();
  }, [user]);

  const saveCalorieGoal = async () => {
    if (!user?.email) return;

    const newGoal = parseInt(tempCalorieGoal) || 2000;
    try {
      await setDoc(
        doc(db, Collections.USER_SETTINGS, user.email),
        { calorieGoal: newGoal },
        { merge: true }
      );
      setUserSettings({ ...userSettings, calorieGoal: newGoal });
      setEditingCalories(false);
    } catch (error) {
      console.error('[MainDashboard] Error saving calorie goal:', error);
      alert('Failed to save calorie goal');
    }
  };

  const saveWorkoutGoal = async () => {
    if (!user?.email) return;

    const newGoal = parseInt(tempWorkoutGoal) || 5;
    try {
      await setDoc(
        doc(db, Collections.USER_SETTINGS, user.email),
        { weeklyWorkoutGoal: newGoal },
        { merge: true }
      );
      setUserSettings({ ...userSettings, weeklyWorkoutGoal: newGoal });
      setEditingWorkouts(false);
    } catch (error) {
      console.error('[MainDashboard] Error saving workout goal:', error);
      alert('Failed to save workout goal');
    }
  };

  const mainFeatures = [
    {
      id: 'reddy',
      name: 'AI Agent Reddy',
      description: 'Your personal AI fitness coach - Chat, voice help & real-time guidance',
      icon: Bot,
      color: 'from-orange-500 to-red-500',
      available: true
    },
    {
      id: 'fitbuddy',
      name: 'AI Agent FitBuddy',
      description: 'AI-powered body fat analysis - Trained by 10M+ humans, once per week',
      icon: Camera,
      color: 'from-green-500 to-emerald-500',
      available: true
    },
    {
      id: 'cupid',
      name: 'AI Agent Cupid',
      description: 'Smart partner matching - Get your perfect fitness accountability buddy weekly',
      icon: Heart,
      color: 'from-pink-500 to-purple-500',
      available: true
    }
  ];

  const additionalFeatures = [
    {
      id: 'chat',
      name: 'AI Chatbot',
      description: 'Advanced conversational AI for fitness advice',
      icon: MessageCircle,
      available: false
    },
    {
      id: 'photo',
      name: 'Photo Analysis',
      description: 'AI-powered body composition & form analysis',
      icon: Camera,
      available: false
    },
    {
      id: 'fatcalc',
      name: 'Body Fat Calculator',
      description: 'Accurate body fat percentage & composition metrics',
      icon: Activity,
      available: false
    },
    {
      id: 'progress',
      name: 'Progress Tracking',
      description: 'Visual tracking of your transformation journey',
      icon: TrendingUp,
      available: false
    },
    {
      id: 'community',
      name: 'Community & Groups',
      description: 'Connect with like-minded fitness enthusiasts',
      icon: Users,
      available: false
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Render different pages based on currentPage
  if (currentPage === 'reddy') {
    return <ReddyAIAgent onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'fitbuddy') {
    return <FitBuddyAIAgent onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'cupid') {
    return <CupidAIAgent onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'settings') {
    return <SettingsPage onBack={() => setCurrentPage('home')} />;
  }

  // Home Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.displayName?.split(' ')[0] || 'Friend'}! 👋
                </h1>
                <p className="text-sm text-gray-500">Let's crush your fitness goals today</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage('settings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Calorie Goal - Editable */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">Today's Goal</p>
                  {!editingCalories && (
                    <button
                      onClick={() => setEditingCalories(true)}
                      className="p-1 hover:bg-orange-100 rounded transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-orange-600" />
                    </button>
                  )}
                </div>
                {editingCalories ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={tempCalorieGoal}
                      onChange={(e) => setTempCalorieGoal(e.target.value)}
                      className="w-24 px-2 py-1 text-xl font-bold text-orange-600 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500"
                      autoFocus
                    />
                    <button
                      onClick={saveCalorieGoal}
                      className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingCalories(false);
                        setTempCalorieGoal(String(userSettings.calorieGoal || 2000));
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-orange-600">{userSettings.calorieGoal?.toLocaleString() || 2000} cal</p>
                )}
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Utensils className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Workout Goal - Editable */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">Weekly Goal</p>
                  {!editingWorkouts && (
                    <button
                      onClick={() => setEditingWorkouts(true)}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-blue-600" />
                    </button>
                  )}
                </div>
                {editingWorkouts ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={tempWorkoutGoal}
                      onChange={(e) => setTempWorkoutGoal(e.target.value)}
                      className="w-16 px-2 py-1 text-xl font-bold text-blue-600 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <span className="text-xl font-bold text-blue-600 flex items-center">/week</span>
                    <button
                      onClick={saveWorkoutGoal}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingWorkouts(false);
                        setTempWorkoutGoal(String(userSettings.weeklyWorkoutGoal || 5));
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">{userSettings.weeklyWorkoutGoal || 5} workouts/week</p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Health Stats - From Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Health Stats</p>
                {userSettings.bmi ? (
                  <div>
                    <p className="text-lg font-bold text-green-600">BMI: {userSettings.bmi.toFixed(1)}</p>
                    {userSettings.bmr && (
                      <p className="text-sm text-gray-500">BMR: {userSettings.bmr.toFixed(0)} cal</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Update in Settings →</p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Main Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mainFeatures.map((feature) => (
              <div
                key={feature.id}
                className="relative group"
              >
                <button
                  onClick={() => feature.available && setCurrentPage(feature.id as PageView)}
                  disabled={!feature.available}
                  className={`w-full text-left bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all ${
                    feature.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                  }`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-between">
                    {feature.name}
                    {feature.available && (
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{feature.description}</p>

                  {!feature.available && (
                    <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium w-fit">
                      <Lock className="w-4 h-4" />
                      Coming Soon
                    </div>
                  )}

                  {feature.available && (
                    <div className="mt-4 text-sm font-medium text-orange-600 group-hover:text-orange-700">
                      Open →
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Coming Soon Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalFeatures.map((feature) => (
              <div
                key={feature.id}
                className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:border-orange-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium w-fit">
                      <Lock className="w-3 h-3" />
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-bold mb-2">Complete Your Profile</h3>
              <p className="text-sm opacity-90">Add your details in Settings for personalized recommendations</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-bold mb-2">Chat with Reddy AI</h3>
              <p className="text-sm opacity-90">Get instant fitness advice, meal analysis, and workout tips</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-bold mb-2">Track Your Nutrition</h3>
              <p className="text-sm opacity-90">Log meals and monitor your calorie & macro intake daily</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
