import { Heart, Users, Sparkles, Target, TrendingUp, CheckCircle2, ArrowRight, MessageCircle, Calendar, Award, Activity, Zap, Crown, UserPlus } from 'lucide-react';

export default function CupidAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-pink-600 to-red-600 rounded-3xl p-8 md:p-12 text-white mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Cupid AI</h1>
                <p className="text-pink-100 text-lg">Find Your Perfect Accountability Partner</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              Unlock with Rapid
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-lg mb-4">
              <strong>Match with accountability partners</strong> for your fitness journey or dating goals. Get AI-powered partner suggestions based on 50+ compatibility factors.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span className="text-sm">Fitness Accountability</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span className="text-sm">Dating Accountability</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm">AI Matching</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Fitness Accountability */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fitness Accountability Partners</h2>
            <p className="text-gray-600 mb-6">
              Find someone with similar fitness goals, schedule, and commitment level. Stay motivated together!
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Matched Goals</h3>
                  <p className="text-sm text-gray-600">Partner with someone targeting the same fitness outcomes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Schedule Sync</h3>
                  <p className="text-sm text-gray-600">Find partners who workout at similar times</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Experience Match</h3>
                  <p className="text-sm text-gray-600">Connect with someone at your fitness level</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Daily Check-ins</h3>
                  <p className="text-sm text-gray-600">Keep each other accountable every day</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dating Accountability */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Dating Accountability Partners</h2>
            <p className="text-gray-600 mb-6">
              Get matched with someone who will help keep you on track with your dating goals and personal growth.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Similar Dating Goals</h3>
                  <p className="text-sm text-gray-600">Match with someone pursuing similar relationship objectives</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Mutual Support</h3>
                  <p className="text-sm text-gray-600">Share experiences and keep each other motivated</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Progress Reviews</h3>
                  <p className="text-sm text-gray-600">Regular check-ins to discuss challenges and wins</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Honest Feedback</h3>
                  <p className="text-sm text-gray-600">Get constructive input on your dating approach</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How AI Matching Works */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
            How AI Matching Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Complete Your Profile</h3>
              <p className="text-gray-600 text-sm">
                Share your goals, preferences, schedule, and what you're looking for in an accountability partner
              </p>
            </div>

            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">AI Analyzes 50+ Factors</h3>
              <p className="text-gray-600 text-sm">
                Goals, schedule, experience level, personality, location, values, commitment level, and more
              </p>
            </div>

            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Get Your Daily Match</h3>
              <p className="text-gray-600 text-sm">
                Receive one high-quality match per day - quality over quantity for meaningful connections
              </p>
            </div>
          </div>
        </div>

        {/* Compatibility Factors */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mb-8 border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">50+ Compatibility Factors</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-sm">Goals Alignment</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-sm">Schedule Match</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-sm">Experience Level</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-sm">Personality Fit</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-sm">Communication Style</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-sm">Commitment Level</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-sm">Energy Match</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-sm">Values Alignment</p>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-6 text-sm">
            ...and 42 more factors analyzed by our AI to ensure the best possible match
          </p>
        </div>

        {/* Unlock Section */}
        <div className="bg-gradient-to-r from-pink-600 to-red-600 rounded-2xl p-8 text-white text-center shadow-2xl">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🔓</div>
            <h2 className="text-3xl font-bold mb-4">Unlock Cupid AI</h2>
            <p className="text-lg text-pink-100 mb-6">
              Complete a Rapid AI assessment to unlock Cupid and start finding your perfect accountability partners!
            </p>
            <button className="px-8 py-4 bg-white text-pink-600 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto">
              <UserPlus className="w-6 h-6" />
              <span>Use Rapid to Unlock</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
