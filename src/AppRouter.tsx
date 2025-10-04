import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthProvider';
import LandingPage from './App';
import ImprovedDashboard from './components/ImprovedDashboard';
import ReliabilityPage from './pages/ReliabilityPage';
import ErrorBoundary from './components/ErrorBoundary';

export default function AppRouter() {
  const { user, loading } = useAuth();

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

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public routes - redirect to /app if logged in */}
          <Route path="/" element={user ? <Navigate to="/app" replace /> : <LandingPage />} />
          <Route path="/reliability" element={<ReliabilityPage />} />

          {/* Protected routes - require authentication */}
          <Route
            path="/app"
            element={user ? <ImprovedDashboard /> : <Navigate to="/" replace />}
          />

          {/* Dashboard alias */}
          <Route
            path="/dashboard"
            element={user ? <ImprovedDashboard /> : <Navigate to="/" replace />}
          />

          {/* Redirect old paths */}
          <Route path="/test-dashboard" element={<Navigate to="/app" replace />} />
          <Route path="/enhanced-dashboard" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
