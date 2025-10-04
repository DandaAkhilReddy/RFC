import { Zap, RotateCcw, Heart, Utensils } from 'lucide-react';

export default function ReliabilityPage() {
  const features = [
    {
      icon: Zap,
      title: 'AI Body Fat Analysis with Automatic Retries',
      description: `Our AI Body Fat Analysis is now powered by Temporal.io workflows. Instead of fragile one-off API calls, each photo you upload is processed through a resilient pipeline that retries automatically if a service fails or times out. Your images are safely uploaded, analyzed by our advanced AI, results stored, and you get notified instantly when complete. Even if external APIs are slow or networks hiccup, the workflow keeps running until your results are ready. This ensures you never lose progress and can rely on consistent, accurate body fat measurements every time. With Temporal's observable workflows, our team can also monitor success rates in real time, guaranteeing over 99.9% reliability. That means fewer worries for you and more trust in your daily routine.`,
      color: 'purple',
    },
    {
      icon: RotateCcw,
      title: 'Daily Streak Calculations',
      description: `Your progress streak is what keeps you motivated. Every night at midnight UTC, Temporal runs a background workflow that checks your activity logs, validates your daily entries, and updates your streak automatically. Even if you're offline or your phone is turned off, the system still tracks your habits. This eliminates missed streaks due to technical issues and gives you peace of mind that your effort is always recognized. With Temporal, the streak calculation workflow is resilient to failures and can be observed in the dashboard. If a job fails, it automatically retries until complete. You get a seamless experience: wake up every morning with your streak updated, motivating you to keep going. This background automation is one of the biggest reliability upgrades we've shipped.`,
      color: 'blue',
    },
    {
      icon: Heart,
      title: 'Future AgentCupid Matching Workflows',
      description: `AgentCupid is our AI-powered fitness dating and community agent. Behind the scenes, compatibility scoring and match generation are complex, multi-step processes involving AI models, scoring algorithms, and personalization. Temporal workflows let us orchestrate these steps reliably and in sequence, so every match is fair, consistent, and delivered daily without delays. With retries and observability built in, you can trust that matches won't silently fail. In the future, this system will also power onboarding journeys and achievement unlocks, sending you personalized experiences over days and weeks, without requiring developers to hand-code timers or cron jobs. Temporal ensures that Cupid's magic always happens on schedule, creating a trusted, scalable foundation for our social features.`,
      color: 'pink',
    },
    {
      icon: Utensils,
      title: 'Meal Plan Generation Automation',
      description: `When AgentRapid launches its advanced nutrition features, meal planning will no longer be just instant suggestions—it will be handled through a Temporal workflow. That means each request is retried until success, portions and macros are saved reliably, and notifications are sent when your plan is ready. Temporal also allows us to schedule meal plan adjustments in advance: for example, recalculating your macros every Sunday night automatically based on your latest weight and activity. This ensures your nutrition plan evolves with you, without you needing to remember to regenerate it. The result is a reliable, scalable, future-proof meal planning service that adapts as your journey progresses. With Temporal, no meal plan request is ever lost, delayed, or forgotten.`,
      color: 'green',
    },
  ];

  const colorClasses = {
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      iconBg: 'bg-purple-100',
      badge: 'bg-purple-100 text-purple-700',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100',
      badge: 'bg-blue-100 text-blue-700',
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      icon: 'text-pink-600',
      iconBg: 'bg-pink-100',
      badge: 'bg-pink-100 text-pink-700',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      iconBg: 'bg-green-100',
      badge: 'bg-green-100 text-green-700',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Zap className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">Powered by Temporal.io Cloud</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Reliability & Automation
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Built on enterprise-grade workflow orchestration. Every feature powered by Temporal.io ensures
              99.9% reliability, automatic retries, and complete observability.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color as keyof typeof colorClasses];

            return (
              <div
                key={index}
                className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                {/* Icon */}
                <div className={`${colors.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h2>

                {/* Badge */}
                <div className="mb-4">
                  <span className={`${colors.badge} text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center`}>
                    <Zap className="w-3 h-3 mr-1" />
                    Powered by Temporal.io Cloud
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Built for Scale, Designed for You
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Every workflow is monitored, logged, and observable. Our team can see exactly how your data flows,
            ensuring nothing is ever lost and every feature works as expected.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm text-purple-200">Uptime</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <div className="text-2xl font-bold">5x</div>
              <div className="text-sm text-purple-200">Auto-Retries</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-purple-200">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
