import { useState, useEffect } from 'react';
import { transition } from '@ssgoi/react';
import { fly } from '@ssgoi/react/transitions';
import {
  Camera, Plus, Edit2, Check, X, Trash2, Upload, Image as ImageIcon,
  Utensils, Dumbbell, TrendingUp, Calendar, Clock, Target, Flame,
  Activity, Heart, Settings, LogOut, Menu, Bell, Home, User, ChevronDown,
  Save, Apple, Coffee, Drumstick, Cookie, Info, BarChart3, Sparkles, Zap,
  Users, Share2, Smartphone, Radio, Bot, Send, UserPlus, Trophy, Lock,
  TrendingDown, Award, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import ToastNotification from './ToastNotification';
import Logo from './Logo';

type PageType = 'dashboard' | 'diet' | 'workout' | 'ai-agents' | 'friends';

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  photo?: string;
}

interface WorkoutEntry {
  id: string;
  name: string;
  duration: number;
  caloriesBurned: number;
  time: string;
  photo?: string;
}

interface DailyActivity {
  date: string;
  steps: number;
  water: number;
  sleep: number;
  weight: number;
  photos: string[];
  foods: FoodEntry[];
  workouts: WorkoutEntry[];
  notes: string;
}

interface UserGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyWorkoutMinutes: number;
  currentWeight: number;
  targetWeight: number;
  targetDate: string;
}

export default function ImprovedDashboard() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [showNFCShare, setShowNFCShare] = useState(false);
  const [showSetGoals, setShowSetGoals] = useState(false);

  // User goals
  const [userGoals, setUserGoals] = useState<UserGoals>({
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyWorkoutMinutes: 30,
    currentWeight: 80,
    targetWeight: 75,
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [dailyData, setDailyData] = useState<DailyActivity>({
    date: currentDate,
    steps: 0,
    water: 0,
    sleep: 0,
    weight: userGoals.currentWeight,
    photos: [],
    foods: [],
    workouts: [],
    notes: ''
  });

  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [editingStats, setEditingStats] = useState(false);

  // Form states
  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  const [newWorkout, setNewWorkout] = useState({
    name: '',
    duration: '',
    caloriesBurned: ''
  });

  const [tempStats, setTempStats] = useState({
    steps: '',
    water: '',
    sleep: '',
    weight: ''
  });

  // Calculate totals
  const totalCalories = dailyData.foods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = dailyData.foods.reduce((sum, food) => sum + food.protein, 0);
  const totalCaloriesBurned = dailyData.workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);
  const totalWorkoutMinutes = dailyData.workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const netCalories = totalCalories - totalCaloriesBurned;

  // Calculate remaining
  const remainingCalories = userGoals.dailyCalories - totalCalories;
  const remainingProtein = userGoals.dailyProtein - totalProtein;
  const remainingWorkout = userGoals.dailyWorkoutMinutes - totalWorkoutMinutes;

  // Weight progress calculation
  const weightDifference = userGoals.currentWeight - userGoals.targetWeight;
  const weightProgress = userGoals.currentWeight - dailyData.weight;
  const weightProgressPercent = Math.min(100, Math.max(0, (weightProgress / weightDifference) * 100));
  const daysToTarget = Math.ceil((new Date(userGoals.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Progress status
  const calorieStatus = remainingCalories >= 0 ? 'good' : 'over';
  const proteinStatus = totalProtein >= userGoals.dailyProtein * 0.8 ? 'good' : 'low';
  const workoutStatus = totalWorkoutMinutes >= userGoals.dailyWorkoutMinutes ? 'good' : 'pending';

  const handleAddFood = () => {
    if (!newFood.name || !newFood.calories) {
      setToast({ message: 'Please enter food name and calories', type: 'error' });
      return;
    }

    const foodEntry: FoodEntry = {
      id: Date.now().toString(),
      name: newFood.name,
      calories: parseInt(newFood.calories) || 0,
      protein: parseInt(newFood.protein) || 0,
      carbs: parseInt(newFood.carbs) || 0,
      fat: parseInt(newFood.fat) || 0,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setDailyData(prev => ({
      ...prev,
      foods: [...prev.foods, foodEntry]
    }));

    setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowAddFood(false);
    setToast({ message: `✅ Added ${newFood.name}!`, type: 'success' });
  };

  const handleAddWorkout = () => {
    if (!newWorkout.name || !newWorkout.duration) {
      setToast({ message: 'Please enter workout name and duration', type: 'error' });
      return;
    }

    const workoutEntry: WorkoutEntry = {
      id: Date.now().toString(),
      name: newWorkout.name,
      duration: parseInt(newWorkout.duration) || 0,
      caloriesBurned: parseInt(newWorkout.caloriesBurned) || 0,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setDailyData(prev => ({
      ...prev,
      workouts: [...prev.workouts, workoutEntry]
    }));

    setNewWorkout({ name: '', duration: '', caloriesBurned: '' });
    setShowAddWorkout(false);
    setToast({ message: `💪 Added ${newWorkout.name}!`, type: 'success' });
  };

  const handleSaveStats = () => {
    setDailyData(prev => ({
      ...prev,
      steps: parseInt(tempStats.steps) || prev.steps,
      water: parseInt(tempStats.water) || prev.water,
      sleep: parseInt(tempStats.sleep) || prev.sleep,
      weight: parseFloat(tempStats.weight) || prev.weight
    }));
    setEditingStats(false);
    setToast({ message: '✅ Stats updated!', type: 'success' });
  };

  const handleDeleteFood = (id: string) => {
    setDailyData(prev => ({
      ...prev,
      foods: prev.foods.filter(food => food.id !== id)
    }));
    setToast({ message: 'Food deleted', type: 'info' });
  };

  const handleDeleteWorkout = (id: string) => {
    setDailyData(prev => ({
      ...prev,
      workouts: prev.workouts.filter(workout => workout.id !== id)
    }));
    setToast({ message: 'Workout deleted', type: 'info' });
  };

  // Initialize temp stats when editing
  useEffect(() => {
    if (editingStats) {
      setTempStats({
        steps: dailyData.steps.toString(),
        water: dailyData.water.toString(),
        sleep: dailyData.sleep.toString(),
        weight: dailyData.weight.toString()
      });
    }
  }, [editingStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white/90 backdrop-blur-md shadow-2xl transition-all duration-300 z-20 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6">
          {sidebarOpen ? (
            <div className="flex items-center justify-between mb-8">
              <Logo size={48} showText={true} />
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-orange-100 rounded-lg transition">
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          ) : (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-orange-100 rounded-lg transition w-full flex justify-center">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          )}
        </div>

        <nav className="mt-6 space-y-1">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center px-6 py-3 transition ${
              currentPage === 'dashboard'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'hover:bg-orange-50 text-gray-600 hover:text-orange-500'
            }`}
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3 font-semibold">Dashboard</span>}
          </button>

          <button
            onClick={() => setCurrentPage('diet')}
            className={`w-full flex items-center px-6 py-3 transition ${
              currentPage === 'diet'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'hover:bg-orange-50 text-gray-600 hover:text-orange-500'
            }`}
          >
            <Utensils className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3 font-semibold">Diet & Nutrition</span>}
          </button>

          <button
            onClick={() => setCurrentPage('workout')}
            className={`w-full flex items-center px-6 py-3 transition ${
              currentPage === 'workout'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'hover:bg-orange-50 text-gray-600 hover:text-orange-500'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3 font-semibold">Workouts</span>}
          </button>

          <button
            onClick={() => setCurrentPage('ai-agents')}
            className={`w-full flex items-center px-6 py-3 transition ${
              currentPage === 'ai-agents'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'hover:bg-orange-50 text-gray-600 hover:text-orange-500'
            }`}
          >
            <Bot className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3 font-semibold">AI Agents</span>}
          </button>

          <button
            onClick={() => setCurrentPage('friends')}
            className={`w-full flex items-center px-6 py-3 transition ${
              currentPage === 'friends'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'hover:bg-orange-50 text-gray-600 hover:text-orange-500'
            }`}
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3 font-semibold">Friends</span>}
          </button>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <button onClick={signOut} className="w-full flex items-center px-6 py-3 hover:bg-orange-50 text-gray-600 transition group">
              <LogOut className="w-5 h-5 group-hover:text-orange-500 transition" />
              {sidebarOpen && <span className="ml-3 group-hover:text-orange-500 transition">Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} relative z-10`}>
        <div className="p-8">
          {/* Share Button */}
          <button
            onClick={() => setShowNFCShare(true)}
            className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center space-x-2"
          >
            <Share2 className="w-6 h-6" />
            <span className="font-semibold">Share</span>
          </button>

          {/* NFC Share Modal */}
          {showNFCShare && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-3xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Share with Friends</h3>
                  <p className="text-gray-600 mb-6">Touch phones together or send a friend request</p>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setToast({ message: '📱 Hold phones together to connect!', type: 'info' });
                        setShowNFCShare(false);
                      }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold"
                    >
                      <Radio className="w-5 h-5 animate-pulse" />
                      <span>Touch to Share (NFC)</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://reddyfit.app/add/${user?.uid}`);
                        setToast({ message: '🔗 Friend link copied!', type: 'success' });
                        setShowNFCShare(false);
                      }}
                      className="w-full px-6 py-4 bg-white border-2 border-purple-500 text-purple-600 rounded-xl hover:bg-purple-50 transition-all flex items-center justify-center space-x-2 font-semibold"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Copy Friend Link</span>
                    </button>

                    <button
                      onClick={() => setShowNFCShare(false)}
                      className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Page */}
          {currentPage === 'dashboard' && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                    Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
                  </h1>
                  <p className="text-gray-600 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                    Let's crush your goals today!
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition"
                  />
                  <button
                    onClick={() => setShowSetGoals(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2"
                  >
                    <Target className="w-5 h-5" />
                    <span>Set Goals</span>
                  </button>
                </div>
              </div>

              {/* TODAY'S CALORIE GOAL - Big Priority Card */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">Today's Calorie Goal</h2>
                        <p className="opacity-90">Track your daily nutrition target</p>
                      </div>
                      <Flame className="w-16 h-16 opacity-50" />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                        <div className="text-sm opacity-90 mb-2">Goal</div>
                        <div className="text-4xl font-bold">{userGoals.dailyCalories}</div>
                        <div className="text-sm opacity-75 mt-1">calories</div>
                      </div>

                      <div className={`p-6 rounded-2xl ${totalCalories > 0 ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/10 backdrop-blur-sm border-2 border-white/30 border-dashed'}`}>
                        <div className="text-sm opacity-90 mb-2">Consumed</div>
                        <div className="text-4xl font-bold">{totalCalories || '0'}</div>
                        <div className="text-sm opacity-75 mt-1">calories</div>
                      </div>

                      <div className={`p-6 rounded-2xl ${
                        remainingCalories >= 0
                          ? 'bg-green-400/30 backdrop-blur-sm'
                          : 'bg-red-400/30 backdrop-blur-sm'
                      }`}>
                        <div className="text-sm opacity-90 mb-2">Remaining</div>
                        <div className="text-4xl font-bold flex items-center">
                          {Math.abs(remainingCalories)}
                          {remainingCalories >= 0 ? (
                            <TrendingUp className="w-8 h-8 ml-2" />
                          ) : (
                            <TrendingDown className="w-8 h-8 ml-2" />
                          )}
                        </div>
                        <div className="text-sm opacity-75 mt-1">
                          {remainingCalories >= 0 ? 'calories left' : 'over limit'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{Math.min(100, Math.round((totalCalories / userGoals.dailyCalories) * 100))}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-4 rounded-full transition-all duration-500 ${
                            totalCalories > userGoals.dailyCalories
                              ? 'bg-red-300'
                              : 'bg-green-300'
                          }`}
                          style={{ width: `${Math.min(100, (totalCalories / userGoals.dailyCalories) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className="mt-4 text-center">
                      {remainingCalories > 0 && (
                        <p className="text-lg font-semibold">✨ You're doing great! {remainingCalories} calories to go!</p>
                      )}
                      {remainingCalories === 0 && (
                        <p className="text-lg font-semibold">🎯 Perfect! You've hit your goal!</p>
                      )}
                      {remainingCalories < 0 && remainingCalories > -200 && (
                        <p className="text-lg font-semibold">⚠️ Slightly over, but still okay!</p>
                      )}
                      {remainingCalories <= -200 && (
                        <p className="text-lg font-semibold">🔥 Over target! Consider more workout tomorrow.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* WEIGHT PROGRESS TIMELINE */}
              <div className="mb-8">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Weight Progress Journey
                      </h2>
                      <p className="text-gray-600">{daysToTarget} days remaining to reach your target</p>
                    </div>
                    <TrendingDown className="w-12 h-12 text-blue-500" />
                  </div>

                  {/* Progress Line */}
                  <div className="relative">
                    {/* Line */}
                    <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${weightProgressPercent}%` }}
                      ></div>
                    </div>

                    {/* Milestones */}
                    <div className="relative flex justify-between items-start pt-16">
                      {/* Current Weight */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg -mt-16 relative z-10">
                          <Trophy className="w-8 h-8" />
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{userGoals.currentWeight} kg</div>
                          <div className="text-sm text-gray-600 mt-1">Starting Weight</div>
                          <div className="text-xs text-gray-500">90 days ago</div>
                        </div>
                      </div>

                      {/* Current Progress */}
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-lg -mt-16 relative z-10 ${
                          dailyData.weight > 0 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {dailyData.weight > 0 ? '📍' : '?'}
                        </div>
                        <div className="mt-4 text-center">
                          <div className={`text-2xl font-bold ${dailyData.weight > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                            {dailyData.weight > 0 ? `${dailyData.weight} kg` : 'Set Today'}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Current Weight</div>
                          <div className="text-xs text-gray-500">Today</div>
                          {dailyData.weight > 0 && weightProgress > 0 && (
                            <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              -{weightProgress.toFixed(1)} kg lost! 🎉
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Target Weight */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg -mt-16 relative z-10">
                          <Target className="w-8 h-8" />
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">{userGoals.targetWeight} kg</div>
                          <div className="text-sm text-gray-600 mt-1">Target Weight</div>
                          <div className="text-xs text-gray-500">{new Date(userGoals.targetDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{weightDifference.toFixed(1)} kg</div>
                      <div className="text-sm text-gray-600">Total to Lose</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{weightProgress.toFixed(1)} kg</div>
                      <div className="text-sm text-gray-600">Progress Made</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">{(weightDifference - weightProgress).toFixed(1)} kg</div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TODAY'S PROGRESS DETAILS */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Activity className="w-6 h-6 mr-2 text-orange-500" />
                  Today's Progress
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Calories Detail */}
                  <div className={`p-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 ${
                    calorieStatus === 'good' ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
                  } text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <Flame className="w-10 h-10" />
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        calorieStatus === 'good' ? 'bg-green-300/50' : 'bg-red-300/50'
                      }`}>
                        {calorieStatus === 'good' ? '✓ On Track' : '⚠ Over Limit'}
                      </div>
                    </div>
                    <div className="text-4xl font-bold mb-2">{totalCalories}</div>
                    <div className="text-sm opacity-90 mb-4">Calories Consumed</div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className="h-3 bg-white/50 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalCalories / userGoals.dailyCalories) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-2 opacity-75">{userGoals.dailyCalories - totalCalories} remaining</div>
                  </div>

                  {/* Protein Detail */}
                  <div className={`p-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 ${
                    proteinStatus === 'good' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                  } text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <Drumstick className="w-10 h-10" />
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        proteinStatus === 'good' ? 'bg-blue-300/50' : 'bg-yellow-300/50'
                      }`}>
                        {proteinStatus === 'good' ? '✓ Great' : '⚠ Low'}
                      </div>
                    </div>
                    <div className="text-4xl font-bold mb-2">{totalProtein}g</div>
                    <div className="text-sm opacity-90 mb-4">Protein Intake</div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className="h-3 bg-white/50 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalProtein / userGoals.dailyProtein) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-2 opacity-75">{Math.max(0, userGoals.dailyProtein - totalProtein)}g remaining</div>
                  </div>

                  {/* Workout Minutes Detail */}
                  <div className={`p-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 ${
                    workoutStatus === 'good' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'
                  } text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <Dumbbell className="w-10 h-10" />
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        workoutStatus === 'good' ? 'bg-purple-300/50' : 'bg-gray-300/50'
                      }`}>
                        {workoutStatus === 'good' ? '✓ Complete' : '⏳ Pending'}
                      </div>
                    </div>
                    <div className="text-4xl font-bold mb-2">{totalWorkoutMinutes}</div>
                    <div className="text-sm opacity-90 mb-4">Workout Minutes</div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className="h-3 bg-white/50 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalWorkoutMinutes / userGoals.dailyWorkoutMinutes) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-2 opacity-75">{Math.max(0, userGoals.dailyWorkoutMinutes - totalWorkoutMinutes)} min remaining</div>
                  </div>
                </div>
              </div>

              {/* TODAY'S ACTIVITIES & CALENDAR */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Food Log */}
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <Utensils className="w-6 h-6 mr-2 text-orange-500" />
                      Today's Meals
                    </h3>
                    <button
                      onClick={() => setShowAddFood(true)}
                      className="p-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {dailyData.foods.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No meals logged yet</p>
                        <p className="text-sm">Start tracking your nutrition!</p>
                      </div>
                    ) : (
                      dailyData.foods.map(food => (
                        <div key={food.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{food.name}</div>
                            <div className="text-sm text-gray-600">
                              {food.calories} cal • {food.protein}g protein • {food.time}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteFood(food.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Workout Log */}
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <Dumbbell className="w-6 h-6 mr-2 text-blue-500" />
                      Today's Workouts
                    </h3>
                    <button
                      onClick={() => setShowAddWorkout(true)}
                      className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {dailyData.workouts.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No workouts logged yet</p>
                        <p className="text-sm">Time to get moving!</p>
                      </div>
                    ) : (
                      dailyData.workouts.map(workout => (
                        <div key={workout.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{workout.name}</div>
                            <div className="text-sm text-gray-600">
                              {workout.duration} min • {workout.caloriesBurned} cal burned • {workout.time}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteWorkout(workout.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Daily Stats */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-green-500" />
                    Daily Stats
                  </h3>
                  {!editingStats ? (
                    <button
                      onClick={() => setEditingStats(true)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveStats}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingStats(false)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">Steps</div>
                    {editingStats ? (
                      <input
                        type="number"
                        value={tempStats.steps}
                        onChange={(e) => setTempStats({...tempStats, steps: e.target.value})}
                        className="w-full px-2 py-1 border-2 border-green-300 rounded text-2xl font-bold"
                        placeholder="0"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-green-600">{dailyData.steps || 0}</div>
                    )}
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">Water (ml)</div>
                    {editingStats ? (
                      <input
                        type="number"
                        value={tempStats.water}
                        onChange={(e) => setTempStats({...tempStats, water: e.target.value})}
                        className="w-full px-2 py-1 border-2 border-blue-300 rounded text-2xl font-bold"
                        placeholder="0"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-blue-600">{dailyData.water || 0}</div>
                    )}
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">Sleep (hrs)</div>
                    {editingStats ? (
                      <input
                        type="number"
                        value={tempStats.sleep}
                        onChange={(e) => setTempStats({...tempStats, sleep: e.target.value})}
                        className="w-full px-2 py-1 border-2 border-purple-300 rounded text-2xl font-bold"
                        placeholder="0"
                        step="0.5"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-purple-600">{dailyData.sleep || 0}</div>
                    )}
                  </div>

                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">Weight (kg)</div>
                    {editingStats ? (
                      <input
                        type="number"
                        value={tempStats.weight}
                        onChange={(e) => setTempStats({...tempStats, weight: e.target.value})}
                        className="w-full px-2 py-1 border-2 border-orange-300 rounded text-2xl font-bold"
                        placeholder="0"
                        step="0.1"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-orange-600">{dailyData.weight || 0}</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Add Food Modal */}
          {showAddFood && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-3xl">
                <h3 className="text-2xl font-bold mb-6">Add Food</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Food Name</label>
                    <input
                      type="text"
                      value={newFood.name}
                      onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                      placeholder="e.g., Chicken Breast"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Calories</label>
                      <input
                        type="number"
                        value={newFood.calories}
                        onChange={(e) => setNewFood({...newFood, calories: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Protein (g)</label>
                      <input
                        type="number"
                        value={newFood.protein}
                        onChange={(e) => setNewFood({...newFood, protein: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleAddFood}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      Add Food
                    </button>
                    <button
                      onClick={() => {
                        setShowAddFood(false);
                        setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Workout Modal */}
          {showAddWorkout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-3xl">
                <h3 className="text-2xl font-bold mb-6">Add Workout</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Workout Name</label>
                    <input
                      type="text"
                      value={newWorkout.name}
                      onChange={(e) => setNewWorkout({...newWorkout, name: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., Morning Run"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (min)</label>
                      <input
                        type="number"
                        value={newWorkout.duration}
                        onChange={(e) => setNewWorkout({...newWorkout, duration: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Calories Burned</label>
                      <input
                        type="number"
                        value={newWorkout.caloriesBurned}
                        onChange={(e) => setNewWorkout({...newWorkout, caloriesBurned: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleAddWorkout}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      Add Workout
                    </button>
                    <button
                      onClick={() => {
                        setShowAddWorkout(false);
                        setNewWorkout({ name: '', duration: '', caloriesBurned: '' });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Pages - Coming Soon */}
          {currentPage !== 'dashboard' && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  {currentPage === 'diet' && <Utensils className="w-12 h-12 text-white" />}
                  {currentPage === 'workout' && <Dumbbell className="w-12 h-12 text-white" />}
                  {currentPage === 'ai-agents' && <Bot className="w-12 h-12 text-white" />}
                  {currentPage === 'friends' && <Users className="w-12 h-12 text-white" />}
                </div>
                <h2 className="text-3xl font-bold mb-4 capitalize">{currentPage.replace('-', ' ')}</h2>
                <p className="text-gray-600 text-lg">Coming soon! Stay tuned for amazing features.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
