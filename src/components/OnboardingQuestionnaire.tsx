import { useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from './AuthProvider';

export default function OnboardingQuestionnaire({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male' as 'male' | 'female',
    fitnessGoal: '',
    currentLevel: '',
    workoutFrequency: '',
    dietPreference: '',
    motivation: '',
    biggestChallenge: '',
    howFoundUs: '',
    featureInterest: [] as string[],
    willingToPay: '',
    priceRange: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    setIsSubmitting(true);

    try {
      // Update user profile
      await api.upsertUserProfile({
        email: user.email,
        firebase_uid: user.uid,
        full_name: formData.fullName,
        gender: formData.gender,
        avatar_url: user.photoURL || '',
      });

      // Submit onboarding responses
      await api.submitOnboarding({
        email: user.email,
        fitness_goal: formData.fitnessGoal,
        current_fitness_level: formData.currentLevel,
        workout_frequency: formData.workoutFrequency,
        diet_preference: formData.dietPreference,
        motivation: formData.motivation,
        biggest_challenge: formData.biggestChallenge,
        how_found_us: formData.howFoundUs,
        feature_interest: formData.featureInterest,
        willing_to_pay: formData.willingToPay,
        price_range: formData.priceRange,
      });

      onComplete();
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert('Error saving your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      featureInterest: prev.featureInterest.includes(feature)
        ? prev.featureInterest.filter(f => f !== feature)
        : [...prev.featureInterest, feature]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-orange-600" />
              <h1 className="text-4xl font-bold">Welcome to ReddyFit Club!</h1>
            </div>
            <p className="text-gray-600">Help us personalize your fitness transformation journey</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Step {step} of 3</span>
              <span className="text-sm font-semibold text-orange-600">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a... *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'male' })}
                      className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                        formData.gender === 'male'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Man
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'female' })}
                      className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                        formData.gender === 'female'
                          ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Woman
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Fitness Goal *</label>
                  <select
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                  >
                    <option value="">Select your goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="general_fitness">General Fitness</option>
                    <option value="athletic_performance">Athletic Performance</option>
                    <option value="body_recomposition">Body Recomposition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Fitness Level *</label>
                  <select
                    value={formData.currentLevel}
                    onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                  >
                    <option value="">Select your level</option>
                    <option value="beginner">Beginner (Just starting out)</option>
                    <option value="intermediate">Intermediate (Regular workouts)</option>
                    <option value="advanced">Advanced (Experienced athlete)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How often can you workout? *</label>
                  <select
                    value={formData.workoutFrequency}
                    onChange={(e) => setFormData({ ...formData, workoutFrequency: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                  >
                    <option value="">Select frequency</option>
                    <option value="1-2">1-2 days/week</option>
                    <option value="3-4">3-4 days/week</option>
                    <option value="5-6">5-6 days/week</option>
                    <option value="7">Every day (7 days/week)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diet Preference *</label>
                  <select
                    value={formData.dietPreference}
                    onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                  >
                    <option value="">Select preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="non_vegetarian">Non-Vegetarian</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="flexible">Flexible/No Restriction</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What motivates you to transform? *</label>
                  <textarea
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition resize-none"
                    placeholder="Share your story... What's driving this change?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What's your biggest fitness challenge? *</label>
                  <textarea
                    value={formData.biggestChallenge}
                    onChange={(e) => setFormData({ ...formData, biggestChallenge: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition resize-none"
                    placeholder="What holds you back? Lack of time, motivation, knowledge?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Which features excite you most? (Select all) *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'AI Workout Plans',
                      'AI Meal Plans',
                      'Daily Accountability Partner',
                      'Progress Tracking',
                      'Video Workouts',
                      'Macro Calculator',
                      'Community Challenges',
                      'Expert Coaching'
                    ].map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                          formData.featureInterest.includes(feature)
                            ? 'bg-orange-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {formData.featureInterest.includes(feature) && <CheckCircle2 className="inline w-4 h-4 mr-1" />}
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How did you hear about us? *</label>
                  <select
                    value={formData.howFoundUs}
                    onChange={(e) => setFormData({ ...formData, howFoundUs: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                  >
                    <option value="">Select source</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                    <option value="google_search">Google Search</option>
                    <option value="friend_referral">Friend Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Would you pay for premium features? *</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Yes', 'Maybe', 'No'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, willingToPay: option })}
                        className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                          formData.willingToPay === option
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.willingToPay !== 'No' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What's your monthly budget?</label>
                    <select
                      value={formData.priceRange}
                      onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                    >
                      <option value="">Select range</option>
                      <option value="under_10">Under $10/month</option>
                      <option value="10_20">$10-$20/month</option>
                      <option value="20_30">$20-$30/month</option>
                      <option value="30_50">$30-$50/month</option>
                      <option value="over_50">Over $50/month</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-xl transition transform hover:scale-105"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Complete Setup'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
