import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { ArrowLeft, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import ToastNotification from '../components/ToastNotification';

interface EmailSignupProps {
  onBack: () => void;
}

export default function EmailSignup({ onBack }: EmailSignupProps) {
  const { signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match!', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password);
      setToast({ message: '🎉 Account created! Welcome to ReddyFit!', type: 'success' });
      // User will be redirected automatically by AuthProvider
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-6">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-orange-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login Options
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600 mt-2">Join ReddyFit and start your transformation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Your data is encrypted and secure. We never share your information.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <button onClick={onBack} className="text-orange-600 font-semibold hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
