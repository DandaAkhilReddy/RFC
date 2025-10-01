import React, { useState } from 'react';
import {
  Bot,
  Heart,
  Camera,
  MessageCircle,
  Activity,
  TrendingUp,
  Users,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db, Collections } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { calculateWaitlistNumber } from '../lib/functions/waitlist';

interface FeedbackData {
  selectedFeatures: string[];
  additionalComments: string;
}

interface UserFeedbackFormProps {
  onComplete: () => void;
}

export default function UserFeedbackForm({ onComplete }: UserFeedbackFormProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    selectedFeatures: [],
    additionalComments: ''
  });

  const features = [
    {
      id: 'reddy-ai',
      name: 'Agent Reddy',
      description: 'Personal AI fitness coach with chat & voice help',
      icon: Bot,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'fitbuddy-ai',
      name: 'Agent FitBuddy',
      description: 'Image analysis & body fat calculator - Once/week, 10min processing',
      icon: Camera,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'cupid-ai',
      name: 'Agent Cupid',
      description: 'Smart fitness partner matching',
      icon: Heart,
      gradient: 'from-pink-500 to-purple-500'
    },
    {
      id: 'photo-analysis',
      name: 'Photo Analysis',
      description: 'AI-powered body composition analysis',
      icon: Camera,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'body-fat-calc',
      name: 'Body Fat Calculator',
      description: 'Accurate body metrics & composition',
      icon: Activity,
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'progress-tracking',
      name: 'Progress Tracking',
      description: 'Visual transformation journey tracking',
      icon: TrendingUp,
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'community',
      name: 'Community & Groups',
      description: 'Connect with fitness enthusiasts',
      icon: Users,
      gradient: 'from-violet-500 to-purple-500'
    }
  ];

  const toggleFeature = (featureId: string) => {
    if (feedback.selectedFeatures.includes(featureId)) {
      setFeedback({
        ...feedback,
        selectedFeatures: feedback.selectedFeatures.filter(id => id !== featureId)
      });
    } else {
      setFeedback({
        ...feedback,
        selectedFeatures: [...feedback.selectedFeatures, featureId]
      });
    }
  };

  const handleSubmit = async () => {
    if (!user?.email) {
      console.error('[UserFeedbackForm] No user email found');
      alert('❌ User not authenticated. Please sign in again.');
      return;
    }

    setSubmitting(true);
    console.log('[UserFeedbackForm] Starting feedback submission for:', user.email);

    try {
      // Step 1: Calculate waitlist number
      console.log('[UserFeedbackForm] Step 1: Calculating waitlist number...');
      const waitlistNumber = await calculateWaitlistNumber();
      console.log('[UserFeedbackForm] Waitlist number calculated:', waitlistNumber);

      // Step 2: Save feedback to user_feedback collection
      console.log('[UserFeedbackForm] Step 2: Saving feedback to Firestore...');
      const feedbackRef = doc(db, Collections.USER_FEEDBACK, user.email);
      await setDoc(feedbackRef, {
        selectedFeatures: feedback.selectedFeatures,
        additionalComments: feedback.additionalComments,
        userEmail: user.email,
        userName: user.displayName || user.email,
        submittedAt: new Date().toISOString(),
        waitlistNumber: waitlistNumber,
        version: '2.0'
      });
      console.log('[UserFeedbackForm] Feedback saved to user_feedback collection');

      // Step 3: Update user document - CRITICAL: mark both flags as true
      console.log('[UserFeedbackForm] Step 3: Updating user document...');
      const userRef = doc(db, Collections.USERS, user.email);
      await setDoc(userRef, {
        feedbackCompleted: true,
        onboardingCompleted: true,
        waitlistNumber: waitlistNumber,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('[UserFeedbackForm] User document updated successfully');

      // Step 4: Verify the update
      console.log('[UserFeedbackForm] Step 4: Verifying user document update...');
      const verifyDoc = await getDoc(userRef);
      if (verifyDoc.exists()) {
        const verifyData = verifyDoc.data();
        console.log('[UserFeedbackForm] Verification - User document state:', {
          feedbackCompleted: verifyData.feedbackCompleted,
          onboardingCompleted: verifyData.onboardingCompleted,
          waitlistNumber: verifyData.waitlistNumber
        });

        if (verifyData.feedbackCompleted !== true || verifyData.onboardingCompleted !== true) {
          throw new Error('Failed to update user completion flags in Firestore');
        }
      } else {
        throw new Error('User document not found after update');
      }

      console.log('[UserFeedbackForm] ✅ All steps completed successfully');

      // Show success message
      alert(`🎉 CONGRATULATIONS! 🎉\n\n✅ Your feedback has been submitted!\n\nGet ready to transform your fitness journey! 💪`);

      // Trigger callback to update AppRouter state
      console.log('[UserFeedbackForm] Calling onComplete callback...');
      onComplete();
    } catch (error: any) {
      console.error('[UserFeedbackForm] ❌ Error submitting feedback:', error);
      console.error('[UserFeedbackForm] Error code:', error.code);
      console.error('[UserFeedbackForm] Error message:', error.message);
      console.error('[UserFeedbackForm] Error stack:', error.stack);

      // Enterprise-grade error handling with specific messages
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please ensure you are signed in and Firebase security rules are configured correctly.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication error. Please sign out and sign in again.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      alert(`❌ Failed to submit feedback\n\n${errorMessage}\n\nPlease try again or contact support if the problem persists.`);

      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to ReddyFit! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Which features are you most excited about?
          </p>
          <p className="text-sm text-gray-500">
            Select all that interest you (optional)
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => {
            const isSelected = feedback.selectedFeatures.includes(feature.id);

            return (
              <div
                key={feature.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => toggleFeature(feature.id)}
                  className={`w-full text-left bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
                    isSelected
                      ? 'border-orange-500 ring-4 ring-orange-100 scale-105'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {feature.name}
                        </h3>
                        {isSelected && (
                          <CheckCircle2 className="w-6 h-6 text-orange-600 animate-scale-in" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Comments */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8 animate-slide-up" style={{ animationDelay: '700ms' }}>
          <label className="block text-lg font-bold text-gray-900 mb-3">
            Any suggestions or ideas? (Optional)
          </label>
          <textarea
            value={feedback.additionalComments}
            onChange={(e) => setFeedback({ ...feedback, additionalComments: e.target.value })}
            rows={4}
            placeholder="Share your thoughts, feature requests, or any feedback you have for us..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Selected Count */}
        {feedback.selectedFeatures.length > 0 && (
          <div className="text-center mb-6 animate-fade-in">
            <p className="text-gray-600">
              You've selected <span className="font-bold text-orange-600">{feedback.selectedFeatures.length}</span> feature{feedback.selectedFeatures.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center animate-slide-up" style={{ animationDelay: '800ms' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {submitting ? (
              <>
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Start Your Fitness Journey
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            All fields are optional • Skip to continue anytime
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
