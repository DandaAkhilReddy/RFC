interface ProgressCardProps {
  icon: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  color: 'orange' | 'blue' | 'green' | 'purple';
}

export default function ProgressCard({ icon, label, current, target, unit, color }: ProgressCardProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);
  const isOver = current > target;

  const colorClasses = {
    orange: {
      bg: 'from-orange-500 to-red-500',
      text: 'text-orange-600',
      border: 'border-orange-300',
      progress: 'bg-gradient-to-r from-orange-400 to-red-400'
    },
    blue: {
      bg: 'from-blue-500 to-cyan-500',
      text: 'text-blue-600',
      border: 'border-blue-300',
      progress: 'bg-gradient-to-r from-blue-400 to-cyan-400'
    },
    green: {
      bg: 'from-green-500 to-emerald-500',
      text: 'text-green-600',
      border: 'border-green-300',
      progress: 'bg-gradient-to-r from-green-400 to-emerald-400'
    },
    purple: {
      bg: 'from-purple-500 to-pink-500',
      text: 'text-purple-600',
      border: 'border-purple-300',
      progress: 'bg-gradient-to-r from-purple-400 to-pink-400'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`bg-white border-2 ${colors.border} rounded-2xl p-4 shadow-md hover:shadow-xl transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-gray-700 text-sm">{label}</span>
        </div>
        <div className={`text-xs font-bold ${colors.text}`}>
          {Math.round(percentage)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.progress} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Numbers */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className={`text-2xl font-bold ${colors.text}`}>
            {Math.round(current)}
          </div>
          <div className="text-xs text-gray-500">Current</div>
        </div>

        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-gray-400">
            {target}
          </div>
          <div className="text-xs text-gray-500">Goal</div>
        </div>

        <div className="text-center flex-1">
          <div className={`text-2xl font-bold ${isOver ? 'text-red-500' : colors.text}`}>
            {isOver ? `+${Math.round(current - target)}` : Math.round(remaining)}
          </div>
          <div className="text-xs text-gray-500">{isOver ? 'Over' : 'Left'}</div>
        </div>
      </div>

      {/* Unit Label */}
      <div className="text-center mt-2">
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
    </div>
  );
}
