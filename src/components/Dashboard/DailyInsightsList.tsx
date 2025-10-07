import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { getScanHistory } from '../../lib/firestore/scans';
import { useAuth } from '../AuthProvider';
import type { Scan } from '../../types/scan';

export default function DailyInsightsList() {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadInsights();
  }, [user]);

  const loadInsights = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Get last 7 scans
      const scanHistory = await getScanHistory(user.uid, 7);
      setScans(scanHistory);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getIconForFlag = (flags: ('ok' | 'warning' | 'danger')[]) => {
    if (flags.includes('danger')) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    } else if (flags.includes('warning')) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    } else {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const getBorderColorForFlag = (flags: ('ok' | 'warning' | 'danger')[]) => {
    if (flags.includes('danger')) {
      return 'border-red-200 bg-red-50';
    } else if (flags.includes('warning')) {
      return 'border-yellow-200 bg-yellow-50';
    } else {
      return 'border-green-200 bg-green-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Insights</h3>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Sparkles className="w-12 h-12 mb-2 opacity-30" />
          <p>No insights yet</p>
          <p className="text-sm mt-1">Complete daily scans to receive AI-powered insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900">Daily Insights</h3>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {scans.map((scan) => (
          <div
            key={scan.id}
            className={`border-2 rounded-lg p-4 transition hover:shadow-md ${
              scan.insight ? getBorderColorForFlag(scan.insight.flags) : 'border-gray-200 bg-gray-50'
            }`}
          >
            {/* Date & Icon */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {formatDate(scan.date)}
                </span>
              </div>

              {scan.insight && getIconForFlag(scan.insight.flags)}
            </div>

            {/* Insight Content */}
            {scan.insight ? (
              <div className="prose prose-sm max-w-none text-gray-800">
                <div
                  dangerouslySetInnerHTML={{
                    __html: scan.insight.summary.replace(/\n\n/g, '<br />'),
                  }}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Processing insights...</p>
            )}

            {/* Metrics Summary */}
            <div className="mt-3 flex gap-4 text-xs text-gray-600">
              {scan.bfPercent !== null && (
                <span>
                  <strong>BF:</strong> {(scan.bfPercent * 100).toFixed(1)}%
                </span>
              )}
              {scan.lbmLb !== null && (
                <span>
                  <strong>LBM:</strong> {scan.lbmLb.toFixed(1)} lb
                </span>
              )}
              {scan.weightLb !== null && (
                <span>
                  <strong>Weight:</strong> {scan.weightLb.toFixed(1)} lb
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* See More */}
      {scans.length >= 7 && (
        <button className="mt-4 w-full py-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
          View All Insights →
        </button>
      )}
    </div>
  );
}
