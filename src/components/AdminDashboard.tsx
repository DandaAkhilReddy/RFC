import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Download,
  Utensils,
  Dumbbell,
  Heart,
  Settings,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  Eye,
  Trash2,
  Filter,
  Search,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db, Collections } from '../lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface UserData {
  email: string;
  displayName: string;
  createdAt: string;
  onboardingCompleted: boolean;
  feedbackCompleted: boolean;
}

interface FeedbackData {
  userEmail: string;
  userName: string;
  submittedAt: string;
  // Step 1: Feature Experience
  experienceWithReddy: string;
  experienceWithDiet: string;
  experienceWithCompanion: string;
  experienceWithWorkout: string;
  // Step 2: Feature Ideas
  featureIdeas: string[];
  customFeatureIdea: string;
  suggestedFeatureName: string;
  // Step 3: Notifications
  notificationFrequency: string;
  notificationTimes: string[];
  notificationTypes: string[];
  // Step 4: FitBuddy
  fitbuddyPersonality: string;
  fitbuddyResponseStyle: string;
  fitbuddyMotivationLevel: string;
  dailyCheckInTime: string;
  // Step 5: Final
  mostExcitedFeature: string;
  suggestionsForImprovement: string;
  wouldRecommend: string;
  additionalComments: string;
}

interface UserSettings {
  email: string;
  fullName: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  bmi: number;
  bmr: number;
  fitnessGoal: string;
  currentFitnessLevel: string;
  dietaryPreference: string;
  updatedAt: string;
}

type DashboardView = 'overview' | 'users' | 'feedback' | 'settings' | 'meals' | 'workouts';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [users, setUsers] = useState<UserData[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadFeedbacks(),
        loadUserSettings()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, Collections.USERS));
      const snapshot = await getDocs(usersQuery);
      const userData: UserData[] = snapshot.docs.map(doc => ({
        email: doc.id,
        ...doc.data()
      } as UserData));
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadFeedbacks = async () => {
    try {
      const feedbackQuery = query(collection(db, Collections.USER_FEEDBACK), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(feedbackQuery);
      const feedbackData: FeedbackData[] = snapshot.docs.map(doc => ({
        userEmail: doc.id,
        ...doc.data()
      } as FeedbackData));
      setFeedbacks(feedbackData);
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  const loadUserSettings = async () => {
    try {
      const settingsQuery = query(collection(db, Collections.USER_SETTINGS));
      const snapshot = await getDocs(settingsQuery);
      const settingsData: UserSettings[] = snapshot.docs.map(doc => ({
        email: doc.id,
        ...doc.data()
      } as UserSettings));
      setUserSettings(settingsData);
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportFeedbackToExcel = () => {
    const formattedData = feedbacks.map(f => ({
      'User Email': f.userEmail,
      'User Name': f.userName,
      'Submitted At': new Date(f.submittedAt).toLocaleString(),
      'Reddy AI Experience': f.experienceWithReddy,
      'Diet Plan Experience': f.experienceWithDiet,
      'AI Companion Experience': f.experienceWithCompanion,
      'Workout Experience': f.experienceWithWorkout,
      'Feature Ideas': f.featureIdeas.join(', '),
      'Custom Idea': f.customFeatureIdea,
      'Suggested Feature Name': f.suggestedFeatureName,
      'Notification Frequency': f.notificationFrequency,
      'Notification Times': f.notificationTimes.join(', '),
      'Notification Types': f.notificationTypes.join(', '),
      'FitBuddy Personality': f.fitbuddyPersonality,
      'Response Style': f.fitbuddyResponseStyle,
      'Motivation Level': f.fitbuddyMotivationLevel,
      'Daily Check-in Time': f.dailyCheckInTime,
      'Most Excited Feature': f.mostExcitedFeature,
      'Suggestions': f.suggestionsForImprovement,
      'Would Recommend': f.wouldRecommend,
      'Additional Comments': f.additionalComments
    }));
    exportToExcel(formattedData, 'ReddyFit_User_Feedback');
  };

  const exportUsersToExcel = () => {
    const formattedData = users.map(u => ({
      'Email': u.email,
      'Display Name': u.displayName,
      'Created At': new Date(u.createdAt).toLocaleString(),
      'Onboarding Complete': u.onboardingCompleted ? 'Yes' : 'No',
      'Feedback Complete': u.feedbackCompleted ? 'Yes' : 'No'
    }));
    exportToExcel(formattedData, 'ReddyFit_Users');
  };

  const exportUserSettingsToExcel = () => {
    const formattedData = userSettings.map(s => ({
      'Email': s.email,
      'Full Name': s.fullName,
      'Age': s.age,
      'Gender': s.gender,
      'Weight (kg)': s.weight,
      'Height (cm)': s.height,
      'BMI': s.bmi?.toFixed(1),
      'BMR': s.bmr?.toFixed(0),
      'Fitness Goal': s.fitnessGoal,
      'Fitness Level': s.currentFitnessLevel,
      'Dietary Preference': s.dietaryPreference,
      'Updated At': new Date(s.updatedAt).toLocaleString()
    }));
    exportToExcel(formattedData, 'ReddyFit_User_Settings');
  };

  const stats = {
    totalUsers: users.length,
    completedOnboarding: users.filter(u => u.onboardingCompleted).length,
    completedFeedback: users.filter(u => u.feedbackCompleted).length,
    totalFeedbacks: feedbacks.length,
    newThisWeek: users.filter(u => {
      const date = new Date(u.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date > weekAgo;
    }).length
  };

  const filteredFeedbacks = feedbacks.filter(f =>
    f.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Overview View
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Onboarding</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedOnboarding}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Feedbacks Received</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalFeedbacks}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">New This Week</p>
              <p className="text-3xl font-bold text-purple-600">{stats.newThisWeek}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportFeedbackToExcel}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <Download className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Export Feedback</p>
              <p className="text-sm text-gray-600">Download as Excel</p>
            </div>
          </button>

          <button
            onClick={exportUsersToExcel}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Download className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Export Users</p>
              <p className="text-sm text-gray-600">Download as Excel</p>
            </div>
          </button>

          <button
            onClick={exportUserSettingsToExcel}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <Download className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Export Settings</p>
              <p className="text-sm text-gray-600">Download as Excel</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Feedback</h2>
        <div className="space-y-3">
          {feedbacks.slice(0, 5).map((feedback, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{feedback.userName || feedback.userEmail}</p>
                <p className="text-sm text-gray-600">
                  Most excited: {feedback.mostExcitedFeature}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(feedback.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedFeedback(feedback)}
                className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Feedback View
  const renderFeedbackView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Feedback ({feedbacks.length})</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={exportFeedbackToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredFeedbacks.map((feedback, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-gray-900">{feedback.userName || 'Anonymous'}</p>
                    <span className="text-sm text-gray-500">{feedback.userEmail}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Most Excited Feature</p>
                      <p className="text-sm font-medium text-gray-900">{feedback.mostExcitedFeature}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Would Recommend</p>
                      <p className="text-sm font-medium text-gray-900">{feedback.wouldRecommend}</p>
                    </div>
                  </div>

                  {feedback.customFeatureIdea && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">💡 Custom Feature Idea</p>
                      <p className="text-sm text-gray-900">{feedback.customFeatureIdea}</p>
                      {feedback.suggestedFeatureName && (
                        <p className="text-xs text-yellow-700 mt-1">Suggested name: <span className="font-semibold">{feedback.suggestedFeatureName}</span></p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(feedback.submittedAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedFeedback(feedback)}
                  className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Full
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Users View
  const renderUsersView = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Users ({users.length})</h2>
        <button
          onClick={exportUsersToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Onboarding</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{user.displayName || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">
                  {user.onboardingCompleted ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      Complete
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {user.feedbackCompleted ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                      Complete
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Settings View
  const renderSettingsView = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Settings & Profiles ({userSettings.length})</h2>
        <button
          onClick={exportUserSettingsToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userSettings.map((setting, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-900">{setting.fullName || setting.email}</p>
              <span className="text-xs text-gray-500">{setting.gender}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{setting.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BMI:</span>
                <span className="font-medium">{setting.bmi?.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BMR:</span>
                <span className="font-medium">{setting.bmr?.toFixed(0)} cal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Goal:</span>
                <span className="font-medium text-xs">{setting.fitnessGoal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Level:</span>
                <span className="font-medium text-xs">{setting.currentFitnessLevel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🛡️ Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Complete platform control & analytics</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to App
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare },
            { id: 'settings', label: 'User Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as DashboardView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                currentView === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {currentView === 'overview' && renderOverview()}
        {currentView === 'users' && renderUsersView()}
        {currentView === 'feedback' && renderFeedbackView()}
        {currentView === 'settings' && renderSettingsView()}
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedFeedback.userName}</h3>
                <p className="text-sm text-gray-600">{selectedFeedback.userEmail}</p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Feature Experience */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">Feature Experience</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Reddy AI Coach</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.experienceWithReddy}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Diet Plan</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.experienceWithDiet}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">AI Companion</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.experienceWithCompanion}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Workout Plans</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.experienceWithWorkout}</p>
                  </div>
                </div>
              </div>

              {/* Feature Ideas */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">💡 Feature Ideas</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Selected Ideas:</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedFeedback.featureIdeas.map((idea, i) => (
                      <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {idea}
                      </span>
                    ))}
                  </div>
                  {selectedFeedback.customFeatureIdea && (
                    <>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Custom Idea:</p>
                      <p className="text-sm text-gray-900 mb-2">{selectedFeedback.customFeatureIdea}</p>
                      {selectedFeedback.suggestedFeatureName && (
                        <p className="text-sm text-yellow-800 font-semibold">
                          Suggested Name: "{selectedFeedback.suggestedFeatureName}"
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">Notification Preferences</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Frequency</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.notificationFrequency}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Preferred Times</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.notificationTimes.join(', ')}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Notification Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeedback.notificationTypes.map((type, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* FitBuddy Preferences */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">FitBuddy Preferences</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Personality</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.fitbuddyPersonality}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Response Style</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.fitbuddyResponseStyle}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Motivation Level</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.fitbuddyMotivationLevel}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Daily Check-in</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.dailyCheckInTime}</p>
                  </div>
                </div>
              </div>

              {/* Final Thoughts */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">Final Thoughts</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Most Excited Feature</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.mostExcitedFeature}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Would Recommend?</p>
                    <p className="text-sm text-gray-900">{selectedFeedback.wouldRecommend}</p>
                  </div>
                  {selectedFeedback.suggestionsForImprovement && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Suggestions for Improvement</p>
                      <p className="text-sm text-gray-900">{selectedFeedback.suggestionsForImprovement}</p>
                    </div>
                  )}
                  {selectedFeedback.additionalComments && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Additional Comments</p>
                      <p className="text-sm text-gray-900">{selectedFeedback.additionalComments}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t">
                Submitted: {new Date(selectedFeedback.submittedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
