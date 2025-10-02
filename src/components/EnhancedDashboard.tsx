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

  // Fetch user settings and check if complete
  useEffect(() => {
    if (user) {
      const fetchSettings = async () => {
        const docRef = doc(db, Collections.USERS, user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Check if settings are complete
          const isComplete = checkSettingsComplete(data);
          setSettingsComplete(isComplete);

          // Show alert and redirect if settings incomplete
          if (!isComplete) {
            setShowSettingsAlert(true);
            setTimeout(() => {
              setCurrentPage('settings');
            }, 3000);
          }

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
        } else {
          // No settings found, redirect to settings
          setShowSettingsAlert(true);
          setTimeout(() => {
            setCurrentPage('settings');
          }, 3000);
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
      alert('⚠️ You can only edit your calorie goal once per day. Try again tomorrow!');
      setEditingCalories(false);
      return;
    }

    const newGoal = parseInt(tempCalorieGoal);
    if (!isNaN(newGoal) && newGoal > 0) {
      const today = new Date().toISOString();
      await setDoc(doc(db, Collections.USERS, user.uid), {
        calorieGoal: newGoal,
        lastCalorieEdit: today
      }, { merge: true });
      setUserSettings({ ...userSettings, calorieGoal: newGoal });
      setLastCalorieEdit(today);
      setEditingCalories(false);
      alert('✅ Calorie goal updated successfully!');
    }
  };

  const saveWorkoutGoal = async () => {
    if (!user) return;

    // Check if already edited today
    if (!canEditToday(lastWorkoutEdit)) {
      alert('⚠️ You can only edit your workout goal once per day. Try again tomorrow!');
      setEditingWorkouts(false);
      return;
    }

    const newGoal = parseInt(tempWorkoutGoal);
    if (!isNaN(newGoal) && newGoal > 0) {
      const today = new Date().toISOString();
      await setDoc(doc(db, Collections.USERS, user.uid), {
        weeklyWorkoutGoal: newGoal,
        lastWorkoutEdit: today
      }, { merge: true });
      setUserSettings({ ...userSettings, weeklyWorkoutGoal: newGoal });
      setLastWorkoutEdit(today);
      setEditingWorkouts(false);
      alert('✅ Workout goal updated successfully!');
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
      alert('Connection request sent! 🎉');
    } catch (error) {
      console.error('Error connecting:', error);
      alert('Failed to send connection request. Please try again.');
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
      alert('Match request sent! 💕');
    } catch (error) {
      console.error('Error matching:', error);
      alert('Failed to send match request. Please try again.');
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

              {/* Quick Stats Grid - Visual Progress Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Calorie Goal - Visual Progress Card */}
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 shadow-xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Flame className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Daily Calorie Goal</h3>
                        <p className="text-xs text-white/80">
                          {canEditToday(lastCalorieEdit) ? 'Click to edit' : 'Already edited today'}
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
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={tempCalorieGoal}
                          onChange={(e) => setTempCalorieGoal(e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-sm rounded-xl text-3xl font-bold text-white placeholder-white/50"
                          placeholder="Goal"
                        />
                        <button
                          onClick={saveCalorieGoal}
                          className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingCalories(false)}
                          className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-2 mb-4">
                        <div className="text-5xl font-bold">{currentCalories}</div>
                        <div className="text-2xl text-white/80">/ {userSettings.calorieGoal}</div>
                        <div className="text-sm text-white/60 ml-auto">kcal</div>
                      </div>
                      <div className="bg-white/20 rounded-full h-3 overflow-hidden mb-2">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((currentCalories / (userSettings.calorieGoal || 2000)) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-white/80">
                        <span>{Math.round((currentCalories / (userSettings.calorieGoal || 2000)) * 100)}% consumed</span>
                        <span>{(userSettings.calorieGoal || 2000) - currentCalories} kcal remaining</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Workout Goal - Visual Progress Card */}
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 shadow-xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Dumbbell className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Weekly Workouts</h3>
                        <p className="text-xs text-white/80">
                          {canEditToday(lastWorkoutEdit) ? 'Click to edit' : 'Already edited today'}
                        </p>
                      </div>
                    </div>
                    {!editingWorkouts && canEditToday(lastWorkoutEdit) && (
                      <button
                        onClick={() => setEditingWorkouts(true)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>

                  {editingWorkouts ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={tempWorkoutGoal}
                          onChange={(e) => setTempWorkoutGoal(e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-sm rounded-xl text-3xl font-bold text-white placeholder-white/50"
                          placeholder="Goal"
                        />
                        <button
                          onClick={saveWorkoutGoal}
                          className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingWorkouts(false)}
                          className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-2 mb-4">
                        <div className="text-5xl font-bold">{currentWorkouts}</div>
                        <div className="text-2xl text-white/80">/ {userSettings.weeklyWorkoutGoal}</div>
                        <div className="text-sm text-white/60 ml-auto">workouts</div>
                      </div>
                      <div className="bg-white/20 rounded-full h-3 overflow-hidden mb-2">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((currentWorkouts / (userSettings.weeklyWorkoutGoal || 5)) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-white/80">
                        <span>{Math.round((currentWorkouts / (userSettings.weeklyWorkoutGoal || 5)) * 100)}% complete</span>
                        <span>{(userSettings.weeklyWorkoutGoal || 5) - currentWorkouts} workouts left</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Health Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Health Stats</h3>
                  <div className="space-y-2">
                    {userSettings.weight && <div className="text-sm"><span className="text-gray-500">Weight:</span> <span className="font-bold">{userSettings.weight}kg</span></div>}
                    {userSettings.bmi && <div className="text-sm"><span className="text-gray-500">BMI:</span> <span className="font-bold">{userSettings.bmi.toFixed(1)}</span></div>}
                    {userSettings.bmr && <div className="text-sm"><span className="text-gray-500">BMR:</span> <span className="font-bold">{Math.round(userSettings.bmr)} kcal</span></div>}
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
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI-Powered Features</h2>
                <p className="text-gray-600">Experience the future of fitness with our advanced AI tools</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* AI Photo Analysis */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 opacity-50">
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
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 opacity-50">
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
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 opacity-50">
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

                {/* AI Meal Planner */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6 opacity-50">
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
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 opacity-50">
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
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 opacity-50">
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

                {/* AI Injury Prevention */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 opacity-50">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Injury Prevention</h3>
                  <p className="text-gray-600 mb-4 text-sm">Predictive analysis to prevent overtraining and reduce injury risk</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                      Recovery time optimization
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                      Muscle imbalance detection
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                      Rest day recommendations
                    </div>
                  </div>
                </div>

                {/* Social AI - Cupid */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-pink-100 text-pink-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 opacity-50">
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
