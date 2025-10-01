import { useEffect, useState } from 'react';
import { useAuth } from './components/AuthProvider';
import { api } from './lib/api';
import LandingPage from './App';
import UserFeedbackForm from './components/UserFeedbackForm';
import OnboardingQuestionnaire from './components/OnboardingQuestionnaire';
import MainDashboard from './components/MainDashboard';
import AdminDashboard from './components/AdminDashboard';

// Admin email list - add authorized admin emails here
const ADMIN_EMAILS = ['akhilreddyd3@gmail.com'];

export default function AppRouter() {
  const { user, loading, signOut } = useAuth();
  const [feedbackComplete, setFeedbackComplete] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  console.log('AppRouter state:', {
    hasUser: !!user,
    userEmail: user?.email,
    loading,
    checkingOnboarding,
    onboardingComplete,
    showAdmin
  });

  useEffect(() => {
    // Handle sign out URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signout') === 'true') {
      console.log('Sign out parameter detected, signing out...');
      signOut().then(() => {
        window.location.href = '/';
      });
      return;
    }

    if (user) {
      checkOnboardingStatus();
      // Check if user is admin
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        // Check URL for admin route
        if (window.location.pathname === '/admin') {
          setShowAdmin(true);
        }
      }
    } else {
      setCheckingOnboarding(false);
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user || !user.email) return;

    try {
      console.log('Checking onboarding status for:', user.email);
      const profile = await api.getUserProfile({ email: user.email });
      console.log('User profile:', profile);

      const feedbackDone = profile?.feedbackCompleted || false;
      const onboardingDone = profile?.onboarding_completed || false;

      console.log('Feedback completed:', feedbackDone);
      console.log('Onboarding completed:', onboardingDone);

      setFeedbackComplete(feedbackDone);
      setOnboardingComplete(onboardingDone);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      // For new users, show feedback form first
      setFeedbackComplete(false);
      setOnboardingComplete(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Always show landing page if user is not authenticated
  if (!user) {
    console.log('Showing LandingPage - user not authenticated');
    return <LandingPage />;
  }

  console.log('User is authenticated, checking next step...');

  // Show admin dashboard if user is admin and on /admin route
  if (showAdmin && user.email && ADMIN_EMAILS.includes(user.email)) {
    return <AdminDashboard />;
  }

  // Show feedback form first (for all new users)
  if (!feedbackComplete) {
    return <UserFeedbackForm onComplete={async () => {
      console.log('Feedback completed, moving to onboarding...');
      setFeedbackComplete(true);
      await checkOnboardingStatus();
    }} />;
  }

  // Then show fitness onboarding
  if (!onboardingComplete) {
    return <OnboardingQuestionnaire onComplete={async () => {
      console.log('Onboarding completed, re-checking status...');
      setCheckingOnboarding(true);
      await checkOnboardingStatus();
    }} />;
  }

  return <MainDashboard />;
}
