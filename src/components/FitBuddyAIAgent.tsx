import React from 'react';
import { MessageCircle, ArrowLeft, Sparkles, Heart, Calendar, Trophy } from 'lucide-react';

interface FitBuddyAIAgentProps {
  onBack: () => void;
}

export default function FitBuddyAIAgent({ onBack }: FitBuddyAIAgentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FitBuddy AI Agent</h1>
                <p className="text-sm text-gray-500">Your Daily Accountability Companion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-12 text-white text-center mb-12 shadow-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-xl text-green-50 mb-6 max-w-2xl mx-auto">
            FitBuddy AI is being trained to be your perfect accountability partner.
            Get ready for daily motivation, check-ins, and personalized encouragement!
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm font-medium">
            <Calendar className="w-4 h-4" />
            Launching Soon
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Daily Check-Ins</h3>
            <p className="text-sm text-gray-600">
              Start your day with personalized motivation and goal tracking
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Emotional Support</h3>
            <p className="text-sm text-gray-600">
              Get encouragement when you need it most, celebrate wins together
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Goal Accountability</h3>
            <p className="text-sm text-gray-600">
              Stay on track with gentle reminders and progress celebrations
            </p>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What to Expect</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Morning Motivation</h3>
                <p className="text-gray-600">Start each day with a personalized message and today's fitness focus</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Continuous Conversation</h3>
                <p className="text-gray-600">Chat anytime about struggles, wins, or questions - FitBuddy is always there</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Evening Reflection</h3>
                <p className="text-gray-600">Review your day, celebrate progress, and plan for tomorrow</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
