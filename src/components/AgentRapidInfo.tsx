import { ArrowLeft, Zap, Sparkles, Mic, UtensilsCrossed, Dumbbell, Brain, Clock } from 'lucide-react';

interface AgentRapidInfoProps {
  onNavigate: (page: string) => void;
}

export default function AgentRapidInfo({ onNavigate }: AgentRapidInfoProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('ai-features')}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to AI Features</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-8 rounded-2xl shadow-xl text-white mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Zap className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">AgentRapid ⚡</h1>
              <p className="text-purple-100 text-lg">Your AI Fitness Companion</p>
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
              <h3 className="font-bold text-lg text-green-900 mb-2">Try Now: Body Fat % Checker (Beta)</h3>
              <p className="text-green-800 mb-4">
                While we're building the full AgentRapid experience, you can try our AI-powered Body Fat Percentage Checker!
                Upload a photo and get instant analysis.
              </p>
              <button
                onClick={() => onNavigate('rapid-ai')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Try Body Fat Checker →
              </button>
            </div>
          </div>
        </div>

        {/* What is AgentRapid */}
        <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">What is AgentRapid?</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            AgentRapid is your complete AI-powered fitness assistant. Using cutting-edge AI technology,
            it provides personalized meal plans, generates custom workout routines, and responds to voice commands
            to help you achieve your fitness goals faster than ever.
          </p>
          <p className="text-purple-600 font-semibold">
            Tagline: "One fresh photo. Real numbers."
          </p>
        </div>

        {/* Planned Features */}
        <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Planned Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voice Commands */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Voice Commands</h3>
                <p className="text-gray-600">
                  Talk to AgentRapid naturally. Ask questions, log meals, or get workout suggestions using just your voice.
                </p>
              </div>
            </div>

            {/* Meal Planning */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Personalized Meal Plans</h3>
                <p className="text-gray-600">
                  AI-generated meal plans tailored to your macros, dietary preferences, and fitness goals.
                </p>
              </div>
            </div>

            {/* Workout Generation */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Custom Workout Generation</h3>
                <p className="text-gray-600">
                  Dynamic workout plans that adapt to your equipment, schedule, and fitness level.
                </p>
              </div>
            </div>

            {/* Smart Analysis */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Advanced AI Analysis</h3>
                <p className="text-gray-600">
                  Body composition analysis, progress tracking, and intelligent recommendations powered by AI.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Powered By</h2>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
              LLama 3.3 70B
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
              Tinker API
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
              Advanced ML Models
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-8 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <Clock className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Development Timeline</h2>
          </div>
          <p className="text-gray-700 text-lg mb-4">
            We're actively building AgentRapid to deliver an exceptional AI fitness experience.
            The full agent with voice commands, meal planning, and workout generation will be available soon.
          </p>
          <p className="text-purple-700 font-semibold">
            In the meantime, try our Body Fat % Checker to get a taste of what's coming!
          </p>
        </div>
      </div>
    </div>
  );
}
