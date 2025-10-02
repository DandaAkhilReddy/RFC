import React, { useState, useEffect } from 'react';
import { transition } from '@ssgoi/react';
import { fly } from '@ssgoi/react/transitions';
import {
  Bot, Utensils, Dumbbell, Settings, LogOut, Menu, X, ChevronRight, Heart,
  Activity, Camera, MessageCircle, TrendingUp, Users, Edit2, Calendar,
  MapPin, Star, Trophy, Mic, BarChart3, Image as ImageIcon, Zap, Crown,
  Clock, Target, Award, Flame, Home, Sparkles, UserCircle2, Bell, AlertCircle,
  Upload, ThumbsUp, Share2
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import ReddyAIAgent from './ReddyAIAgent';
import FitBuddyAIAgent from './FitBuddyAIAgent';
import CupidAIAgent from './CupidAIAgent';
import SettingsPage from './SettingsPage';
import OnboardingWelcome, { hasSeenOnboarding } from './OnboardingWelcome';
import { db, Collections } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

type DashboardPage = 'dashboard' | 'ai-agents' | 'workout-buddies' | 'dating-matches' | 'community' | 'diet-nutrition' | 'settings' | 'reddy' | 'fitbuddy' | 'cupid';

interface UserSettings {
  calorieGoal?: number;
  weeklyWorkoutGoal?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  bmr?: number;
  targetWeight?: number;
  startWeight?: number;
}

interface Match {
  id: string;
  name: string;
  age: number;
  photo: string;
  compatibility: number;
  fitnessGoal: string;
  distance: string;
}

interface WorkoutBuddy {
  id: string;
  name: string;
  photo: string;
  lastActive: string;
  distance: string;
  commonWorkouts: string[];
}

interface HealthInsight {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

interface CommunityPost {
  id: string;
  author: string;
  authorPhoto: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export default function EnhancedDashboard() {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<DashboardPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsComplete, setSettingsComplete] = useState(false);
  const [showSettingsAlert, setShowSettingsAlert] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    calorieGoal: 2000,
    weeklyWorkoutGoal: 5,
    weight: 75,
    targetWeight: 70,
    startWeight: 80
  });
  const [editingCalories, setEditingCalories] = useState(false);
  const [editingWorkouts, setEditingWorkouts] = useState(false);
  const [tempCalorieGoal, setTempCalorieGoal] = useState('2000');
  const [tempWorkoutGoal, setTempWorkoutGoal] = useState('5');
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [lastCalorieEdit, setLastCalorieEdit] = useState<string>('');
  const [lastWorkoutEdit, setLastWorkoutEdit] = useState<string>('');
  const [currentCalories, setCurrentCalories] = useState(0);
  const [currentWorkouts, setCurrentWorkouts] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Discipline tracking state
  const [disciplineData, setDisciplineData] = useState({
    currentStreak: 0,
    bestStreak: 0,
    totalDays: 0,
    workoutStreak: 0,
    calorieStreak: 0,
    weightStreak: 0,
    aiChatStreak: 0,
    lastWorkoutDate: '',
    lastCalorieLog: '',
    lastWeightLog: '',
    lastAIChatDate: '',
    workoutHistory: [] as boolean[],
    calorieHistory: [] as boolean[],
    weightHistory: [] as boolean[],
    aiChatHistory: [] as boolean[]
  });

  // Mock data
  const [todaysMatches] = useState<Match[]>([
    { id: '1', name: 'Sarah Johnson', age: 28, photo: '👩', compatibility: 92, fitnessGoal: 'Weight Loss', distance: '2.3 km' },
    { id: '2', name: 'Mike Chen', age: 31, photo: '👨', compatibility: 88, fitnessGoal: 'Muscle Gain', distance: '3.5 km' },
    { id: '3', name: 'Emma Davis', age: 26, photo: '👱‍♀️', compatibility: 85, fitnessGoal: 'Cardio', distance: '1.8 km' }
  ]);

  const [workoutBuddies] = useState<WorkoutBuddy[]>([
    { id: '1', name: 'Alex Rodriguez', photo: '🧑', lastActive: '2 hours ago', distance: '1.5 km', commonWorkouts: ['💪 Strength', '🏃 Cardio'] },
    { id: '2', name: 'Jessica Lee', photo: '👩', lastActive: '5 hours ago', distance: '2.8 km', commonWorkouts: ['🧘 Yoga', '💪 Strength'] },
    { id: '3', name: 'David Kim', photo: '👨', lastActive: '1 day ago', distance: '3.2 km', commonWorkouts: ['🏃 Running', '🚴 Cycling'] }
  ]);

  const [healthInsights] = useState<HealthInsight[]>([
    { id: '1', title: 'Sleep Quality', description: 'You averaged 7.5 hours this week. Try to maintain this!', icon: Activity, color: 'from-blue-500 to-cyan-500' },
    { id: '2', title: 'Nutrition Score', description: 'Great protein intake! Consider more vegetables.', icon: Utensils, color: 'from-green-500 to-emerald-500' },
    { id: '3', title: 'Hydration', description: 'You drank 2.1L today. Goal: 2.5L', icon: Trophy, color: 'from-purple-500 to-pink-500' }
  ]);

  const [communityPosts] = useState<CommunityPost[]>([
    { id: '1', author: 'John Smith', authorPhoto: '🧑', content: 'Just completed my 100th workout! Feeling amazing! 💪', likes: 42, comments: 8, timestamp: '2 hours ago' },
    { id: '2', author: 'Lisa Wang', authorPhoto: '👩', content: 'Found an amazing workout buddy through ReddyFit! Best decision ever! 🎉', likes: 38, comments: 12, timestamp: '5 hours ago' }
  ]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activityDots = [true, true, false, true, true, true, false];

  // Check if settings are complete
  const checkSettingsComplete = (data: any) => {
    const requiredFields = ['weight', 'height', 'fitnessGoal', 'currentFitnessLevel', 'targetWeight'];
    const isComplete = requiredFields.every(field => data[field] && data[field] !== '');
    return isComplete;
  };

  // Initialize new user with fresh data
  const initializeNewUser = async (userId: string) => {
    try {
      const initialData = {
        calorieGoal: 2000,
        weeklyWorkoutGoal: 5,
        weight: 0,
        height: 0,
        targetWeight: 0,
        startWeight: 0,
        currentCalories: 0,
        currentWorkouts: 0,
        lastCalorieEdit: '',
        lastWorkoutEdit: '',
        createdAt: new Date().toISOString(),
        // Discipline tracking
        currentStreak: 0,
        bestStreak: 0,
        totalDays: 0,
        workoutStreak: 0,
        calorieStreak: 0,
        weightStreak: 0,
        aiChatStreak: 0,
        lastWorkoutDate: '',
        lastCalorieLog: '',
        lastWeightLog: '',
        lastAIChatDate: '',
        workoutHistory: [],
        calorieHistory: [],
        weightHistory: [],
        aiChatHistory: []
      };

      await setDoc(doc(db, Collections.USERS, userId), initialData);
      console.log('✅ New user initialized with clean data');
      return initialData;
    } catch (error) {
      console.error('Error initializing new user:', error);
      return null;
    }
  };

  // Fetch user settings and check if complete
  useEffect(() => {
    if (user) {
      const fetchSettings = async () => {
        try {
          const docRef = doc(db, Collections.USERS, user.uid);
          const docSnap = await getDoc(docRef);

          let data;
          if (docSnap.exists()) {
            data = docSnap.data();
          } else {
            // New user - initialize with clean data
            console.log('🆕 New user detected, initializing...');
            data = await initializeNewUser(user.uid);
            if (!data) {
              throw new Error('Failed to initialize user');
            }
          }

          // Check if settings are complete
          const isComplete = checkSettingsComplete(data);
          setSettingsComplete(isComplete);

          // Load user settings
          setUserSettings({
            calorieGoal: data.calorieGoal || 2000,
            weeklyWorkoutGoal: data.weeklyWorkoutGoal || 5,
            weight: data.weight,
            height: data.height,
            bmi: data.bmi,
            bmr: data.bmr,
            targetWeight: data.targetWeight,
            startWeight: data.startWeight
          });

          setTempCalorieGoal((data.calorieGoal || 2000).toString());
          setTempWorkoutGoal((data.weeklyWorkoutGoal || 5).toString());
          setLastCalorieEdit(data.lastCalorieEdit || '');
          setLastWorkoutEdit(data.lastWorkoutEdit || '');
          setCurrentCalories(data.currentCalories || 0);
          setCurrentWorkouts(data.currentWorkouts || 0);

          // Load discipline data
          setDisciplineData({
            currentStreak: data.currentStreak || 0,
            bestStreak: data.bestStreak || 0,
            totalDays: data.totalDays || 0,
            workoutStreak: data.workoutStreak || 0,
            calorieStreak: data.calorieStreak || 0,
            weightStreak: data.weightStreak || 0,
            aiChatStreak: data.aiChatStreak || 0,
            lastWorkoutDate: data.lastWorkoutDate || '',
            lastCalorieLog: data.lastCalorieLog || '',
            lastWeightLog: data.lastWeightLog || '',
            lastAIChatDate: data.lastAIChatDate || '',
            workoutHistory: data.workoutHistory || Array(7).fill(false),
            calorieHistory: data.calorieHistory || Array(7).fill(false),
            weightHistory: data.weightHistory || Array(7).fill(false),
            aiChatHistory: data.aiChatHistory || Array(7).fill(false)
          });

        } catch (error) {
          console.error('Error fetching user settings:', error);
          // Use defaults on error
          setUserSettings({
            calorieGoal: 2000,
            weeklyWorkoutGoal: 5,
            weight: 75,
            targetWeight: 70,
            startWeight: 80
          });
        }
      };
      fetchSettings();
    }
  }, [user]);

  // Check if user needs to see onboarding
  useEffect(() => {
    if (user && !hasSeenOnboarding()) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Check if can edit today
  const canEditToday = (lastEditDate: string) => {
    if (!lastEditDate) return true;
    const today = new Date().toDateString();
    const lastEdit = new Date(lastEditDate).toDateString();
    return today !== lastEdit;
  };

  const saveCalorieGoal = async () => {
    if (!user) return;

    // Check if already edited today
    if (!canEditToday(lastCalorieEdit)) {
      setEditingCalories(false);
      return;
    }

    const newGoal = parseInt(tempCalorieGoal);
    if (!isNaN(newGoal) && newGoal > 0) {
      try {
        const today = new Date().toISOString();
        await setDoc(doc(db, Collections.USERS, user.uid), {
          calorieGoal: newGoal,
          lastCalorieEdit: today
        }, { merge: true });
        setUserSettings({ ...userSettings, calorieGoal: newGoal });
        setLastCalorieEdit(today);
        setEditingCalories(false);
      } catch (error) {
        console.error('Error saving calorie goal:', error);
        setEditingCalories(false);
      }
    }
  };

  const saveWorkoutGoal = async () => {
    if (!user) return;

    // Check if already edited today
    if (!canEditToday(lastWorkoutEdit)) {
      setEditingWorkouts(false);
      return;
    }

    const newGoal = parseInt(tempWorkoutGoal);
    if (!isNaN(newGoal) && newGoal > 0) {
      try {
        const today = new Date().toISOString();
        await setDoc(doc(db, Collections.USERS, user.uid), {
          weeklyWorkoutGoal: newGoal,
          lastWorkoutEdit: today
        }, { merge: true });
        setUserSettings({ ...userSettings, weeklyWorkoutGoal: newGoal });
        setLastWorkoutEdit(today);
        setEditingWorkouts(false);
      } catch (error) {
        console.error('Error saving workout goal:', error);
        setEditingWorkouts(false);
      }
    }
  };

  const weightProgress = userSettings.startWeight && userSettings.targetWeight && userSettings.weight
    ? ((userSettings.startWeight - userSettings.weight) / (userSettings.startWeight - userSettings.targetWeight)) * 100
    : 0;

  // Button Handlers
  const handleConnectBuddy = async (buddyId: string) => {
    if (!user) return;
    try {
      const connectionRef = collection(db, Collections.USERS, user.uid, 'connections');
      await addDoc(connectionRef, {
        buddyId,
        type: 'workout_buddy',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      console.log('Connection request sent successfully');
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  const handleConnectMatch = async (matchId: string) => {
    if (!user) return;
    try {
      const matchRef = collection(db, Collections.MATCHES);
      await addDoc(matchRef, {
        userId: user.uid,
        matchId,
        status: 'interested',
        createdAt: new Date().toISOString()
      });
      console.log('Match request sent successfully');
    } catch (error) {
      console.error('Error matching:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    try {
      if (likedPosts.has(postId)) {
        // Unlike
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        // Like
        setLikedPosts(prev => new Set(prev).add(postId));
        const postRef = doc(db, Collections.USER_FEEDBACK, postId);
        await setDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid)
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleUpgradePremium = () => {
    alert('🔥 Premium upgrade coming soon! Get ready for advanced AI matchmaking.');
  };

  const handleUploadPhoto = () => {
    alert('📸 Photo upload feature coming soon!');
  };

  const handleVoiceChat = () => {
    alert('🎤 Voice chat feature coming soon!');
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'orange' },
    { id: 'ai-agents', label: 'AI Agents', icon: Bot, color: 'purple' },
    { id: 'diet-nutrition', label: 'Diet & Nutrition', icon: Utensils, color: 'green' },
    { id: 'workout-buddies', label: 'Workout Buddies', icon: Users, color: 'blue' },
    { id: 'dating-matches', label: 'Dating & Matches', icon: Heart, color: 'pink' },
    { id: 'community', label: 'Community', icon: MessageCircle, color: 'cyan' }
  ];

  // Handle AI agent navigation
  if (currentPage === 'reddy') {
    return <ReddyAIAgent onBack={() => setCurrentPage('ai-agents')} />;
  }
  if (currentPage === 'fitbuddy') {
    return <FitBuddyAIAgent onBack={() => setCurrentPage('ai-agents')} />;
  }
  if (currentPage === 'cupid') {
    return <CupidAIAgent onBack={() => setCurrentPage('ai-agents')} />;
  }
  if (currentPage === 'settings') {
    return <SettingsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Onboarding Welcome Modal */}
      {showOnboarding && (
        <OnboardingWelcome onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Settings Alert Banner */}
      {showSettingsAlert && !settingsComplete && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 z-50 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-bold">Complete Your Profile Settings</p>
                <p className="text-sm text-white/90">Please fill in all required information to unlock all features. Redirecting to settings...</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettingsAlert(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modern Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div
                ref={transition({ key: 'sidebar-logo', ...fly({ x: -50, y: 0, opacity: true }) })}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    ReddyFit
                  </h2>
                  <p className="text-xs text-gray-500">Your Fitness Hub</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        {sidebarOpen && (
          <div
            ref={transition({ key: 'sidebar-profile', ...fly({ x: -50, y: 0, opacity: true }) })}
            className="p-4 mx-4 mt-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl text-white"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <UserCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{user?.displayName || 'Fitness Enthusiast'}</h3>
                <p className="text-xs text-white/80 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-center">
                <div className="font-bold">150</div>
                <div className="text-xs text-white/80">Day Streak</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="font-bold">245</div>
                <div className="text-xs text-white/80">Workouts</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="font-bold">12</div>
                <div className="text-xs text-white/80">Buddies</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                ref={transition({
                  key: `nav-${item.id}`,
                  ...fly({ x: -100, y: 0, opacity: true })
                })}
                onClick={() => setCurrentPage(item.id as DashboardPage)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white shadow-lg`
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                {sidebarOpen && (
                  <span className="font-semibold">{item.label}</span>
                )}
                {sidebarOpen && isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white space-y-2">
          <button
            onClick={() => setCurrentPage('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentPage === 'settings'
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span className="font-semibold">Settings</span>}
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}
      >
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.displayName?.split(' ')[0] || 'Champion'}! 👋</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {/* Dashboard Page */}
          {currentPage === 'dashboard' && (
            <div
              ref={transition({ key: 'dashboard-content', ...fly({ x: 100, y: 0, opacity: true }) })}
            >
              {/* Weight Goal Progress */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 shadow-xl mb-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold">Weight Goal Progress</h3>
                    <p className="text-white/80">Keep pushing towards your goal!</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{Math.round(weightProgress)}%</div>
                    <div className="text-sm text-white/80">Complete</div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-full h-4 mb-4 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(weightProgress, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>Start: {userSettings.startWeight}kg</div>
                  <div>Current: {userSettings.weight}kg</div>
                  <div>Goal: {userSettings.targetWeight}kg</div>
                </div>
              </div>

              {/* Quick Stats Grid - Compact Progress Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Calorie Goal - Compact Card */}
                <div
                  ref={transition({ key: 'calorie-card', ...fly({ y: 20, opacity: true }) })}
                  className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 shadow-lg text-white relative overflow-hidden group hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Flame className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Daily Calories</h3>
                        <p className="text-xs text-white/70">
                          {canEditToday(lastCalorieEdit) ? 'Editable' : 'Locked today'}
                        </p>
                      </div>
                    </div>
                    {!editingCalories && canEditToday(lastCalorieEdit) && (
                      <button
                        onClick={() => setEditingCalories(true)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>

                  {editingCalories ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={tempCalorieGoal}
                        onChange={(e) => setTempCalorieGoal(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm rounded-lg text-xl font-bold text-white placeholder-white/50"
                        placeholder="Goal"
                      />
                      <button
                        onClick={saveCalorieGoal}
                        className="px-3 py-2 bg-white text-orange-600 rounded-lg font-bold hover:scale-105 transition-transform text-sm"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingCalories(false)}
                        className="px-3 py-2 bg-white/20 text-white rounded-lg font-bold hover:scale-105 transition-transform text-sm"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <div className="text-3xl font-bold">{currentCalories}</div>
                        <div className="text-lg text-white/80">/ {userSettings.calorieGoal}</div>
                        <div className="text-xs text-white/60 ml-auto">kcal</div>
                      </div>
                      <div className="bg-white/20 rounded-full h-2 overflow-hidden mb-2">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((currentCalories / (userSettings.calorieGoal || 2000)) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/80">
                        <span>{Math.round((currentCalories / (userSettings.calorieGoal || 2000)) * 100)}%</span>
                        <span>{(userSettings.calorieGoal || 2000) - currentCalories} left</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Discipline & Consistency - Compact Card */}
                <div
                  ref={transition({ key: 'discipline-card', ...fly({ y: 20, opacity: true, delay: 100 }) })}
                  className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 shadow-lg text-white relative overflow-hidden group hover:shadow-2xl transition-shadow cursor-pointer"
                  onClick={() => setCurrentPage('discipline')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Discipline</h3>
                        <p className="text-xs text-white/70">Track Consistency</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-3xl font-bold">{disciplineData.currentStreak}</div>
                      <div className="text-lg text-white/80">day streak</div>
                    </div>
                    <div className="bg-white/20 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${disciplineData.totalDays > 0
                            ? (disciplineData.currentStreak / disciplineData.totalDays) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>Click to view details</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>

                {/* Weight Progress - Compact Card */}
                <div
                  ref={transition({ key: 'weight-card', ...fly({ y: 20, opacity: true, delay: 200 }) })}
                  className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 shadow-lg text-white relative overflow-hidden group hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Weight Goal</h3>
                        <p className="text-xs text-white/70">Current Progress</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-3xl font-bold">{userSettings.weight || 75}</div>
                      <div className="text-lg text-white/80">/ {userSettings.targetWeight || 70}</div>
                      <div className="text-xs text-white/60 ml-auto">kg</div>
                    </div>
                    <div className="bg-white/20 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(((userSettings.startWeight || 80) - (userSettings.weight || 75)) / ((userSettings.startWeight || 80) - (userSettings.targetWeight || 70)) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>{Math.round(((userSettings.startWeight || 80) - (userSettings.weight || 75)) / ((userSettings.startWeight || 80) - (userSettings.targetWeight || 70)) * 100)}%</span>
                      <span>{(userSettings.weight || 75) - (userSettings.targetWeight || 70)} kg to go</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Health Insights */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🧠 AI Health Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {healthInsights.map((insight, index) => (
                    <div
                      key={insight.id}
                      ref={transition({
                        key: `insight-${insight.id}`,
                        ...fly({ x: -100 * (index + 1), y: 0, opacity: true })
                      })}
                      className={`bg-gradient-to-br ${insight.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer`}
                    >
                      <insight.icon className="w-10 h-10 mb-3" />
                      <h4 className="font-bold text-lg mb-2">{insight.title}</h4>
                      <p className="text-sm text-white/90">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Calendar */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Weekly Activity</h2>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => (
                    <div
                      key={day}
                      onClick={() => setSelectedDay(index)}
                      className={`text-center p-4 rounded-xl cursor-pointer transition-all ${
                        index === selectedDay
                          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg scale-105'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-sm font-semibold mb-2">{day}</div>
                      <div className={`w-2 h-2 rounded-full mx-auto ${
                        activityDots[index] ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Analytics */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-6">📊 Progress Analytics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900">150</div>
                    <div className="text-sm text-gray-600">Days Streak</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <Dumbbell className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900">245</div>
                    <div className="text-sm text-gray-600">Workouts</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <Zap className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900">52.4k</div>
                    <div className="text-sm text-gray-600">Calories Burned</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900">28</div>
                    <div className="text-sm text-gray-600">Goals Achieved</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Agents Page - Enhanced with All Features */}
          {currentPage === 'ai-agents' && (
            <div
              ref={transition({ key: 'ai-agents-content', ...fly({ x: 100, y: 0, opacity: true }) })}
            >
              {/* Header */}
              <div className="mb-10">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-3">
                  🤖 AI-Powered Fitness Suite
                </h2>
                <p className="text-lg text-gray-600">12 intelligent agents transforming your fitness journey</p>
              </div>

              {/* Active Features Section */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-orange-500" />
                  Active Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Reddy AI Chatbot - ACTIVE */}
                <div
                  onClick={() => setCurrentPage('reddy')}
                  className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer group hover:scale-105 text-white relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    ✨ ACTIVE
                  </div>
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">AI Chatbot</h3>
                  <p className="text-white/90 mb-4 text-sm">Chat with Reddy, your 24/7 AI fitness coach for personalized guidance</p>
                  <div className="flex items-center font-semibold">
                    Start Chat <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
                </div>
              </div>

              {/* Health & Analytics Section */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-teal-500" />
                  Health & Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* AI Photo Analysis */}
                <div
                  onClick={() => alert('📸 AI Photo Analysis\n\n✨ Upload a photo to get:\n• Body fat percentage estimate\n• Muscle mass analysis\n• Posture correction tips\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Photo Analysis</h3>
                  <p className="text-gray-600 mb-4 text-sm">Upload photos for AI-powered body composition and posture analysis</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      Body fat percentage estimate
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      Muscle mass analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      Posture correction tips
                    </div>
                  </div>
                </div>

                {/* AI Body Fat Calculator */}
                <div
                  onClick={() => alert('📊 AI Body Fat Calculator\n\n✨ Calculate your:\n• Multi-point body measurements\n• BMI & BMR values\n• Personalized health recommendations\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Activity className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Body Fat Calculator</h3>
                  <p className="text-gray-600 mb-4 text-sm">Advanced AI algorithm for accurate body composition metrics</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      Multi-point measurements
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      BMI & BMR calculation
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      Personalized recommendations
                    </div>
                  </div>
                </div>

                {/* AI Progress Tracking */}
                <div
                  onClick={() => alert('📈 AI Progress Tracking\n\n✨ Track your progress with:\n• Weight & measurement trends\n• Goal achievement predictions\n• Smart AI recommendations\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Progress Tracking</h3>
                  <p className="text-gray-600 mb-4 text-sm">Intelligent tracking with predictive insights and trend analysis</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      Weight & measurement trends
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      Goal achievement predictions
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      Smart recommendations
                    </div>
                  </div>
                </div>
                </div>
              </div>

              {/* Nutrition & Training Section */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Utensils className="w-6 h-6 text-orange-500" />
                  Nutrition & Training
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* AI Meal Planner */}
                <div
                  onClick={() => alert('🍽️ AI Meal Planner\n\n✨ Get personalized:\n• Custom macro calculations\n• Recipe suggestions\n• Grocery list generator\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Utensils className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Meal Planner</h3>
                  <p className="text-gray-600 mb-4 text-sm">Personalized meal plans based on your goals and preferences</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      Custom macro calculations
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      Recipe suggestions
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      Grocery list generator
                    </div>
                  </div>
                </div>

                {/* AI Workout Generator */}
                <div
                  onClick={() => alert('💪 AI Workout Generator\n\n✨ Get dynamic workouts:\n• Personalized routines\n• Exercise form videos\n• Progressive overload tracking\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Dumbbell className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Workout Generator</h3>
                  <p className="text-gray-600 mb-4 text-sm">Dynamic workout plans that adapt to your progress and feedback</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      Personalized routines
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      Exercise form videos
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      Progressive overload tracking
                    </div>
                  </div>
                </div>

                {/* AI Voice Coach */}
                <div
                  onClick={() => alert('🎤 AI Voice Coach\n\n✨ Voice-activated coaching:\n• Hands-free workout tracking\n• Real-time form corrections\n• Motivational coaching\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Voice Coach</h3>
                  <p className="text-gray-600 mb-4 text-sm">Voice-activated coaching during workouts with real-time guidance</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      Hands-free workout tracking
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      Real-time form corrections
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      Motivational coaching
                    </div>
                  </div>
                </div>
                </div>
              </div>

              {/* Advanced AI Tools Section */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-purple-500" />
                  Advanced AI Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* AI Health Monitoring */}
                <div
                  onClick={() => alert('❤️ AI Health Monitoring\n\n✨ Monitor your health:\n• Heart rate & sleep tracking\n• Recovery score analysis\n• Health risk predictions\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Activity className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Health Monitoring</h3>
                  <p className="text-gray-600 mb-4 text-sm">Real-time health metrics tracking with AI-powered insights and alerts</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                      Heart rate & sleep tracking
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                      Recovery score analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                      Health risk predictions
                    </div>
                  </div>
                </div>

                {/* Social AI - Cupid */}
                <div
                  onClick={() => alert('💘 Cupid AI Dating\n\n✨ Find your fitness match:\n• Fitness compatibility scores\n• Activity-based matching\n• Workout date suggestions\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-pink-100 text-pink-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Cupid AI Dating</h3>
                  <p className="text-gray-600 mb-4 text-sm">AI-powered matchmaking with fitness-focused compatibility</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                      Fitness compatibility scores
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                      Activity-based matching
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                      Workout date suggestions
                    </div>
                  </div>
                </div>

                {/* AI Nutrition Analyzer */}
                <div
                  onClick={() => alert('🥗 AI Nutrition Analyzer\n\n✨ Advanced nutrition tracking:\n• Photo-based meal scanning\n• Real-time macro breakdown\n• Nutritional deficit alerts\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Utensils className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Nutrition Analyzer</h3>
                  <p className="text-gray-600 mb-4 text-sm">Advanced meal scanning with instant macro tracking and nutrition insights</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      Photo-based meal scanning
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      Real-time macro breakdown
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      Nutritional deficit alerts
                    </div>
                  </div>
                </div>

                {/* AI Form Checker */}
                <div
                  onClick={() => alert('📹 AI Form Checker\n\n✨ Perfect your form:\n• Live video form analysis\n• Joint angle tracking\n• Instant correction feedback\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-violet-100 text-violet-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Form Checker</h3>
                  <p className="text-gray-600 mb-4 text-sm">Video analysis for real-time exercise form correction and injury prevention</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                      Live video form analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                      Joint angle tracking
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                      Instant correction feedback
                    </div>
                  </div>
                </div>

                {/* AI Recovery Optimizer */}
                <div
                  onClick={() => alert('😴 AI Recovery Optimizer\n\n✨ Optimize your recovery:\n• Sleep quality analysis\n• Stress level monitoring\n• Recovery protocol builder\n\nThis feature is coming soon!')}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Activity className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Recovery Optimizer</h3>
                  <p className="text-gray-600 mb-4 text-sm">Smart recovery protocols with sleep quality and stress management insights</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                      Sleep quality analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                      Stress level monitoring
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                      Recovery protocol builder
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Workout Buddies Page */}
          {currentPage === 'workout-buddies' && (
            <div
              ref={transition({ key: 'workout-buddies-content', ...fly({ x: 100, y: 0, opacity: true }) })}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {workoutBuddies.map((buddy, index) => (
                  <div
                    key={buddy.id}
                    ref={transition({
                      key: `buddy-${buddy.id}`,
                      ...fly({ x: 100 * (index + 1), y: 0, opacity: true })
                    })}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-5xl">{buddy.photo}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{buddy.name}</h4>
                        <div className="text-xs text-gray-500">{buddy.lastActive}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          {buddy.distance}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {buddy.commonWorkouts.map(workout => (
                        <span key={workout} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          {workout}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleConnectBuddy(buddy.id)}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dating & Matches Page */}
          {currentPage === 'dating-matches' && (
            <div
              ref={transition({ key: 'dating-matches-content', ...fly({ x: 100, y: 0, opacity: true }) })}
            >
              {/* Premium Banner */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 shadow-xl mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-8 h-8" />
                      <h2 className="text-3xl font-bold">Cupid AI Premium</h2>
                    </div>
                    <p className="text-white/90 mb-4">Unlock advanced matchmaking with AI-powered compatibility analysis</p>
                  </div>
                  <button
                    onClick={handleUpgradePremium}
                    className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>

              {/* Today's Matches */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💕 Today's Matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {todaysMatches.map((match, index) => (
                  <div
                    key={match.id}
                    ref={transition({
                      key: `match-${match.id}`,
                      ...fly({ x: 100 * (index + 1), y: 0, opacity: true })
                    })}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-6xl">{match.photo}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-xl">{match.name}, {match.age}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          {match.distance}
                        </div>
                        <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold inline-block">
                          {match.fitnessGoal}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        <Star className="w-4 h-4" />
                        {match.compatibility}%
                      </div>
                    </div>
                    <button
                      onClick={() => handleConnectMatch(match.id)}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all group-hover:scale-105"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Page */}
          {/* Discipline & Consistency Page */}
          {currentPage === 'discipline' && (
            <div
              ref={transition({ key: 'discipline-content', ...fly({ x: 100, y: 0, opacity: true }) })}
            >
              <div className="mb-10">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-3">
                  💪 Discipline & Consistency Tracker
                </h2>
                <p className="text-lg text-gray-600">Build unstoppable habits and track your fitness journey</p>
              </div>

              {/* Current Streak */}
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 shadow-xl text-white mb-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">🔥 Current Streak</h3>
                  <div className="text-7xl font-black mb-2">{disciplineData.currentStreak}</div>
                  <p className="text-2xl text-white/90">Days</p>
                  <p className="text-sm text-white/70 mt-4">
                    {disciplineData.currentStreak > 0
                      ? "Keep going! You're building momentum"
                      : "Start your journey today!"}
                  </p>
                </div>
              </div>

              {/* Habits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-orange-600" />
                    Daily Workout
                  </h4>
                  <div className="flex gap-2 mb-4">
                    {disciplineData.workoutHistory.slice(-7).map((completed, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 rounded-lg ${completed ? 'bg-orange-500' : 'bg-gray-200'} flex items-center justify-center text-white font-bold`}
                      >
                        {completed ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{disciplineData.workoutStreak}-day streak</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-600" />
                    Calorie Tracking
                  </h4>
                  <div className="flex gap-2 mb-4">
                    {disciplineData.calorieHistory.slice(-7).map((completed, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 rounded-lg ${completed ? 'bg-red-500' : 'bg-gray-200'} flex items-center justify-center text-white font-bold`}
                      >
                        {completed ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{disciplineData.calorieStreak}-day streak</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Weight Logging
                  </h4>
                  <div className="flex gap-2 mb-4">
                    {disciplineData.weightHistory.slice(-7).map((completed, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 rounded-lg ${completed ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center text-white font-bold`}
                      >
                        {completed ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{disciplineData.weightStreak}-day streak</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    AI Chatbot Usage
                  </h4>
                  <div className="flex gap-2 mb-4">
                    {disciplineData.aiChatHistory.slice(-7).map((completed, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 rounded-lg ${completed ? 'bg-purple-500' : 'bg-gray-200'} flex items-center justify-center text-white font-bold`}
                      >
                        {completed ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{disciplineData.aiChatStreak}-day streak</p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{disciplineData.totalDays}</div>
                  <div className="text-sm text-gray-700">Total Days</div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {disciplineData.totalDays > 0
                      ? Math.round((disciplineData.currentStreak / disciplineData.totalDays) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-700">Consistency</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{disciplineData.bestStreak}</div>
                  <div className="text-sm text-gray-700">Best Streak</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {[
                      disciplineData.workoutStreak > 0 ? 1 : 0,
                      disciplineData.calorieStreak > 0 ? 1 : 0,
                      disciplineData.weightStreak > 0 ? 1 : 0,
                      disciplineData.aiChatStreak > 0 ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-sm text-gray-700">Active Habits</div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'community' && (
            <div
              ref={transition({ key: 'community-content', ...fly({ x: 100, y: 0, opacity: true }) })}
            >
              <div className="space-y-6">
                {communityPosts.map((post, index) => (
                  <div
                    key={post.id}
                    ref={transition({
                      key: `post-${post.id}`,
                      ...fly({ x: 0, y: 100 * (index + 1), opacity: true })
                    })}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{post.authorPhoto}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">{post.author}</h4>
                          <span className="text-xs text-gray-500">{post.timestamp}</span>
                        </div>
                        <p className="text-gray-700 mb-4 text-lg">{post.content}</p>
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-2 transition-colors ${
                              likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-red-500' : ''}`} />
                            <span className="font-semibold">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-semibold">{post.comments}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
