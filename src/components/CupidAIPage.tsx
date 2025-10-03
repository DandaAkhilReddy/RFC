import { Heart, Users, Sparkles, Target, TrendingUp, CheckCircle2, ArrowRight, MessageCircle, Calendar, Award } from 'lucide-react';

export default function CupidAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-pink-600 to-red-600 rounded-3xl p-8 md:p-12 text-white mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Cupid AI Agent</h1>
                <p className="text-pink-100 text-lg">Your AI Dating Coach & Fitness Buddy Matcher</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              Exclusive with Rapid
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-lg mb-4">
              <strong>Unlock Cupid when you use Rapid!</strong> Get access to AI-powered dating coaching and find your perfect fitness accountability partner.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span className="text-sm">Smart Matching</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">Fitness Buddies</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Dating Advice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Fitness Buddy Matching */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fitness Buddy Matching</h2>
            <p className="text-gray-600 mb-6">
              Find your perfect workout partner or accountability buddy based on fitness goals, location, schedule, and personality.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">AI-Powered Matching</h3>
                  <p className="text-sm text-gray-600">Algorithm analyzes goals, fitness level, schedule, and preferences to find compatible partners</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Location-Based</h3>
                  <p className="text-sm text-gray-600">Connect with fitness buddies near you or find virtual workout partners anywhere</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Compatibility Score</h3>
                  <p className="text-sm text-gray-600">See detailed compatibility metrics before connecting with potential buddies</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Accountability Tracking</h3>
                  <p className="text-sm text-gray-600">Keep each other motivated with shared goals and progress tracking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dating Coach */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Dating Coach</h2>
            <p className="text-gray-600 mb-6">
              Get personalized dating advice, conversation starters, and relationship guidance powered by advanced AI.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Profile Optimization</h3>
                  <p className="text-sm text-gray-600">AI-powered tips to make your dating profile stand out and attract the right matches</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Conversation Starters</h3>
                  <p className="text-sm text-gray-600">Never run out of things to say with personalized icebreakers and topic suggestions</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Date Planning</h3>
                  <p className="text-sm text-gray-600">Get creative, fitness-focused date ideas that align with both partners' interests</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Relationship Advice</h3>
                  <p className="text-sm text-gray-600">Navigate challenges with AI-powered insights and communication strategies</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How Cupid Works */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Sparkles className="w-6 h-6 text-pink-600 mr-2" />
            How Cupid Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">1</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Use Rapid</h3>
              <p className="text-sm text-gray-600">Complete your fitness plan with Rapid AI to unlock Cupid access</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Build Profile</h3>
              <p className="text-sm text-gray-600">Set your preferences, interests, and what you're looking for</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">3</span>
              </div>
              <h3 className="font-bold text-lg mb-2">AI Matching</h3>
              <p className="text-sm text-gray-600">Cupid analyzes and suggests the best matches for you</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Connect & Grow</h3>
              <p className="text-sm text-gray-600">Start conversations and build meaningful connections</p>
            </div>
          </div>
        </div>

        {/* Success Stories Preview */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Cupid Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Award className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Shared Goals</h3>
              <p className="text-sm text-gray-600">
                Match with people who share your fitness journey and understand your lifestyle
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Target className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Better Compatibility</h3>
              <p className="text-sm text-gray-600">
                AI considers multiple dimensions beyond just looks - values, goals, and personality
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <TrendingUp className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Continuous Learning</h3>
              <p className="text-sm text-gray-600">
                The more you interact, the better Cupid gets at understanding your preferences
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Match?</h2>
          <p className="text-pink-100 mb-6 text-lg">
            Use Rapid AI to unlock Cupid and start connecting with your ideal fitness buddy or partner
          </p>
          <button className="px-8 py-4 bg-white text-pink-600 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto">
            <Heart className="w-6 h-6" />
            <span>Unlock Cupid Now</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
