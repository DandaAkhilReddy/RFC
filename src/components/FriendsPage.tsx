import { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Search, X, Check, Loader, Trophy, Flame, TrendingUp, Crown } from 'lucide-react';
import { useAuth } from './AuthProvider';
import {
  getUserFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  FriendRequest,
  getUserGroups,
  createFriendGroup,
  FriendGroup
} from '../lib/friendsService';
import { getUserPoints, UserPoints } from '../lib/pointsService';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FriendProfile {
  userId: string;
  name: string;
  photoUrl?: string;
  points?: UserPoints;
  city?: string;
  country?: string;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user?.uid) {
      loadFriendsData();
    }
  }, [user]);

  const loadFriendsData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Load friends
      const friendIds = await getUserFriends(user.uid);
      const friendProfiles = await Promise.all(
        friendIds.map(async (friendId) => {
          const profile = await getUserProfile(friendId);
          const points = await getUserPoints(friendId);
          return { ...profile, points };
        })
      );
      setFriends(friendProfiles);

      // Load pending requests
      const requests = await getPendingRequests(user.uid);
      setPendingRequests(requests);

      // Load groups
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading friends data:', error);
      showToast('Failed to load friends', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async (userId: string): Promise<FriendProfile> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          userId,
          name: data.displayName || 'Unknown',
          photoUrl: data.photoURL || undefined,
          city: data.city,
          country: data.country
        };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
    return { userId, name: 'Unknown' };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user?.uid) return;

    setSearching(true);
    try {
      // Search users by name or email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('displayName', '>=', searchQuery), where('displayName', '<=', searchQuery + '\uf8ff'));
      const snapshot = await getDocs(q);

      const results: FriendProfile[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== user.uid) {
          const data = doc.data();
          results.push({
            userId: doc.id,
            name: data.displayName || 'Unknown',
            photoUrl: data.photoURL || undefined,
            city: data.city,
            country: data.country
          });
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      showToast('Search failed', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (toUserId: string, toUserName: string) => {
    if (!user?.uid || !user.displayName) return;

    try {
      await sendFriendRequest(user.uid, user.displayName, toUserId, user.photoURL || undefined);
      showToast(`Friend request sent to ${toUserName}!`, 'success');
      setSearchResults(searchResults.filter(r => r.userId !== toUserId));
    } catch (error: any) {
      showToast(error.message || 'Failed to send request', 'error');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!user?.uid) return;

    try {
      await acceptFriendRequest(requestId, user.uid);
      showToast('Friend request accepted!', 'success');
      await loadFriendsData();
    } catch (error: any) {
      showToast(error.message || 'Failed to accept request', 'error');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (!user?.uid) return;

    try {
      await declineFriendRequest(requestId, user.uid);
      showToast('Friend request declined', 'info');
      await loadFriendsData();
    } catch (error: any) {
      showToast(error.message || 'Failed to decline request', 'error');
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (!user?.uid) return;

    if (!confirm(`Remove ${friendName} from friends?`)) return;

    try {
      await removeFriend(user.uid, friendId);
      showToast(`Removed ${friendName} from friends`, 'info');
      await loadFriendsData();
    } catch (error: any) {
      showToast(error.message || 'Failed to remove friend', 'error');
    }
  };

  const handleCreateGroup = async () => {
    if (!user?.uid || !newGroupName.trim()) return;

    try {
      await createFriendGroup(user.uid, newGroupName, newGroupDesc, []);
      showToast(`Group "${newGroupName}" created!`, 'success');
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreateGroup(false);
      await loadFriendsData();
    } catch (error: any) {
      showToast(error.message || 'Failed to create group', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ message, type });

    // Set new timeout and store reference
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white font-semibold animate-slide-in`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            Friends & Groups
          </h1>
          <p className="text-gray-600 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Compete with friends and join groups
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowAddFriend(!showAddFriend)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition font-semibold flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Friends</span>
          </button>
          <button
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold flex items-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Add Friend Section */}
        {showAddFriend && (
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Add Friends</h3>
              <button onClick={() => setShowAddFriend(false)}>
                <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            {/* Search */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-semibold disabled:opacity-50"
              >
                {searching ? <Loader className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-2">Found {searchResults.length} users</p>
                {searchResults.map((result) => (
                  <div key={result.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {result.photoUrl ? (
                        <img src={result.photoUrl} alt={result.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {result.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{result.name}</p>
                        {result.city && <p className="text-xs text-gray-500">{result.city}, {result.country}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(result.userId, result.name)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Group Section */}
        {showCreateGroup && (
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Create Friend Group</h3>
              <button onClick={() => setShowCreateGroup(false)}>
                <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g., Gym Warriors"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  placeholder="What's your group about?"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
                  rows={3}
                />
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading friends...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Friends List */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-500" />
                  My Friends ({friends.length})
                </h3>

                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold mb-2">No friends yet</p>
                    <p className="text-sm text-gray-500">Add friends to compete and stay motivated!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friend) => (
                      <div key={friend.userId} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition">
                        <div className="flex items-center space-x-4 flex-1">
                          {friend.photoUrl ? (
                            <img src={friend.photoUrl} alt={friend.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-300" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl border-2 border-blue-300">
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-lg">{friend.name}</p>
                            {friend.city && <p className="text-xs text-gray-500">{friend.city}, {friend.country}</p>}
                            {friend.points && (
                              <div className="flex items-center space-x-3 mt-1">
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold flex items-center">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  {friend.points.totalPoints} pts
                                </span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold flex items-center">
                                  <Flame className="w-3 h-3 mr-1" />
                                  This Week: {friend.points.weeklyPoints}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFriend(friend.userId, friend.name)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pending Requests */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
                  Requests ({pendingRequests.length})
                </h3>

                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No pending requests</p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          {request.fromPhoto ? (
                            <img src={request.fromPhoto} alt={request.fromName} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                              {request.fromName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{request.fromName}</p>
                            <p className="text-xs text-gray-500">wants to be friends</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-semibold flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(request.id)}
                            className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm font-semibold flex items-center justify-center"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Friend Groups */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                  My Groups ({groups.length})
                </h3>

                {groups.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No groups yet</p>
                ) : (
                  <div className="space-y-3">
                    {groups.map((group) => (
                      <div key={group.id} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                        <p className="font-bold text-lg mb-1">{group.name}</p>
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                            {group.members.length} members
                          </span>
                          {group.ownerId === user?.uid && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-semibold">
                              Owner
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
