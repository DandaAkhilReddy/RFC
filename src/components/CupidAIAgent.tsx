import React from 'react';
import { Heart, ArrowLeft, Sparkles, Users, Target, MessageCircle } from 'lucide-react';

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
                <h1 className="text-2xl font-bold text-gray-900">Agent Cupid</h1>
                <p className="text-sm text-gray-500">Smart Fitness Partner Matching</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-12 text-white text-center mb-12 shadow-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-xl text-pink-50 mb-6 max-w-2xl mx-auto">
            Cupid AI is learning to match you with the perfect fitness accountability partner.
            Get ready to find someone who shares your goals and journey!
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm font-medium">
            <Heart className="w-4 h-4" />
            Launching Soon
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Matching</h3>
            <p className="text-sm text-gray-600">
              AI-powered algorithm matches you with compatible fitness partners
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Daily Accountability</h3>
            <p className="text-sm text-gray-600">
              Connect with partners who keep you motivated and on track
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Built-in Chat</h3>
            <p className="text-sm text-gray-600">
              Message your fitness buddy, share progress, and celebrate wins
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-pink-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Set Your Preferences</h3>
                <p className="text-gray-600">Tell us your fitness goals, experience level, and what you're looking for in a partner</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-pink-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">AI Finds Your Match</h3>
                <p className="text-gray-600">Cupid AI analyzes compatibility based on goals, schedules, and fitness interests</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-pink-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Connect & Grow Together</h3>
                <p className="text-gray-600">Chat daily, share workouts, track progress, and keep each other accountable</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-pink-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Achieve Goals Together</h3>
                <p className="text-gray-600">Celebrate milestones, overcome challenges, and transform your fitness journey as a team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
