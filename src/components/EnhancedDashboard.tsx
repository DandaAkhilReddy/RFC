import { useState } from 'react';
import { transition } from '@ssgoi/react';
import { fly } from '@ssgoi/react/transitions';
import {
  Camera, Plus, Edit2, Check, X, Trash2, Upload, Image as ImageIcon,
  Utensils, Dumbbell, TrendingUp, Calendar, Clock, Target, Flame,
  Activity, Heart, Settings, LogOut, Menu, Bell, Home, User, ChevronDown,
  Save, Apple, Coffee, Drumstick, Cookie, Info, BarChart3, Sparkles, Zap,
  Users, Share2, Smartphone, Radio, Bot, Send, UserPlus, Trophy, Lock
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

export default function EnhancedDashboard() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [showNFCShare, setShowNFCShare] = useState(false);

  const [dailyData, setDailyData] = useState<DailyActivity>({
    date: currentDate,
    steps: 0,
    water: 0,
    sleep: 0,
    weight: 0,
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

  const handleAddFood = () => {
    if (!newFood.name || !newFood.calories) {
      setToast({ message: 'Please enter food name and calories', type: 'error' });
      return;
    }

    const foodEntry: FoodEntry = {
      id: Date.now().toString(),
      name: newFood.name,
      calories: parseInt(newFood.calories),
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
    setToast({ message: 'Food added successfully!', type: 'success' });
  };

  const handleAddWorkout = () => {
    if (!newWorkout.name || !newWorkout.duration) {
      setToast({ message: 'Please enter workout name and duration', type: 'error' });
      return;
    }

    const workoutEntry: WorkoutEntry = {
      id: Date.now().toString(),
      name: newWorkout.name,
      duration: parseInt(newWorkout.duration),
      caloriesBurned: parseInt(newWorkout.caloriesBurned) || 0,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setDailyData(prev => ({
      ...prev,
      workouts: [...prev.workouts, workoutEntry]
    }));

    setNewWorkout({ name: '', duration: '', caloriesBurned: '' });
    setShowAddWorkout(false);
    setToast({ message: 'Workout added successfully!', type: 'success' });
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDailyData(prev => ({
            ...prev,
            photos: [...prev.photos, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
      setToast({ message: 'Photos uploaded!', type: 'success' });
    }
  };

  const totalCalories = dailyData.foods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = dailyData.foods.reduce((sum, food) => sum + food.protein, 0);
  const totalCarbs = dailyData.foods.reduce((sum, food) => sum + food.carbs, 0);
  const totalFat = dailyData.foods.reduce((sum, food) => sum + food.fat, 0);
  const totalCaloriesBurned = dailyData.workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);
  const netCalories = totalCalories - totalCaloriesBurned;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white/90 backdrop-blur-md shadow-2xl transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'} border-r border-gray-200`}>
        <div className="p-6 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <Logo size={40} showText={true} />
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
          {/* Share Button - Floating */}
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
              <div
                ref={transition({
                  key: 'header',
                  ...fly({ y: -50, opacity: true })
                })}
                className="flex justify-between items-center mb-8"
              >
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                    Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
                  </h1>
                  <p className="text-gray-600 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                    Track your daily fitness journey
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition"
                  />
                </div>
              </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div
              ref={transition({
                key: 'stat-1',
                ...fly({ x: -100, opacity: true })
              })}
              className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Utensils className="w-8 h-8" />
                  <span className="text-sm opacity-90">Calories</span>
                </div>
                <div className="text-4xl font-bold">{totalCalories}</div>
                <div className="text-sm opacity-90 mt-1">Net: {netCalories}</div>
              </div>
            </div>

            <div
              ref={transition({
                key: 'stat-2',
                ...fly({ y: -100, opacity: true })
              })}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Dumbbell className="w-8 h-8" />
                  <span className="text-sm opacity-90">Workouts</span>
                </div>
                <div className="text-4xl font-bold">{dailyData.workouts.length}</div>
                <div className="text-sm opacity-90 mt-1">{totalCaloriesBurned} cal burned</div>
              </div>
            </div>

            <div
              ref={transition({
                key: 'stat-3',
                ...fly({ y: -100, opacity: true })
              })}
              className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8" />
                  <span className="text-sm opacity-90">Steps</span>
                </div>
                {editingStats ? (
                  <input
                    type="number"
                    value={dailyData.steps}
                    onChange={(e) => setDailyData(prev => ({ ...prev, steps: parseInt(e.target.value) || 0 }))}
                    className="text-4xl font-bold w-full border-b-2 border-white focus:outline-none bg-transparent"
                  />
                ) : (
                  <div className="text-4xl font-bold">{dailyData.steps}</div>
                )}
                <div className="text-sm opacity-90 mt-1">Daily goal: 10,000</div>
              </div>
            </div>

            <div
              ref={transition({
                key: 'stat-4',
                ...fly({ x: 100, opacity: true })
              })}
              className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="w-8 h-8" />
                  <span className="text-sm opacity-90">Weight</span>
                </div>
                {editingStats ? (
                  <input
                    type="number"
                    step="0.1"
                    value={dailyData.weight}
                    onChange={(e) => setDailyData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    className="text-4xl font-bold w-full border-b-2 border-white focus:outline-none bg-transparent"
                  />
                ) : (
                  <div className="text-4xl font-bold">{dailyData.weight} kg</div>
                )}
                <button
                  onClick={() => setEditingStats(!editingStats)}
                  className="text-sm hover:underline mt-1 flex items-center opacity-90 hover:opacity-100 transition"
                >
                  {editingStats ? <><Check className="w-4 h-4 mr-1" /> Save</> : <><Edit2 className="w-4 h-4 mr-1" /> Edit</>}
                </button>
              </div>
            </div>
          </div>

          {/* Macros Breakdown */}
          <div
            ref={transition({
              key: 'macros',
              ...fly({ y: 100, opacity: true })
            })}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-gray-200 hover:shadow-3xl transition-all"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              <Target className="w-7 h-7 mr-2 text-orange-500" />
              Today's Macros
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{totalProtein}g</div>
                <div className="text-sm text-gray-600 font-semibold mt-1">Protein</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 transition">
                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">{totalCarbs}g</div>
                <div className="text-sm text-gray-600 font-semibold mt-1">Carbs</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{totalFat}g</div>
                <div className="text-sm text-gray-600 font-semibold mt-1">Fat</div>
              </div>
            </div>
          </div>

          {/* Food Tracking */}
          <div
            ref={transition({
              key: 'food',
              ...fly({ x: -100, opacity: true })
            })}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-gray-200 hover:shadow-3xl transition-all"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                <Utensils className="w-7 h-7 mr-2 text-orange-500" />
                Food Log
              </h3>
              <button
                onClick={() => setShowAddFood(!showAddFood)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Food
              </button>
            </div>

            {showAddFood && (
              <div className="bg-orange-50 p-4 rounded-xl mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Food name"
                    value={newFood.name}
                    onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                    className="px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Calories"
                    value={newFood.calories}
                    onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                    className="px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={newFood.protein}
                    onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                    className="px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Carbs (g)"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                    className="px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Fat (g)"
                    value={newFood.fat}
                    onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                    className="px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddFood}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddFood(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {dailyData.foods.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Apple className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>No food logged today. Start tracking your meals!</p>
                </div>
              ) : (
                dailyData.foods.map(food => (
                  <div key={food.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div>
                      <div className="font-semibold text-gray-800">{food.name}</div>
                      <div className="text-sm text-gray-600">
                        {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g • {food.time}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFood(food.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Workout Tracking */}
          <div
            ref={transition({
              key: 'workout',
              ...fly({ x: 100, opacity: true })
            })}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-gray-200 hover:shadow-3xl transition-all"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                <Dumbbell className="w-7 h-7 mr-2 text-blue-500" />
                Workout Log
              </h3>
              <button
                onClick={() => setShowAddWorkout(!showAddWorkout)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Workout
              </button>
            </div>

            {showAddWorkout && (
              <div className="bg-blue-50 p-4 rounded-xl mb-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Workout name"
                    value={newWorkout.name}
                    onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                    className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Duration (min)"
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                    className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Calories burned"
                    value={newWorkout.caloriesBurned}
                    onChange={(e) => setNewWorkout({ ...newWorkout, caloriesBurned: e.target.value })}
                    className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddWorkout}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddWorkout(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {dailyData.workouts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Dumbbell className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>No workouts logged today. Get moving!</p>
                </div>
              ) : (
                dailyData.workouts.map(workout => (
                  <div key={workout.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div>
                      <div className="font-semibold text-gray-800">{workout.name}</div>
                      <div className="text-sm text-gray-600">
                        {workout.duration} min • {workout.caloriesBurned} cal burned • {workout.time}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Photo Gallery */}
          <div
            ref={transition({
              key: 'photos',
              ...fly({ y: 100, opacity: true })
            })}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200 hover:shadow-3xl transition-all"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                <Camera className="w-7 h-7 mr-2 text-purple-500" />
                Progress Photos
              </h3>
              <label className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center cursor-pointer font-semibold">
                <Upload className="w-5 h-5 mr-2" />
                Upload Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {dailyData.photos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>No photos uploaded yet. Track your progress visually!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dailyData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img src={photo} alt={`Progress ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
                    <button
                      onClick={() => setDailyData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          </>
          )}

          {/* Diet & Nutrition Page */}
          {currentPage === 'diet' && (
            <div className="text-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-2xl mx-auto shadow-2xl">
                <Lock className="w-24 h-24 mx-auto mb-6 text-orange-500" />
                <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
                  Diet & Nutrition
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  AI-powered meal planning and nutrition tracking coming soon!
                </p>
                <div className="text-left bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                    What's Coming:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                      <span>AI meal recommendations based on your goals</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                      <span>Photo-based calorie & macro tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                      <span>Personalized nutrition plans</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Workout Page */}
          {currentPage === 'workout' && (
            <div className="text-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-2xl mx-auto shadow-2xl">
                <Lock className="w-24 h-24 mx-auto mb-6 text-blue-500" />
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-4">
                  Smart Workouts
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  AI-generated workout plans tailored to your fitness level!
                </p>
                <div className="text-left bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
                    What's Coming:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                      <span>Personalized workout routines</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                      <span>Form correction with AI video analysis</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                      <span>Progressive overload tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* AI Agents Page */}
          {currentPage === 'ai-agents' && (
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-8">
                Your AI Fitness Squad
              </h1>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Reddy AI */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">Reddy AI</h3>
                  <p className="text-gray-600 text-center mb-4">Your Personal Fitness Coach</p>
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-700">24/7 AI coaching, meal plans, workout routines, and motivation!</p>
                  </div>
                  <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Coming Soon
                  </button>
                </div>

                {/* Rapid AI */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all border-2 border-purple-500">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">Rapid AI</h3>
                  <p className="text-gray-600 text-center mb-4">Get Your Six Pack Fast!</p>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-700 font-semibold mb-2">🎯 The Six-Pack System:</p>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• AI body fat % analysis</li>
                      <li>• Daily scoring & rewards</li>
                      <li>• Personalized 6-pack roadmap</li>
                      <li>• Progress streaks & badges</li>
                    </ul>
                  </div>
                  <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Coming Soon
                  </button>
                </div>

                {/* Cupid AI */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">Cupid AI</h3>
                  <p className="text-gray-600 text-center mb-4">Find Your Fitness Soulmate</p>
                  <div className="bg-pink-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-700">Match with fitness partners who share your goals and vibe!</p>
                  </div>
                  <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Coming Soon
                  </button>
                </div>
              </div>

              {/* The Journey */}
              <div className="mt-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl p-8 text-white">
                <h3 className="text-3xl font-bold text-center mb-6">Your Fitness Journey</h3>
                <div className="flex items-center justify-center space-x-4 text-center">
                  <div>
                    <Bot className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold">Reddy</p>
                    <p className="text-xs opacity-90">Get Fit</p>
                  </div>
                  <div className="text-2xl">→</div>
                  <div>
                    <Zap className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold">Rapid</p>
                    <p className="text-xs opacity-90">Get Shredded</p>
                  </div>
                  <div className="text-2xl">→</div>
                  <div>
                    <Heart className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold">Cupid</p>
                    <p className="text-xs opacity-90">Get Love</p>
                  </div>
                  <div className="text-2xl">→</div>
                  <div>
                    <Trophy className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold">Together</p>
                    <p className="text-xs opacity-90">Win Life!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Friends Page */}
          {currentPage === 'friends' && (
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
                Your Fitness Crew
              </h1>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
                    <Users className="w-7 h-7 mr-2 text-purple-500" />
                    Friends List
                  </h3>
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No friends yet. Start sharing!</p>
                    <button
                      onClick={() => setShowNFCShare(true)}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
                    >
                      <UserPlus className="w-5 h-5 inline mr-2" />
                      Add Friends
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
                    <Trophy className="w-7 h-7 mr-2 text-orange-500" />
                    Group Challenges
                  </h3>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                    <p className="text-center text-gray-600 font-semibold">Coming Soon!</p>
                    <p className="text-center text-sm text-gray-500 mt-2">Compete with friends in fitness challenges</p>
                  </div>
                </div>
              </div>

              {/* Share Methods */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6 text-center">Share with Friends</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowNFCShare(true)}
                    className="bg-white/20 backdrop-blur-sm p-6 rounded-xl hover:bg-white/30 transition"
                  >
                    <Smartphone className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Touch Phones (NFC)</p>
                    <p className="text-sm opacity-90 mt-1">Instantly connect by touching devices</p>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://reddyfit.app/add/${user?.uid}`);
                      setToast({ message: '🔗 Link copied!', type: 'success' });
                    }}
                    className="bg-white/20 backdrop-blur-sm p-6 rounded-xl hover:bg-white/30 transition"
                  >
                    <Share2 className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Share Link</p>
                    <p className="text-sm opacity-90 mt-1">Copy and share your friend code</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animation Styles */}
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
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
