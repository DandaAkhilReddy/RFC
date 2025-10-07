import { useState, useEffect } from 'react';
import { TrendingDown, Activity, Target, Flame } from 'lucide-react';
import { getLatestScan, calculateStreak } from '../../lib/firestore/scans';
import { useAuth } from '../AuthProvider';
import type { Scan } from '../../types/scan';

export default function KpiTiles() {
  const { user } = useAuth();
  const [latestScan, setLatestScan] = useState<Scan | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadKpiData();
  }, [user]);

  const loadKpiData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const [scan, streakData] = await Promise.all([
        getLatestScan(user.uid),
        calculateStreak(user.uid),
      ]);

      setLatestScan(scan);
      setCurrentStreak(streakData.currentStreak);
    } catch (error) {
      console.error('Failed to load KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Body Fat % */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          {latestScan?.bfConfidence !== null && (
            <span className="text-xs text-orange-700 font-medium">
              {(latestScan.bfConfidence * 100).toFixed(0)}% confidence
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1">Body Fat %</p>
        <p className="text-3xl font-bold text-gray-900">
          {latestScan?.bfPercent !== null
            ? `${(latestScan.bfPercent * 100).toFixed(1)}%`
            : '-'}
        </p>
        {latestScan?.deltas?.bf_d1 !== null && (
          <p
            className={`text-xs mt-2 ${
              latestScan.deltas.bf_d1 < 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {latestScan.deltas.bf_d1 < 0 ? '↓' : '↑'}{' '}
            {Math.abs(latestScan.deltas.bf_d1 * 100).toFixed(1)}% vs yesterday
          </p>
        )}
      </div>

      {/* Lean Body Mass */}
      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl shadow-sm border border-cyan-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Lean Body Mass</p>
        <p className="text-3xl font-bold text-gray-900">
          {latestScan?.lbmLb !== null ? `${latestScan.lbmLb.toFixed(1)} lb` : '-'}
        </p>
        {latestScan?.deltas?.lbm_d1 !== null && (
          <p
            className={`text-xs mt-2 ${
              latestScan.deltas.lbm_d1 > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {latestScan.deltas.lbm_d1 > 0 ? '↑' : '↓'}{' '}
            {Math.abs(latestScan.deltas.lbm_d1).toFixed(1)} lb vs yesterday
          </p>
        )}
      </div>

      {/* Weight */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Current Weight</p>
        <p className="text-3xl font-bold text-gray-900">
          {latestScan?.weightLb !== null ? `${latestScan.weightLb.toFixed(1)} lb` : '-'}
        </p>
        {latestScan?.deltas?.weight_d1 !== null && (
          <p
            className={`text-xs mt-2 ${
              latestScan.deltas.weight_d1 < 0 ? 'text-green-600' : 'text-orange-600'
            }`}
          >
            {latestScan.deltas.weight_d1 < 0 ? '↓' : '↑'}{' '}
            {Math.abs(latestScan.deltas.weight_d1).toFixed(1)} lb vs yesterday
          </p>
        )}
      </div>

      {/* Streak */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Current Streak</p>
        <p className="text-3xl font-bold text-gray-900">{currentStreak}</p>
        <p className="text-xs text-gray-500 mt-2">consecutive days</p>
      </div>
    </div>
  );
}
