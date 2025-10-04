import { useState } from 'react';
import { Link } from 'react-router-dom';
import { transition } from '@ssgoi/react';
import { fly, mask } from '@ssgoi/react/transitions';
import {
  Bot, Camera, Activity, TrendingUp, Utensils, Dumbbell, Mic, Target,
  Heart, Users, Sparkles, Shield, CheckCircle2, ArrowRight, Star, Zap, Crown
} from 'lucide-react';
import { useAuth } from './components/AuthProvider';
import Logo from './components/Logo';
import DOMPurify from 'isomorphic-dompurify';
import ToastNotification from './components/ToastNotification';
import EmailSignup from './pages/EmailSignup';

export default function LandingPage() {
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  console.log('LandingPage rendered - current user:', user?.email || 'none');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Sanitize inputs to prevent XSS attacks
    const sanitizedName = DOMPurify.sanitize(fullName.trim());
    const sanitizedEmail = DOMPurify.sanitize(email.trim());

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setSubmitMessage('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    // Validate name (2-50 characters, letters and spaces only)
    if (sanitizedName.length < 2 || sanitizedName.length > 50) {
      setSubmitMessage('Name must be between 2 and 50 characters');
      setIsSubmitting(false);
      return;
    }

    setSubmitMessage(`Thanks ${sanitizedName}! Please sign in with Google to get started.`);
    setFullName('');
    setEmail('');
    setIsSubmitting(false);

    setTimeout(() => {
      signInWithGoogle();
    }, 2000);
  };

  // Show EmailSignup page if user selected email signup
  if (showEmailSignup) {
    return <EmailSignup onBack={() => setShowEmailSignup(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <Logo size={56} showText={true} />
        <div className="hidden md:flex space-x-8 text-gray-700">
          <a href="#features" className="hover:text-orange-600 transition">Features</a>
          <Link to="/reliability" className="hover:text-orange-600 transition">Reliability</Link>
        </div>
      </nav>

      {/* BETA/FREE BANNER */}
      <div className="relative z-10 container mx-auto px-6 pt-4">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-4 rounded-2xl text-center shadow-xl">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-6 h-6" />
            <span className="text-lg md:text-xl font-bold">All Features Currently FREE - Beta Version</span>
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="max-w-5xl mx-auto">
          <div
            ref={transition({
              key: 'hero-badge',
              ...fly({ y: -100, opacity: true })
            })}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            <span>AI-Powered Fitness Revolution</span>
          </div>

          <h1
            ref={transition({
              key: 'hero-headline',
              ...fly({ y: -100, opacity: true })
            })}
            className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight"
          >
            Transform Your<br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Fitness Journey
            </span>
          </h1>

          <p
            ref={transition({
              key: 'hero-subheadline',
              ...fly({ y: 100, opacity: true })
            })}
            className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Enterprise-grade AI fitness platform powered by 6 intelligent agents and Temporal.io workflows.
            99.9% uptime, automatic retries, and complete observability for your fitness journey.
          </p>

          {/* Enterprise Trust Badges */}
          <div className="flex items-center justify-center gap-4 mb-12 flex-wrap">
            <div className="inline-flex items-center bg-purple-100 text-purple-700 rounded-full px-4 py-2 text-sm font-semibold">
              <Zap className="w-4 h-4 mr-2" />
              Powered by Temporal.io Cloud
            </div>
            <div className="inline-flex items-center bg-green-100 text-green-700 rounded-full px-4 py-2 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              99.9% Uptime Guarantee
            </div>
            <div className="inline-flex items-center bg-blue-100 text-blue-700 rounded-full px-4 py-2 text-sm font-semibold">
              <Shield className="w-4 h-4 mr-2" />
              Enterprise Security
            </div>
          </div>

          {/* CTA Buttons - All Auth Options */}
          <div className="flex flex-col gap-4 justify-center items-center mb-8 max-w-2xl mx-auto">
            {/* Google Sign Up - Primary */}
            <button
              ref={transition({
                key: 'hero-signup-btn',
                ...fly({ x: -100, opacity: true }),
                ...mask({ shape: 'circle', origin: 'center', scale: 2, fade: true, spring: { stiffness: 400, damping: 35 } })
              })}
              onClick={signInWithGoogle}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign Up with Google</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Auth Options - Row */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* GitHub Login */}
              <button
                onClick={signInWithGithub}
                className="group relative overflow-hidden bg-gray-800 text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </button>

              {/* Email Signup Button */}
              <button
                onClick={() => setShowEmailSignup(true)}
                className="group relative overflow-hidden bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>📧 Email</span>
              </button>

              {/* Google Login - Secondary */}
              <button
                onClick={signInWithGoogle}
                className="group relative overflow-hidden bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:shadow-xl hover:border-orange-400 transition transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Login</span>
              </button>
            </div>
          </div>

          {/* Privacy & AI Stats - Replacing fake user stats */}
          <div
            ref={transition({
              key: 'privacy-stats',
              ...fly({ y: 100, opacity: true })
            })}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                10M+
              </div>
              <div className="text-gray-600 font-semibold">Training Data Points</div>
              <p className="text-sm text-gray-500 mt-2">Our AI analyzed millions of fitness images</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-600 font-semibold">Data Encrypted</div>
              <p className="text-sm text-gray-500 mt-2">End-to-end encryption for all your data</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                Pixel
              </div>
              <div className="text-gray-600 font-semibold">Image Analysis</div>
              <p className="text-sm text-gray-500 mt-2">Only patterns saved, not your actual images</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI AGENTS WORKFLOW SECTION */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              🤖 Meet Your AI Agents
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Three intelligent agents working together to transform your fitness journey
            </p>
          </div>

          {/* 3-Step Process Flow */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1: Rapid AI */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-purple-400/50 hover:border-purple-300 transition-all hover:scale-105">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-2">Step 1</div>
                  <h3 className="text-2xl font-bold mb-4">Rapid AI</h3>
                  <div className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold mb-2">
                    🚧 COMING SOON
                  </div>
                  <div className="inline-block px-3 py-1 bg-green-400 text-green-900 rounded-full text-xs font-bold ml-2 mb-2">
                    ✅ BETA: Body Fat Checker
                  </div>
                </div>
                <ul className="space-y-3 text-purple-100">
                  <li className="flex items-start">
                    <Mic className="w-5 h-5 text-purple-300 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>One Voice Note</strong> - Just speak or type your fitness goals</span>
                  </li>
                  <li className="flex items-start">
                    <Sparkles className="w-5 h-5 text-purple-300 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Instant Plans</strong> - Complete workout & meal plans in seconds</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-purple-300 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Powered by LLama 3.3 70B</strong> - 70 billion parameters for deep understanding</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-purple-400/30">
                  <div className="text-sm text-purple-200">
                    <strong>Try Now:</strong> Body Fat % Checker is live in beta!
                  </div>
                </div>
              </div>

              {/* Step 2: Cupid AI */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-pink-400/50 hover:border-pink-300 transition-all hover:scale-105">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-2">Step 2</div>
                  <h3 className="text-2xl font-bold mb-4">Cupid AI</h3>
                  <div className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold mb-2">
                    🚧 COMING SOON
                  </div>
                  <div className="inline-block px-3 py-1 bg-green-400 text-green-900 rounded-full text-xs font-bold ml-2 mb-2">
                    ✅ BETA: Community Browser
                  </div>
                </div>
                <ul className="space-y-3 text-pink-100">
                  <li className="flex items-start">
                    <Heart className="w-5 h-5 text-pink-300 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Dating Coach</strong> - AI-powered dating advice and profile tips</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-5 h-5 text-pink-300 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Fitness Buddy Matching</strong> - Find your perfect workout accountability partner</span>
                  </li>
                  <li className="flex items-start">
                    <Target className="w-5 h-5 text-pink-300 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Compatibility Analysis</strong> - Match based on goals, level, schedule & values</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-pink-400/30">
                  <div className="text-sm text-pink-200">
                    <strong>Try Now:</strong> Browse our fitness community in beta!
                  </div>
                </div>
              </div>

              {/* Step 3: ML Matching */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-green-400/50 hover:border-green-300 transition-all hover:scale-105">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-2">Step 3</div>
                  <h3 className="text-2xl font-bold mb-4">ML Matching</h3>
                  <div className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold mb-4">
                    🚧 COMING SOON
                  </div>
                </div>
                <ul className="space-y-3 text-green-100">
                  <li className="flex items-start">
                    <Activity className="w-5 h-5 text-green-300 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Multi-Scenario Analysis</strong> - Analyzes 50+ compatibility factors</span>
                  </li>
                  <li className="flex items-start">
                    <TrendingUp className="w-5 h-5 text-green-300 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Self-Learning AI</strong> - Gets smarter with every interaction</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="w-5 h-5 text-green-300 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Perfect Matches</strong> - One quality match per day, carefully curated</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-green-400/30">
                  <div className="text-sm text-green-200">
                    <strong>Result:</strong> Find your ideal fitness accountability partner
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Behind It */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-400/50">
              <h3 className="text-3xl font-bold mb-8 text-center">🧠 Advanced ML Technology</h3>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Tinker API */}
                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Zap className="w-8 h-8 text-yellow-400 mr-3" />
                    <h4 className="text-xl font-bold">Tinker API by Thinking Labs</h4>
                  </div>
                  <p className="text-purple-200 mb-4">
                    Enterprise-grade AI infrastructure providing lightning-fast inference with 99.9% uptime guarantee.
                  </p>
                  <ul className="space-y-2 text-sm text-purple-100">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Sub-second response times</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Global CDN for low latency</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Auto-scaling infrastructure</span>
                    </li>
                  </ul>
                </div>

                {/* LLama 3.3 70B */}
                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Bot className="w-8 h-8 text-blue-400 mr-3" />
                    <h4 className="text-xl font-bold">Meta LLama 3.3 70B</h4>
                  </div>
                  <p className="text-purple-200 mb-4">
                    Meta's latest open-source language model with 70 billion parameters, fine-tuned for fitness and health coaching.
                  </p>
                  <ul className="space-y-2 text-sm text-purple-100">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>70B parameters for deep context understanding</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Specialized fitness & nutrition training</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Personalized recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Matching Scenarios */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl">
                <h4 className="text-xl font-bold mb-4 flex items-center">
                  <Crown className="w-6 h-6 text-yellow-400 mr-2" />
                  Multi-Scenario Matching Algorithm
                </h4>
                <p className="text-purple-100 mb-4">
                  Our ML algorithm analyzes 50+ compatibility factors across multiple scenarios:
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="font-bold mb-2">🎯 Fitness Alignment</div>
                    <ul className="space-y-1 text-xs text-purple-100">
                      <li>• Current fitness level</li>
                      <li>• Workout preferences</li>
                      <li>• Training frequency</li>
                      <li>• Goal compatibility</li>
                    </ul>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="font-bold mb-2">📅 Lifestyle Sync</div>
                    <ul className="space-y-1 text-xs text-purple-100">
                      <li>• Schedule compatibility</li>
                      <li>• Geographic proximity</li>
                      <li>• Availability patterns</li>
                      <li>• Time zone matching</li>
                    </ul>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="font-bold mb-2">💡 Values Match</div>
                    <ul className="space-y-1 text-xs text-purple-100">
                      <li>• Motivation style</li>
                      <li>• Communication preferences</li>
                      <li>• Accountability needs</li>
                      <li>• Personality compatibility</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-400/30">
                  <p className="text-sm text-purple-200 text-center">
                    <strong>🚀 The more you use ReddyFit, the smarter the AI becomes!</strong> Our self-learning algorithms continuously improve match quality based on your interactions and feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY & SECURITY SECTION */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🔒 Your Privacy, Our Priority
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI with enterprise-grade security. Your data is safe with us.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* AI Technology */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="flex items-center mb-4">
                <Bot className="w-12 h-12 text-purple-600 mr-4" />
                <h3 className="text-2xl font-bold">Advanced AI Analysis</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>10M+ Training Data</strong> - Our models are trained on over 10 million fitness images and expert annotations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Pixel-Level Analysis</strong> - Images converted to mathematical patterns, not stored as photos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Intent Recognition</strong> - Only workout form, food nutrition data extracted - never personal identifiers</span>
                </li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="flex items-center mb-4">
                <Shield className="w-12 h-12 text-blue-600 mr-4" />
                <h3 className="text-2xl font-bold">Bank-Level Security</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>End-to-End Encryption</strong> - All data encrypted in transit and at rest with AES-256</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Zero Knowledge</strong> - Your images displayed in-app, but AI only sees mathematical representations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>GDPR Compliant</strong> - Full data deletion on request. You own your data, always.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-8 rounded-2xl">
              <h4 className="text-2xl font-bold mb-6 text-center">How Image Analysis Works</h4>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                  <h5 className="font-bold mb-2">1. Upload</h5>
                  <p className="text-sm text-gray-600">Upload meal or workout photo</p>
                </div>
                <div className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h5 className="font-bold mb-2">2. Convert</h5>
                  <p className="text-sm text-gray-600">Image → pixel matrix → features</p>
                </div>
                <div className="text-center">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                  <h5 className="font-bold mb-2">3. Analyze</h5>
                  <p className="text-sm text-gray-600">AI extracts nutrition/form data</p>
                </div>
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-green-600" />
                  <h5 className="font-bold mb-2">4. Secure</h5>
                  <p className="text-sm text-gray-600">Only intent saved, image shown to you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* AI FEATURES SHOWCASE */}
      <section id="features" className="relative z-10 py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              ref={transition({
                key: 'features-title',
                ...fly({ y: -50, opacity: true })
              })}
              className="text-5xl font-bold mb-6"
            >
              6 Core <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">AI Agents</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your personal AI team working 24/7 to transform your fitness journey with enterprise-grade reliability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Agent Rapid */}
            <div
              ref={transition({
                key: 'agent-rapid',
                ...fly({ x: -100, opacity: true })
              })}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition transform border-2 border-orange-200"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="mb-3">
                <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Body Composition & Nutrition
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Agent Rapid</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AI-powered body fat analysis and nutrition coach. Upload daily progress photos for instant body composition tracking with Temporal.io workflows ensuring 99.9% reliability and automatic retries.
              </p>
              <button className="text-orange-600 font-semibold flex items-center space-x-2 hover:space-x-3 transition-all">
                <span>Try Rapid</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Agent Cupid */}
            <div
              ref={transition({
                key: 'agent-cupid',
                ...fly({ y: -100, opacity: true })
              })}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition transform border-2 border-pink-200"
            >
              <div className="bg-gradient-to-r from-pink-500 to-red-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="mb-3">
                <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Fitness Dating & Accountability
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Agent Cupid</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Find love with fitness-minded singles. One quality match per day based on AI compatibility scoring, shared values, and fitness goals. Built on Temporal workflows for reliable matching.
              </p>
              <button className="text-orange-600 font-semibold flex items-center space-x-2 hover:space-x-3 transition-all">
                <span>Meet Cupid</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Agent Temporal */}
            <div
              ref={transition({
                key: 'agent-temporal',
                ...fly({ x: 100, opacity: true })
              })}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition transform border-2 border-purple-200"
            >
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="mb-3">
                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Powered by Temporal.io Cloud
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Agent Temporal</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Enterprise-grade workflow orchestration powering all ReddyFit AI agents. Ensures 99.9% uptime, automatic retries, daily streak calculations, and observable workflows for every feature.
              </p>
              <Link to="/reliability" className="text-orange-600 font-semibold flex items-center space-x-2 hover:space-x-3 transition-all">
                <span>View Reliability</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Agent Trainer */}
            <div
              ref={transition({
                key: 'agent-trainer',
                ...fly({ x: -100, opacity: true })
              })}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition transform border-2 border-red-200"
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <div className="mb-3">
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Workout Planning & Coaching
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Agent Trainer</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AI-powered workout generation and form coaching. Custom routines for your fitness level and equipment with progressive overload. Real-time voice feedback during exercises.
              </p>
              <button className="text-orange-600 font-semibold flex items-center space-x-2 hover:space-x-3 transition-all">
                <span>Train Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Agent Chef */}
            <div
              ref={transition({
                key: 'agent-chef',
                ...fly({ y: 100, opacity: true })
              })}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition transform border-2 border-yellow-200"
            >
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <div className="mb-3">
                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Meal Planning & Macros
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Agent Chef</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Personalized meal plans with automated macro tracking. Temporal workflows recalculate your nutrition every Sunday based on latest weight and activity. AI adjusts recipes based on progress.
              </p>
              <button className="text-orange-600 font-semibold flex items-center space-x-2 hover:space-x-3 transition-all">
                <span>Plan Meals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Agent Voice */}
            <div
              ref={transition({
                key: 'agent-voice',
                ...fly({ x: 100, opacity: true })
              })}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition transform border-2 border-indigo-200"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <div className="mb-3">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Hands-Free Coaching
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Agent Voice</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Hands-free AI coaching with voice commands and real-time feedback. Get form corrections, rep counting, and motivational support during workouts without touching your phone.
              </p>
              <button className="text-orange-600 font-semibold flex items-center space-x-2 hover:space-x-3 transition-all">
                <span>Try Voice</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* WORKOUT BUDDIES SECTION */}
      <section id="buddies" className="relative z-10 py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2
                ref={transition({
                  key: 'buddies-title',
                  ...fly({ x: -100, opacity: true })
                })}
                className="text-5xl font-bold mb-6"
              >
                Find Your Perfect <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Workout Partner</span>
              </h2>
              <p
                ref={transition({
                  key: 'buddies-desc',
                  ...fly({ x: 100, opacity: true })
                })}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Connect with fitness enthusiasts across the USA based on your location, fitness level,
                goals, and workout preferences. Train together, stay motivated, achieve more.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div
                ref={transition({
                  key: 'buddy-card-1',
                  ...fly({ y: -100, opacity: true })
                })}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Location-Based Matching</h3>
                </div>
                <p className="text-gray-600">
                  Find workout buddies in your area. Train at the same gym, go for runs together,
                  or share healthy meal spots nearby.
                </p>
              </div>

              <div
                ref={transition({
                  key: 'buddy-card-2',
                  ...fly({ y: -100, opacity: true })
                })}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Smart Compatibility</h3>
                </div>
                <p className="text-gray-600">
                  AI analyzes fitness levels, workout styles, schedules, and personalities
                  to create perfect partnerships for long-term success.
                </p>
              </div>

              <div
                ref={transition({
                  key: 'buddy-card-3',
                  ...fly({ y: 100, opacity: true })
                })}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Accountability System</h3>
                </div>
                <p className="text-gray-600">
                  Check in daily with your buddy, share progress, celebrate wins, and push
                  each other through challenges. Success is better together.
                </p>
              </div>

              <div
                ref={transition({
                  key: 'buddy-card-4',
                  ...fly({ y: 100, opacity: true })
                })}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Build Real Friendships</h3>
                </div>
                <p className="text-gray-600">
                  Many members form lasting friendships through shared fitness journeys.
                  Train together, grow together, succeed together.
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                ref={transition({
                  key: 'buddies-cta',
                  ...fly({ y: 100, opacity: true })
                })}
                onClick={signInWithGoogle}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition transform hover:scale-105 inline-flex items-center space-x-3"
              >
                <span>Find Your Workout Buddy</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CUPID DATING SECTION */}
      <section id="dating" className="relative z-10 py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2
                ref={transition({
                  key: 'dating-title',
                  ...fly({ x: 100, opacity: true })
                })}
                className="text-5xl font-bold mb-6"
              >
                <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">Love & Fitness</span> Combined
              </h2>
              <p
                ref={transition({
                  key: 'dating-desc',
                  ...fly({ x: -100, opacity: true })
                })}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Meet your perfect match through Cupid AI Dating. One carefully selected match per day
                based on deep compatibility analysis, shared values, and fitness lifestyle alignment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div
                ref={transition({
                  key: 'dating-feature-1',
                  ...fly({ x: -100, opacity: true })
                })}
                className="bg-gradient-to-br from-pink-50 to-red-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                <div className="bg-gradient-to-r from-pink-500 to-red-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">One Match Per Day</h3>
                <p className="text-gray-600 leading-relaxed">
                  Quality over quantity. Every midnight, receive one thoughtfully selected match.
                  Take time to connect meaningfully without endless swiping.
                </p>
              </div>

              <div
                ref={transition({
                  key: 'dating-feature-2',
                  ...fly({ y: -100, opacity: true })
                })}
                className="bg-gradient-to-br from-pink-50 to-red-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                <div className="bg-gradient-to-r from-pink-500 to-red-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">AI Compatibility Scoring</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced algorithms analyze values, interests, lifestyle, fitness goals,
                  and communication styles for genuine compatibility.
                </p>
              </div>

              <div
                ref={transition({
                  key: 'dating-feature-3',
                  ...fly({ x: 100, opacity: true })
                })}
                className="bg-gradient-to-br from-pink-50 to-red-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                <div className="bg-gradient-to-r from-pink-500 to-red-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Fitness-First Matching</h3>
                <p className="text-gray-600 leading-relaxed">
                  Meet someone who shares your passion for health and fitness. Build a
                  relationship based on shared goals and active lifestyles.
                </p>
              </div>
            </div>

            <div
              ref={transition({
                key: 'dating-explanation',
                ...fly({ y: 100, opacity: true })
              })}
              className="bg-gradient-to-r from-pink-100 to-red-100 p-10 rounded-2xl border-2 border-pink-200 mb-12"
            >
              <div className="flex items-start space-x-6">
                <div className="bg-pink-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">How Compatibility Scoring Works</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Our AI analyzes multiple dimensions of compatibility:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0" />
                      <span><strong>Values Alignment:</strong> Core beliefs, life priorities, and relationship goals</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0" />
                      <span><strong>Fitness Compatibility:</strong> Workout styles, activity levels, health goals</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0" />
                      <span><strong>Lifestyle Match:</strong> Daily routines, dietary preferences, social habits</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0" />
                      <span><strong>Personality Fit:</strong> Communication styles, energy levels, interests</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0" />
                      <span><strong>Long-term Potential:</strong> Relationship readiness and future vision alignment</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                ref={transition({
                  key: 'dating-cta',
                  ...fly({ y: 100, opacity: true })
                })}
                onClick={signInWithGoogle}
                className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition transform hover:scale-105 inline-flex items-center space-x-3"
              >
                <Heart className="w-6 h-6" />
                <span>Start Finding Love</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="relative z-10 py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              ref={transition({
                key: 'testimonials-title',
                ...fly({ y: -50, opacity: true })
              })}
              className="text-5xl font-bold mb-6"
            >
              Success <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Stories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real transformations from real people who achieved their fitness goals with ReddyFit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div
              ref={transition({
                key: 'testimonial-1',
                ...fly({ x: -100, opacity: true })
              })}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "Lost 45 pounds in 6 months! The AI chatbot kept me accountable every single day.
                My workout buddy made it fun instead of a chore."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div>
                  <div className="font-bold">Sarah M.</div>
                  <div className="text-sm text-gray-500">Los Angeles, CA</div>
                </div>
              </div>
            </div>

            <div
              ref={transition({
                key: 'testimonial-2',
                ...fly({ y: 100, opacity: true })
              })}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "Met my girlfriend through Cupid AI Dating! We train together now and push each
                other to be better. Best decision I ever made."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <div className="font-bold">James D.</div>
                  <div className="text-sm text-gray-500">New York, NY</div>
                </div>
              </div>
            </div>

            <div
              ref={transition({
                key: 'testimonial-3',
                ...fly({ x: 100, opacity: true })
              })}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "The AI meal planner is incredible. Custom recipes for my vegan diet, perfect macros,
                and I've gained 15 pounds of muscle. Game changer!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">
                  MT
                </div>
                <div>
                  <div className="font-bold">Maria T.</div>
                  <div className="text-sm text-gray-500">Austin, TX</div>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={transition({
              key: 'transformation-placeholder',
              ...fly({ y: 100, opacity: true })
            })}
            className="mt-16 bg-white p-12 rounded-2xl shadow-lg max-w-4xl mx-auto text-center"
          >
            <h3 className="text-3xl font-bold mb-6">Amazing Transformations</h3>
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-16">
              <Camera className="w-24 h-24 text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Before & After transformation photos coming soon!<br />
                See real results from our community members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DAILY STREAK REQUIREMENTS */}
      <section className="relative z-10 py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              ref={transition({
                key: 'streak-title',
                ...fly({ y: -50, opacity: true })
              })}
              className="text-5xl font-bold mb-6"
            >
              Build Your <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Daily Streak</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Consistency is key. Complete these daily requirements to maintain your streak and unlock rewards.
            </p>
            <div className="inline-flex items-center bg-purple-100 text-purple-700 rounded-full px-4 py-2 text-sm font-semibold">
              <Zap className="w-4 h-4 mr-2" />
              Powered by Temporal.io for 99.9% reliable streak tracking
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-12 border-2 border-orange-200">
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {/* Requirement 1 - Daily Progress Photo */}
                <div
                  ref={transition({
                    key: 'req-photo',
                    ...fly({ x: -100, opacity: true })
                  })}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Daily Progress Photo</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Upload 1 progress photo every day. Agent Rapid tracks your body composition changes with AI analysis.
                  </p>
                  <div className="flex items-center text-xs text-orange-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    MANDATORY
                  </div>
                </div>

                {/* Requirement 2 - Daily Meal Photo */}
                <div
                  ref={transition({
                    key: 'req-meal',
                    ...fly({ y: 100, opacity: true })
                  })}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                    <Utensils className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Meal Photo + Log</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Log at least 1 meal with photo daily. Agent Chef analyzes your nutrition and adjusts your macro targets.
                  </p>
                  <div className="flex items-center text-xs text-orange-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    MANDATORY
                  </div>
                </div>

                {/* Requirement 3 - Weekly Weight Check */}
                <div
                  ref={transition({
                    key: 'req-weight',
                    ...fly({ x: 100, opacity: true })
                  })}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Weekly Weight Check</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Log your weight once per week. Temporal workflows automatically recalculate your macros every Sunday.
                  </p>
                  <div className="flex items-center text-xs text-orange-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    MANDATORY
                  </div>
                </div>
              </div>

              {/* Reward System - Coming Soon */}
              <div className="bg-white rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-6">🎁 Reward System</h3>
                <div className="inline-flex items-center bg-orange-100 text-orange-700 rounded-full px-6 py-3 text-sm font-semibold">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Coming Soon!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 py-24 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2
              ref={transition({
                key: 'final-cta-title',
                ...fly({ y: -100, opacity: true })
              })}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Start Your Transformation Today
            </h2>
            <p
              ref={transition({
                key: 'final-cta-desc',
                ...fly({ y: 100, opacity: true })
              })}
              className="text-2xl mb-12 opacity-90"
            >
              Join thousands of fitness enthusiasts achieving their goals with AI-powered coaching,
              personalized plans, and supportive community.
            </p>
            <button
              ref={transition({
                key: 'final-cta-button',
                ...fly({ y: 100, opacity: true })
              })}
              onClick={signInWithGoogle}
              className="bg-white text-orange-600 px-16 py-6 rounded-full font-bold text-2xl hover:shadow-2xl transition transform hover:scale-105 inline-flex items-center space-x-4"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Join ReddyFit Free</span>
              <Zap className="w-8 h-8" />
            </button>
            <p className="mt-6 text-lg opacity-80">No credit card required. Start in 30 seconds.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo size={48} showText={true} className="mb-6" />
              <p className="text-gray-400 leading-relaxed">
                AI-powered fitness transformation platform helping you achieve your goals
                with intelligent coaching and community support.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Features</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">AI Chatbot</a></li>
                <li><a href="#features" className="hover:text-white transition">Photo Analysis</a></li>
                <li><a href="#features" className="hover:text-white transition">Workout Generator</a></li>
                <li><a href="#features" className="hover:text-white transition">Meal Planner</a></li>
                <li><a href="#buddies" className="hover:text-white transition">Workout Buddies</a></li>
                <li><a href="#dating" className="hover:text-white transition">Cupid Dating</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Connect With Us</h4>
              <div className="flex space-x-4 mb-6">
                <a href="#" className="text-gray-400 hover:text-white transition transform hover:scale-110">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-xl">📱</span>
                  </div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition transform hover:scale-110">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-xl">🐦</span>
                  </div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition transform hover:scale-110">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-xl">📘</span>
                  </div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition transform hover:scale-110">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-xl">💼</span>
                  </div>
                </a>
              </div>
              <div className="text-gray-400">
                <p className="mb-2">Email us:</p>
                <a href="mailto:hello@reddytalk.club" className="text-orange-400 hover:text-orange-300 transition">
                  hello@reddytalk.club
                </a>
              </div>
              <button
                onClick={() => window.location.href = 'mailto:hello@reddytalk.club?subject=ReddyFit Inquiry&body=Hi ReddyFit Team,%0D%0A%0D%0AI would like to know more about...'}
                className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition transform hover:scale-105 flex items-center space-x-2"
              >
                <span>📧</span>
                <span>Contact Us</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              Copyright 2025 ReddyFit. All rights reserved. Built with passion for fitness and innovation.
            </p>
          </div>
        </div>
      </footer>

      {/* Animation Styles */}
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
