import { useEffect, useState } from 'react';
import { useAuth } from './components/AuthProvider';
import { db, Collections } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import LandingPage from './App';
import UserFeedbackForm from './components/UserFeedbackForm';
import MainDashboard from './components/MainDashboard';
import AdminDashboard from './components/AdminDashboard';

// Admin email list - add authorized admin emails here
const ADMIN_EMAILS = ['akhilreddyd3@gmail.com'];

interface UserStatus {
  feedbackCompleted: boolean;
  onboardingCompleted: boolean;
}

export default function AppRouter() {
  const { user, loading, signOut } = useAuth();
  const [userStatus, setUserStatus] = useState<UserStatus>({
    feedbackCompleted: false,
    onboardingCompleted: false
  });
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('[AppRouter] Current state:', {
    hasUser: !!user,
    userEmail: user?.email,
    loading,
    checkingStatus,
    feedbackCompleted: userStatus.feedbackCompleted,
    onboardingCompleted: userStatus.onboardingCompleted,
    showAdmin,
    error
  });

  useEffect(() => {
    // Handle sign out URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signout') === 'true') {
      console.log('[AppRouter] Sign out parameter detected');
      signOut().then(() => {
        window.location.href = '/';
      }).catch((err) => {
        console.error('[AppRouter] Sign out error:', err);
        setError('Failed to sign out. Please try again.');
      });
      return;
    }

    if (user && user.email) {
      checkUserStatus();

      // Check if user is admin
      if (ADMIN_EMAILS.includes(user.email)) {
        if (window.location.pathname === '/admin') {
          setShowAdmin(true);
        }
      }
    } else {
      setCheckingStatus(false);
    }
  }, [user]);

  const checkUserStatus = async () => {
    if (!user || !user.email) {
      console.log('[AppRouter] No user or email, skipping status check');
      setCheckingStatus(false);
      return;
    }

    try {
      console.log('[AppRouter] Checking user status for:', user.email);
      setCheckingStatus(true);
      setError(null);

      // Check user document in Firestore
      const userDocRef = doc(db, Collections.USERS, user.email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('[AppRouter] User document found:', {
          feedbackCompleted: userData.feedbackCompleted,
          onboardingCompleted: userData.onboardingCompleted,
          waitlistNumber: userData.waitlistNumber
        });

        setUserStatus({
          feedbackCompleted: userData.feedbackCompleted === true,
          onboardingCompleted: userData.onboardingCompleted === true
        });
      } else {
        console.log('[AppRouter] User document not found - new user');
        setUserStatus({
          feedbackCompleted: false,
          onboardingCompleted: false
        });
      }
    } catch (error: any) {
      console.error('[AppRouter] Error checking user status:', error);

      // Enterprise-grade error handling
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check Firebase security rules.');
      } else if (error.code === 'unavailable') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Failed to load user data: ${error.message}`);
      }

      // Default to showing form on error (safe fallback)
      setUserStatus({
        feedbackCompleted: false,
        onboardingCompleted: false
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleFeedbackComplete = async () => {
    console.log('[AppRouter] Feedback completed callback triggered');

    // Update local state immediately
    setUserStatus({
      feedbackCompleted: true,
      onboardingCompleted: true
    });

    // Re-check from Firestore to ensure consistency
    try {
      console.log('[AppRouter] Re-checking Firestore after feedback completion');
      await checkUserStatus();
    } catch (error) {
      console.error('[AppRouter] Error re-checking status:', error);
      // Even if re-check fails, keep the updated local state
    }
  };

  // Loading state
  if (loading || checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your experience...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              checkUserStatus();
            }}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-red-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Always show landing page if user is not authenticated
  if (!user) {
    console.log('[AppRouter] Showing LandingPage - user not authenticated');
    return <LandingPage />;
  }

  console.log('[AppRouter] User is authenticated, determining view...');

  // Show admin dashboard if user is admin and on /admin route
  if (showAdmin && user.email && ADMIN_EMAILS.includes(user.email)) {
    console.log('[AppRouter] Showing AdminDashboard');
    return <AdminDashboard />;
  }

  // Show feedback form for new users who haven't completed it
  if (!userStatus.feedbackCompleted) {
    console.log('[AppRouter] Showing UserFeedbackForm - feedback not completed');
    return <UserFeedbackForm onComplete={handleFeedbackComplete} />;
  }

  // Show dashboard for users who have completed feedback
  console.log('[AppRouter] Showing MainDashboard - user onboarded');
  return <MainDashboard />;
}
