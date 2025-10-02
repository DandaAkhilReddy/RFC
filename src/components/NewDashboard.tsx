import React, { useState, useEffect } from 'react';
import { transition } from '@ssgoi/react';
import { fly } from '@ssgoi/react/transitions';
import {
  Bot, Utensils, Dumbbell, Settings, LogOut, Menu, X, ChevronRight, Heart,
  Activity, Camera, MessageCircle, TrendingUp, Users, Edit2, Calendar,
  MapPin, Star, Trophy, Mic, BarChart3, Image as ImageIcon, Zap, Crown,
  Clock, Target, Award, Flame, ChevronLeft, ChevronDown
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

export default function NewDashboard() {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  // Mock data for new features
  const [todaysMatches] = useState<Match[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 28,
      photo: '👩',
      compatibility: 92,
      fitnessGoal: 'Weight Loss',
      distance: '2.3 km'
    },
    {
      id: '2',
      name: 'Mike Chen',
      age: 31,
      photo: '👨',
      compatibility: 88,
      fitnessGoal: 'Muscle Gain',
      distance: '5.1 km'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      age: 26,
      photo: '👩',
      compatibility: 85,
      fitnessGoal: 'Endurance',
      distance: '3.7 km'
    }
  ]);

  const [workoutBuddies] = useState<WorkoutBuddy[]>([
    {
      id: '1',
      name: 'Alex Turner',
      photo: '🧑',
      lastActive: '10 min ago',
      distance: '1.2 km',
      commonWorkouts: ['Running', 'Yoga']
    },
    {
      id: '2',
      name: 'Jessica Lee',
      photo: '👩',
      lastActive: '30 min ago',
      distance: '3.5 km',
      commonWorkouts: ['Gym', 'Cycling']
    }
  ]);

  const [healthInsights] = useState<HealthInsight[]>([
    {
      id: '1',
      title: 'Great Progress!',
      description: 'You lost 2kg this month. Keep it up!',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '2',
      title: 'Hydration Alert',
      description: 'Remember to drink 2L water today',
      icon: Activity,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '3',
      title: 'Rest Day',
      description: 'Consider taking a rest day tomorrow',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500'
    }
  ]);

  const [communityPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      author: 'John Fitness',
      authorPhoto: '👨‍💼',
      content: 'Just completed my 100th workout this year! 🎉',
      likes: 45,
      comments: 12,
      timestamp: '2h ago'
    },
    {
      id: '2',
      author: 'FitMom Sarah',
      authorPhoto: '👩',
      content: 'Lost 10kg in 3 months with ReddyFit! Thank you!',
      likes: 89,
      comments: 23,
      timestamp: '5h ago'
    }
  ]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activityDots = [true, true, false, true, true, true, false]; // Mock activity data

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
            weight: data.weight || 75,
            height: data.height,
            bmi: data.bmi,
            bmr: data.bmr,
            targetWeight: data.targetWeight || 70,
            startWeight: data.startWeight || 80
          });
          setTempCalorieGoal(String(data.calorieGoal || 2000));
          setTempWorkoutGoal(String(data.weeklyWorkoutGoal || 5));
        }
      } catch (error) {
        console.error('[NewDashboard] Error fetching user settings:', error);
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
      console.error('[NewDashboard] Error saving calorie goal:', error);
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
      console.error('[NewDashboard] Error saving workout goal:', error);
      alert('Failed to save workout goal');
    }
  };

  // Calculate weight progress
  const weightProgress = userSettings.startWeight && userSettings.targetWeight
    ? ((userSettings.startWeight - (userSettings.weight || userSettings.startWeight)) /
       (userSettings.startWeight - userSettings.targetWeight)) * 100
    : 0;

  const mainFeatures = [
    {
      id: 'reddy',
      name: 'AI Agent Reddy',
      description: 'Your personal AI fitness coach',
      icon: Bot,
      color: 'from-orange-500 to-red-500',
      available: true
    },
    {
      id: 'fitbuddy',
      name: 'AI Agent FitBuddy',
      description: 'AI-powered body fat analysis',
      icon: Camera,
      color: 'from-green-500 to-emerald-500',
      available: true,
      comingSoon: true
    },
    {
      id: 'cupid',
      name: 'AI Agent Cupid',
      description: 'Smart partner matching',
      icon: Heart,
      color: 'from-pink-500 to-purple-500',
      available: true,
      comingSoon: false,
      premium: true
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
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
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
        {/* Weight Goal Progress Tracker */}
        <div
          ref={transition({
            key: 'weight-progress',
            ...fly({ x: 0, y: -80, opacity: true })
          })}
          className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 shadow-xl mb-8 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">Weight Goal Progress</h3>
              <p className="text-white/80 text-sm">Keep pushing towards your goal!</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(weightProgress)}%</div>
              <div className="text-sm text-white/80">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-4 mb-4 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(weightProgress, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-white/80">Start</div>
              <div className="text-xl font-bold">{userSettings.startWeight}kg</div>
            </div>
            <div>
              <div className="text-sm text-white/80">Current</div>
              <div className="text-xl font-bold">{userSettings.weight}kg</div>
            </div>
            <div>
              <div className="text-sm text-white/80">Goal</div>
              <div className="text-xl font-bold">{userSettings.targetWeight}kg</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Banner - EXISTING FEATURE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Calorie Goal */}
          <div
            ref={transition({
              key: 'calorie-goal-card',
              ...fly({ x: -100, y: 0, opacity: true })
            })}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
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

          {/* Workout Goal */}
          <div
            ref={transition({
              key: 'workout-goal-card',
              ...fly({ x: 0, y: -80, opacity: true })
            })}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
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

          {/* Health Stats */}
          <div
            ref={transition({
              key: 'health-stats-card',
              ...fly({ x: 100, y: 0, opacity: true })
            })}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setCurrentPage('settings')}
          >
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

        {/* Weekly Calendar View - NEW FEATURE */}
        <div
          ref={transition({
            key: 'weekly-calendar',
            ...fly({ x: 0, y: -60, opacity: true })
          })}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">This Week's Activity</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`text-center p-3 rounded-xl cursor-pointer transition-all ${
                  index === selectedDay
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedDay(index)}
              >
                <div className="text-xs font-semibold mb-1">{day}</div>
                <div className={`w-2 h-2 rounded-full mx-auto ${
                  activityDots[index] ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Main Features - EXISTING with ENHANCED */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              <div
                key={feature.id}
                ref={transition({
                  key: `feature-${feature.id}`,
                  ...fly({
                    x: index === 0 ? -150 : index === 1 ? 0 : 150,
                    y: -100,
                    opacity: true
                  })
                })}
                className="relative group"
              >
                <button
                  onClick={() => feature.available && setCurrentPage(feature.id as PageView)}
                  disabled={!feature.available}
                  className={`w-full text-left bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all ${
                    feature.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                  }`}
                >
                  {feature.premium && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                        <Crown className="w-3 h-3" />
                        Premium
                      </div>
                    </div>
                  )}

                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {feature.name}
                      {feature.comingSoon && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </span>
                    {feature.available && (
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{feature.description}</p>

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

        {/* Today's Matches Carousel - NEW FEATURE */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Today's Matches</h2>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-semibold">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {todaysMatches.map((match, index) => (
              <div
                key={match.id}
                ref={transition({
                  key: `match-${match.id}`,
                  ...fly({ x: index * 100 - 100, y: 0, opacity: true })
                })}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{match.photo}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{match.name}, {match.age}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {match.distance}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    <Star className="w-3 h-3" />
                    {match.compatibility}%
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">{match.fitnessGoal}</span>
                </div>
                <button className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all group-hover:scale-105">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Health Insights - NEW FEATURE */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Health Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthInsights.map((insight, index) => (
              <div
                key={insight.id}
                ref={transition({
                  key: `insight-${insight.id}`,
                  ...fly({ x: 0, y: 50 + index * 20, opacity: true })
                })}
                className={`bg-gradient-to-br ${insight.color} rounded-2xl p-6 text-white shadow-lg`}
              >
                <insight.icon className="w-10 h-10 mb-3" />
                <h4 className="font-bold text-lg mb-2">{insight.title}</h4>
                <p className="text-sm text-white/90">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workout Buddies Nearby - NEW FEATURE */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Workout Buddies Nearby</h2>
            <button className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-semibold">
              <MapPin className="w-4 h-4" />
              Find More
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workoutBuddies.map((buddy, index) => (
              <div
                key={buddy.id}
                ref={transition({
                  key: `buddy-${buddy.id}`,
                  ...fly({ x: index === 0 ? -100 : 100, y: 0, opacity: true })
                })}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{buddy.photo}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{buddy.name}</h4>
                    <div className="text-xs text-gray-500">{buddy.lastActive}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      {buddy.distance}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  {buddy.commonWorkouts.map(workout => (
                    <span key={workout} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                      {workout}
                    </span>
                  ))}
                </div>
                <button className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                  Send Message
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Assistant Quick Access - NEW FEATURE */}
        <div
          ref={transition({
            key: 'voice-assistant',
            ...fly({ x: 0, y: 80, opacity: true })
          })}
          className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 shadow-xl mb-8 text-white text-center"
        >
          <Mic className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">FitBot AI Voice Assistant</h3>
          <p className="text-white/80 mb-6">Ask me anything about your fitness journey!</p>
          <button className="px-8 py-3 bg-white text-purple-600 rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105">
            Start Voice Chat
          </button>
        </div>

        {/* Progress Analytics - NEW FEATURE */}
        <div
          ref={transition({
            key: 'progress-analytics',
            ...fly({ x: 0, y: 60, opacity: true })
          })}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Progress Analytics</h2>
            <button className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-semibold">
              <BarChart3 className="w-4 h-4" />
              View Details
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">150</div>
              <div className="text-sm text-gray-600">Days Streak</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Dumbbell className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">245</div>
              <div className="text-sm text-gray-600">Workouts</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">Top 5%</div>
              <div className="text-sm text-gray-600">Global Rank</div>
            </div>
          </div>
        </div>

        {/* Community Posts - NEW FEATURE */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Community Highlights</h2>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-semibold">
              Explore Community →
            </button>
          </div>
          <div className="space-y-4">
            {communityPosts.map((post, index) => (
              <div
                key={post.id}
                ref={transition({
                  key: `post-${post.id}`,
                  ...fly({ x: 0, y: 40 + index * 20, opacity: true })
                })}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{post.authorPhoto}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{post.author}</h4>
                      <span className="text-xs text-gray-500">{post.timestamp}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{post.content}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <button className="flex items-center gap-2 hover:text-orange-600 transition-colors">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-2 hover:text-orange-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Photo Journal - NEW FEATURE */}
        <div
          ref={transition({
            key: 'photo-journal',
            ...fly({ x: 0, y: 70, opacity: true })
          })}
          className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 shadow-xl text-white text-center"
        >
          <Camera className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Progress Photo Journal</h3>
          <p className="text-white/80 mb-6">Track your transformation with weekly photos</p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105">
            Upload Progress Photo
          </button>
        </div>
      </div>
    </div>
  );
}
