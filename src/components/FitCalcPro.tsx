import React, { useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  TrendingDown,
  Activity,
  Ruler,
  Weight,
  Calendar,
  Target,
  Zap,
  Info
} from 'lucide-react';
import {
  calculateAllMetrics,
  calculateWeightLossDays,
  getRecommendedMacros,
  validateWeightLossGoal,
  getBodyFatCategory,
  type BodyMetrics,
  type BodyFatMeasurements
} from '../lib/functions/fitCalcPro';

interface FitCalcProProps {
  onBack: () => void;
}

export default function FitCalcPro({ onBack }: FitCalcProProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'weightloss'>('metrics');

  // Body Metrics Form
  const [metrics, setMetrics] = useState<BodyMetrics>({
    weight: 70,
    height: 170,
    age: 25,
    gender: 'male',
    activityLevel: 'moderate'
  });

  const [measurements, setMeasurements] = useState<BodyFatMeasurements>({
    neck: 35,
    waist: 80,
    hip: 95
  });

  const [showBodyFat, setShowBodyFat] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Weight Loss Calculator Form
  const [weightLossGoal, setWeightLossGoal] = useState({
    currentWeight: 80,
    targetWeight: 70,
    weeklyDeficit: 'moderate' as 'slow' | 'moderate' | 'aggressive'
  });

  const [weightLossResults, setWeightLossResults] = useState<any>(null);

  const calculateMetrics = () => {
    const calculatedResults = calculateAllMetrics(
      metrics,
      showBodyFat ? measurements : undefined
    );
    setResults(calculatedResults);
  };

  const calculateWeightLoss = () => {
    const validation = validateWeightLossGoal(weightLossGoal.currentWeight, weightLossGoal.targetWeight);

    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    // Calculate TDEE first
    const metricsForTDEE: BodyMetrics = {
      weight: weightLossGoal.currentWeight,
      height: metrics.height,
      age: metrics.age,
      gender: metrics.gender,
      activityLevel: metrics.activityLevel
    };

    const { tdee } = calculateAllMetrics(metricsForTDEE);

    const result = calculateWeightLossDays({
      ...weightLossGoal,
      tdee
    });

    const macros = getRecommendedMacros(tdee, 'lose');

    setWeightLossResults({ ...result, macros });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FitCalc Pro</h1>
              <p className="text-sm text-gray-600">Body metrics & weight loss calculator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'metrics'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-5 h-5" />
            Body Metrics Calculator
          </button>
          <button
            onClick={() => setActiveTab('weightloss')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'weightloss'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingDown className="w-5 h-5" />
            Weight Loss Calculator
          </button>
        </div>

        {/* Body Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Information</h2>

              <div className="space-y-4">
                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={metrics.weight}
                    onChange={(e) => setMetrics({ ...metrics, weight: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={metrics.height}
                    onChange={(e) => setMetrics({ ...metrics, height: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={metrics.age}
                    onChange={(e) => setMetrics({ ...metrics, age: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={metrics.gender}
                    onChange={(e) => setMetrics({ ...metrics, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={metrics.activityLevel}
                    onChange={(e) => setMetrics({ ...metrics, activityLevel: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sedentary">Sedentary (Little or no exercise)</option>
                    <option value="light">Light (1-3 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="very_active">Very Active (Intense daily)</option>
                  </select>
                </div>

                {/* Body Fat Measurements Toggle */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBodyFat}
                      onChange={(e) => setShowBodyFat(e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Calculate Body Fat % (Optional)
                    </span>
                  </label>
                </div>

                {/* Body Fat Measurements */}
                {showBodyFat && (
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Neck Circumference (cm)
                      </label>
                      <input
                        type="number"
                        value={measurements.neck}
                        onChange={(e) => setMeasurements({ ...measurements, neck: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waist Circumference (cm)
                      </label>
                      <input
                        type="number"
                        value={measurements.waist}
                        onChange={(e) => setMeasurements({ ...measurements, waist: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {metrics.gender === 'female' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hip Circumference (cm)
                        </label>
                        <input
                          type="number"
                          value={measurements.hip || 0}
                          onChange={(e) => setMeasurements({ ...measurements, hip: Number(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={calculateMetrics}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Calculator className="w-5 h-5" />
                  Calculate Metrics
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {results ? (
                <>
                  {/* BMI */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Body Mass Index (BMI)</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl font-bold text-blue-600">{results.bmi.toFixed(1)}</span>
                      <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {results.bmiCategory}
                      </span>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Ideal weight range: {results.idealWeight.min.toFixed(1)} - {results.idealWeight.max.toFixed(1)} kg</p>
                    </div>
                  </div>

                  {/* BMR & TDEE */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Calories</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">BMR (Basal Metabolic Rate)</p>
                        <p className="text-3xl font-bold text-gray-900">{results.bmr} cal/day</p>
                        <p className="text-xs text-gray-500 mt-1">Calories burned at rest</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">TDEE (Total Daily Energy Expenditure)</p>
                        <p className="text-3xl font-bold text-blue-600">{results.tdee} cal/day</p>
                        <p className="text-xs text-gray-500 mt-1">Calories needed to maintain weight</p>
                      </div>
                    </div>
                  </div>

                  {/* Body Fat */}
                  {results.bodyFatPercentage !== undefined && (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Body Fat Percentage</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl font-bold text-purple-600">{results.bodyFatPercentage}%</span>
                        <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                          {getBodyFatCategory(results.bodyFatPercentage, metrics.gender)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                  <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter your information and click Calculate to see your results</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weight Loss Tab */}
        {activeTab === 'weightloss' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Weight Loss Goal</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weightLossGoal.currentWeight}
                    onChange={(e) => setWeightLossGoal({ ...weightLossGoal, currentWeight: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weightLossGoal.targetWeight}
                    onChange={(e) => setWeightLossGoal({ ...weightLossGoal, targetWeight: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight Loss Speed
                  </label>
                  <select
                    value={weightLossGoal.weeklyDeficit}
                    onChange={(e) => setWeightLossGoal({ ...weightLossGoal, weeklyDeficit: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="slow">Slow (0.25 kg/week) - Most sustainable</option>
                    <option value="moderate">Moderate (0.5 kg/week) - Recommended</option>
                    <option value="aggressive">Aggressive (1 kg/week) - Maximum safe rate</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Make sure you've calculated your Body Metrics first for accurate TDEE calculation
                    </p>
                  </div>
                </div>

                <button
                  onClick={calculateWeightLoss}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Target className="w-5 h-5" />
                  Calculate Timeline
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {weightLossResults ? (
                <>
                  {/* Timeline */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline to Goal</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Weight to Lose:</span>
                        <span className="text-2xl font-bold text-red-600">{weightLossResults.weightToLose} kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Estimated Days:</span>
                        <span className="text-2xl font-bold text-blue-600">{weightLossResults.estimatedDays} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Estimated Weeks:</span>
                        <span className="text-2xl font-bold text-purple-600">{weightLossResults.estimatedWeeks} weeks</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-gray-600">Target Date:</span>
                        <span className="text-lg font-bold text-green-600">
                          {weightLossResults.targetDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Calories */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Calorie Target</h3>
                    <div className="text-center mb-4">
                      <p className="text-5xl font-bold text-orange-600">{weightLossResults.dailyCalories}</p>
                      <p className="text-gray-600 mt-2">calories per day</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-orange-800">
                        Weekly total: {weightLossResults.weeklyCalories.toLocaleString()} calories
                      </p>
                    </div>
                  </div>

                  {/* Recommended Macros */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Macros</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Protein:</span>
                        <span className="font-bold text-blue-600">{weightLossResults.macros.protein}g/day</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Carbs:</span>
                        <span className="font-bold text-green-600">{weightLossResults.macros.carbs}g/day</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Fats:</span>
                        <span className="font-bold text-yellow-600">{weightLossResults.macros.fats}g/day</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                  <TrendingDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter your weight loss goal to see your personalized timeline</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
