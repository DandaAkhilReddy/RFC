import React, { useState, useEffect } from 'react';
import {
  Bot, Utensils, Dumbbell, Settings, LogOut, Menu, X, ChevronRight,
  Activity, TrendingUp, Users, Calendar, Target, Award, Flame, Sparkles,
  UserCircle2, Bell, ArrowRight, Info
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import ReddyAIAgent from './ReddyAIAgent';
import SettingsPage from './SettingsPage';
import { db, Collections } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type DashboardPage = 'dashboard' | 'reddy' | 'settings' | 'discipline';

interface UserSettings {
  calorieGoal?: number;
  weeklyWorkoutGoal?: number;
  weight?: number;
  height?: number;
  targetWeight?: number;
}

interface DisciplineData {
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  workoutHistory: boolean[];
  calorieHistory: boolean[];
}

export default function CleanDashboard() {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<DashboardPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showWelcomePointers, setShowWelcomePointers] = useState(true);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    calorieGoal: 2000,
    weeklyWorkoutGoal: 5,
    weight: 0,
    height: 0,
    targetWeight: 0
  });

  const [disciplineData, setDisciplineData] = useState<DisciplineData>({
    currentStreak: 0,
    bestStreak: 0,
    totalDays: 0,
    workoutHistory: Array(7).fill(false),
    calorieHistory: Array(7).fill(false)
  });

  // Initialize new user
  const initializeNewUser = async (userId: string) => {
    try {
      const initialData = {
        calorieGoal: 2000,
        weeklyWorkoutGoal: 5,
        weight: 0,
        height: 0,
        targetWeight: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalDays: 0,
        workoutHistory: Array(7).fill(false),
        calorieHistory: Array(7).fill(false),
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, Collections.USERS, userId), initialData);
      console.log('✅ New user initialized');
      return initialData;
    } catch (error) {
      console.error('Error initializing user:', error);
      return null;
    }
  };

  // Load user data
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const docRef = doc(db, Collections.USERS, user.uid);
          const docSnap = await getDoc(docRef);

          let data;
          let isNewUser = false;

          if (docSnap.exists()) {
            data = docSnap.data();
            // Check if created within last 5 minutes
            const createdAt = data.createdAt ? new Date(data.createdAt) : null;
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            isNewUser = createdAt && createdAt > fiveMinutesAgo;
          } else {
            console.log('🆕 New user detected');
            data = await initializeNewUser(user.uid);
            isNewUser = true;
          }

          setIsFirstTimeUser(isNewUser);

          // Load settings
          setUserSettings({
            calorieGoal: data.calorieGoal || 2000,
            weeklyWorkoutGoal: data.weeklyWorkoutGoal || 5,
            weight: data.weight || 0,
            height: data.height || 0,
            targetWeight: data.targetWeight || 0
          });

          // Load discipline data
          setDisciplineData({
            currentStreak: data.currentStreak || 0,
            bestStreak: data.bestStreak || 0,
            totalDays: data.totalDays || 0,
            workoutHistory: data.workoutHistory || Array(7).fill(false),
            calorieHistory: data.calorieHistory || Array(7).fill(false)
          });

        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };

      loadUserData();
    }
  }, [user]);

  // Render different pages
  if (currentPage === 'reddy') {
    return <ReddyAIAgent onClose={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'settings') {
    return <SettingsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} hidden md:block bg-white border-r transition-all duration-300 overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              ReddyFit
            </h1>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'dashboard' ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentPage('reddy')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <Bot className="w-5 h-5" />
              <span>AI Chatbot</span>
            </button>

            <button
              onClick={() => setCurrentPage('discipline')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <Flame className="w-5 h-5" />
              <span>Discipline Tracker</span>
            </button>

            <button
              onClick={() => setCurrentPage('settings')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.displayName?.split(' ')[0] || 'User'}! 👋</h2>
                <p className="text-sm text-gray-600">Let's crush your fitness goals today</p>
                <p className="text-xs text-gray-400">v2.0 Clean</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
              </button>
              <img
                src={user?.photoURL || ''}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-orange-600"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* First-Time User Welcome */}
          {isFirstTimeUser && showWelcomePointers && (
            <div className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <button
                onClick={() => setShowWelcomePointers(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8" />
                  <h3 className="text-3xl font-bold">Welcome to ReddyFit! 🎉</h3>
                </div>

                <p className="text-lg mb-6 text-white/90">
                  Your AI-powered fitness journey starts here. Let's get you set up in 3 simple steps:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold">1</span>
                    </div>
                    <h4 className="font-bold mb-2">Complete Your Profile</h4>
                    <p className="text-sm text-white/80">Add your weight, height, and fitness goals</p>
                    <button
                      onClick={() => setCurrentPage('settings')}
                      className="mt-3 flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                    >
                      Go to Settings <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold">2</span>
                    </div>
                    <h4 className="font-bold mb-2">Chat with Reddy AI</h4>
                    <p className="text-sm text-white/80">Get personalized workout and meal plans</p>
                    <button
                      onClick={() => setCurrentPage('reddy')}
                      className="mt-3 flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                    >
                      Start Chatting <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold">3</span>
                    </div>
                    <h4 className="font-bold mb-2">Track Your Progress</h4>
                    <p className="text-sm text-white/80">Build streaks and stay consistent</p>
                    <button
                      onClick={() => setCurrentPage('discipline')}
                      className="mt-3 flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                    >
                      View Tracker <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Calorie Goal */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative group">
              {isFirstTimeUser && (
                <div className="absolute -top-3 -right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  Set this!
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <Utensils className="w-8 h-8 text-orange-600" />
                <div className="text-right">
                  <p className="text-sm text-gray-600">Daily Goal</p>
                  <p className="text-2xl font-bold text-gray-900">{userSettings.calorieGoal || 0}</p>
                  <p className="text-xs text-gray-500">calories</p>
                </div>
              </div>
              {userSettings.calorieGoal === 0 && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Set your goal in Settings
                </p>
              )}
            </div>

            {/* Workout Goal */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
              {isFirstTimeUser && (
                <div className="absolute -top-3 -right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  Set this!
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <Dumbbell className="w-8 h-8 text-orange-600" />
                <div className="text-right">
                  <p className="text-sm text-gray-600">Weekly Goal</p>
                  <p className="text-2xl font-bold text-gray-900">{userSettings.weeklyWorkoutGoal || 0}</p>
                  <p className="text-xs text-gray-500">workouts</p>
                </div>
              </div>
              {userSettings.weeklyWorkoutGoal === 0 && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Set your goal in Settings
                </p>
              )}
            </div>

            {/* Current Streak */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-8 h-8 text-orange-600" />
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{disciplineData.currentStreak}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
              </div>
              <div className="flex gap-1">
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full ${
                      disciplineData.workoutHistory[i] ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Best Streak */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-orange-600" />
                <div className="text-right">
                  <p className="text-sm text-gray-600">Best Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{disciplineData.bestStreak}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {disciplineData.bestStreak === 0 ? 'Start your journey today!' : 'Keep going! 💪'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setCurrentPage('reddy')}
              className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white hover:shadow-xl transition-all group"
            >
              <Bot className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Chat with Reddy AI</h3>
              <p className="text-white/80 text-sm">Get personalized fitness advice</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                Start Chat <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => setCurrentPage('settings')}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
            >
              <Settings className="w-12 h-12 mb-4 text-orange-600 group-hover:rotate-90 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Complete Profile</h3>
              <p className="text-gray-600 text-sm">Add your details and goals</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-orange-600">
                Go to Settings <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => setCurrentPage('discipline')}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
            >
              <Flame className="w-12 h-12 mb-4 text-orange-600 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Track Discipline</h3>
              <p className="text-gray-600 text-sm">Build your daily streaks</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-orange-600">
                View Tracker <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
