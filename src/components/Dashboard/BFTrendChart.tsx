import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { getTrendData } from '../../lib/firestore/scans';
import { useAuth } from '../AuthProvider';

interface ChartDataPoint {
  date: string;
  displayDate: string;
  bfPercent: number | null;
  lbm: number | null;
}

export default function BFTrendChart() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<14 | 30>(14);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

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
        bfPercent: trendData.bfPercents[idx] ? trendData.bfPercents[idx]! * 100 : null,
        lbm: trendData.lbms[idx],
      }));

      setChartData(data);

      // Calculate trend
      const validBF = data.filter(d => d.bfPercent !== null).map(d => d.bfPercent!);
      if (validBF.length >= 2) {
        const first = validBF[0];
        const last = validBF[validBF.length - 1];
        const change = last - first;

        if (change < -0.3) {
          setTrend('down');
        } else if (change > 0.3) {
          setTrend('up');
        } else {
          setTrend('stable');
        }
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
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
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Fat % Trend</h3>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <TrendingDown className="w-12 h-12 mb-2 opacity-30" />
          <p>No scan data yet</p>
          <p className="text-sm mt-1">Complete your first daily scan to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Body Fat % Trend</h3>
          {trend === 'down' && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>Decreasing</span>
            </div>
          )}
          {trend === 'up' && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Increasing</span>
            </div>
          )}
        </div>

        {/* Period selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod(14)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === 14
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === 30
                ? 'bg-orange-500 text-white'
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
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Body Fat']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="bfPercent"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: '#f97316', r: 4 }}
            activeDot={{ r: 6 }}
            name="Body Fat %"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
