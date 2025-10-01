import { useEffect, useState } from 'react';
import { useAuth } from './components/AuthProvider';
import { api } from './lib/api';
import LandingPage from './App';
import OnboardingQuestionnaire from './components/OnboardingQuestionnaire';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

// Admin email list - add authorized admin emails here
const ADMIN_EMAILS = ['akhilreddyd3@gmail.com'];

export default function AppRouter() {
  const { user, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
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
      const profile = await api.getUserProfile({ email: user.email });
      setOnboardingComplete(profile?.onboarding_completed || false);
    } catch (error) {
      console.error('Error checking onboarding:', error);
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

  if (!user) {
    return <LandingPage />;
  }

  // Show admin panel if user is admin and on /admin route
  if (showAdmin && user.email && ADMIN_EMAILS.includes(user.email)) {
    return <AdminPanel />;
  }

  if (!onboardingComplete) {
    return <OnboardingQuestionnaire onComplete={() => setOnboardingComplete(true)} />;
  }

  return <Dashboard />;
}
