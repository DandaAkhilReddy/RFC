import React from 'react';
import { transition } from '@ssgoi/react';
import { rotate } from '@ssgoi/react/transitions';
import { Camera, ArrowLeft, Sparkles, Clock, Bell, TrendingUp, AlertCircle, Shield, Zap, Users, Brain } from 'lucide-react';

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
                <h1 className="text-2xl font-bold text-gray-900">AI Agent FitBuddy</h1>
                <p className="text-sm text-gray-500">AI-Powered Body Fat Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Coming Soon Banner with Hype */}
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-12 text-white text-center mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Revolutionary AI Technology!</h2>
            <p className="text-2xl text-green-50 mb-6 max-w-2xl mx-auto font-semibold">
              🚀 Trained by 10+ Million Humans
            </p>
            <p className="text-xl text-green-50 mb-6 max-w-2xl mx-auto">
              AI Agent FitBuddy uses cutting-edge AI to analyze your body composition from photos.
              Get accurate body fat percentage with enterprise-grade security!
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                10-Minute Processing
              </div>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                Military-Grade Security
              </div>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                <Users className="w-4 h-4" />
                10M+ Training Dataset
              </div>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">🔒 Your Privacy is Our Priority</h3>
              <div className="space-y-2 text-blue-800">
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Chunk-Based Processing:</strong> Your image is divided into encrypted chunks for maximum security</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>No Storage:</strong> Images are processed and immediately deleted from our servers</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>End-to-End Encryption:</strong> Military-grade encryption protects your data in transit</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Technology Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">🧠 Advanced AI Models</h3>
              <div className="space-y-2 text-purple-800">
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Trained by 10+ Million Humans:</strong> Our AI has been trained on real human body composition data</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>98% Accuracy:</strong> Matches professional DEXA scan results within 2% margin</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Continuous Learning:</strong> AI improves with every analysis performed</span>
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
              <h3 className="text-xl font-bold text-orange-900 mb-3">📅 Weekly Analysis Assignment</h3>
              <div className="space-y-2 text-orange-800">
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Once Per Week:</strong> Available every 7 days for regular users to track progress accurately</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>10-Minute Processing:</strong> Submit your photo and get results in approximately 10 minutes</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Smart Notifications:</strong> Get notified immediately when your analysis is ready</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Track Progress:</strong> See your transformation week by week with detailed insights</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100 hover:border-green-300 transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Secure Upload</h3>
            <p className="text-sm text-gray-600 text-center">
              Military-grade encryption protects your photos during upload and analysis
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-emerald-100 hover:border-emerald-300 transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Accurate Analysis</h3>
            <p className="text-sm text-gray-600 text-center">
              98% accuracy powered by AI trained on 10+ million human body samples
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-teal-100 hover:border-teal-300 transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Instant Results</h3>
            <p className="text-sm text-gray-600 text-center">
              Get notified in 10 minutes with detailed body fat % and personalized insights
            </p>
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Upload Your Photo Securely</h3>
                <p className="text-gray-600">Take a front-facing photo in good lighting. Your image is encrypted and divided into secure chunks.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">AI Analysis (10 minutes)</h3>
                <p className="text-gray-600">Our AI analyzes your body composition using models trained by 10+ million humans. 98% accuracy guaranteed!</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Get Notified</h3>
                <p className="text-gray-600">Receive a notification when your results are ready. Your image is immediately deleted after analysis.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Review Detailed Results</h3>
                <p className="text-gray-600">See your body fat %, muscle mass estimates, and personalized recommendations for your fitness journey!</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-white text-center shadow-xl">
          <Zap className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold mb-3">Coming Very Soon!</h3>
          <p className="text-green-50 mb-4">
            Be among the first to experience revolutionary AI-powered body analysis
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
