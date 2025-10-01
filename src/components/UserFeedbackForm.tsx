import React, { useState } from 'react';
import {
  ArrowRight,
  Lightbulb,
  Bell,
  Heart,
  Star,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Clock,
  User,
  Mail
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db, Collections } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface FeedbackData {
  // User Experience
  experienceWithReddy: string;
  experienceWithDiet: string;
  experienceWithCompanion: string;
  experienceWithWorkout: string;

  // Feature Ideas
  featureIdeas: string[];
  customFeatureIdea: string;
  suggestedFeatureName: string;

  // Notification Preferences
  notificationFrequency: string;
  notificationTimes: string[];
  notificationTypes: string[];

  // FitBuddy Behavior
  fitbuddyPersonality: string;
  fitbuddyResponseStyle: string;
  fitbuddyMotivationLevel: string;
  dailyCheckInTime: string;

  // Additional Feedback
  mostExcitedFeature: string;
  suggestionsForImprovement: string;
  wouldRecommend: string;
  additionalComments: string;
}

interface UserFeedbackFormProps {
  onComplete: () => void;
}

export default function UserFeedbackForm({ onComplete }: UserFeedbackFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [submitting, setSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackData>({
    experienceWithReddy: '',
    experienceWithDiet: '',
    experienceWithCompanion: '',
    experienceWithWorkout: '',
    featureIdeas: [],
    customFeatureIdea: '',
    suggestedFeatureName: '',
    notificationFrequency: '',
    notificationTimes: [],
    notificationTypes: [],
    fitbuddyPersonality: '',
    fitbuddyResponseStyle: '',
    fitbuddyMotivationLevel: '',
    dailyCheckInTime: '',
    mostExcitedFeature: '',
    suggestionsForImprovement: '',
    wouldRecommend: '',
    additionalComments: ''
  });

  const handleCheckboxChange = (field: keyof FeedbackData, value: string) => {
    const currentValues = feedback[field] as string[];
    if (currentValues.includes(value)) {
      setFeedback({
        ...feedback,
        [field]: currentValues.filter(v => v !== value)
      });
    } else {
      setFeedback({
        ...feedback,
        [field]: [...currentValues, value]
      });
    }
  };

  const handleSubmit = async () => {
    if (!user?.email) {
      alert('User not authenticated. Please sign in again.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Starting feedback submission for:', user.email);
      console.log('Feedback data:', feedback);

      // Save feedback to user_feedback collection
      const feedbackRef = doc(db, Collections.USER_FEEDBACK, user.email);
      console.log('Saving feedback to:', Collections.USER_FEEDBACK);

      await setDoc(feedbackRef, {
        ...feedback,
        userEmail: user.email,
        userName: user.displayName || user.email,
        submittedAt: new Date().toISOString(),
        version: '1.0'
      });

      console.log('Feedback saved successfully');

      // Mark feedback as complete in users collection
      const userRef = doc(db, Collections.USERS, user.email);
      console.log('Updating user document in:', Collections.USERS);

      await setDoc(userRef, {
        feedbackCompleted: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('User document updated successfully');
      alert('Thank you! Your feedback has been submitted successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 'permission-denied') {
        alert('Permission denied. Firebase security rules need to be configured.\n\nPlease contact the administrator to enable write access to Firestore.');
      } else if (error.code === 'unavailable') {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        alert(`Failed to submit feedback: ${error.message}\n\nPlease try again or contact support.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return feedback.experienceWithReddy && feedback.experienceWithDiet &&
               feedback.experienceWithCompanion && feedback.experienceWithWorkout;
      case 2:
        return feedback.featureIdeas.length > 0 || feedback.customFeatureIdea;
      case 3:
        return feedback.notificationFrequency && feedback.notificationTimes.length > 0;
      case 4:
        return feedback.fitbuddyPersonality && feedback.fitbuddyResponseStyle;
      case 5:
        return feedback.mostExcitedFeature;
      default:
        return false;
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-orange-600">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Experience with Features */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Sparkles className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ReddyFit! 🎉</h2>
                <p className="text-gray-600">
                  We'd love to hear your thoughts on each feature. Your feedback shapes the platform!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How do you want Reddy AI Coach to help you?
                  </label>
                  <textarea
                    value={feedback.experienceWithReddy}
                    onChange={(e) => setFeedback({ ...feedback, experienceWithReddy: e.target.value })}
                    rows={3}
                    placeholder="e.g., Quick workout advice, meal analysis, daily motivation..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would make Diet Plan perfect for you?
                  </label>
                  <textarea
                    value={feedback.experienceWithDiet}
                    onChange={(e) => setFeedback({ ...feedback, experienceWithDiet: e.target.value })}
                    rows={3}
                    placeholder="e.g., Barcode scanning, restaurant menu tracking, meal reminders..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you expect from your AI Companion?
                  </label>
                  <textarea
                    value={feedback.experienceWithCompanion}
                    onChange={(e) => setFeedback({ ...feedback, experienceWithCompanion: e.target.value })}
                    rows={3}
                    placeholder="e.g., Daily check-ins, workout accountability, celebrating wins together..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What workout features would you love to see?
                  </label>
                  <textarea
                    value={feedback.experienceWithWorkout}
                    onChange={(e) => setFeedback({ ...feedback, experienceWithWorkout: e.target.value })}
                    rows={3}
                    placeholder="e.g., Video demonstrations, custom routines, rest timers, form checking..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Feature Ideas */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Ideas Matter!</h2>
                <p className="text-gray-600">
                  We'll seriously consider every suggestion. The best ideas get built AND named by you!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What features would you love to see? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Progress Photos Timeline',
                      'Recipe Suggestions',
                      'Workout Music Integration',
                      'Social Challenges',
                      'Body Measurement Tracker',
                      'Habit Streaks',
                      'Meditation & Mindfulness',
                      'Sleep Tracking',
                      'Water Reminder',
                      'Macro Meal Planner',
                      'Supplement Tracking',
                      'Virtual Personal Trainer'
                    ].map(idea => (
                      <label key={idea} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={feedback.featureIdeas.includes(idea)}
                          onChange={() => handleCheckboxChange('featureIdeas', idea)}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{idea}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💡 Got a unique idea? Tell us!
                  </label>
                  <textarea
                    value={feedback.customFeatureIdea}
                    onChange={(e) => setFeedback({ ...feedback, customFeatureIdea: e.target.value })}
                    rows={4}
                    placeholder="Describe your feature idea in detail. Be creative! We're listening..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {feedback.customFeatureIdea && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎯 What should we name this feature?
                    </label>
                    <input
                      type="text"
                      value={feedback.suggestedFeatureName}
                      onChange={(e) => setFeedback({ ...feedback, suggestedFeatureName: e.target.value })}
                      placeholder="Your suggested name (we might use it!)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-xs text-orange-600 mt-1">
                      ✨ If we build this, we'll credit you and use your name!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Notification Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Bell className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Stay Connected</h2>
                <p className="text-gray-600">
                  How would you like us to keep you motivated?
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Frequency
                  </label>
                  <select
                    value={feedback.notificationFrequency}
                    onChange={(e) => setFeedback({ ...feedback, notificationFrequency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select frequency...</option>
                    <option value="minimal">Minimal (1-2 per day)</option>
                    <option value="moderate">Moderate (3-5 per day)</option>
                    <option value="active">Active (Multiple throughout day)</option>
                    <option value="custom">Custom Schedule</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Best times for notifications
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      'Early Morning (6-8 AM)',
                      'Morning (8-10 AM)',
                      'Midday (12-2 PM)',
                      'Afternoon (3-5 PM)',
                      'Evening (6-8 PM)',
                      'Night (8-10 PM)'
                    ].map(time => (
                      <label key={time} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-orange-50">
                        <input
                          type="checkbox"
                          checked={feedback.notificationTimes.includes(time)}
                          onChange={() => handleCheckboxChange('notificationTimes', time)}
                          className="w-4 h-4 text-orange-600"
                        />
                        <span className="text-xs">{time}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What type of notifications do you want?
                  </label>
                  <div className="space-y-2">
                    {[
                      'Daily motivational quotes',
                      'Workout reminders',
                      'Meal logging reminders',
                      'Water intake reminders',
                      'Progress updates',
                      'Achievement celebrations',
                      'Companion messages',
                      'Weekly summary reports',
                      'Community challenges',
                      'Tips and educational content'
                    ].map(type => (
                      <label key={type} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-orange-50">
                        <input
                          type="checkbox"
                          checked={feedback.notificationTypes.includes(type)}
                          onChange={() => handleCheckboxChange('notificationTypes', type)}
                          className="w-4 h-4 text-orange-600"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: FitBuddy Behavior */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Heart className="w-12 h-12 text-pink-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Design Your FitBuddy</h2>
                <p className="text-gray-600">
                  How should your AI companion interact with you?
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FitBuddy Personality
                  </label>
                  <select
                    value={feedback.fitbuddyPersonality}
                    onChange={(e) => setFeedback({ ...feedback, fitbuddyPersonality: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select personality...</option>
                    <option value="cheerful">Cheerful & Energetic 🎉</option>
                    <option value="calm">Calm & Supportive 🧘</option>
                    <option value="tough">Tough Love Coach 💪</option>
                    <option value="funny">Funny & Lighthearted 😄</option>
                    <option value="professional">Professional & Informative 📊</option>
                    <option value="friend">Best Friend Vibes 🤝</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Style
                  </label>
                  <select
                    value={feedback.fitbuddyResponseStyle}
                    onChange={(e) => setFeedback({ ...feedback, fitbuddyResponseStyle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select style...</option>
                    <option value="brief">Brief & To the Point</option>
                    <option value="detailed">Detailed Explanations</option>
                    <option value="conversational">Conversational & Friendly</option>
                    <option value="scientific">Scientific & Data-Driven</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivation Level
                  </label>
                  <select
                    value={feedback.fitbuddyMotivationLevel}
                    onChange={(e) => setFeedback({ ...feedback, fitbuddyMotivationLevel: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select level...</option>
                    <option value="gentle">Gentle Encouragement</option>
                    <option value="moderate">Balanced Push</option>
                    <option value="intense">Intense Motivation</option>
                    <option value="aggressive">Aggressive Challenge Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Daily Check-in Time
                  </label>
                  <input
                    type="time"
                    value={feedback.dailyCheckInTime}
                    onChange={(e) => setFeedback({ ...feedback, dailyCheckInTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">When should FitBuddy check in with you daily?</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Final Thoughts */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Almost Done!</h2>
                <p className="text-gray-600">
                  Just a few more questions to make your experience perfect
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which feature are you most excited about?
                  </label>
                  <select
                    value={feedback.mostExcitedFeature}
                    onChange={(e) => setFeedback({ ...feedback, mostExcitedFeature: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select feature...</option>
                    <option value="reddy">Reddy AI Coach</option>
                    <option value="diet">Diet Plan Tracking</option>
                    <option value="companion">AI Companion Matching</option>
                    <option value="workout">Workout Plans (Coming Soon)</option>
                    <option value="all">All of them!</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Any suggestions for improvement?
                  </label>
                  <textarea
                    value={feedback.suggestionsForImprovement}
                    onChange={(e) => setFeedback({ ...feedback, suggestionsForImprovement: e.target.value })}
                    rows={3}
                    placeholder="What could we do better?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Would you recommend ReddyFit to a friend?
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'definitely', label: 'Definitely!', emoji: '🎉' },
                      { value: 'probably', label: 'Probably', emoji: '👍' },
                      { value: 'maybe', label: 'Maybe', emoji: '🤔' },
                      { value: 'not_yet', label: 'Not Yet', emoji: '⏰' }
                    ].map(option => (
                      <label key={option.value} className="flex-1">
                        <input
                          type="radio"
                          name="recommend"
                          value={option.value}
                          checked={feedback.wouldRecommend === option.value}
                          onChange={(e) => setFeedback({ ...feedback, wouldRecommend: e.target.value })}
                          className="sr-only"
                        />
                        <div className={`p-3 border-2 rounded-lg text-center cursor-pointer transition-all ${
                          feedback.wouldRecommend === option.value
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}>
                          <div className="text-2xl mb-1">{option.emoji}</div>
                          <div className="text-xs font-medium">{option.label}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anything else you'd like to share?
                  </label>
                  <textarea
                    value={feedback.additionalComments}
                    onChange={(e) => setFeedback({ ...feedback, additionalComments: e.target.value })}
                    rows={4}
                    placeholder="We read every single comment! ❤️"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete & Start Your Journey!
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
