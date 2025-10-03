import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { ArrowLeft, Mail, Lock, User, CheckCircle2, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import ToastNotification from '../components/ToastNotification';
import Logo from '../components/Logo';

interface EmailSignupProps {
  onBack: () => void;
}

export default function EmailSignup({ onBack }: EmailSignupProps) {
  const { signUpWithEmail, signInWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setToast({ message: 'Please enter a valid email address', type: 'error' });
      return;
    }

    if (isSignUp) {
      if (!displayName.trim()) {
        setToast({ message: 'Please enter your name', type: 'error' });
        return;
      }

      if (password !== confirmPassword) {
        setToast({ message: 'Passwords do not match!', type: 'error' });
        return;
      }

      if (password.length < 6) {
        setToast({ message: 'Password must be at least 6 characters', type: 'error' });
        return;
      }

      if (passwordStrength < 2) {
        setToast({ message: 'Please use a stronger password', type: 'error' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        setToast({ message: '🎉 Account created! Welcome to ReddyFit!', type: 'success' });
      } else {
        await signInWithEmail(email, password);
        setToast({ message: '✨ Welcome back!', type: 'success' });
      }
      // User will be redirected automatically by AuthProvider
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Try signing in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      }
      setToast({ message: errorMessage, type: 'error' });
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-orange-600 mb-6 transition group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Login Options
          </button>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <Logo size={64} showText={false} className="mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isSignUp ? 'Join ReddyFit and start your transformation' : 'Sign in to continue your journey'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={isSignUp}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition hover:border-gray-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition hover:border-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition hover:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {isSignUp && password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password Strength:</span>
                      <span className={`text-xs font-semibold ${passwordStrength <= 1 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={isSignUp}
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition hover:border-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <div className="flex items-center mt-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Passwords do not match
                    </div>
                  )}
                </div>
              )}

              {isSignUp && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 rounded-xl">
                  <div className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">🔒 Your Privacy Matters</p>
                      <p className="text-xs">256-bit encryption • Never shared • GDPR compliant</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setPassword('');
                  setConfirmPassword('');
                  setDisplayName('');
                }}
                className="text-sm text-gray-600"
              >
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <span className="text-orange-600 font-semibold hover:underline">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </span>
              </button>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-xs text-gray-600 font-semibold">Secure</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-gray-600 font-semibold">Fast Setup</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-xs text-gray-600 font-semibold">AI Powered</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
