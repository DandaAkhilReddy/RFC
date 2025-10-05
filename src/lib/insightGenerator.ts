// Generate personalized insights for the dashboard

export interface DailyData {
  steps: number;
  water: number;
  weight: number;
  foods: Array<{ calories: number; protein: number; carbs: number; fat: number }>;
  workouts: Array<{ caloriesBurned: string; duration: string }>;
}

export interface UserGoals {
  dailyCalories: number;
  dailyProtein: number;
  targetWeight: number;
  currentWeight: number;
}

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'achievement';
  icon: string;
  title: string;
  message: string;
  priority: number; // 1 = highest
}

export function generateInsights(
  dailyData: DailyData,
  userGoals: UserGoals,
  streak: number = 0
): Insight[] {
  const insights: Insight[] = [];

  // Calculate totals
  const totalCalories = dailyData.foods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = dailyData.foods.reduce((sum, food) => sum + food.protein, 0);
  const totalBurned = dailyData.workouts.reduce((sum, workout) => sum + parseInt(workout.caloriesBurned || '0'), 0);
  const netCalories = totalCalories - totalBurned;
  const caloriesRemaining = userGoals.dailyCalories - netCalories;
  const proteinRemaining = userGoals.dailyProtein - totalProtein;
  const weightDiff = userGoals.currentWeight - userGoals.targetWeight;
  const weightProgress = ((userGoals.currentWeight - dailyData.weight) / weightDiff) * 100;

  // 🔥 Calorie Insights
  if (caloriesRemaining > 0 && caloriesRemaining < 500) {
    insights.push({
      id: 'cal-remaining',
      type: 'success',
      icon: '🔥',
      title: 'Calories Looking Good!',
      message: `${Math.round(caloriesRemaining)} cal left for ${caloriesRemaining < 200 ? 'a light snack' : 'dinner'}!`,
      priority: 2
    });
  } else if (caloriesRemaining < 0) {
    insights.push({
      id: 'cal-over',
      type: 'warning',
      icon: '⚠️',
      title: 'Over Calorie Goal',
      message: `Over by ${Math.abs(Math.round(caloriesRemaining))} cal - maybe an extra workout tomorrow?`,
      priority: 1
    });
  } else if (caloriesRemaining > 500) {
    insights.push({
      id: 'cal-plenty',
      type: 'info',
      icon: '🍽️',
      title: 'Room for More!',
      message: `${Math.round(caloriesRemaining)} cal remaining - enjoy your meals!`,
      priority: 3
    });
  }

  // Perfect calorie day
  if (Math.abs(caloriesRemaining) < 50 && totalCalories > 0) {
    insights.push({
      id: 'cal-perfect',
      type: 'achievement',
      icon: '🎯',
      title: 'Perfect Day!',
      message: `Right on target! Only ${Math.abs(Math.round(caloriesRemaining))} cal ${caloriesRemaining > 0 ? 'under' : 'over'}`,
      priority: 1
    });
  }

  // 💪 Protein Insights
  const proteinPercent = (totalProtein / userGoals.dailyProtein) * 100;
  if (totalProtein >= userGoals.dailyProtein) {
    insights.push({
      id: 'protein-goal',
      type: 'achievement',
      icon: '💪',
      title: 'Protein Goal Crushed!',
      message: `${Math.round(totalProtein)}g achieved - muscle building mode!`,
      priority: 2
    });
  } else if (proteinPercent >= 75) {
    insights.push({
      id: 'protein-close',
      type: 'success',
      icon: '💪',
      title: 'Almost There!',
      message: `${Math.round(totalProtein)}g/${userGoals.dailyProtein}g - just ${Math.round(proteinRemaining)}g more!`,
      priority: 3
    });
  } else if (proteinPercent < 50 && totalCalories > 0) {
    insights.push({
      id: 'protein-low',
      type: 'info',
      icon: '🥩',
      title: 'Boost Your Protein',
      message: `Need ${Math.round(proteinRemaining)}g more - try a protein shake!`,
      priority: 2
    });
  }

  // ⚡ Workout Insights
  if (totalBurned > 0) {
    if (totalBurned >= 500) {
      insights.push({
        id: 'workout-excellent',
        type: 'achievement',
        icon: '🔥',
        title: 'Epic Workout!',
        message: `Burned ${totalBurned} cal - that's ${Math.round(totalBurned / 150)} snacks earned!`,
        priority: 1
      });
    } else if (totalBurned >= 200) {
      insights.push({
        id: 'workout-good',
        type: 'success',
        icon: '⚡',
        title: 'Great Session!',
        message: `${totalBurned} cal burned - keeping the momentum!`,
        priority: 2
      });
    }
  } else if (dailyData.workouts.length === 0 && new Date().getHours() > 16) {
    insights.push({
      id: 'workout-reminder',
      type: 'info',
      icon: '🏃',
      title: 'Move Your Body',
      message: 'No workout yet - a quick walk counts!',
      priority: 4
    });
  }

  // 🎯 Streak Insights
  if (streak >= 7) {
    insights.push({
      id: 'streak-week',
      type: 'achievement',
      icon: '🔥',
      title: `${streak} Day Streak!`,
      message: "You're unstoppable - keep the fire burning!",
      priority: 1
    });
  } else if (streak >= 3) {
    insights.push({
      id: 'streak-going',
      type: 'success',
      icon: '🎯',
      title: `${streak} Day Streak`,
      message: "Don't break the chain - you're doing great!",
      priority: 2
    });
  }

  // 📉 Weight Progress (if weight changed)
  if (dailyData.weight > 0 && dailyData.weight !== userGoals.currentWeight) {
    const weightChange = userGoals.currentWeight - dailyData.weight;
    if (weightChange > 0) {
      insights.push({
        id: 'weight-loss',
        type: 'achievement',
        icon: '📉',
        title: 'Weight Progress!',
        message: `Lost ${weightChange.toFixed(1)}kg - ${Math.round(weightProgress)}% to goal!`,
        priority: 1
      });
    } else if (weightChange < 0) {
      insights.push({
        id: 'weight-gain',
        type: 'info',
        icon: '📊',
        title: 'Weight Update',
        message: `Up ${Math.abs(weightChange).toFixed(1)}kg - building muscle?`,
        priority: 3
      });
    }
  }

  // 🏆 Achievement: First meal logged
  if (dailyData.foods.length === 1) {
    insights.push({
      id: 'first-meal',
      type: 'success',
      icon: '✨',
      title: 'Great Start!',
      message: 'First meal logged - tracking leads to success!',
      priority: 3
    });
  }

  // 🏆 Achievement: All macros balanced
  if (dailyData.foods.length > 0) {
    const totalCarbs = dailyData.foods.reduce((sum, food) => sum + food.carbs, 0);
    const totalFat = dailyData.foods.reduce((sum, food) => sum + food.fat, 0);
    const proteinCal = totalProtein * 4;
    const carbsCal = totalCarbs * 4;
    const fatCal = totalFat * 9;
    const total = proteinCal + carbsCal + fatCal;

    if (total > 0) {
      const proteinRatio = proteinCal / total;
      const carbsRatio = carbsCal / total;
      const fatRatio = fatCal / total;

      // Good balance: 30% protein, 40% carbs, 30% fat (±10%)
      if (proteinRatio >= 0.25 && carbsRatio >= 0.35 && carbsRatio <= 0.50 && fatRatio >= 0.20 && fatRatio <= 0.35) {
        insights.push({
          id: 'macros-balanced',
          type: 'achievement',
          icon: '⚖️',
          title: 'Perfect Macro Balance!',
          message: `${Math.round(proteinRatio*100)}P/${Math.round(carbsRatio*100)}C/${Math.round(fatRatio*100)}F - textbook nutrition!`,
          priority: 2
        });
      }
    }
  }

  // 💧 Water reminder (if low)
  if (dailyData.water < 4 && new Date().getHours() > 12) {
    insights.push({
      id: 'water-low',
      type: 'info',
      icon: '💧',
      title: 'Stay Hydrated',
      message: `Only ${dailyData.water} glasses - drink up!`,
      priority: 4
    });
  } else if (dailyData.water >= 8) {
    insights.push({
      id: 'water-goal',
      type: 'success',
      icon: '💧',
      title: 'Hydration Hero!',
      message: `${dailyData.water} glasses - perfectly hydrated!`,
      priority: 3
    });
  }

  // Sort by priority (lower number = higher priority)
  insights.sort((a, b) => a.priority - b.priority);

  // Return top 6 insights
  return insights.slice(0, 6);
}

// Calculate daily totals for display
export function calculateDailyTotals(dailyData: DailyData) {
  const totalCalories = dailyData.foods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = dailyData.foods.reduce((sum, food) => sum + food.protein, 0);
  const totalCarbs = dailyData.foods.reduce((sum, food) => sum + food.carbs, 0);
  const totalFat = dailyData.foods.reduce((sum, food) => sum + food.fat, 0);
  const totalBurned = dailyData.workouts.reduce((sum, workout) => sum + parseInt(workout.caloriesBurned || '0'), 0);

  return {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    burned: totalBurned,
    netCalories: totalCalories - totalBurned
  };
}
