import { Trophy, Award, Star, TrendingUp } from 'lucide-react';
import { BADGES, type Badge } from '../lib/gamification';

interface GamificationWidgetProps {
  totalPoints: number;
  todayPoints: number;
  weeklyPoints: number;
  streak: number;
  earnedBadges: string[];
  motivationalMessage?: string;
}

export default function GamificationWidget({
  totalPoints,
  todayPoints,
  weeklyPoints,
  streak,
  earnedBadges,
  motivationalMessage
}: GamificationWidgetProps) {
  // Get badge objects from IDs
  const badges = earnedBadges.map(id => Object.values(BADGES).find(b => b.id === id)).filter(Boolean) as Badge[];

  return (
    <div className="space-y-4">
      {/* Points & Streak Bar */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Total Points</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">+{todayPoints}</p>
              <p className="text-xs text-gray-600">Today</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">{weeklyPoints}</p>
              <p className="text-xs text-gray-600">This Week</p>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between pt-3 border-t border-orange-200">
          <span className="text-sm font-semibold text-gray-700">Workout Streak</span>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔥</span>
            <span className="text-xl font-bold text-orange-600">{streak}</span>
            <span className="text-sm text-gray-600">days</span>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {motivationalMessage && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-4 rounded-2xl">
          <div className="flex items-start space-x-3">
            <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-gray-800">{motivationalMessage}</p>
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border-2 border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-gray-800">Badges Earned</h3>
            </div>
            <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
              {badges.length}
            </span>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {badges.slice(0, 5).map(badge => (
              <div
                key={badge.id}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 rounded-xl border-2 border-yellow-200 text-center hover:scale-105 transition-transform cursor-pointer"
                title={badge.description}
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <p className="text-xs font-semibold text-gray-800 truncate">{badge.name}</p>
              </div>
            ))}
            {badges.length > 5 && (
              <div className="bg-gray-100 p-3 rounded-xl border-2 border-gray-300 text-center flex flex-col items-center justify-center">
                <p className="text-lg font-bold text-gray-600">+{badges.length - 5}</p>
                <p className="text-xs text-gray-600">more</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Milestones */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-4 rounded-2xl">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-800">Next Milestones</h3>
        </div>

        <div className="space-y-2">
          {/* 7-day streak milestone */}
          {streak < 7 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">🔥 7-Day Streak Badge</span>
              <span className="text-sm font-semibold text-blue-600">{7 - streak} days</span>
            </div>
          )}

          {/* Points milestones */}
          {totalPoints < 1000 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">🌟 Points Rookie Badge</span>
              <span className="text-sm font-semibold text-blue-600">{1000 - totalPoints} pts</span>
            </div>
          )}
          {totalPoints >= 1000 && totalPoints < 5000 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">⭐ Points Pro Badge</span>
              <span className="text-sm font-semibold text-blue-600">{5000 - totalPoints} pts</span>
            </div>
          )}
          {totalPoints >= 5000 && totalPoints < 10000 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">🏆 Points Legend Badge</span>
              <span className="text-sm font-semibold text-blue-600">{10000 - totalPoints} pts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
