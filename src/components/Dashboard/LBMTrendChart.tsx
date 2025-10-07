import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { getTrendData } from '../../lib/firestore/scans';
import { useAuth } from '../AuthProvider';

interface ChartDataPoint {
  date: string;
  displayDate: string;
  lbm: number | null;
}

export default function LBMTrendChart() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<14 | 30>(14);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadChartData();
  }, [user, period]);

  const loadChartData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const trendData = await getTrendData(user.uid, period);

      const data: ChartDataPoint[] = trendData.dates.map((date, idx) => ({
        date,
        displayDate: formatDateShort(date),
        lbm: trendData.lbms[idx],
      }));

      setChartData(data);
    } catch (error) {
      console.error('Failed to load LBM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateShort = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0 || chartData.every(d => d.lbm === null)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lean Body Mass (LBM)</h3>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Activity className="w-12 h-12 mb-2 opacity-30" />
          <p>No LBM data yet</p>
          <p className="text-sm mt-1">LBM is calculated when you enter weight</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Lean Body Mass (LBM)</h3>

        {/* Period selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod(14)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === 14
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === 30
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="displayDate"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 5', 'dataMax + 5']}
            tickFormatter={(value) => `${value.toFixed(0)} lb`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number) => [`${value.toFixed(1)} lb`, 'LBM']}
          />
          <Line
            type="monotone"
            dataKey="lbm"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ fill: '#06b6d4', r: 4 }}
            activeDot={{ r: 6 }}
            name="Lean Mass"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Info */}
      <div className="mt-4 p-3 bg-cyan-50 rounded-lg">
        <p className="text-xs text-cyan-900">
          <strong>LBM = Weight × (1 - Body Fat %)</strong> — Tracks muscle retention during fat loss.
          Goal: Keep LBM stable or increasing!
        </p>
      </div>
    </div>
  );
}
