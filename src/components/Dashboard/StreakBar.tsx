import { useState, useEffect } from 'react';
import { Flame, Award, Calendar } from 'lucide-react';
import { calculateStreak, getScanHistory } from '../../lib/firestore/scans';
import { useAuth } from '../AuthProvider';

export default function StreakBar() {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [last14Days, setLast14Days] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadStreakData();
  }, [user]);

  const loadStreakData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Get streak counts
      const streakData = await calculateStreak(user.uid);
      setCurrentStreak(streakData.currentStreak);
      setBestStreak(streakData.bestStreak);

      // Get last 14 days for visualization
      const scans = await getScanHistory(user.uid, 14);
      const scanDates = scans.map(s => s.date);

      const last14DaysArray: boolean[] = [];
      for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last14DaysArray.push(scanDates.includes(dateStr));
      }

      setLast14Days(last14DaysArray);
    } catch (error) {
      console.error('Failed to load streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-sm border border-orange-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-sm border border-orange-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Daily Scan Streak</h3>
            <p className="text-sm text-gray-600">Consistency is key</p>
          </div>
        </div>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">Current Streak</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
          <p className="text-xs text-gray-500 mt-1">consecutive days</p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600">Best Streak</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{bestStreak}</p>
          <p className="text-xs text-gray-500 mt-1">personal record</p>
        </div>
      </div>

      {/* Visual Calendar (Last 14 Days) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">Last 14 Days</span>
        </div>

        <div className="grid grid-cols-14 gap-1">
          {last14Days.map((hasScanned, idx) => (
            <div
              key={idx}
              className={`h-8 rounded ${
                hasScanned
                  ? 'bg-gradient-to-br from-orange-500 to-red-500'
                  : 'bg-gray-200'
              }`}
              title={hasScanned ? 'Scanned' : 'Missed'}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>14 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Motivational Message */}
      {currentStreak === 0 && (
        <div className="mt-4 p-3 bg-orange-100 rounded-lg">
          <p className="text-sm text-orange-900">
            <strong>Start your streak today!</strong> Daily scans help track true progress.
          </p>
        </div>
      )}

      {currentStreak >= 7 && (
        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <p className="text-sm text-green-900">
            <strong>🔥 {currentStreak} days strong!</strong> You're building great habits!
          </p>
        </div>
      )}
    </div>
  );
}
