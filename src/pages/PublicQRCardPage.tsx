import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrendingDown, Activity, Target, Flame, AlertCircle, Calendar, ExternalLink } from 'lucide-react';
import { getUserByQrSlug } from '../lib/firestore/users';
import { getLatestScan, getTrendData, calculateStreak } from '../lib/firestore/scans';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { UserProfile, Scan } from '../types/scan';

export default function PublicQRCardPage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestScan, setLatestScan] = useState<Scan | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [streakData, setStreakData] = useState({ currentStreak: 0, bestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    loadPublicProfile();
  }, [slug]);

  const loadPublicProfile = async () => {
    if (!slug) return;

    setLoading(true);
    setError('');

    try {
      // Look up user by QR slug
      const userProfile = await getUserByQrSlug(slug);
      if (!userProfile) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      setProfile(userProfile);

      // Load latest scan and trend data
      const [scan, trend, streak] = await Promise.all([
        getLatestScan(userProfile.userId),
        getTrendData(userProfile.userId, 14),
        calculateStreak(userProfile.userId),
      ]);

      setLatestScan(scan);
      setTrendData(trend);
      setStreakData(streak);
    } catch (err) {
      console.error('Failed to load public profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This QR code may have been rotated or deleted.'}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600"
          >
            Go to ReddyFit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {profile.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.displayName || 'ReddyFit User'}</h1>
                <p className="text-gray-600">Fitness Journey</p>
                {latestScan && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {formatDate(latestScan.date)}
                  </p>
                )}
              </div>
            </div>

            {/* ReddyFit Logo/Link */}
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">ReddyFit</span>
            </Link>
          </div>
        </div>

        {/* KPI Tiles (respecting privacy settings) */}
        {latestScan && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Body Fat % - Always show if available */}
            {latestScan.bfPercent !== null && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Body Fat %</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(latestScan.bfPercent * 100).toFixed(1)}%
                </p>
              </div>
            )}

            {/* Weight */}
            {profile.privacy?.allowedFields?.showWeight && latestScan.weightLb !== null && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Weight</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestScan.weightLb.toFixed(1)} lb
                </p>
              </div>
            )}

            {/* LBM */}
            {profile.privacy?.allowedFields?.showLBM && latestScan.lbmLb !== null && (
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl shadow-sm border border-cyan-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8 text-cyan-500" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Lean Mass</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestScan.lbmLb.toFixed(1)} lb
                </p>
              </div>
            )}

            {/* Streak */}
            {profile.privacy?.allowedFields?.showBadges && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Streak</p>
                <p className="text-2xl font-bold text-gray-900">{streakData.currentStreak}</p>
                <p className="text-xs text-gray-500">days</p>
              </div>
            )}
          </div>
        )}

        {/* BF Trend Chart */}
        {profile.privacy?.allowedFields?.showBfTrend && trendData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Fat % Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  tickFormatter={(date) => formatDate(date)}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Body Fat %']}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Line
                  type="monotone"
                  dataKey="bfPercent"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Body Fat %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Latest Insight */}
        {profile.privacy?.allowedFields?.showLastInsight && latestScan?.insight && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Latest Insight</h3>
            </div>
            <div className="prose prose-sm max-w-none text-gray-800">
              <div
                dangerouslySetInnerHTML={{
                  __html: latestScan.insight.summary.replace(/\n\n/g, '<br />'),
                }}
              />
            </div>
          </div>
        )}

        {/* Achievement Badges */}
        {profile.privacy?.allowedFields?.showBadges && streakData.bestStreak > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="flex flex-wrap gap-3">
              {streakData.currentStreak >= 7 && (
                <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-full flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-medium text-green-800">7 Day Streak</span>
                </div>
              )}
              {streakData.currentStreak >= 30 && (
                <div className="px-4 py-2 bg-orange-100 border border-orange-300 rounded-full flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <span className="text-sm font-medium text-orange-800">30 Day Streak</span>
                </div>
              )}
              {streakData.bestStreak >= 100 && (
                <div className="px-4 py-2 bg-purple-100 border border-purple-300 rounded-full flex items-center gap-2">
                  <span className="text-xl">💎</span>
                  <span className="text-sm font-medium text-purple-800">100 Day Legend</span>
                </div>
              )}
              {latestScan && latestScan.bfPercent !== null && latestScan.bfPercent < 0.15 && (
                <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-full flex items-center gap-2">
                  <span className="text-xl">💪</span>
                  <span className="text-sm font-medium text-blue-800">Lean Machine</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA Footer */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Start Your Own Fitness Journey</h3>
          <p className="mb-4 opacity-90">Track your body composition with daily AI-powered scans</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Join ReddyFit
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Powered by ReddyFit • Privacy-first fitness tracking</p>
        </div>
      </div>
    </div>
  );
}
