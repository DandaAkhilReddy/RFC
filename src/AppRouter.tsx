import { useAuth } from './components/AuthProvider';
import LandingPage from './App';
import MainDashboard from './components/MainDashboard';
import NewDashboard from './components/NewDashboard';
import EnhancedDashboard from './components/EnhancedDashboard';

export default function AppRouter() {
  const { user, loading } = useAuth();

  // Check if we're on the test dashboard routes
  const isTestDashboard = window.location.pathname === '/test-dashboard';
  const isEnhancedDashboard = window.location.pathname === '/enhanced-dashboard';

  console.log('[AppRouter] user:', user?.email, 'loading:', loading);

  // Show loading spinner only while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // NOT logged in - show landing page
  if (!user) {
    console.log('[AppRouter] No user - showing landing page');
    return <LandingPage />;
  }

  // Logged in - show dashboard (or test dashboards if on test routes)
  console.log('[AppRouter] User logged in - showing dashboard');
  if (isTestDashboard) return <NewDashboard />;

  // DEFAULT: Always show EnhancedDashboard (with onboarding)
  return <EnhancedDashboard />;
}
