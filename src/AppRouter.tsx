import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from './components/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';

// Eager load landing page (first page users see)
import LandingPage from './App';

// Lazy load all other pages for code splitting
const ImprovedDashboard = lazy(() => import('./components/ImprovedDashboard'));
const ReliabilityPage = lazy(() => import('./pages/ReliabilityPage'));
const DailyScanPage = lazy(() => import('./pages/DailyScanPage'));
const DailyScanDashboard = lazy(() => import('./pages/DailyScanDashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicQRCardPage = lazy(() => import('./pages/PublicQRCardPage'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes - redirect to /app if logged in */}
            <Route path="/" element={user ? <Navigate to="/app" replace /> : <LandingPage />} />
            <Route path="/reliability" element={<ReliabilityPage />} />

            {/* Public QR Card - accessible without auth */}
            <Route path="/q/:slug" element={<PublicQRCardPage />} />

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

            {/* Daily Scan routes */}
            <Route
              path="/scan"
              element={user ? <DailyScanPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/scan-dashboard"
              element={user ? <DailyScanDashboard /> : <Navigate to="/" replace />}
            />

            {/* Profile route */}
            <Route
              path="/profile"
              element={user ? <ProfilePage /> : <Navigate to="/" replace />}
            />

            {/* Redirect old paths */}
            <Route path="/test-dashboard" element={<Navigate to="/app" replace />} />
            <Route path="/enhanced-dashboard" element={<Navigate to="/app" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
