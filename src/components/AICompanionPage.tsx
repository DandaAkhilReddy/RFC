import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  X,
  Check,
  Clock,
  Utensils,
  Dumbbell,
  MessageCircle,
  Users,
  Shield,
  Sparkles,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db, Collections } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface UserPreferences {
  loginTimes: string[]; // Array of preferred login times
  workoutTimes: string[];
  mealTimes: string[];
  fitnessGoals: string[];
  interests: string[];
  dietaryPreferences: string[];
  workoutTypes: string[];
  motivationStyle: string; // 'gentle', 'strict', 'balanced'
  communicationStyle: string; // 'casual', 'professional', 'friendly'
}

interface PotentialMatch {
  id: string;
  name: string;
  gender: string;
  matchScore: number;
  commonInterests: string[];
  timezone: string;
  profilePicture?: string;
}

interface AICompanionPageProps {
  onBack: () => void;
}

export default function AICompanionPage({ onBack }: AICompanionPageProps) {
  const { user } = useAuth();
  const [currentMatch, setCurrentMatch] = useState<PotentialMatch | null>(null);
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    loginTimes: [],
    workoutTimes: [],
    mealTimes: [],
    fitnessGoals: [],
    interests: [],
    dietaryPreferences: [],
    workoutTypes: [],
    motivationStyle: 'balanced',
    communicationStyle: 'friendly'
  });
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    loadUserPreferences();
    loadTodaysMatch();
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user?.email) return;

    try {
      const docRef = doc(db, Collections.USER_SETTINGS, user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserPreferences({
          loginTimes: data.loginTimes || [],
          workoutTimes: data.workoutTimes || [],
          mealTimes: data.mealTimes || [],
          fitnessGoals: data.specificGoals || [],
          interests: data.interests || [],
          dietaryPreferences: [data.dietaryPreference] || [],
          workoutTypes: [data.workoutLocation] || [],
          motivationStyle: data.motivationStyle || 'balanced',
          communicationStyle: data.communicationStyle || 'friendly'
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysMatch = async () => {
    if (!user?.email) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const matchDocRef = doc(db, Collections.MATCHES, `${user.email}_${today}`);
      const matchSnap = await getDoc(matchDocRef);

      if (matchSnap.exists()) {
        setCurrentMatch(matchSnap.data() as PotentialMatch);
      } else {
        // Find new matches
        await findMatches();
      }
    } catch (error) {
      console.error('Error loading match:', error);
    }
  };

  const findMatches = async () => {
    if (!user?.email) return;

    // This would be replaced with actual matching algorithm
    // For now, showing sample data
    const sampleMatches: PotentialMatch[] = [
      {
        id: '1',
        name: 'Sarah M.',
        gender: 'female',
        matchScore: 92,
        commonInterests: ['Morning workouts', 'Yoga', 'Healthy cooking'],
        timezone: 'EST',
        profilePicture: ''
      },
      {
        id: '2',
        name: 'Mike D.',
        gender: 'male',
        matchScore: 88,
        commonInterests: ['Evening gym', 'Protein meals', 'Running'],
        timezone: 'CST',
        profilePicture: ''
      }
    ];

    setPotentialMatches(sampleMatches);
  };

  const handleAcceptMatch = async (match: PotentialMatch) => {
    if (!user?.email) return;

    const today = new Date().toISOString().split('T')[0];
    const matchDocRef = doc(db, Collections.MATCHES, `${user.email}_${today}`);

    await setDoc(matchDocRef, {
      ...match,
      status: 'accepted',
      matchedAt: new Date().toISOString()
    });

    setCurrentMatch(match);
    setPotentialMatches([]);
  };

  const handleRejectMatch = () => {
    if (potentialMatches.length > 1) {
      setPotentialMatches(potentialMatches.slice(1));
    } else {
      setPotentialMatches([]);
    }
  };

  const savePreferences = async () => {
    if (!user?.email) return;

    try {
      const docRef = doc(db, Collections.USER_SETTINGS, user.email);
      await setDoc(docRef, {
        ...userPreferences,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setShowPreferences(false);
      alert('Preferences saved! Finding better matches...');
      await findMatches();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Finding your perfect match...</p>
        </div>
      </div>
    );
  }

  if (showPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Matching Preferences</h1>
              <button
                onClick={savePreferences}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Privacy Notice */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">Privacy Protected</h3>
              <p className="text-sm text-purple-700">
                We match based on habits, schedules, and interests only. Personal data like weight, height,
                and body measurements are never shared or used for matching.
              </p>
            </div>
          </div>

          {/* Timing Preferences */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-600" />
              Daily Schedule
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Login Times</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Morning (6-9 AM)', 'Midday (12-2 PM)', 'Evening (6-8 PM)', 'Night (9-11 PM)'].map(time => (
                    <label key={time} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-pink-50">
                      <input
                        type="checkbox"
                        checked={userPreferences.loginTimes.includes(time)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserPreferences({
                              ...userPreferences,
                              loginTimes: [...userPreferences.loginTimes, time]
                            });
                          } else {
                            setUserPreferences({
                              ...userPreferences,
                              loginTimes: userPreferences.loginTimes.filter(t => t !== time)
                            });
                          }
                        }}
                        className="text-pink-600"
                      />
                      <span className="text-sm">{time}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workout Times</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Early Morning', 'Morning', 'Afternoon', 'Evening'].map(time => (
                    <label key={time} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-pink-50">
                      <input
                        type="checkbox"
                        checked={userPreferences.workoutTimes.includes(time)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserPreferences({
                              ...userPreferences,
                              workoutTimes: [...userPreferences.workoutTimes, time]
                            });
                          } else {
                            setUserPreferences({
                              ...userPreferences,
                              workoutTimes: userPreferences.workoutTimes.filter(t => t !== time)
                            });
                          }
                        }}
                        className="text-pink-600"
                      />
                      <span className="text-sm">{time}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Interests & Habits</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Yoga', 'Running', 'Weightlifting', 'Swimming',
                'Cycling', 'Meditation', 'Healthy Cooking', 'Meal Prep',
                'Early Riser', 'Night Owl', 'Plant-Based Diet', 'Protein Focus'
              ].map(interest => (
                <label key={interest} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-pink-50">
                  <input
                    type="checkbox"
                    checked={userPreferences.interests.includes(interest)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setUserPreferences({
                          ...userPreferences,
                          interests: [...userPreferences.interests, interest]
                        });
                      } else {
                        setUserPreferences({
                          ...userPreferences,
                          interests: userPreferences.interests.filter(i => i !== interest)
                        });
                      }
                    }}
                    className="text-pink-600"
                  />
                  <span className="text-sm">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Communication Style */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Communication Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivation Style</label>
                <select
                  value={userPreferences.motivationStyle}
                  onChange={(e) => setUserPreferences({ ...userPreferences, motivationStyle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="gentle">Gentle & Supportive</option>
                  <option value="balanced">Balanced Approach</option>
                  <option value="strict">Direct & Challenging</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Style</label>
                <select
                  value={userPreferences.communicationStyle}
                  onChange={(e) => setUserPreferences({ ...userPreferences, communicationStyle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="casual">Casual & Fun</option>
                  <option value="friendly">Friendly & Warm</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-600" />
                  AI Companion
                </h1>
                <p className="text-sm text-gray-500">Your daily accountability partner</p>
              </div>
            </div>
            <button
              onClick={() => setShowPreferences(true)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Preferences
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Current Match */}
        {currentMatch ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Today's Match!</h2>
              <p className="opacity-90">You've been matched with your accountability partner</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {currentMatch.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{currentMatch.name}</h3>
                  <p className="text-gray-600">Match Score: {currentMatch.matchScore}%</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">{currentMatch.matchScore}%</div>
                  <p className="text-xs text-gray-500">Compatible</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Common Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.commonInterests.map((interest, i) => (
                      <span key={i} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    Start Chat
                  </button>
                </div>
              </div>
            </div>

            {/* Match Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <Calendar className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Matched Today</p>
                <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Timezone</p>
                <p className="font-semibold text-gray-900">{currentMatch.timezone}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Privacy</p>
                <p className="font-semibold text-gray-900">Protected</p>
              </div>
            </div>
          </div>
        ) : potentialMatches.length > 0 ? (
          /* Match Cards */
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Match</h2>
              <p className="text-gray-600">Swipe through potential accountability partners</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {potentialMatches[0].name.charAt(0)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{potentialMatches[0].name}</h3>
                <p className="text-gray-600">Match Score: {potentialMatches[0].matchScore}%</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Common Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {potentialMatches[0].commonInterests.map((interest, i) => (
                    <span key={i} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRejectMatch}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Pass
                </button>
                <button
                  onClick={() => handleAcceptMatch(potentialMatches[0])}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Match
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* No Matches */
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches available</h3>
            <p className="text-gray-600 mb-6">
              Check back tomorrow for your daily match or update your preferences
            </p>
            <button
              onClick={() => setShowPreferences(true)}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Update Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
