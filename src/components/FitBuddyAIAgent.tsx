import React from 'react';
import { Camera, ArrowLeft, Sparkles, Clock, Bell, TrendingUp, AlertCircle } from 'lucide-react';

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
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agent FitBuddy</h1>
                <p className="text-sm text-gray-500">AI-Powered Body Analysis</p>
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
            Agent FitBuddy uses advanced AI to analyze your body composition from photos.
            Get accurate body fat percentage and personalized insights!
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Launching Soon
          </div>
        </div>

        {/* Important Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">How It Works</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Available <strong>once per week</strong> for regular users
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Processing takes approximately <strong>10 minutes</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  You'll receive a <strong>notification</strong> when results are ready
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Photo Analysis</h3>
            <p className="text-sm text-gray-600">
              Upload your photo and let AI analyze your body composition
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Body Fat %</h3>
            <p className="text-sm text-gray-600">
              Get accurate body fat percentage calculations using advanced AI
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Notifications</h3>
            <p className="text-sm text-gray-600">
              Get notified when your analysis is complete (10 min processing)
            </p>
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Process</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Upload Your Photo</h3>
                <p className="text-gray-600">Take a front-facing photo in good lighting with minimal clothing</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">AI Processing (10 min)</h3>
                <p className="text-gray-600">Our advanced AI analyzes your body composition, measurements, and fat distribution</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Get Notified</h3>
                <p className="text-gray-600">Receive a notification when your results are ready to view</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Review Detailed Results</h3>
                <p className="text-gray-600">See your body fat percentage, muscle mass estimates, and personalized recommendations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Frequency Info */}
        <div className="mt-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-6 h-6 text-green-700" />
            <h3 className="text-lg font-bold text-green-900">Weekly Analysis</h3>
          </div>
          <p className="text-green-800">
            For optimal tracking and to ensure accurate results, regular users can submit one photo per week.
            This allows you to monitor your progress over time without overwhelming the system.
          </p>
        </div>
      </div>
    </div>
  );
}
