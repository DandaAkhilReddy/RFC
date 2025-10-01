import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Utensils,
  Apple,
  Beef,
  Droplet,
  Flame,
  TrendingUp,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  Camera,
  BarChart3,
  Target,
  Clock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { uploadImageToAzure, BlobContainers, logMeal } from '../lib/storage';
import { useAuth } from './AuthProvider';

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed: boolean;
}

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DietPlanPageProps {
  onBack: () => void;
}

export default function DietPlanPage({ onBack }: DietPlanPageProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Oatmeal with fruits and nuts',
      type: 'breakfast',
      time: '08:00 AM',
      calories: 450,
      protein: 15,
      carbs: 65,
      fats: 12,
      completed: true
    },
    {
      id: '2',
      name: 'Grilled chicken salad',
      type: 'lunch',
      time: '01:00 PM',
      calories: 380,
      protein: 35,
      carbs: 25,
      fats: 15,
      completed: true
    },
    {
      id: '3',
      name: 'Protein shake',
      type: 'snack',
      time: '04:00 PM',
      calories: 180,
      protein: 25,
      carbs: 15,
      fats: 3,
      completed: false
    },
    {
      id: '4',
      name: 'Salmon with quinoa and vegetables',
      type: 'dinner',
      time: '07:00 PM',
      calories: 550,
      protein: 40,
      carbs: 45,
      fats: 18,
      completed: false
    }
  ]);

  const [dailyGoals] = useState<DailyGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65
  });

  const [showAddMeal, setShowAddMeal] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const waterGoal = 8; // glasses

  // Calculate totals
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.completed ? meal.calories : 0),
      protein: acc.protein + (meal.completed ? meal.protein : 0),
      carbs: acc.carbs + (meal.completed ? meal.carbs : 0),
      fats: acc.fats + (meal.completed ? meal.fats : 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const macroData = [
    { name: 'Protein', value: totals.protein, color: '#f97316' },
    { name: 'Carbs', value: totals.carbs, color: '#3b82f6' },
    { name: 'Fats', value: totals.fats, color: '#eab308' }
  ];

  const weeklyProgress = [
    { day: 'Mon', calories: 1850, goal: 2000 },
    { day: 'Tue', calories: 1920, goal: 2000 },
    { day: 'Wed', calories: 1780, goal: 2000 },
    { day: 'Thu', calories: 2100, goal: 2000 },
    { day: 'Fri', calories: 1950, goal: 2000 },
    { day: 'Sat', calories: 2200, goal: 2000 },
    { day: 'Sun', calories: totals.calories, goal: 2000 }
  ];

  const toggleMealComplete = (id: string) => {
    setMeals(meals.map(meal =>
      meal.id === id ? { ...meal, completed: !meal.completed } : meal
    ));
  };

  const deleteMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 95 && percentage <= 105) return 'text-green-600';
    if (percentage > 105) return 'text-orange-600';
    return 'text-blue-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Diet Plan</h1>
                <p className="text-sm text-gray-500">Track your nutrition & stay healthy</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddMeal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Meal
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Date Selector */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-600" />
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Meals */}
          <div className="lg:col-span-2 space-y-4">
            {/* Daily Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Calories</span>
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <p className={`text-2xl font-bold ${getProgressColor(totals.calories, dailyGoals.calories)}`}>
                  {totals.calories}
                </p>
                <p className="text-xs text-gray-500">of {dailyGoals.calories}</p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${Math.min((totals.calories / dailyGoals.calories) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Protein</span>
                  <Beef className="w-5 h-5 text-orange-500" />
                </div>
                <p className={`text-2xl font-bold ${getProgressColor(totals.protein, dailyGoals.protein)}`}>
                  {totals.protein}g
                </p>
                <p className="text-xs text-gray-500">of {dailyGoals.protein}g</p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${Math.min((totals.protein / dailyGoals.protein) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Carbs</span>
                  <Apple className="w-5 h-5 text-blue-500" />
                </div>
                <p className={`text-2xl font-bold ${getProgressColor(totals.carbs, dailyGoals.carbs)}`}>
                  {totals.carbs}g
                </p>
                <p className="text-xs text-gray-500">of {dailyGoals.carbs}g</p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min((totals.carbs / dailyGoals.carbs) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Fats</span>
                  <Droplet className="w-5 h-5 text-yellow-500" />
                </div>
                <p className={`text-2xl font-bold ${getProgressColor(totals.fats, dailyGoals.fats)}`}>
                  {totals.fats}g
                </p>
                <p className="text-xs text-gray-500">of {dailyGoals.fats}g</p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all"
                    style={{ width: `${Math.min((totals.fats / dailyGoals.fats) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Meals List */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Meals</h2>
              <div className="space-y-3">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      meal.completed
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => toggleMealComplete(meal.id)}
                          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            meal.completed
                              ? 'border-green-600 bg-green-600'
                              : 'border-gray-300 hover:border-orange-600'
                          }`}
                        >
                          {meal.completed && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{getMealIcon(meal.type)}</span>
                            <h3 className={`font-semibold ${meal.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                              {meal.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Clock className="w-4 h-4" />
                            <span>{meal.time}</span>
                            <span className="text-gray-400">•</span>
                            <span className="capitalize">{meal.type}</span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-orange-600 font-medium">{meal.calories} cal</span>
                            <span className="text-gray-600">P: {meal.protein}g</span>
                            <span className="text-gray-600">C: {meal.carbs}g</span>
                            <span className="text-gray-600">F: {meal.fats}g</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Calorie Intake</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyProgress}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calories" fill="#f97316" name="Consumed" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="goal" fill="#d1d5db" name="Goal" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-4">
            {/* Macro Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Macro Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {macroData.map((macro) => (
                  <div key={macro.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }} />
                      <span className="text-sm text-gray-600">{macro.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{macro.value}g</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Water Intake */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Water Intake</h2>
                <Droplet className="w-6 h-6 text-blue-500" />
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{waterIntake} glasses</span>
                  <span className="text-gray-600">Goal: {waterGoal}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(waterIntake / waterGoal) * 100}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(waterGoal)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setWaterIntake(i < waterIntake ? i : i + 1)}
                    className={`p-3 rounded-lg transition-colors ${
                      i < waterIntake
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Droplet className="w-5 h-5 mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Health Tips */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-2">💡 Daily Tip</h3>
              <p className="text-sm opacity-90">
                Staying hydrated helps boost metabolism and reduce hunger. Aim for 8-10 glasses of water daily!
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Meals logged today</span>
                  <span className="text-lg font-bold text-orange-600">{meals.filter(m => m.completed).length}/{meals.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Calorie goal status</span>
                  <span className={`text-lg font-bold ${getProgressColor(totals.calories, dailyGoals.calories)}`}>
                    {((totals.calories / dailyGoals.calories) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Protein target</span>
                  <span className={`text-lg font-bold ${getProgressColor(totals.protein, dailyGoals.protein)}`}>
                    {((totals.protein / dailyGoals.protein) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
