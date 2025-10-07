import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Camera, CheckCircle2, X } from 'lucide-react';
import { hasScannedToday } from '../lib/firestore/scans';
import { useAuth } from '../components/AuthProvider';
import KpiTiles from '../components/Dashboard/KpiTiles';
import BFTrendChart from '../components/Dashboard/BFTrendChart';
import LBMTrendChart from '../components/Dashboard/LBMTrendChart';
import StreakBar from '../components/Dashboard/StreakBar';
import DailyInsightsList from '../components/Dashboard/DailyInsightsList';

export default function DailyScanDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scannedToday, setScannedToday] = useState<boolean | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Check if redirected from scan completion
    if (searchParams.get('scanCompleted') === 'true') {
      setShowSuccessMessage(true);
      // Clear query param
      setSearchParams({});
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user) return;

    checkTodayScan();
  }, [user]);

  const checkTodayScan = async () => {
    if (!user) return;

    try {
      const scanned = await hasScannedToday(user.uid);
      setScannedToday(scanned);
    } catch (error) {
      console.error('Failed to check today scan:', error);
    }
  };

  const formatTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-start justify-between animate-slide-down">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900">Daily Scan Complete!</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your scan is being processed. Results will appear below shortly.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-700 hover:text-green-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Scan Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your body composition journey</p>
          </div>

          {/* Scan CTA */}
          {scannedToday === false && (
            <Link
              to="/scan"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition"
            >
              <Camera className="w-5 h-5" />
              Start Morning Scan
            </Link>
          )}

          {scannedToday === true && (
            <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Scanned Today
            </div>
          )}
        </div>

        {/* Reminder Banner (if not scanned today and it's morning) */}
        {scannedToday === false && new Date().getHours() < 10 && (
          <div className="mb-6 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Camera className="w-6 h-6 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900">Good Morning! Time for Your Scan</h4>
                <p className="text-sm text-orange-700 mt-1">
                  It's {formatTime()} — complete your scan before breakfast for best results.
                </p>
                <Link
                  to="/scan"
                  className="inline-block mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
                >
                  Start Scan Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* KPI Tiles */}
        <div className="mb-6">
          <KpiTiles />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BFTrendChart />
          <LBMTrendChart />
        </div>

        {/* Streak & Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StreakBar />
          <DailyInsightsList />
        </div>

        {/* Footer Tips */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Accurate Scans</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Scan at the same time daily (ideally 6:00 AM)</li>
            <li>• Before eating or drinking</li>
            <li>• Wear the same fitted clothing (or minimal clothing)</li>
            <li>• Good lighting, no shadows</li>
            <li>• Align yourself with the pose overlay</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
