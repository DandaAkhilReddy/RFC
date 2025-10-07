import { useState, useEffect } from 'react';
import { Shield, Save, Loader } from 'lucide-react';
import { getUserProfile, updateUserPrivacy } from '../../lib/firestore/users';
import { useAuth } from '../AuthProvider';
import type { PrivacySettings } from '../../types/scan';

export default function PrivacyForm() {
  const { user } = useAuth();
  const [privacy, setPrivacy] = useState<PrivacySettings['allowedFields']>({
    showWeek: true,
    showBfTrend: true,
    showWeight: false,
    showLastInsight: true,
    showBadges: true,
    showLBM: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    loadPrivacySettings();
  }, [user]);

  const loadPrivacySettings = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const profile = await getUserProfile(user.uid);
      if (profile?.privacy?.allowedFields) {
        setPrivacy(profile.privacy.allowedFields);
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof PrivacySettings['allowedFields']) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaveMessage('');

    try {
      await updateUserPrivacy(user.uid, privacy);
      setSaveMessage('Privacy settings saved!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      setSaveMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-orange-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">QR Profile Privacy</h3>
          <p className="text-sm text-gray-600">Control what others see on your public profile</p>
        </div>
      </div>

      {/* Privacy Toggles */}
      <div className="space-y-4">
        {/* Body Fat Trend */}
        <label className="flex items-center justify-between cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">Show Body Fat Trend</p>
            <p className="text-sm text-gray-500">Display BF% chart on public profile</p>
          </div>
          <input
            type="checkbox"
            checked={privacy.showBfTrend}
            onChange={() => handleToggle('showBfTrend')}
            className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
          />
        </label>

        {/* Weight */}
        <label className="flex items-center justify-between cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">Show Weight</p>
            <p className="text-sm text-gray-500">Display current weight on public profile</p>
          </div>
          <input
            type="checkbox"
            checked={privacy.showWeight}
            onChange={() => handleToggle('showWeight')}
            className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
          />
        </label>

        {/* Lean Body Mass */}
        <label className="flex items-center justify-between cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">Show Lean Body Mass</p>
            <p className="text-sm text-gray-500">Display LBM on public profile</p>
          </div>
          <input
            type="checkbox"
            checked={privacy.showLBM}
            onChange={() => handleToggle('showLBM')}
            className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
          />
        </label>

        {/* Last Insight */}
        <label className="flex items-center justify-between cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">Show Last Insight</p>
            <p className="text-sm text-gray-500">Display latest AI-generated insight</p>
          </div>
          <input
            type="checkbox"
            checked={privacy.showLastInsight}
            onChange={() => handleToggle('showLastInsight')}
            className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
          />
        </label>

        {/* Badges */}
        <label className="flex items-center justify-between cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">Show Badges</p>
            <p className="text-sm text-gray-500">Display streak and achievement badges</p>
          </div>
          <input
            type="checkbox"
            checked={privacy.showBadges}
            onChange={() => handleToggle('showBadges')}
            className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
          />
        </label>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Privacy Settings
            </>
          )}
        </button>

        {saveMessage && (
          <p
            className={`text-sm text-center mt-2 ${
              saveMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {saveMessage}
          </p>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 Your public profile is accessible via QR code. Only selected information will be visible to others.
        </p>
      </div>
    </div>
  );
}
