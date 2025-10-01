import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  Download,
  Users,
  UserPlus,
  TrendingUp,
  Trash2,
  Eye,
  X,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Calendar,
  Target
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  gender?: string;
  onboarding_completed: boolean;
  created_at: string;
  fitness_goal?: string;
  current_fitness_level?: string;
  workout_frequency?: string;
  diet_preference?: string;
  motivation?: string;
  biggest_challenge?: string;
  how_found_us?: string;
  feature_interest?: string;
  willing_to_pay?: string;
  price_range?: string;
}

interface AdminStats {
  overview: {
    total_users: number;
    completed_onboarding: number;
    new_this_week: number;
    new_this_month: number;
  };
  fitnessGoals: Array<{ fitness_goal: string; count: number }>;
  dietPreferences: Array<{ diet_preference: string; count: number }>;
  fitnessLevels: Array<{ current_fitness_level: string; count: number }>;
  paymentWillingness: Array<{ willing_to_pay: string; count: number }>;
  sources: Array<{ how_found_us: string; count: number }>;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<'table' | 'stats'>('stats');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allUsers, adminStats] = await Promise.all([
        api.getAllUsers(),
        api.getAdminStats()
      ]);
      setUsers(allUsers);
      setStats(adminStats);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteUser(userId);
      alert('User deleted successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const viewUserDetails = (user: UserProfile) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const exportToExcel = () => {
    try {
      const excelData = users.map(user => ({
        'Email': user.email,
        'Full Name': user.full_name || '',
        'Gender': user.gender || '',
        'Onboarding Completed': user.onboarding_completed ? 'Yes' : 'No',
        'Registered At': new Date(user.created_at).toLocaleString(),
        'Fitness Goal': user.fitness_goal || '',
        'Fitness Level': user.current_fitness_level || '',
        'Workout Frequency': user.workout_frequency || '',
        'Diet Preference': user.diet_preference || '',
        'Motivation': user.motivation || '',
        'Biggest Challenge': user.biggest_challenge || '',
        'How Found Us': user.how_found_us || '',
        'Features of Interest': user.feature_interest ? JSON.parse(user.feature_interest).join(', ') : '',
        'Willing to Pay': user.willing_to_pay || '',
        'Price Range': user.price_range || '',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const maxWidth = 50;
      const colWidths = Object.keys(excelData[0] || {}).map(key => ({
        wch: Math.min(
          Math.max(
            key.length,
            ...excelData.map(row => String(row[key as keyof typeof row] || '').length)
          ),
          maxWidth
        )
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Users');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reddyfit-users-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Comprehensive analytics and user management</p>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setView('stats')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === 'stats'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="inline w-5 h-5 mr-2" />
            Analytics Dashboard
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === 'table'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="inline w-5 h-5 mr-2" />
            User Management
          </button>
        </div>

        {/* Statistics View */}
        {view === 'stats' && stats && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overview.total_users}</p>
                  </div>
                  <div className="p-4 rounded-full bg-blue-100">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Onboarding</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overview.completed_onboarding}</p>
                  </div>
                  <div className="p-4 rounded-full bg-green-100">
                    <UserPlus className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.overview.total_users > 0
                    ? Math.round((stats.overview.completed_onboarding / stats.overview.total_users) * 100)
                    : 0}% completion rate
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New This Week</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overview.new_this_week}</p>
                  </div>
                  <div className="p-4 rounded-full bg-purple-100">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New This Month</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overview.new_this_month}</p>
                  </div>
                  <div className="p-4 rounded-full bg-orange-100">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fitness Goals */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Fitness Goals Distribution</h3>
                </div>
                <div className="space-y-3">
                  {stats.fitnessGoals.map((goal, index) => {
                    const total = stats.fitnessGoals.reduce((sum, g) => sum + g.count, 0);
                    const percentage = total > 0 ? (goal.count / total) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{goal.fitness_goal}</span>
                          <span className="text-gray-600">{goal.count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fitness Levels */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <Activity className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Fitness Levels</h3>
                </div>
                <div className="space-y-3">
                  {stats.fitnessLevels.map((level, index) => {
                    const total = stats.fitnessLevels.reduce((sum, l) => sum + l.count, 0);
                    const percentage = total > 0 ? (level.count / total) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{level.current_fitness_level}</span>
                          <span className="text-gray-600">{level.count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diet Preferences */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <PieChart className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Diet Preferences</h3>
                </div>
                <div className="space-y-3">
                  {stats.dietPreferences.map((diet, index) => {
                    const total = stats.dietPreferences.reduce((sum, d) => sum + d.count, 0);
                    const percentage = total > 0 ? (diet.count / total) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{diet.diet_preference}</span>
                          <span className="text-gray-600">{diet.count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Willingness */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-6 w-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Payment Willingness</h3>
                </div>
                <div className="space-y-3">
                  {stats.paymentWillingness.map((payment, index) => {
                    const total = stats.paymentWillingness.reduce((sum, p) => sum + p.count, 0);
                    const percentage = total > 0 ? (payment.count / total) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{payment.willing_to_pay}</span>
                          <span className="text-gray-600">{payment.count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* User Acquisition Sources */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">User Acquisition Sources</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.sources.map((source, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{source.count}</p>
                    <p className="text-sm text-gray-600 mt-1">{source.how_found_us}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {view === 'table' && (
          <div>
            {/* Export Button */}
            <div className="mb-6">
              <button
                onClick={exportToExcel}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download className="h-5 w-5 mr-2" />
                Export to Excel
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Onboarding
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {user.full_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {user.gender || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.onboarding_completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {user.onboarding_completed ? '✓ Completed' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center ml-3"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg mt-6">
                <Users className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No users yet</h3>
                <p className="mt-2 text-sm text-gray-500">Get started by having users sign up!</p>
              </div>
            )}
          </div>
        )}

        {/* User Detail Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 flex justify-between items-center rounded-t-2xl">
                <h2 className="text-2xl font-bold">User Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.full_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.gender || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Onboarding Status</p>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedUser.onboarding_completed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {selectedUser.onboarding_completed ? 'Completed' : 'Pending'}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedUser.onboarding_completed && (
                  <>
                    <hr className="my-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Onboarding Responses</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Fitness Goal</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.fitness_goal || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Current Fitness Level</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.current_fitness_level || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Workout Frequency</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.workout_frequency || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Diet Preference</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.diet_preference || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Motivation</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.motivation || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Biggest Challenge</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.biggest_challenge || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">How Found Us</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.how_found_us || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Features of Interest</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedUser.feature_interest
                            ? JSON.parse(selectedUser.feature_interest).join(', ')
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Willing to Pay</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.willing_to_pay || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Price Range</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.price_range || '-'}</p>
                      </div>
                    </div>
                  </>
                )}

                <hr className="my-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Registered At</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
