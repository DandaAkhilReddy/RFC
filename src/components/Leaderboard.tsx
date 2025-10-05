import { Trophy, TrendingUp, Medal } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  period: 'weekly' | 'monthly' | 'allTime';
  currentUserPoints: number;
  currentUserRank: number;
}

export default function Leaderboard({ period, currentUserPoints, currentUserRank }: LeaderboardProps) {
  // Mock leaderboard data (in production, this would come from Firestore)
  const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'FitWarrior93', points: 8750 },
    { rank: 2, name: 'GymHero2024', points: 7320 },
    { rank: 3, name: 'AbsChaser', points: 6890 },
    { rank: currentUserRank, name: 'You', points: currentUserPoints, isCurrentUser: true },
    { rank: 5, name: 'HealthyVibes', points: 5120 },
    { rank: 6, name: 'FitnessJunkie', points: 4890 },
    { rank: 7, name: 'TransformMe', points: 4560 },
  ].sort((a, b) => b.points - a.points);

  // Re-rank after sorting
  const rankedLeaderboard = mockLeaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPeriodLabel = () => {
    if (period === 'weekly') return 'This Week';
    if (period === 'monthly') return 'This Month';
    return 'All Time';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-gray-800">Leaderboard</h3>
        </div>
        <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
          {getPeriodLabel()}
        </span>
      </div>

      <div className="space-y-2">
        {rankedLeaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              entry.isCurrentUser
                ? 'bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 shadow-md scale-105'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1">
              {/* Rank */}
              <div className={`text-center min-w-[40px] ${entry.isCurrentUser ? 'text-xl font-bold' : 'text-lg'}`}>
                {getMedalIcon(entry.rank)}
              </div>

              {/* Name */}
              <div className="flex-1">
                <p className={`font-semibold ${entry.isCurrentUser ? 'text-orange-700' : 'text-gray-800'}`}>
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      YOU
                    </span>
                  )}
                </p>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className={`font-bold ${entry.isCurrentUser ? 'text-orange-600' : 'text-gray-700'}`}>
                  {entry.points.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">points</p>
              </div>

              {/* Trend Indicator (optional) */}
              {entry.rank <= 3 && !entry.isCurrentUser && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {currentUserRank > 7 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border-2 border-orange-300">
            <div className="flex items-center space-x-3">
              <div className="text-lg font-bold">#{currentUserRank}</div>
              <div>
                <p className="font-semibold text-orange-700">
                  You
                  <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                    YOUR RANK
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-orange-600">{currentUserPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          🏆 Complete workouts and hit goals to climb the leaderboard!
        </p>
      </div>
    </div>
  );
}
