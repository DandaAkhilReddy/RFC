import { TrendingUp, AlertTriangle, Info, Trophy } from 'lucide-react';

interface InsightCardProps {
  type: 'success' | 'warning' | 'info' | 'achievement';
  icon: string;
  title: string;
  message: string;
}

export default function InsightCard({ type, icon, title, message }: InsightCardProps) {
  // Color schemes for different insight types
  const getCardStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 text-green-900';
      case 'warning':
        return 'bg-gradient-to-br from-orange-50 to-yellow-100 border-orange-300 text-orange-900';
      case 'info':
        return 'bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-300 text-blue-900';
      case 'achievement':
        return 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-300 text-purple-900';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-900';
    }
  };

  const getIconComponent = () => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={`border-2 rounded-xl p-4 transition-all hover:shadow-lg hover:scale-105 ${getCardStyle()}`}>
      <div className="flex items-start space-x-3">
        {/* Emoji Icon */}
        <div className="text-3xl flex-shrink-0">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-bold text-sm">{title}</h4>
            {getIconComponent()}
          </div>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}
