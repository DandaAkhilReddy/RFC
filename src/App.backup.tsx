import { useState } from 'react';
import { Heart, Users, Target, Sparkles, TrendingUp, Shield, Calendar, Instagram, Twitter, Facebook, Linkedin, Mail, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from './components/AuthProvider';
import Logo from './components/Logo';

export default function LandingPage() {
  const { signInWithGoogle, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const waitlistCount = 127; // Static count for now

  console.log('LandingPage rendered - current user:', user?.email || 'none');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Simply redirect to Google sign-in instead of waitlist
    setSubmitMessage(`Thanks ${fullName}! Please sign in with Google to get started.`);
    setFullName('');
    setEmail('');
    setIsSubmitting(false);

    // Auto redirect to sign in after 2 seconds
    setTimeout(() => {
      signInWithGoogle();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <Logo size={56} showText={true} />
        <div className="hidden md:flex space-x-8 text-gray-700">
          <a href="#features" className="hover:text-orange-600 transition">Features</a>
          <a href="#matching" className="hover:text-orange-600 transition">Matching</a>
          <a href="#how-it-works" className="hover:text-orange-600 transition">How It Works</a>
          <a href="#waitlist" className="hover:text-orange-600 transition">Join Waitlist</a>
        </div>
      </nav>

      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Coming Soon - Join the Revolution</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Your <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">AI-Powered</span><br />
            Fitness Transformation
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your body with AI-generated workout plans, personalized meal plans, and daily accountability partners.
            Get matched with someone who complements your fitness journey. Stay motivated, achieve goals together.
          </p>

          <div className="flex flex-col gap-4 justify-center items-center mb-8">
            <button
              onClick={signInWithGoogle}
              className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>🚀 Get Started - Sign Up Free</span>
            </button>

            <button
              onClick={signInWithGoogle}
              className="group bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:border-orange-400 transition transform hover:scale-105 flex items-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>✨ Already a Member? Login</span>
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-12">🔐 Secure sign-in • Instant access to all AI features</p>

          <div className="flex items-center justify-center space-x-3 text-gray-600">
            <Users className="w-5 h-5" />
            <span className="text-lg"><span className="font-bold text-orange-600">{waitlistCount}</span> people already joined the movement</span>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What is <span className="text-orange-600">ReddyFit Club</span>?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your complete fitness transformation platform powered by AI. Track progress, get personalized plans, and stay accountable with daily partners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-3xl hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-purple-200">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">🤖 AI Chatbot with Memory</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your 24/7 AI fitness coach that remembers everything! Log meals, workouts, and daily activities by voice or text. Edit meals directly in chat. AI tracks your progress and provides personalized guidance.
              </p>
              <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Main Dashboard Feature</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-blue-200">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">📸 AI Photo Analysis</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Upload progress photos and get instant AI analysis! Track body fat %, muscle mass, posture, and facial changes. Side-by-side comparisons show your transformation journey visually.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                <span>Coming Soon</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-3xl hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-orange-200">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">🎯 Smart Accountability Matching</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                AI matches you daily with accountability partners based on goals, fitness level, and lifestyle. Share progress, motivate each other, and achieve goals together!
              </p>
              <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                <span>Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="matching" className="relative z-10 py-20 bg-gradient-to-br from-orange-100 via-red-50 to-pink-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Smart <span className="text-red-600">Accountability Matching</span></h2>
            <p className="text-xl text-gray-700">
              AI matches you with a daily accountability partner based on fitness level, goals, and lifestyle. Having the right partner makes transformation easier.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center mb-16">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Set Your Fitness Goals</h4>
                  <p className="text-gray-600">Tell us your target weight, timeline, diet preferences, and workout style.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">AI Creates Your Plan</h4>
                  <p className="text-gray-600">Get personalized workout routines, meal plans with macros, and daily schedules optimized for your goals.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Get Your Daily Partner</h4>
                  <p className="text-gray-600">Every midnight, get matched with an accountability partner who complements your journey. Someone at a similar stage with compatible goals.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Support Each Other</h4>
                  <p className="text-gray-600">Share progress, exchange tips, motivate through tough days, and celebrate wins together for 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">5</div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Build Real Connections</h4>
                  <p className="text-gray-600">Many members form lasting friendships (and more!) through their shared fitness journeys. Accountability builds bonds.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-32 h-32 text-white" />
              </div>
              <div className="space-y-3">
                <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-600">
                  <p className="font-semibold text-orange-900">Year One: Limited Launch</p>
                  <p className="text-sm text-gray-600">Only 2 people matched daily - creating quality accountability partnerships</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-600">
                  <p className="font-semibold text-red-900">Balanced Matching</p>
                  <p className="text-sm text-gray-600">Men paired with women, women with men - diverse perspectives and complementary support styles create better results.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How The <span className="text-orange-600">Algorithm</span> Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced AI matching based on 5 key compatibility factors
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
              <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold mb-2">Sentiment Analysis</h4>
              <p className="text-sm text-gray-600">Analyzes your written goals and motivations</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold mb-2">Activity Patterns</h4>
              <p className="text-sm text-gray-600">Morning vs evening, workout style preferences</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
              <div className="bg-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold mb-2">Dietary Match</h4>
              <p className="text-sm text-gray-600">Vegetarian, keto, preferences alignment</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold mb-2">Goal Alignment</h4>
              <p className="text-sm text-gray-600">Weight loss, muscle gain, complementary goals</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold mb-2">Interest Matching</h4>
              <p className="text-sm text-gray-600">Hobbies and conversation topics beyond fitness</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-12 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
            <div className="flex items-start space-x-4">
              <Shield className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-2">Your Privacy is Sacred</h4>
                <p className="text-gray-700">Your personal requirements are encrypted and visible only to you. We analyze patterns, not content. Advanced sentiment analysis respects your privacy while finding perfect matches.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="relative z-10 py-20 bg-gradient-to-br from-orange-100 via-red-50 to-pink-100">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <h2 className="text-4xl font-bold text-center mb-4">Join the <span className="text-orange-600">Waitlist</span></h2>
              <p className="text-center text-gray-600 mb-8">Be among the first to experience AI-powered fitness transformation with smart accountability matching.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-4 px-6 rounded-xl font-semibold transition-all transform ${
                        gender === 'male'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      👨 Man
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-4 px-6 rounded-xl font-semibold transition-all transform ${
                        gender === 'female'
                          ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-xl scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      👩 Woman
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">For optimal accountability dynamics, men are paired with women and women with men</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Joining...' : 'Join the Revolution'}
                </button>

                {submitMessage && (
                  <div className={`p-4 rounded-xl ${submitMessage.includes('Success') ? 'bg-green-50 text-green-800 border-2 border-green-200' : 'bg-orange-50 text-orange-800 border-2 border-orange-200'}`}>
                    {submitMessage}
                  </div>
                )}
              </form>

              <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
                <p>🔥 We'll notify you when we launch. Your transformation journey starts soon!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size={40} showText={true} className="mb-4" />
              <p className="text-gray-400 text-sm">AI-powered fitness transformation with smart accountability matching.</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#matching" className="hover:text-white transition">Matchmaking</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#waitlist" className="hover:text-white transition">Join Waitlist</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition"><Instagram className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><Twitter className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><Facebook className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><Linkedin className="w-6 h-6" /></a>
              </div>
              <div className="mt-4">
                <a href="mailto:hello@reddyfit.club" className="flex items-center space-x-2 text-gray-400 hover:text-white transition text-sm">
                  <Mail className="w-4 h-4" />
                  <span>hello@reddyfit.club</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 ReddyFit Club. All rights reserved. Built with passion for fitness and technology.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
