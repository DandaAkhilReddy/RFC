import { useState, useEffect } from 'react';
import { MapPin, Users, Globe, Navigation, Filter, Search } from 'lucide-react';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, Collections } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import { getUserLocation, calculateDistance, formatDistance, getProximityCategory, isSameCity } from '../utils/geolocation';

interface CommunityUser {
  userId: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  joinedAt: string;
  distance?: number;
  proximityCategory?: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [communityUsers, setCommunityUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initializeUserLocation();
    loadCommunityUsers();
  }, [user]);

  const initializeUserLocation = async () => {
    if (!user?.uid) return;

    try {
      // Check if user location already exists
      const locationDoc = await getDoc(doc(db, Collections.USER_LOCATIONS, user.uid));

      if (locationDoc.exists()) {
        setUserLocation(locationDoc.data());
      } else {
        // Fetch and save user's location
        const location = await getUserLocation();
        if (location) {
          const locationData = {
            userId: user.uid,
            ...location,
            lastUpdated: new Date().toISOString()
          };
          await setDoc(doc(db, Collections.USER_LOCATIONS, user.uid), locationData);
          setUserLocation(locationData);
        }
      }
    } catch (error) {
      console.error('Error initializing user location:', error);
    }
  };

  const loadCommunityUsers = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Load all community users
      const usersSnapshot = await getDocs(collection(db, Collections.COMMUNITY_USERS));
      const users: CommunityUser[] = [];

      usersSnapshot.forEach((doc) => {
        if (doc.id !== user.uid) {
          // Don't include current user
          users.push(doc.data() as CommunityUser);
        }
      });

      // Calculate distances if user location is available
      if (userLocation) {
        users.forEach((u) => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            u.latitude,
            u.longitude
          );
          u.distance = distance;
          u.proximityCategory = getProximityCategory(distance);
        });

        // Sort by distance (closest first)
        users.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      setCommunityUsers(users);
    } catch (error) {
      console.error('Error loading community users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = communityUsers.filter((u) => {
    // Apply proximity filter
    if (filterCategory !== 'all' && u.proximityCategory !== filterCategory) {
      return false;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        u.displayName.toLowerCase().includes(query) ||
        u.bio.toLowerCase().includes(query) ||
        u.city.toLowerCase().includes(query) ||
        u.country.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
            Community
          </h1>
          <p className="text-gray-600 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Connect with {communityUsers.length} fitness enthusiasts near you
          </p>
        </div>

        {/* User's Location Info */}
        {userLocation && (
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Your Location</h3>
                  <p className="text-gray-600">
                    <Globe className="w-4 h-4 inline mr-1" />
                    {userLocation.city}, {userLocation.country}
                  </p>
                </div>
              </div>
              <button
                onClick={initializeUserLocation}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center space-x-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Update Location</span>
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, bio, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Proximity Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Distances</option>
                <option value="nearby">Nearby (0-5 km)</option>
                <option value="local">Local (5-25 km)</option>
                <option value="regional">Regional (25-100 km)</option>
                <option value="distant">Distant (100+ km)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading community members...</p>
            </div>
          </div>
        )}

        {/* User Grid */}
        {!loading && (
          <>
            <div className="mb-4 text-gray-600">
              Showing {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''}
            </div>

            {filteredUsers.length === 0 ? (
              <div className="bg-white/90 p-12 rounded-2xl text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No members found</h3>
                <p className="text-gray-600">Try adjusting your filters or be the first to join!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((member) => (
                  <div
                    key={member.userId}
                    className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
                  >
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 flex-shrink-0">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={member.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                            {member.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{member.displayName}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {member.city}, {member.country}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {member.bio || 'No bio yet'}
                    </p>

                    {/* Distance Badge */}
                    {member.distance !== undefined && (
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.proximityCategory === 'nearby'
                              ? 'bg-green-100 text-green-700'
                              : member.proximityCategory === 'local'
                              ? 'bg-blue-100 text-blue-700'
                              : member.proximityCategory === 'regional'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {formatDistance(member.distance)}
                        </span>
                        {isSameCity(userLocation?.city || '', member.city) && (
                          <span className="text-xs text-green-600 font-semibold">
                            ✓ Same city
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
