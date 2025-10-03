const fs = require('fs');

const content = `import { useState } from 'react';
import {
  ArrowRight, ArrowLeft, Check, Target, Dumbbell,
  Utensils, Heart, TrendingUp, Sparkles, X
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: any;
  color: string;
  details: string[];
}

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Set Your Fitness Goals",
    description: "Define your personal fitness journey and target milestones",
    icon: Target,
    color: "from-orange-500 to-red-500",
    details: [
      "🎯 Set your target weight and body composition",
      "📊 Define daily calorie and workout goals",
      "📈 Track your progress with smart metrics",
      "🔥 Get AI-powered recommendations"
    ]
  },
  {
    title: "Track Your Workouts",
    description: "Log daily exercises and build consistent fitness habits",
    icon: Dumbbell,
    color: "from-blue-500 to-cyan-500",
    details: [
      "💪 Log workouts and track completion",
      "🏆 Build and maintain workout streaks",
      "📅 Plan your weekly exercise routine",
      "⚡ Get personalized workout suggestions"
    ]
  },
  {
    title: "Monitor Your Nutrition",
    description: "Track calories and maintain a balanced diet plan",
    icon: Utensils,
    color: "from-green-500 to-emerald-500",
    details: [
      "🍎 Log daily calorie intake easily",
      "🥗 Track nutrition and meal timing",
      "📉 Monitor calorie deficit/surplus",
      "🤖 AI diet recommendations based on goals"
    ]
  },
  {
    title: "Find Your Fitness Community",
    description: "Connect with workout buddies and accountability partners",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    details: [
      "👥 Find workout partners nearby",
      "💑 Match with fitness-minded dates",
      "🤝 Build accountability partnerships",
      "💬 Chat and motivate each other"
    ]
  },
  {
    title: "Track Your Discipline",
    description: "Build streaks and maintain consistent healthy habits",
    icon: TrendingUp,
    color: "from-purple-500 to-indigo-500",
    details: [
      "🔥 Build daily discipline streaks",
      "📊 Track workout, calorie, and weight logs",
      "🏅 Earn achievements and milestones",
      "📈 Visualize your consistency journey"
    ]
  }
];

export default function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div
        key={\`onboarding-\${currentStep}\`}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden transition-all duration-300"
      >
        {/* Header */}
        <div className={\`bg-gradient-to-r \${step.color} p-8 text-white relative\`}>
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Icon className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="text-sm opacity-90 mb-1">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</div>
              <h2 className="text-3xl font-bold">{step.title}</h2>
            </div>
          </div>

          <p className="text-lg opacity-95">{step.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-6">
          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={\`h-2 flex-1 rounded-full transition-all duration-300 \${
                  index <= currentStep ? \`bg-gradient-to-r \${step.color}\` : 'bg-gray-200'
                }\`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-4">
          {step.details.map((detail, index) => (
            <div
              key={\`\${currentStep}-\${index}\`}
              className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 transition-all duration-200"
            >
              <div className={\`p-2 bg-gradient-to-r \${step.color} rounded-lg\`}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <p className="text-gray-700 flex-1 pt-1">{detail}</p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all \${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }\`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={onSkip}
            className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Skip Tour
          </button>

          <button
            onClick={handleNext}
            className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r \${step.color} hover:shadow-lg transition-all\`}
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <>
                Get Started
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('C:/Users/akhil/ReddyfitWebsiteready/src/components/OnboardingTour.tsx', content, 'utf8');
console.log('✅ OnboardingTour.tsx fixed - removed SSGOI transitions');
