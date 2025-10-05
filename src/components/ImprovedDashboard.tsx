import { useState, useEffect } from 'react';
import { transition } from '@ssgoi/react';
import { fly } from '@ssgoi/react/transitions';
import {
  Camera, Plus, Edit2, Check, X, Trash2, Upload, Image as ImageIcon,
  Utensils, Dumbbell, TrendingUp, Calendar, Clock, Target, Flame,
  Activity, Heart, Settings, LogOut, Menu, Bell, Home, User, ChevronDown,
  Save, Apple, Coffee, Drumstick, Cookie, Info, BarChart3, Sparkles, Zap,
  Users, Share2, Smartphone, Radio, Bot, Send, UserPlus, Trophy, Lock,
  TrendingDown, Award, ChevronRight, AlertCircle, Shield, CheckCircle2,
  ArrowLeft, Mic, Brain
} from 'lucide-react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db, Collections } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import ToastNotification from './ToastNotification';
import Logo from './Logo';
import RapidAIPage from './RapidAIPage';
import CupidAIPage from './CupidAIPage';
import SettingsPage from './SettingsPage';
import CommunityPage from './CommunityPage';
import AgentRapidInfo from './AgentRapidInfo';
import AgentCupidInfo from './AgentCupidInfo';
import PhotoFoodInput from './PhotoFoodInput';
import VoiceNoteInput from './VoiceNoteInput';
import PhotoWorkoutInput from './PhotoWorkoutInput';
import InsightCard from './InsightCard';
import ProgressCard from './ProgressCard';
import { generateInsights, calculateDailyTotals } from '../lib/insightGenerator';
import {
  celebrateCalorieGoal,
  celebrateProteinGoal,
  celebrateWorkout,
  celebrateStreak,
  celebrateWeightMilestone,
  celebrateFirstEntry,
  megaCelebration
} from '../lib/animations';

type PageType = 'dashboard' | 'diet' | 'workout' | 'ai-agents' | 'friends' | 'rapid-ai' | 'cupid-ai' | 'settings' | 'agent-rapid-info' | 'agent-cupid-info';

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
    weight: userGoals.currentWeight,
    photos: [],
    foods: [],
    workouts: [],
    notes: ''
  });

  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [editingStats, setEditingStats] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingSteps, setEditingSteps] = useState(false);
  const [foodInputMode, setFoodInputMode] = useState<'photo' | 'voice' | 'manual'>('photo');
  const [workoutInputMode, setWorkoutInputMode] = useState<'photo' | 'manual'>('photo');

  // Celebration tracking
  const [celebratedToday, setCelebratedToday] = useState({
    calories: false,
    protein: false,
    workout: false,
    streak: false,
    weight: false
  });

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
    weight: ''
  });

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;

      try {
        // Load user goals
        const userDoc = await getDoc(doc(db, Collections.USERS, user.uid));
        if (userDoc.exists() && userDoc.data().goals) {
          setUserGoals(userDoc.data().goals);
        }

        // Load daily data for current date
        const dailyDataDoc = await getDoc(doc(db, Collections.USERS, user.uid, 'daily_activities', currentDate));
        if (dailyDataDoc.exists()) {
          setDailyData(dailyDataDoc.data() as DailyActivity);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setToast({ message: '⚠️ Failed to load data from database', type: 'error' });
      }
    };

    loadUserData();
  }, [user, currentDate]);

  // Calculate streak
  useEffect(() => {
    const calculateStreak = async () => {
      if (!user?.uid) return;

      try {
        const activitiesRef = collection(db, Collections.USERS, user.uid, 'daily_activities');
        const activitiesSnapshot = await getDocs(activitiesRef);

        if (activitiesSnapshot.empty) {
          setStreak(0);
          return;
        }

        // Get all dates with activities and sort descending
        const dates = activitiesSnapshot.docs
          .map(doc => doc.id)
          .sort((a, b) => b.localeCompare(a));

        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];

        // Start from today and count backwards
        for (let i = 0; i < dates.length; i++) {
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() - i);
          const expectedDateStr = expectedDate.toISOString().split('T')[0];

          if (dates.includes(expectedDateStr)) {
            currentStreak++;
          } else {
            break;
          }
        }

        setStreak(currentStreak);
      } catch (error) {
        console.error('Error calculating streak:', error);
      }
    };

    calculateStreak();
  }, [user, dailyData]);

  // Save daily data to Firestore whenever it changes
  useEffect(() => {
    const saveDailyData = async () => {
      if (!user?.uid || dailyData.foods.length === 0 && dailyData.workouts.length === 0) return;

      try {
        await setDoc(doc(db, Collections.USERS, user.uid, 'daily_activities', currentDate), dailyData);
        console.log('✅ Daily data saved to Firestore');
      } catch (error) {
        console.error('Error saving daily data:', error);
      }
    };

    // Debounce saves
    const timer = setTimeout(saveDailyData, 1000);
    return () => clearTimeout(timer);
  }, [dailyData, user, currentDate]);

  // Save user goals to Firestore whenever they change
  useEffect(() => {
    const saveUserGoals = async () => {
      if (!user?.uid) return;

      try {
        await updateDoc(doc(db, Collections.USERS, user.uid), {
          goals: userGoals,
          updatedAt: new Date().toISOString()
        });
        console.log('✅ User goals saved to Firestore');
      } catch (error) {
        console.error('Error saving user goals:', error);
      }
    };

    // Debounce saves
    const timer = setTimeout(saveUserGoals, 1000);
    return () => clearTimeout(timer);
  }, [userGoals, user]);

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

  // Celebration effect - trigger confetti when goals are achieved
  useEffect(() => {
    const todayKey = new Date().toISOString().split('T')[0];

    // Reset celebrations for new day
    if (dailyData.date !== todayKey) {
      setCelebratedToday({
        calories: false,
        protein: false,
        workout: false,
        streak: false,
        weight: false
      });
    }

    // Calorie goal celebration
    if (totalCalories >= userGoals.dailyCalories && !celebratedToday.calories && totalCalories > 0) {
      celebrateCalorieGoal();
      setCelebratedToday(prev => ({ ...prev, calories: true }));
      setToast({ message: '🎉 Daily calorie goal achieved!', type: 'success' });
    }

    // Protein goal celebration
    if (totalProtein >= userGoals.dailyProtein && !celebratedToday.protein && totalProtein > 0) {
      celebrateProteinGoal();
      setCelebratedToday(prev => ({ ...prev, protein: true }));
      setToast({ message: '💪 Protein goal crushed!', type: 'success' });
    }

    // Workout goal celebration
    if (totalWorkoutMinutes >= userGoals.dailyWorkoutMinutes && !celebratedToday.workout && totalWorkoutMinutes > 0) {
      celebrateWorkout();
      setCelebratedToday(prev => ({ ...prev, workout: true }));
      setToast({ message: '🔥 Workout goal completed!', type: 'success' });
    }

    // Streak milestone celebration
    if (streak > 0 && streak % 7 === 0 && !celebratedToday.streak) {
      celebrateStreak(streak);
      setCelebratedToday(prev => ({ ...prev, streak: true }));
      setToast({ message: `🔥 ${streak} day streak! You're unstoppable!`, type: 'success' });
    }

    // Weight milestone celebration (every 1kg lost)
    if (dailyData.weight > 0 && dailyData.weight < userGoals.currentWeight) {
      const weightLost = userGoals.currentWeight - dailyData.weight;
      if (weightLost >= 1 && !celebratedToday.weight) {
        celebrateWeightMilestone();
        setCelebratedToday(prev => ({ ...prev, weight: true }));
        setToast({ message: `📉 Amazing! ${weightLost.toFixed(1)}kg lost!`, type: 'success' });
      }
    }

    // Mega celebration for perfect day (all goals met)
    const perfectDay = totalCalories >= userGoals.dailyCalories &&
                      totalProtein >= userGoals.dailyProtein &&
                      totalWorkoutMinutes >= userGoals.dailyWorkoutMinutes;

    if (perfectDay && celebratedToday.calories && celebratedToday.protein && celebratedToday.workout) {
      setTimeout(() => {
        megaCelebration();
        setToast({ message: '🏆 PERFECT DAY! All goals achieved!', type: 'success' });
      }, 1000);
    }
  }, [totalCalories, totalProtein, totalWorkoutMinutes, streak, dailyData.weight, userGoals, celebratedToday]);
  const weightProgress = userGoals.currentWeight - dailyData.weight;
  const weightProgressPercent = Math.min(100, Math.max(0, (weightProgress / weightDifference) * 100));
  const daysToTarget = Math.ceil((new Date(userGoals.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Progress status
  const calorieStatus = remainingCalories >= 0 ? 'good' : 'over';
  const proteinStatus = totalProtein >= userGoals.dailyProtein * 0.8 ? 'good' : 'low';
  const workoutStatus = totalWorkoutMinutes >= userGoals.dailyWorkoutMinutes ? 'good' : 'pending';

  const handleAddFood = () => {
    try {
      // Validate food name
      if (!newFood.name || newFood.name.trim().length === 0) {
        setToast({ message: '⚠️ Please enter a food name', type: 'error' });
        return;
      }

      if (newFood.name.trim().length > 100) {
        setToast({ message: '⚠️ Food name is too long (max 100 characters)', type: 'error' });
        return;
      }

      // Validate calories
      if (!newFood.calories || newFood.calories.trim().length === 0) {
        setToast({ message: '⚠️ Please enter calories', type: 'error' });
        return;
      }

      const calories = parseInt(newFood.calories);
      if (isNaN(calories) || calories < 0 || calories > 10000) {
        setToast({ message: '⚠️ Calories must be between 0 and 10000', type: 'error' });
        return;
      }

      // Validate protein (optional but if provided must be valid)
      let protein = 0;
      if (newFood.protein && newFood.protein.trim().length > 0) {
        protein = parseInt(newFood.protein);
        if (isNaN(protein) || protein < 0 || protein > 1000) {
          setToast({ message: '⚠️ Protein must be between 0 and 1000g', type: 'error' });
          return;
        }
      }

      // Validate carbs (optional)
      let carbs = 0;
      if (newFood.carbs && newFood.carbs.trim().length > 0) {
        carbs = parseInt(newFood.carbs);
        if (isNaN(carbs) || carbs < 0 || carbs > 1000) {
          setToast({ message: '⚠️ Carbs must be between 0 and 1000g', type: 'error' });
          return;
        }
      }

      // Validate fat (optional)
      let fat = 0;
      if (newFood.fat && newFood.fat.trim().length > 0) {
        fat = parseInt(newFood.fat);
        if (isNaN(fat) || fat < 0 || fat > 1000) {
          setToast({ message: '⚠️ Fat must be between 0 and 1000g', type: 'error' });
          return;
        }
      }

      const foodEntry: FoodEntry = {
        id: Date.now().toString(),
        name: newFood.name.trim(),
        calories,
        protein,
        carbs,
        fat,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      // Celebrate first meal of the day
      const isFirstMeal = dailyData.foods.length === 0;

      setDailyData(prev => ({
        ...prev,
        foods: [...prev.foods, foodEntry]
      }));

      setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
      setShowAddFood(false);
      setToast({ message: `✅ Added ${foodEntry.name}!`, type: 'success' });

      if (isFirstMeal) {
        celebrateFirstEntry();
      }
    } catch (error) {
      console.error('Error adding food:', error);
      setToast({ message: '❌ Failed to add food. Please try again.', type: 'error' });
    }
  };

  const handleAddWorkout = () => {
    try {
      // Validate workout name
      if (!newWorkout.name || newWorkout.name.trim().length === 0) {
        setToast({ message: '⚠️ Please enter a workout name', type: 'error' });
        return;
      }

      if (newWorkout.name.trim().length > 100) {
        setToast({ message: '⚠️ Workout name is too long (max 100 characters)', type: 'error' });
        return;
      }

      // Validate duration
      if (!newWorkout.duration || newWorkout.duration.trim().length === 0) {
        setToast({ message: '⚠️ Please enter workout duration', type: 'error' });
        return;
      }

      const duration = parseInt(newWorkout.duration);
      if (isNaN(duration) || duration <= 0 || duration > 600) {
        setToast({ message: '⚠️ Duration must be between 1 and 600 minutes', type: 'error' });
        return;
      }

      // Validate calories burned (optional)
      let caloriesBurned = 0;
      if (newWorkout.caloriesBurned && newWorkout.caloriesBurned.trim().length > 0) {
        caloriesBurned = parseInt(newWorkout.caloriesBurned);
        if (isNaN(caloriesBurned) || caloriesBurned < 0 || caloriesBurned > 5000) {
          setToast({ message: '⚠️ Calories burned must be between 0 and 5000', type: 'error' });
          return;
        }
      }

      const workoutEntry: WorkoutEntry = {
        id: Date.now().toString(),
        name: newWorkout.name.trim(),
        duration,
        caloriesBurned,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      // Celebrate first workout of the day
      const isFirstWorkout = dailyData.workouts.length === 0;

      setDailyData(prev => ({
        ...prev,
        workouts: [...prev.workouts, workoutEntry]
      }));

      setNewWorkout({ name: '', duration: '', caloriesBurned: '' });

      if (isFirstWorkout) {
        celebrateFirstEntry();
      }
      setShowAddWorkout(false);
      setToast({ message: `💪 Added ${workoutEntry.name}!`, type: 'success' });
    } catch (error) {
      console.error('Error adding workout:', error);
      setToast({ message: '❌ Failed to add workout. Please try again.', type: 'error' });
    }
  };

  const handleSaveStats = () => {
    try {
      let steps = 0;
      let water = 0;
      let weight = 0;

      // Validate steps
      if (tempStats.steps && tempStats.steps.trim().length > 0) {
        steps = parseInt(tempStats.steps);
        if (isNaN(steps) || steps < 0 || steps > 100000) {
          setToast({ message: '⚠️ Steps must be between 0 and 100,000', type: 'error' });
          return;
        }
      }

      // Validate water
      if (tempStats.water && tempStats.water.trim().length > 0) {
        water = parseInt(tempStats.water);
        if (isNaN(water) || water < 0 || water > 10000) {
          setToast({ message: '⚠️ Water must be between 0 and 10,000ml', type: 'error' });
          return;
        }
      }

      // Validate weight
      if (tempStats.weight && tempStats.weight.trim().length > 0) {
        weight = parseFloat(tempStats.weight);
        if (isNaN(weight) || weight < 20 || weight > 300) {
          setToast({ message: '⚠️ Weight must be between 20 and 300kg', type: 'error' });
          return;
        }
      }

      setDailyData(prev => ({
        ...prev,
        steps: steps > 0 ? steps : prev.steps,
        water: water > 0 ? water : prev.water,
        weight: weight > 0 ? weight : prev.weight
      }));

      setEditingStats(false);
      setToast({ message: '✅ Stats updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error saving stats:', error);
      setToast({ message: '❌ Failed to save stats. Please try again.', type: 'error' });
    }
  };

  const handleDeleteFood = (id: string) => {
    try {
      if (!id) {
        setToast({ message: '⚠️ Invalid food entry', type: 'error' });
        return;
      }

      setDailyData(prev => ({
        ...prev,
        foods: prev.foods.filter(food => food.id !== id)
      }));
      setToast({ message: '🗑️ Food entry deleted', type: 'info' });
    } catch (error) {
      console.error('Error deleting food:', error);
      setToast({ message: '❌ Failed to delete food entry', type: 'error' });
    }
  };

  const handleDeleteWorkout = (id: string) => {
    try {
      if (!id) {
        setToast({ message: '⚠️ Invalid workout entry', type: 'error' });
        return;
      }

      setDailyData(prev => ({
        ...prev,
        workouts: prev.workouts.filter(workout => workout.id !== id)
      }));
      setToast({ message: '🗑️ Workout entry deleted', type: 'info' });
    } catch (error) {
      console.error('Error deleting workout:', error);
      setToast({ message: '❌ Failed to delete workout entry', type: 'error' });
    }
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

  // Auto-update calendar at midnight
  useEffect(() => {
    const checkDate = () => {
      const today = new Date().toISOString().split('T')[0];
      if (today !== currentDate) {
        setCurrentDate(today);
        setToast({
          message: '🌅 New day started! Good morning!',
          type: 'success'
        });
        // Reset daily data for new day
        setDailyData({
          date: today,
          steps: 0,
          water: 0,
          weight: 0,
          photos: [],
          foods: [],
          workouts: [],
          notes: ''
        });
      }
    };

    // Check every minute
    const interval = setInterval(checkDate, 60000);

    return () => clearInterval(interval);
  }, [currentDate]);

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
            {sidebarOpen && <span className="ml-3 font-semibold">AI Features</span>}
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
            {sidebarOpen && <span className="ml-3 font-semibold">Community</span>}
          </button>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <button
              onClick={() => setCurrentPage('settings')}
              className={`w-full flex items-center px-6 py-3 transition group ${
                currentPage === 'settings'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <Settings className={`w-5 h-5 transition ${
                currentPage === 'settings' ? 'text-blue-600' : 'group-hover:text-blue-600'
              }`} />
              {sidebarOpen && <span className={`ml-3 font-semibold transition ${
                currentPage === 'settings' ? 'text-blue-600' : 'group-hover:text-blue-600'
              }`}>Settings</span>}
            </button>

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
          {/* Quick Action Buttons - Add Meal & Add Workout */}
          {(currentPage === 'dashboard' || currentPage === 'diet' || currentPage === 'workout') && (
            <div className="fixed bottom-8 right-8 z-50 flex flex-col-reverse gap-3">
              {/* Share Button */}
              <button
                onClick={() => setShowNFCShare(true)}
                className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center space-x-2"
              >
                <Share2 className="w-6 h-6" />
                <span className="font-semibold">Share</span>
              </button>

              {/* Add Workout Button */}
              <button
                onClick={() => setShowAddWorkout(true)}
                className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center space-x-2 group"
                title="Add Workout"
              >
                <Dumbbell className="w-6 h-6" />
                <span className="font-semibold">Add Workout</span>
              </button>

              {/* Add Meal Button */}
              <button
                onClick={() => setShowAddFood(true)}
                className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center space-x-2 group"
                title="Add Meal"
              >
                <Utensils className="w-6 h-6" />
                <span className="font-semibold">Add Meal</span>
              </button>
            </div>
          )}

          {/* Keep original Share button visible on other pages */}
          {currentPage !== 'dashboard' && currentPage !== 'diet' && currentPage !== 'workout' && (
            <button
              onClick={() => setShowNFCShare(true)}
              className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center space-x-2"
            >
              <Share2 className="w-6 h-6" />
              <span className="font-semibold">Share</span>
            </button>
          )}

          {/* NFC Share Modal */}
          {showNFCShare && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-3xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Share with Friends</h3>
                  <p className="text-gray-600 mb-2">Share your profile link with friends</p>
                  <div className="inline-flex items-center bg-orange-100 text-orange-700 rounded-full px-3 py-1 text-xs font-semibold mb-4">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Web Version
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://delightful-sky-0437f100f.2.azurestaticapps.net/add/${user?.uid}`);
                        setToast({ message: '🔗 Friend link copied!', type: 'success' });
                        setShowNFCShare(false);
                      }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Copy Website Link</span>
                    </button>

                    <div className="relative">
                      <button
                        disabled
                        className="w-full px-6 py-4 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed flex items-center justify-center space-x-2 font-semibold relative"
                      >
                        <Radio className="w-5 h-5" />
                        <span>NFC Share</span>
                      </button>
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Coming Soon in Mobile Apps
                      </div>
                    </div>

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

          {/* Set Goals Modal */}
          {showSetGoals && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center">
                    <Target className="w-7 h-7 mr-2 text-blue-500" />
                    Set Your Goals
                  </h3>
                  <button
                    onClick={() => setShowSetGoals(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Target Weight */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={userGoals.targetWeight}
                      onChange={(e) => setUserGoals({...userGoals, targetWeight: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                      placeholder="75"
                    />
                  </div>

                  {/* Daily Steps Goal */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Daily Steps Goal
                    </label>
                    <input
                      type="number"
                      value={10000}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-lg"
                      placeholder="10000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Currently fixed at 10,000 steps/day</p>
                  </div>

                  {/* Daily Calories */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Daily Calorie Goal
                    </label>
                    <input
                      type="number"
                      value={userGoals.dailyCalories}
                      onChange={(e) => setUserGoals({...userGoals, dailyCalories: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                      placeholder="2000"
                    />
                  </div>

                  {/* Daily Workout Minutes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Daily Workout Minutes
                    </label>
                    <input
                      type="number"
                      value={userGoals.dailyWorkoutMinutes}
                      onChange={(e) => setUserGoals({...userGoals, dailyWorkoutMinutes: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                      placeholder="30"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowSetGoals(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await setDoc(doc(db, Collections.USERS, user!.uid), {
                            goals: userGoals
                          }, { merge: true });
                          setToast({ message: '✅ Goals saved successfully!', type: 'success' });
                          setShowSetGoals(false);
                        } catch (error) {
                          console.error('Error saving goals:', error);
                          setToast({ message: '⚠️ Failed to save goals', type: 'error' });
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition font-semibold"
                    >
                      Save Goals
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
                  <h1 className="text-4xl font-bold text-gray-800 mb-1">
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}!
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full text-white shadow-lg">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold text-lg">{streak}</span>
                  <span className="text-sm opacity-90">day{streak !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Today's Progress - 4 Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {/* Weight Card */}
                <div
                  onClick={() => setEditingWeight(true)}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl shadow-lg text-white cursor-pointer hover:shadow-xl transition-all flex flex-col justify-between min-h-[140px]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Weight</h3>
                    <TrendingDown className="w-4 h-4 opacity-75" />
                  </div>
                  {editingWeight ? (
                    <div className="flex flex-col items-center space-y-2">
                      <input
                        type="number"
                        step="0.1"
                        value={dailyData.weight}
                        onChange={(e) => setDailyData({...dailyData, weight: parseFloat(e.target.value) || 0})}
                        className="w-full px-2 py-1 rounded-lg text-gray-800 text-lg font-bold text-center"
                        placeholder="Enter weight"
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingWeight(false);
                        }}
                        className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition text-xs"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-center my-2">
                        {dailyData.weight > 0 ? dailyData.weight : '--'}
                        <span className="text-lg ml-1">kg</span>
                      </div>
                      <div className="flex justify-between items-center text-xs opacity-90">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDailyData({...dailyData, weight: Math.max(0, dailyData.weight - 0.1)});
                          }}
                          className="px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition"
                        >
                          -
                        </button>
                        <span className="text-xs">→ {userGoals.targetWeight}kg</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDailyData({...dailyData, weight: dailyData.weight + 0.1});
                          }}
                          className="px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition"
                        >
                          +
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Steps Card */}
                <div
                  onClick={() => setEditingSteps(true)}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg text-white cursor-pointer hover:shadow-xl transition-all flex flex-col justify-between min-h-[140px]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Steps</h3>
                    <Activity className="w-4 h-4 opacity-75" />
                  </div>
                  {editingSteps ? (
                    <div className="flex flex-col items-center space-y-2">
                      <input
                        type="number"
                        value={dailyData.steps}
                        onChange={(e) => setDailyData({...dailyData, steps: parseInt(e.target.value) || 0})}
                        className="w-full px-2 py-1 rounded-lg text-gray-800 text-lg font-bold text-center"
                        placeholder="Enter steps"
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSteps(false);
                        }}
                        className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition text-xs"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center flex-1 flex items-center justify-center">
                        <div className="text-2xl font-bold">{dailyData.steps.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="w-full bg-white/20 rounded-full h-1.5">
                          <div
                            className="h-1.5 bg-white rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (dailyData.steps / 10000) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs opacity-75 mt-1">Goal: 10k</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Workout Card */}
                <div
                  onClick={() => setShowAddWorkout(true)}
                  className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-xl shadow-lg text-white cursor-pointer hover:shadow-xl transition-all flex flex-col justify-between min-h-[140px]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Workout</h3>
                    <Dumbbell className="w-4 h-4 opacity-75" />
                  </div>
                  <div className="text-center flex-1 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold">{totalWorkoutMinutes}</div>
                    <div className="text-xs opacity-90 mt-1">minutes today</div>
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-xs opacity-90">
                    <Plus className="w-3 h-3" />
                    <span>Log workout</span>
                  </div>
                </div>
              </div>

              {/* Goals Strip */}
              <div
                onClick={() => setShowSetGoals(true)}
                className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg mb-6 cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">Goals:</span>
                    <span className="text-sm">
                      {userGoals.targetWeight}kg • {(userGoals.dailyCalories / 1000).toFixed(0)}k cal/day • {userGoals.dailyWorkoutMinutes}min workout
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Progress Visualizations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ProgressCard
                  icon="🔥"
                  label="Daily Calories"
                  current={calculateDailyTotals({
                    steps: dailyData.steps,
                    water: dailyData.water,
                    weight: dailyData.weight,
                    foods: dailyData.foods.map(f => ({ calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat })),
                    workouts: dailyData.workouts.map(w => ({ caloriesBurned: w.caloriesBurned.toString(), duration: w.duration.toString() }))
                  }).netCalories}
                  target={userGoals.dailyCalories}
                  unit="calories"
                  color="orange"
                />
                <ProgressCard
                  icon="💪"
                  label="Daily Protein"
                  current={calculateDailyTotals({
                    steps: dailyData.steps,
                    water: dailyData.water,
                    weight: dailyData.weight,
                    foods: dailyData.foods.map(f => ({ calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat })),
                    workouts: dailyData.workouts.map(w => ({ caloriesBurned: w.caloriesBurned.toString(), duration: w.duration.toString() }))
                  }).protein}
                  target={userGoals.dailyProtein}
                  unit="grams"
                  color="blue"
                />
              </div>

              {/* AI Insights */}
              {(() => {
                const insights = generateInsights(
                  {
                    steps: dailyData.steps,
                    water: dailyData.water,
                    weight: dailyData.weight,
                    foods: dailyData.foods.map(f => ({ calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat })),
                    workouts: dailyData.workouts.map(w => ({ caloriesBurned: w.caloriesBurned.toString(), duration: w.duration.toString() }))
                  },
                  {
                    dailyCalories: userGoals.dailyCalories,
                    dailyProtein: userGoals.dailyProtein,
                    targetWeight: userGoals.targetWeight,
                    currentWeight: userGoals.currentWeight
                  },
                  streak
                );

                return insights.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                      Today's Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {insights.map((insight) => (
                        <InsightCard
                          key={insight.id}
                          type={insight.type}
                          icon={insight.icon}
                          title={insight.title}
                          message={insight.message}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Apple Watch Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 p-6 rounded-2xl mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">Coming Soon: Apple Watch Integration</h3>
                      <p className="text-sm text-gray-600">
                        Automatically sync steps, workouts, and sleep data from your Apple Watch
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setToast({ message: 'We\'ll notify you when Apple Watch integration is ready!', type: 'info' })}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition text-sm font-semibold"
                  >
                    Notify me
                  </button>
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
              <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-3xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6">Add Meal</h3>

                {/* Tab Switcher */}
                <div className="flex mb-6 border-b-2 border-gray-200">
                  <button
                    onClick={() => setFoodInputMode('photo')}
                    className={`flex-1 pb-3 font-semibold transition-all ${
                      foodInputMode === 'photo'
                        ? 'border-b-4 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📸 Photo
                  </button>
                  <button
                    onClick={() => setFoodInputMode('voice')}
                    className={`flex-1 pb-3 font-semibold transition-all ${
                      foodInputMode === 'voice'
                        ? 'border-b-4 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🎤 Voice
                  </button>
                  <button
                    onClick={() => setFoodInputMode('manual')}
                    className={`flex-1 pb-3 font-semibold transition-all ${
                      foodInputMode === 'manual'
                        ? 'border-b-4 border-orange-500 text-orange-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ✍️ Manual
                  </button>
                </div>

                {/* Photo Mode */}
                {foodInputMode === 'photo' && (
                  <PhotoFoodInput
                    onAnalysisComplete={(result) => {
                      // Add meal from photo analysis
                      const foodEntry: FoodEntry = {
                        id: Date.now().toString(),
                        name: result.foods.join(', '),
                        calories: result.calories,
                        protein: result.protein,
                        carbs: result.carbs,
                        fat: result.fats,
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        photo: result.photoUrl
                      };

                      setDailyData(prev => ({
                        ...prev,
                        foods: [...prev.foods, foodEntry]
                      }));

                      setShowAddFood(false);
                      setFoodInputMode('photo'); // Reset for next time
                      setToast({ message: `✅ Added ${foodEntry.name}!`, type: 'success' });
                    }}
                    onCancel={() => {
                      setShowAddFood(false);
                      setFoodInputMode('photo'); // Reset for next time
                    }}
                    userContext={{
                      name: user?.displayName || 'User',
                      email: user?.email || '',
                      startWeight: userGoals.currentWeight,
                      currentWeight: dailyData.weight || userGoals.currentWeight,
                      targetWeight: userGoals.targetWeight,
                      fitnessGoal: 'Lose Weight',
                      currentLevel: 'Intermediate',
                      dailyCalories: userGoals.dailyCalories,
                      dailyProtein: userGoals.dailyProtein
                    }}
                  />
                )}

                {/* Voice Mode */}
                {foodInputMode === 'voice' && (
                  <VoiceNoteInput
                    onAnalysisComplete={(result) => {
                      // Add meal from voice analysis
                      const foodEntry: FoodEntry = {
                        id: Date.now().toString(),
                        name: result.foods.join(', '),
                        calories: result.calories,
                        protein: result.protein,
                        carbs: result.carbs,
                        fat: result.fats,
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      };

                      setDailyData(prev => ({
                        ...prev,
                        foods: [...prev.foods, foodEntry]
                      }));

                      setShowAddFood(false);
                      setFoodInputMode('photo'); // Reset for next time
                      setToast({ message: `✅ Added ${foodEntry.name} from voice!`, type: 'success' });
                    }}
                    onCancel={() => {
                      setShowAddFood(false);
                      setFoodInputMode('photo'); // Reset for next time
                    }}
                    userContext={{
                      name: user?.displayName || 'User',
                      email: user?.email || '',
                      startWeight: userGoals.currentWeight,
                      currentWeight: dailyData.weight || userGoals.currentWeight,
                      targetWeight: userGoals.targetWeight,
                      fitnessGoal: 'Lose Weight',
                      currentLevel: 'Intermediate',
                      dailyCalories: userGoals.dailyCalories,
                      dailyProtein: userGoals.dailyProtein
                    }}
                  />
                )}

                {/* Manual Mode */}
                {foodInputMode === 'manual' && (
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
                          setFoodInputMode('photo'); // Reset for next time
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy Modal */}
          {showPrivacyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-3xl w-full mx-4 shadow-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold flex items-center">
                    <Lock className="w-8 h-8 text-green-500 mr-3" />
                    Your Privacy & Security
                  </h3>
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* End-to-End Encryption Section */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">End-to-End Encryption</h4>
                      <p className="text-sm text-green-600 font-semibold">256-bit AES Military-Grade Security</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    <strong>Even we cannot see your pictures or videos.</strong> All your photos, videos, and sensitive data are encrypted on your device before being uploaded to our servers. This means only you have the decryption keys, and nobody else—including ReddyFit staff—can access your private content.
                  </p>

                  {/* Encryption Process Visual */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-4">
                    <h5 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      How It Works
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                        <div className="text-3xl mb-2">📱</div>
                        <h6 className="font-bold text-sm mb-2">1. Client-Side Encryption</h6>
                        <p className="text-xs text-gray-600">Your photos are encrypted on your device using AES-256 before upload</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                        <div className="text-3xl mb-2">🔐</div>
                        <h6 className="font-bold text-sm mb-2">2. Secure Transfer</h6>
                        <p className="text-xs text-gray-600">Encrypted data is sent over HTTPS with TLS 1.3 to our servers</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                        <div className="text-3xl mb-2">🗝️</div>
                        <h6 className="font-bold text-sm mb-2">3. You Control Keys</h6>
                        <p className="text-xs text-gray-600">Only you have the decryption keys stored securely on your device</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zero-Knowledge Encryption */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">Zero-Knowledge Architecture</h4>
                      <p className="text-sm text-purple-600 font-semibold">We Can't Access Your Data</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    ReddyFit uses a <strong>zero-knowledge encryption model</strong>. This means:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">We never have access to your unencrypted photos or videos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Your encryption keys never leave your device</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Even if our servers were compromised, your data remains encrypted</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">No government, hacker, or ReddyFit employee can decrypt your content</span>
                    </li>
                  </ul>
                </div>

                {/* Technical Details */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">Technical Specifications</h4>
                      <p className="text-sm text-orange-600 font-semibold">Industry-Leading Security Standards</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                      <h6 className="font-bold text-sm mb-2">Encryption Algorithm</h6>
                      <p className="text-xs text-gray-600">AES-256 (Advanced Encryption Standard)</p>
                      <p className="text-xs text-gray-500 mt-1">Same encryption used by banks and governments</p>
                    </div>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                      <h6 className="font-bold text-sm mb-2">Key Length</h6>
                      <p className="text-xs text-gray-600">256-bit encryption keys</p>
                      <p className="text-xs text-gray-500 mt-1">2^256 possible combinations (virtually unbreakable)</p>
                    </div>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                      <h6 className="font-bold text-sm mb-2">Transport Security</h6>
                      <p className="text-xs text-gray-600">TLS 1.3 with Perfect Forward Secrecy</p>
                      <p className="text-xs text-gray-500 mt-1">Secure transmission over the internet</p>
                    </div>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                      <h6 className="font-bold text-sm mb-2">Key Storage</h6>
                      <p className="text-xs text-gray-600">Secure device-level storage</p>
                      <p className="text-xs text-gray-500 mt-1">Keys never transmitted to servers</p>
                    </div>
                  </div>
                </div>

                {/* GDPR & Data Rights */}
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">GDPR Compliant & Your Rights</h4>
                      <p className="text-sm text-blue-600 font-semibold">Full Control Over Your Data</p>
                    </div>
                  </div>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Right to Access:</strong> View all your data anytime</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Right to Deletion:</strong> Permanently delete your account and all data</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Right to Portability:</strong> Export your data in standard formats</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Data Minimization:</strong> We only collect what's necessary</span>
                    </li>
                  </ul>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg"
                >
                  Got it, my data is secure! 🔒
                </button>
              </div>
            </div>
          )}

          {/* Add Workout Modal */}
          {showAddWorkout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-3xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6">Add Workout</h3>

                {/* Tab Switcher */}
                <div className="flex mb-6 border-b-2 border-gray-200">
                  <button
                    onClick={() => setWorkoutInputMode('photo')}
                    className={`flex-1 pb-3 font-semibold transition-all ${
                      workoutInputMode === 'photo'
                        ? 'border-b-4 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📸 Photo
                  </button>
                  <button
                    onClick={() => setWorkoutInputMode('manual')}
                    className={`flex-1 pb-3 font-semibold transition-all ${
                      workoutInputMode === 'manual'
                        ? 'border-b-4 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ✍️ Manual
                  </button>
                </div>

                {/* Photo Mode */}
                {workoutInputMode === 'photo' && (
                  <PhotoWorkoutInput
                    onAnalysisComplete={(result) => {
                      // Add workout from photo analysis
                      const workoutEntry = {
                        id: Date.now().toString(),
                        name: result.exercise,
                        duration: result.duration.toString(),
                        caloriesBurned: result.calories.toString(),
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        photo: result.photoUrl
                      };

                      setDailyData(prev => ({
                        ...prev,
                        workouts: [...prev.workouts, workoutEntry]
                      }));

                      setShowAddWorkout(false);
                      setWorkoutInputMode('photo'); // Reset for next time
                      setToast({ message: `✅ Added ${workoutEntry.name}!`, type: 'success' });
                    }}
                    onCancel={() => {
                      setShowAddWorkout(false);
                      setWorkoutInputMode('photo'); // Reset for next time
                    }}
                    userContext={{
                      name: user?.displayName || 'User',
                      email: user?.email || '',
                      startWeight: userGoals.currentWeight,
                      currentWeight: dailyData.weight || userGoals.currentWeight,
                      targetWeight: userGoals.targetWeight,
                      fitnessGoal: 'Lose Weight',
                      currentLevel: 'Intermediate',
                      dailyCalories: userGoals.dailyCalories,
                      dailyProtein: userGoals.dailyProtein
                    }}
                  />
                )}

                {/* Manual Mode */}
                {workoutInputMode === 'manual' && (
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
                          setWorkoutInputMode('photo'); // Reset for next time
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Features Hub */}
          {currentPage === 'ai-agents' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">🤖 AI Features</h2>
              <p className="text-gray-600 mb-8 text-lg">
                AI-powered tools to help you track and achieve your fitness goals.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Body Fat Checker - LIVE */}
                <div
                  onClick={() => setCurrentPage('rapid-ai')}
                  className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-8 text-white cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105 relative"
                >
                  {/* LIVE Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-400 text-green-900 text-xs font-bold rounded-full">
                    LIVE
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <ChevronRight className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Body Fat % Checker</h3>
                  <p className="text-purple-100 mb-4">
                    Upload photos to get AI-estimated body fat percentage using Gemini Vision API
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Analysis</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Camera className="w-4 h-4" />
                      <span>Multi-Photo</span>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Cards - Now Clickable */}
                <div
                  onClick={() => setCurrentPage('agent-rapid-info')}
                  className="bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl p-8 text-white relative cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Zap className="w-8 h-8" />
                    </div>
                    <ChevronRight className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">AgentRapid ⚡</h3>
                  <p className="text-purple-100 mb-4">
                    Full AI agent with personalized meal plans, workout generation, and voice commands
                  </p>
                </div>

                <div
                  onClick={() => setCurrentPage('agent-cupid-info')}
                  className="bg-gradient-to-br from-pink-400 to-red-400 rounded-2xl p-8 text-white relative cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Heart className="w-8 h-8" />
                    </div>
                    <ChevronRight className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">AgentCupid ♥️</h3>
                  <p className="text-pink-100 mb-4">
                    AI-powered fitness dating and matching with workout buddies
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl p-8 text-white relative opacity-60 cursor-not-allowed">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">More AI Agents</h3>
                  <p className="text-gray-100 mb-4">
                    AgentLean, AgentRise, AgentFuel, AgentForge - Coming weekly!
                  </p>
                </div>
              </div>

              {/* Technology Section */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Brain className="w-6 h-6 text-blue-600 mr-2" />
                  Powered by Advanced AI Technology
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <h4 className="font-bold text-gray-800 mb-2">🚀 Gemini Vision API</h4>
                    <p className="text-sm text-gray-600">
                      Google's advanced vision AI for body composition analysis
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-purple-200">
                    <h4 className="font-bold text-gray-800 mb-2">🧠 Training LLama 3.3 70B</h4>
                    <p className="text-sm text-gray-600">
                      Building custom fitness models with 10M+ datasets from Hugging Face
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <h4 className="font-bold text-gray-800 mb-2">📈 Weekly Updates</h4>
                    <p className="text-sm text-gray-600">
                      <strong>New AI features every week!</strong> We're building the future of fitness
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Body Fat Checker Page */}
          {currentPage === 'rapid-ai' && (
            <div>
              <button
                onClick={() => setCurrentPage('ai-agents')}
                className="flex items-center text-gray-600 hover:text-purple-600 mb-6 transition group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to AI Features
              </button>
              <RapidAIPage />
            </div>
          )}

          {/* Cupid AI Page */}
          {currentPage === 'cupid-ai' && (
            <div>
              <button
                onClick={() => setCurrentPage('ai-agents')}
                className="flex items-center text-gray-600 hover:text-pink-600 mb-6 transition group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to AI Agents Hub
              </button>
              <CupidAIPage />
            </div>
          )}

          {/* Settings Page */}
          {currentPage === 'settings' && (
            <SettingsPage onBack={() => setCurrentPage('dashboard')} />
          )}

          {/* Agent Info Pages */}
          {currentPage === 'agent-rapid-info' && (
            <AgentRapidInfo onNavigate={setCurrentPage} />
          )}

          {currentPage === 'agent-cupid-info' && (
            <AgentCupidInfo onNavigate={setCurrentPage} />
          )}

          {/* Other Pages - Coming Soon */}
          {currentPage === 'friends' && <CommunityPage />}

          {(currentPage === 'diet' || currentPage === 'workout') && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  {currentPage === 'diet' && <Utensils className="w-12 h-12 text-white" />}
                  {currentPage === 'workout' && <Dumbbell className="w-12 h-12 text-white" />}
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
