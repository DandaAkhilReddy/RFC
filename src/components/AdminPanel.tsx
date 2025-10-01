import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Download, Users, UserPlus, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BlobServiceClient } from '@azure/storage-blob';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  gender?: string;
  onboarding_completed: boolean;
  created_at: string;
  // Onboarding fields (from JOIN)
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

export default function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    completedOnboarding: 0,
    newThisWeek: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch all users with onboarding data
      const allUsers = await api.getAllUsers();
      setUsers(allUsers);

      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setStats({
        totalUsers: allUsers.length,
        completedOnboarding: allUsers.filter(u => u.onboarding_completed).length,
        newThisWeek: allUsers.filter(u => new Date(u.created_at) > weekAgo).length,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      // Prepare data for Excel
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

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
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

      // Generate buffer
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Upload to Azure Blob Storage if credentials are available
      const azureConnectionString = import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING;
      const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER_NAME || 'reddyfit-exports';

      if (azureConnectionString) {
        try {
          const blobServiceClient = BlobServiceClient.fromConnectionString(azureConnectionString);
          const containerClient = blobServiceClient.getContainerClient(containerName);

          // Create container if it doesn't exist
          await containerClient.createIfNotExists({ access: 'blob' });

          const fileName = `reddyfit-users-${new Date().toISOString().split('T')[0]}.xlsx`;
          const blockBlobClient = containerClient.getBlockBlobClient(fileName);

          await blockBlobClient.uploadData(blob, {
            blobHTTPHeaders: { blobContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
          });

          alert(`File successfully uploaded to Azure Blob Storage: ${fileName}`);
        } catch (azureError) {
          console.error('Error uploading to Azure:', azureError);
          // Fall back to local download
          downloadLocally(blob);
        }
      } else {
        // Download locally if no Azure credentials
        downloadLocally(blob);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const downloadLocally = (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reddyfit-users-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">Manage and view all registered users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Onboarding</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedOnboarding}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New This Week</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.newThisWeek}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mb-6">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Download className="h-5 w-5 mr-2" />
            Export to Excel
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Onboarding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.full_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.gender || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.onboarding_completed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.onboarding_completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by having users sign up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
