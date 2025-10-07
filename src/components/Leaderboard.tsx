import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, MapPin, Globe, Flag } from 'lucide-react';
import {
  getLeaderboardByScope,
  LeaderboardEntry as LBEntry,
  LeaderboardScope,
  LeaderboardPeriod
} from '../lib/leaderboardService';

interface LeaderboardProps {
  userId: string;
  period?: LeaderboardPeriod;
  scope?: LeaderboardScope;
  showScopeSelector?: boolean;
}

export default function Leaderboard({
  userId,
  period = 'weekly',
  scope = 'friends',
  showScopeSelector = true
}: LeaderboardProps) {
  const [currentScope, setCurrentScope] = useState<LeaderboardScope>(scope);
  const [currentPeriod, setCurrentPeriod] = useState<LeaderboardPeriod>(period);
  const [leaderboard, setLeaderboard] = useState<LBEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [userId, currentScope, currentPeriod]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboardByScope(currentScope, userId, currentPeriod, 20);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPeriodLabel = () => {
    if (currentPeriod === 'weekly') return 'This Week';
    if (currentPeriod === 'monthly') return 'This Month';
    return 'All Time';
  };

  const getScopeIcon = (scopeName: LeaderboardScope) => {
    switch (scopeName) {
      case 'friends': return <Users className="w-4 h-4" />;
      case 'city': return <MapPin className="w-4 h-4" />;
      case 'country': return <Flag className="w-4 h-4" />;
      case 'global': return <Globe className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getScopeLabel = (scopeName: LeaderboardScope) => {
    switch (scopeName) {
      case 'friends': return 'Friends';
      case 'city': return 'City';
      case 'country': return 'Country';
      case 'global': return 'Global';
      default: return 'Friends';
    }
  };

  // Find current user in leaderboard for special display
  const currentUserEntry = leaderboard.find(entry => entry.isCurrentUser);
  const visibleLeaderboard = leaderboard.slice(0, 7);
  const showCurrentUserBelow = currentUserEntry && currentUserEntry.rank > 7;

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

      {/* Scope Selector */}
      {showScopeSelector && (
        <div className="flex space-x-2 mb-4 overflow-x-auto">
          {(['friends', 'city', 'country', 'global'] as LeaderboardScope[]).map((scopeName) => (
            <button
              key={scopeName}
              onClick={() => setCurrentScope(scopeName)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
                currentScope === scopeName
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getScopeIcon(scopeName)}
              <span>{getScopeLabel(scopeName)}</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading rankings...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No rankings available yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            {currentScope === 'friends'
              ? 'Add friends to compete with them!'
              : 'Start tracking activities to appear on the leaderboard!'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {visibleLeaderboard.map((entry) => (
              <div
                key={entry.userId}
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

                  {/* Profile */}
                  <div className="flex items-center space-x-2 flex-1">
                    {entry.photoUrl && (
                      <img
                        src={entry.photoUrl}
                        alt={entry.name}
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${entry.isCurrentUser ? 'text-orange-700' : 'text-gray-800'}`}>
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                      </p>
                      {(entry.city || entry.country) && (
                        <p className="text-xs text-gray-500 truncate">
                          {entry.city && entry.country ? `${entry.city}, ${entry.country}` : entry.city || entry.country}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className={`font-bold ${entry.isCurrentUser ? 'text-orange-600' : 'text-gray-700'}`}>
                      {entry.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>

                  {/* Trend Indicator */}
                  {entry.rank <= 3 && !entry.isCurrentUser && (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Show current user if ranked below top 7 */}
          {showCurrentUserBelow && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border-2 border-orange-300">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-bold">#{currentUserEntry.rank}</div>
                  {currentUserEntry.photoUrl && (
                    <img
                      src={currentUserEntry.photoUrl}
                      alt={currentUserEntry.name}
                      className="w-8 h-8 rounded-full border-2 border-orange-300"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-orange-700">
                      {currentUserEntry.name}
                      <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                        YOUR RANK
                      </span>
                    </p>
                    {(currentUserEntry.city || currentUserEntry.country) && (
                      <p className="text-xs text-gray-500">
                        {currentUserEntry.city && currentUserEntry.country
                          ? `${currentUserEntry.city}, ${currentUserEntry.country}`
                          : currentUserEntry.city || currentUserEntry.country}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600">{currentUserEntry.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          🏆 Complete workouts and hit goals to climb the leaderboard!
        </p>
      </div>
    </div>
  );
}
