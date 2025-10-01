import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import ReddyAIAgent from './ReddyAIAgent';
import FitCalcPro from './FitCalcPro';
import SettingsPage from './SettingsPage';
import AICompanionPage from './AICompanionPage';

type PageView = 'home' | 'reddy' | 'fitcalc' | 'datefit' | 'settings';

export default function MainDashboard() {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mainFeatures = [
    {
      id: 'reddy',
      name: 'Reddy AI Agent',
      description: 'Your personal AI fitness coach - Chat, voice help & guidance',
      icon: Bot,
      color: 'from-orange-500 to-red-500',
      available: true
    },
    {
      id: 'fitbuddy',
      name: 'FitBuddy AI Agent',
      description: 'AI companion for accountability & daily motivation',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      available: false
    },
    {
      id: 'cupid',
      name: 'Cupid AI Agent',
      description: 'Smart fitness partner matching & accountability buddies',
      icon: Heart,
      color: 'from-pink-500 to-purple-500',
      available: false
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

  if (currentPage === 'fitcalc') {
    return <FitCalcPro onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'datefit') {
    return <AICompanionPage onBack={() => setCurrentPage('home')} />;
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
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Goal</p>
                <p className="text-2xl font-bold text-orange-600">2,000 cal</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Utensils className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Workouts This Week</p>
                <p className="text-2xl font-bold text-blue-600">4/5</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">AI Chats</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-green-600" />
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
