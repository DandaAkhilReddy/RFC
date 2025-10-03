import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function ToastNotification({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <AlertCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${styles[type]} px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 animate-slide-in-right max-w-md`}>
      {icons[type]}
      <p className="flex-1 font-semibold">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
