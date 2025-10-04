import { ArrowLeft, Heart, Users, MessageCircle, Star, TrendingUp, Sparkles, Clock } from 'lucide-react';

interface AgentCupidInfoProps {
  onNavigate: (page: string) => void;
}

export default function AgentCupidInfo({ onNavigate }: AgentCupidInfoProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('ai-features')}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to AI Features</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-pink-500 to-red-600 p-8 rounded-2xl shadow-xl text-white mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Heart className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">AgentCupid ♥️</h1>
              <p className="text-pink-100 text-lg">Find Your Perfect Fitness Match</p>
            </div>
          </div>
          <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-semibold inline-block">
            🚧 COMING SOON
          </div>
        </div>

        {/* Current Beta Feature */}
        <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl mb-8">
          <div className="flex items-start space-x-4">
            <Sparkles className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-green-900 mb-2">Try Now: Community Browser (Beta)</h3>
              <p className="text-green-800 mb-4">
                While we're building the full AgentCupid matching system, you can browse our fitness community!
                See members near you and start connecting.
              </p>
              <button
                onClick={() => onNavigate('community')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Browse Community →
              </button>
            </div>
          </div>
        </div>

        {/* What is AgentCupid */}
        <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">What is AgentCupid?</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            AgentCupid is the world's first AI-powered fitness dating and accountability partner matching system.
            Using advanced machine learning, it analyzes your fitness goals, schedule, personality, and location
            to find your perfect workout buddy or fitness accountability partner.
          </p>
          <p className="text-pink-600 font-semibold">
            Tagline: "Find your fitness match"
          </p>
        </div>

        {/* Planned Features */}
        <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Planned Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Dating Coach */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">AI Dating Coach</h3>
                <p className="text-gray-600">
                  Get personalized advice on building connections, starting conversations, and maintaining
                  fitness accountability partnerships.
                </p>
              </div>
            </div>

            {/* Smart Matching */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">ML-Powered Matching</h3>
                <p className="text-gray-600">
                  Advanced machine learning analyzes 50+ factors to find compatible workout partners based on
                  goals, schedule, location, and personality.
                </p>
              </div>
            </div>

            {/* Compatibility Scoring */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Compatibility Scores</h3>
                <p className="text-gray-600">
                  See detailed compatibility breakdowns showing how well you match with potential workout buddies
                  across different dimensions.
                </p>
              </div>
            </div>

            {/* In-App Messaging */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Built-in Chat</h3>
                <p className="text-gray-600">
                  Connect with your matches directly through our secure in-app messaging system. Plan workouts
                  and share progress together.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">How AgentCupid Works</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Complete Your Profile</h3>
                <p className="text-gray-600">
                  Tell us about your fitness goals, schedule, experience level, and workout preferences.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">AI Analyzes & Matches</h3>
                <p className="text-gray-600">
                  Our ML algorithm processes your data and finds the most compatible workout partners near you.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Connect & Grow Together</h3>
                <p className="text-gray-600">
                  Message your matches, schedule workouts, and achieve your fitness goals with your new accountability partner.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Powered By</h2>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold">
              Machine Learning Matching
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
              Geolocation Services
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
              Advanced AI Algorithms
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gradient-to-r from-pink-100 to-red-100 p-8 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <Clock className="w-8 h-8 text-pink-600" />
            <h2 className="text-2xl font-bold text-gray-900">Development Timeline</h2>
          </div>
          <p className="text-gray-700 text-lg mb-4">
            We're building AgentCupid to revolutionize how people find fitness accountability partners.
            The full AI matching system with dating coach features will launch soon.
          </p>
          <p className="text-pink-700 font-semibold">
            Browse our community now to see who's nearby and get excited for what's coming!
          </p>
        </div>
      </div>
    </div>
  );
}
