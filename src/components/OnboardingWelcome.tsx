import { useState, useEffect } from 'react';
import { Heart, Bot, TrendingUp, Users, X, Sparkles } from 'lucide-react';
import { transition } from '@ssgoi/react';
import { fly, mask } from '@ssgoi/react/transitions';

interface OnboardingWelcomeProps {
  onComplete?: () => void;
}

export default function OnboardingWelcome({ onComplete }: OnboardingWelcomeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has already seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

    if (hasSeenOnboarding === 'true') {
      return; // Don't show if already seen
    }

    // Show onboarding after a brief delay for smooth entrance
    setTimeout(() => {
      setIsVisible(true);
    }, 300);

    // Auto-close after 10 seconds of inactivity
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(autoCloseTimer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);

    // Mark as seen in localStorage
    localStorage.setItem('hasSeenOnboarding', 'true');

    // Call completion callback after animation
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 500);
  };

  const features = [
    {
      icon: Heart,
      title: 'Cupid AI',
      description: 'AI-powered fitness match finding. Meet your perfect workout partner or soulmate based on compatibility.',
      gradient: 'from-pink-500 to-red-500',
      delay: 0.2
    },
    {
      icon: Bot,
      title: 'FitBot Assistant',
      description: 'Voice-activated workout helper. Get real-time form corrections and personalized coaching.',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.4
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'AI progress tracking and insights. Visualize your journey with predictive analytics.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.6
    },
    {
      icon: Users,
      title: 'Dating Events',
      description: 'AI-curated fitness meetups. Connect at exclusive events designed for meaningful connections.',
      gradient: 'from-orange-500 to-red-500',
      delay: 0.8
    }
  ];

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      {/* Blurred Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Main Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={handleClose}
          ref={transition({
            key: 'close-button',
            ...mask({ shape: 'circle', origin: 'center', scale: 2, fade: true })
          })}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Close onboarding"
        >
          <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
        </button>

        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-12 rounded-t-3xl overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-blob" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-blob animation-delay-2000" />
          </div>

          <div
            ref={transition({
              key: 'welcome-header',
              ...fly({ y: -50, opacity: true })
            })}
            className="relative text-center text-white"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
              Welcome to <br />
              <span className="text-white/90">ReddyFit Club!</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Your AI-powered journey to fitness, connections, and transformation starts now
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="p-8 md:p-12">
          <h2
            ref={transition({
              key: 'features-title',
              ...fly({ x: -50, opacity: true })
            })}
            className="text-3xl font-bold text-gray-900 mb-8 text-center"
          >
            Discover Your <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Superpowers</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  ref={transition({
                    key: `feature-${index}`,
                    ...fly({ y: 50, opacity: true })
                  })}
                  className="group relative bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    animationDelay: `${feature.delay}s`
                  }}
                >
                  {/* Gradient Border on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 rounded-2xl -z-10 blur-sm transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Arrow */}
                  <div className="mt-4 flex items-center text-orange-600 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all">
                    <span className="text-sm font-semibold">Explore Now</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="mt-10 text-center">
            <button
              ref={transition({
                key: 'get-started-button',
                ...mask({ shape: 'circle', origin: 'center', scale: 2.5, fade: true })
              })}
              onClick={handleClose}
              className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all transform hover:scale-110 inline-flex items-center space-x-3"
            >
              <span>Let's Get Started!</span>
              <Sparkles className="w-6 h-6 animate-pulse" />

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Click anywhere outside to continue to dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-blob {
          animation: blob 8s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        /* Custom scrollbar for modal */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f97316, #ef4444);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ea580c, #dc2626);
        }
      `}</style>
    </div>
  );
}

// Utility function to manually reset onboarding (for testing)
export function resetOnboarding() {
  localStorage.removeItem('hasSeenOnboarding');
  console.log('✅ Onboarding reset! Reload the page to see it again.');
}

// Utility function to check if user has seen onboarding
export function hasSeenOnboarding(): boolean {
  return localStorage.getItem('hasSeenOnboarding') === 'true';
}

// Utility function to manually trigger onboarding
export function showOnboarding() {
  localStorage.removeItem('hasSeenOnboarding');
  window.location.reload();
}
