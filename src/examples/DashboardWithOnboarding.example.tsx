/**
 * EXAMPLE: Dashboard with Onboarding Integration
 *
 * This is a complete example showing how to integrate OnboardingWelcome
 * into your existing dashboard component.
 *
 * DO NOT USE THIS FILE DIRECTLY - Copy the pattern into your real dashboard file.
 */

import { useState, useEffect } from 'react';
import { transition } from '@ssgoi/react';
import { fly } from '@ssgoi/react/transitions';
import OnboardingWelcome, { hasSeenOnboarding, showOnboarding } from '../components/OnboardingWelcome';
import { Home, Settings, User } from 'lucide-react';

export default function DashboardWithOnboardingExample() {
  // ============================================
  // STEP 1: Add state for onboarding visibility
  // ============================================
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // ============================================
  // STEP 2: Check if user needs to see onboarding
  // ============================================
  useEffect(() => {
    // Only show if user hasn't seen it before
    if (!hasSeenOnboarding()) {
      setShowOnboardingModal(true);
    }
  }, []);

  // ============================================
  // STEP 3: Handle onboarding completion
  // ============================================
  const handleOnboardingComplete = () => {
    setShowOnboardingModal(false);
    console.log('✅ User completed onboarding!');

    // Optional: Add your custom logic here
    // - Track analytics: analytics.track('onboarding_complete')
    // - Update user profile
    // - Navigate to a specific page
    // - Show a welcome notification
  };

  // ============================================
  // STEP 4: Render the component
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ====================================== */}
      {/* ONBOARDING MODAL (Add this first)     */}
      {/* ====================================== */}
      {showOnboardingModal && (
        <OnboardingWelcome onComplete={handleOnboardingComplete} />
      )}

      {/* ====================================== */}
      {/* YOUR EXISTING DASHBOARD CODE BELOW    */}
      {/* ====================================== */}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              ReddyFit Dashboard
            </h1>

            {/* Optional: Button to replay onboarding */}
            <button
              onClick={showOnboarding}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
            >
              View Welcome Tour Again
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          ref={transition({
            key: 'dashboard-content',
            ...fly({ y: 50, opacity: true })
          })}
        >
          {/* Welcome Message */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back! 👋
            </h2>
            <p className="text-gray-600">
              Ready to crush your fitness goals today?
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Workouts</p>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Streak</p>
                  <p className="text-3xl font-bold text-gray-900">7 Days</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Connections</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Rest of your dashboard content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Your Fitness Journey
            </h3>
            <p className="text-gray-600">
              This is where your existing dashboard content goes...
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2025 ReddyFit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * ============================================
 * TESTING COMMANDS (Use in Browser Console)
 * ============================================
 *
 * 1. Reset onboarding to see it again:
 *    localStorage.removeItem('hasSeenOnboarding');
 *    window.location.reload();
 *
 * 2. Check if user has seen onboarding:
 *    console.log(localStorage.getItem('hasSeenOnboarding'));
 *
 * 3. Manually clear all localStorage:
 *    localStorage.clear();
 *    window.location.reload();
 *
 * ============================================
 * INTEGRATION CHECKLIST
 * ============================================
 *
 * [ ] Import OnboardingWelcome component
 * [ ] Import utility functions (hasSeenOnboarding, showOnboarding)
 * [ ] Add showOnboardingModal state
 * [ ] Add useEffect to check on mount
 * [ ] Add OnboardingWelcome component to JSX
 * [ ] Add onComplete callback
 * [ ] Test: Clear localStorage and reload
 * [ ] Test: Close button works
 * [ ] Test: Click outside works
 * [ ] Test: Auto-close after 10 seconds
 * [ ] Test: Mobile responsive design
 * [ ] (Optional) Add "View Tour" button
 * [ ] (Optional) Track analytics on complete
 *
 * ============================================
 * QUICK START - COPY THIS TO YOUR DASHBOARD
 * ============================================
 *
 * import OnboardingWelcome, { hasSeenOnboarding } from './OnboardingWelcome';
 *
 * const [showOnboardingModal, setShowOnboardingModal] = useState(false);
 *
 * useEffect(() => {
 *   if (!hasSeenOnboarding()) {
 *     setShowOnboardingModal(true);
 *   }
 * }, []);
 *
 * return (
 *   <div>
 *     {showOnboardingModal && (
 *       <OnboardingWelcome onComplete={() => setShowOnboardingModal(false)} />
 *     )}
 *     // Your existing dashboard code
 *   </div>
 * );
 *
 * ============================================
 */
