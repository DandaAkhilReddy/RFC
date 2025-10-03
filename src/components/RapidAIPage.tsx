import { Mic, MousePointer, Sparkles, Brain, TrendingUp, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function RapidAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Rapid AI Agent</h1>
                <p className="text-purple-100 text-lg">One Voice Note. Complete Fitness Plan. Instant Results.</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              Powered by Tinker API
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Mic className="w-8 h-8 mb-2" />
              <h3 className="font-bold text-lg mb-1">Voice Input</h3>
              <p className="text-sm text-purple-100">Just speak your goals</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <MousePointer className="w-8 h-8 mb-2" />
              <h3 className="font-bold text-lg mb-1">One-Click Magic</h3>
              <p className="text-sm text-purple-100">Or click to start instantly</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Brain className="w-8 h-8 mb-2" />
              <h3 className="font-bold text-lg mb-1">Detailed Plan</h3>
              <p className="text-sm text-purple-100">Get your complete roadmap</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* How It Works */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
              How Rapid Works
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Voice Note or Click</h3>
                  <p className="text-gray-600 text-sm">
                    Simply record a voice note describing your fitness goals, current state, and preferences. Or just click to start with quick questions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">AI Analysis</h3>
                  <p className="text-gray-600 text-sm">
                    Rapid processes your input using advanced LLama 3.3 70B model through Tinker API, understanding context, goals, and constraints.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Detailed Plan Generated</h3>
                  <p className="text-gray-600 text-sm">
                    Receive a comprehensive fitness plan including workout routines, meal plans, recovery schedules, and progress milestones - all personalized for you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Brain className="w-6 h-6 text-blue-600 mr-2" />
              Powered by Advanced AI
            </h2>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">🚀 Tinker API by Thinking Labs</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Enterprise-grade AI infrastructure providing lightning-fast inference and reliable performance.
                </p>
                <div className="flex items-center space-x-2 text-sm text-purple-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>99.9% uptime reliability</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">🧠 LLama 3.3 70B Model</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Meta's latest and most powerful open-source language model, fine-tuned for fitness and health coaching.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>70 billion parameters for deep understanding</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Context-aware fitness planning</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">📈 Self-Improving AI</h3>
                <p className="text-gray-600 text-sm mb-3">
                  <strong>The more you use ReddyFit, the smarter it gets!</strong> Our AI continuously learns from your interactions and feedback.
                </p>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Personalization improves with every interaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">What You Get with Rapid</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Personalized Workouts</h3>
              <p className="text-gray-600 text-sm">Custom exercise routines based on your fitness level, goals, and available equipment</p>
            </div>

            <div className="border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Nutrition Plans</h3>
              <p className="text-gray-600 text-sm">Detailed meal plans with macros, recipes, and shopping lists tailored to your preferences</p>
            </div>

            <div className="border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Recovery Schedules</h3>
              <p className="text-gray-600 text-sm">Optimized rest days, sleep recommendations, and recovery protocols</p>
            </div>

            <div className="border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Progress Milestones</h3>
              <p className="text-gray-600 text-sm">Clear checkpoints and goals to keep you motivated and on track</p>
            </div>

            <div className="border-2 border-pink-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Adaptive Adjustments</h3>
              <p className="text-gray-600 text-sm">Plans that evolve based on your progress and feedback</p>
            </div>

            <div className="border-2 border-cyan-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">24/7 Availability</h3>
              <p className="text-gray-600 text-sm">Get instant plans anytime, anywhere - Rapid never sleeps</p>
            </div>
          </div>
        </div>

        {/* Unlock Cupid Section */}
        <div className="bg-gradient-to-r from-pink-500 via-red-500 to-purple-500 rounded-2xl p-8 text-white mb-8 shadow-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-4">🔓</div>
            <h2 className="text-3xl font-bold mb-4">Unlock Cupid AI by Using Rapid!</h2>
            <p className="text-lg text-pink-100 mb-6">
              When you use Rapid AI to get your fitness plan, you automatically become eligible for <strong>Cupid AI</strong> - our dating coach and fitness buddy matching agent!
            </p>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-white/30">
                <h3 className="text-xl font-bold mb-3">💕 What is Cupid AI?</h3>
                <ul className="space-y-2 text-sm text-pink-100">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>AI Dating Coach</strong> - Get personalized dating advice and profile optimization tips</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Fitness Buddy Matching</strong> - Find your perfect workout accountability partner</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>One Match Per Day</strong> - Quality over quantity, carefully curated by AI</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-white/30">
                <h3 className="text-xl font-bold mb-3">🤖 How ML Matching Works</h3>
                <ul className="space-y-2 text-sm text-pink-100">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>50+ Compatibility Factors</strong> - Fitness level, goals, schedule, location, values</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Multi-Scenario Analysis</strong> - Fitness alignment, lifestyle sync, personality match</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Self-Learning Algorithm</strong> - Gets smarter with every interaction</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-400/20 border-2 border-yellow-300/50 rounded-xl">
              <p className="text-sm font-semibold">
                ⚡ <strong>Quick Unlock:</strong> Use Rapid AI once → Cupid AI activates automatically → ML Matching begins finding your perfect fitness partner!
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Fitness Journey?</h2>
          <p className="text-purple-100 mb-6 text-lg">
            One voice note or click is all it takes to get started with Rapid AI
          </p>
          <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto">
            <Mic className="w-6 h-6" />
            <span>Start with Rapid Now</span>
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-sm text-purple-200 mt-4">
            ✨ Plus unlock Cupid AI for dating coaching & fitness buddy matching
          </p>
        </div>
      </div>
    </div>
  );
}
