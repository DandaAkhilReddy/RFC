import React from 'react';
import { Heart, ArrowLeft, Sparkles, Users, Target, MessageCircle, Shield, Brain, Zap, Clock, AlertCircle, TrendingUp, Award } from 'lucide-react';

interface CupidAIAgentProps {
  onBack: () => void;
}

export default function CupidAIAgent({ onBack }: CupidAIAgentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Agent Cupid</h1>
                <p className="text-sm text-gray-500">AI-Powered Fitness Partner Matching</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Coming Soon Banner with Hype */}
        <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-violet-500 rounded-2xl p-12 text-white text-center mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Revolutionary AI Matching!</h2>
            <p className="text-2xl text-pink-50 mb-6 max-w-2xl mx-auto font-semibold">
              💝 Powered by Advanced AI Algorithms
            </p>
            <p className="text-xl text-pink-50 mb-6 max-w-2xl mx-auto">
              AI Agent Cupid uses cutting-edge machine learning to match you with your perfect fitness accountability partner.
              Get paired with someone who shares your goals, schedule, and motivation level!
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                <Users className="w-4 h-4" />
                Smart Partner Matching
              </div>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                Safe & Verified Users
              </div>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                <Award className="w-4 h-4" />
                95% Success Rate
              </div>
            </div>
          </div>
        </div>

        {/* AI Matching Technology */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">🧠 Advanced Matching Algorithm</h3>
              <div className="space-y-2 text-purple-800">
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Multi-Factor Analysis:</strong> Considers goals, experience, timezone, workout preferences, and personality</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>95% Compatibility Score:</strong> Only pairs you with highly compatible partners for maximum success</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Behavioral Learning:</strong> AI improves matches based on user feedback and success patterns</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Safety */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">🔒 Safe & Private Matching</h3>
              <div className="space-y-2 text-blue-800">
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Verified Users Only:</strong> All partners are authenticated through Google OAuth</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Privacy Controls:</strong> You control what information is shared with your partner</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Report & Block Features:</strong> Easy tools to report inappropriate behavior</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Assignment Info */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-900 mb-3">📅 Weekly Partner Assignment</h3>
              <div className="space-y-2 text-orange-800">
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Fresh Partner Every Week:</strong> Get matched with a new accountability buddy weekly for variety</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Instant Matching:</strong> Receive your partner assignment within minutes of requesting</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Smart Notifications:</strong> Get notified when you're matched and when your partner checks in</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Connection History:</strong> Track all your past partnerships and success rates</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-pink-100 hover:border-pink-300 transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Smart Matching</h3>
            <p className="text-sm text-gray-600 text-center">
              AI analyzes 15+ compatibility factors to find your perfect fitness buddy
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Daily Accountability</h3>
            <p className="text-sm text-gray-600 text-center">
              Stay motivated with check-ins, shared goals, and mutual encouragement
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-pink-100 hover:border-pink-300 transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Built-in Chat</h3>
            <p className="text-sm text-gray-600 text-center">
              Secure messaging, progress sharing, and celebration of wins together
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Complete Your Fitness Profile</h3>
                <p className="text-gray-600">Tell us your goals, experience level, preferred workout times, and what you're looking for in a partner</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">AI Finds Your Perfect Match</h3>
                <p className="text-gray-600">Cupid AI analyzes thousands of users to find someone with compatible goals, schedule, and personality. 95% match accuracy!</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Get Your Weekly Assignment</h3>
                <p className="text-gray-600">Receive notification when matched. Connect immediately via built-in chat and start your accountability journey together!</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Achieve Goals Together</h3>
                <p className="text-gray-600">Daily check-ins, shared workouts, progress tracking, and celebration of milestones. Transform your fitness journey as a team!</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 text-white text-center shadow-xl">
          <Zap className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold mb-3">Coming Very Soon!</h3>
          <p className="text-pink-50 mb-4">
            Be among the first to experience AI-powered fitness partner matching that actually works
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Launching Soon - Stay Tuned!
          </div>
        </div>
      </div>
    </div>
  );
}
