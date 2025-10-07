import { Link } from 'react-router-dom';
import { ArrowLeft, User, Settings } from 'lucide-react';
import PrivacyForm from '../components/Profile/PrivacyForm';
import QRBadge from '../components/Profile/QRBadge';
import { useAuth } from '../components/AuthProvider';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Navigation */}
        <Link
          to="/scan-dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900">Profile & Privacy</h1>
          </div>
          <p className="text-gray-600">
            Manage your public profile and control what others can see
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.displayName || 'ReddyFit User'}
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Privacy Settings */}
          <PrivacyForm />

          {/* QR Badge */}
          <QRBadge />
        </div>

        {/* Additional Settings Section */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
          </div>

          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <p className="font-medium text-gray-900">Notification Preferences</p>
              <p className="text-sm text-gray-600">Manage scan reminders and updates</p>
            </button>

            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <p className="font-medium text-gray-900">Data Export</p>
              <p className="text-sm text-gray-600">Download your scan history and data</p>
            </button>

            <button className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition text-red-600">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm">Permanently delete your account and all data</p>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-semibold text-blue-900 mb-2">📱 How to Use Your QR Code</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Download and print your QR code to share with trainers or friends</li>
            <li>• Set your privacy preferences before sharing</li>
            <li>• Rotate your QR code anytime to revoke access</li>
            <li>• Preview your public profile to see what others will see</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
