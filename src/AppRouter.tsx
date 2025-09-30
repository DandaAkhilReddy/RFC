import { useEffect, useState } from 'react';
import { useAuth } from './components/AuthProvider';
import { supabase } from './lib/supabase';
import LandingPage from './App';
import OnboardingQuestionnaire from './components/OnboardingQuestionnaire';
import Dashboard from './components/Dashboard';

export default function AppRouter() {
  const { user, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboarding(false);
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      setOnboardingComplete(data?.onboarding_completed || false);
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

  if (!onboardingComplete) {
    return <OnboardingQuestionnaire onComplete={() => setOnboardingComplete(true)} />;
  }

  return <Dashboard />;
}
