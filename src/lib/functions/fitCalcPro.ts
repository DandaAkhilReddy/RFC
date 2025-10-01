/**
 * FitCalc Pro Functions
 * Feature 2: Body Metrics Calculator - BMI, BMR, Body Fat %, Weight Loss Days Calculator
 */

export interface BodyMetrics {
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface BodyFatMeasurements {
  neck: number; // in cm
  waist: number; // in cm
  hip?: number; // in cm (required for females)
}

export interface CalculationResults {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  bodyFatPercentage?: number;
  idealWeight: {
    min: number;
    max: number;
  };
}

export interface WeightLossGoal {
  currentWeight: number;
  targetWeight: number;
  weeklyDeficit: 'slow' | 'moderate' | 'aggressive'; // 0.25kg, 0.5kg, 1kg per week
  tdee: number;
}

export interface WeightLossResult {
  weightToLose: number;
  estimatedDays: number;
  estimatedWeeks: number;
  dailyCalories: number;
  weeklyCalories: number;
  targetDate: Date;
}

/**
 * Calculate BMI (Body Mass Index)
 */
export const calculateBMI = (weight: number, height: number): number => {
  // BMI = weight (kg) / (height (m))^2
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

/**
 * Get BMI Category
 */
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obese Class I';
  if (bmi < 40) return 'Obese Class II';
  return 'Obese Class III';
};

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 */
export const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
  // BMR = 10 × weight (kg) + 6.25 × height (cm) - 5 × age (years) + s
  // s = +5 for males, -161 for females
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Heavy exercise 6-7 days/week
    very_active: 1.9     // Very heavy exercise, physical job
  };

  return bmr * (activityMultipliers[activityLevel] || 1.2);
};

/**
 * Calculate Body Fat Percentage using US Navy Method
 */
export const calculateBodyFatPercentage = (
  height: number,
  gender: 'male' | 'female',
  measurements: BodyFatMeasurements
): number => {
  // US Navy Body Fat Formula
  if (gender === 'male') {
    // Male: 86.010 × log10(abdomen - neck) - 70.041 × log10(height) + 36.76
    const bodyFat = 86.010 * Math.log10(measurements.waist - measurements.neck)
                    - 70.041 * Math.log10(height)
                    + 36.76;
    return Math.max(0, Math.min(100, bodyFat));
  } else {
    // Female: 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
    if (!measurements.hip) {
      throw new Error('Hip measurement required for female body fat calculation');
    }
    const bodyFat = 163.205 * Math.log10(measurements.waist + measurements.hip - measurements.neck)
                    - 97.684 * Math.log10(height)
                    - 78.387;
    return Math.max(0, Math.min(100, bodyFat));
  }
};

/**
 * Get Body Fat Category
 */
export const getBodyFatCategory = (bodyFat: number, gender: 'male' | 'female'): string => {
  if (gender === 'male') {
    if (bodyFat < 6) return 'Essential Fat';
    if (bodyFat < 14) return 'Athletes';
    if (bodyFat < 18) return 'Fitness';
    if (bodyFat < 25) return 'Average';
    return 'Obese';
  } else {
    if (bodyFat < 14) return 'Essential Fat';
    if (bodyFat < 21) return 'Athletes';
    if (bodyFat < 25) return 'Fitness';
    if (bodyFat < 32) return 'Average';
    return 'Obese';
  }
};

/**
 * Calculate Ideal Weight Range based on BMI
 */
export const calculateIdealWeight = (height: number): { min: number; max: number } => {
  // Ideal weight range for BMI 18.5 to 25
  const heightInMeters = height / 100;
  const min = 18.5 * heightInMeters * heightInMeters;
  const max = 25 * heightInMeters * heightInMeters;
  return { min, max };
};

/**
 * Complete Body Metrics Calculation
 */
export const calculateAllMetrics = (metrics: BodyMetrics, measurements?: BodyFatMeasurements): CalculationResults => {
  const bmi = calculateBMI(metrics.weight, metrics.height);
  const bmr = calculateBMR(metrics.weight, metrics.height, metrics.age, metrics.gender);
  const tdee = calculateTDEE(bmr, metrics.activityLevel);
  const idealWeight = calculateIdealWeight(metrics.height);

  const results: CalculationResults = {
    bmi,
    bmiCategory: getBMICategory(bmi),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    idealWeight: {
      min: Math.round(idealWeight.min * 10) / 10,
      max: Math.round(idealWeight.max * 10) / 10
    }
  };

  if (measurements) {
    try {
      const bodyFat = calculateBodyFatPercentage(metrics.height, metrics.gender, measurements);
      results.bodyFatPercentage = Math.round(bodyFat * 10) / 10;
    } catch (error) {
      console.error('Error calculating body fat:', error);
    }
  }

  return results;
};

/**
 * Calculate Weight Loss Timeline
 */
export const calculateWeightLossDays = (goal: WeightLossGoal): WeightLossResult => {
  const weightToLose = goal.currentWeight - goal.targetWeight;

  // Weekly weight loss targets (in kg)
  const weeklyLoss = {
    slow: 0.25,        // 250g per week (safe for small amounts)
    moderate: 0.5,     // 500g per week (recommended)
    aggressive: 1.0    // 1kg per week (maximum safe rate)
  };

  const weeklyTarget = weeklyLoss[goal.weeklyDeficit];
  const weeksNeeded = weightToLose / weeklyTarget;
  const daysNeeded = Math.ceil(weeksNeeded * 7);

  // Calorie deficit needed
  // 1 kg fat = ~7700 calories
  const totalCaloriesDeficit = weightToLose * 7700;
  const dailyDeficit = totalCaloriesDeficit / daysNeeded;
  const dailyCalories = Math.round(goal.tdee - dailyDeficit);
  const weeklyCalories = dailyCalories * 7;

  // Calculate target date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysNeeded);

  return {
    weightToLose: Math.round(weightToLose * 10) / 10,
    estimatedDays: daysNeeded,
    estimatedWeeks: Math.round(weeksNeeded * 10) / 10,
    dailyCalories,
    weeklyCalories,
    targetDate
  };
};

/**
 * Get Recommended Macros based on goal
 */
export const getRecommendedMacros = (
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain'
): { calories: number; protein: number; carbs: number; fats: number } => {
  let calories: number;

  switch (goal) {
    case 'lose':
      calories = Math.round(tdee * 0.8); // 20% deficit
      break;
    case 'gain':
      calories = Math.round(tdee * 1.1); // 10% surplus
      break;
    default:
      calories = Math.round(tdee);
  }

  // Macro distribution
  // Protein: 30% (4 cal/g)
  // Carbs: 40% (4 cal/g)
  // Fats: 30% (9 cal/g)

  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.4) / 4);
  const fats = Math.round((calories * 0.3) / 9);

  return { calories, protein, carbs, fats };
};

/**
 * Validate weight loss goal
 */
export const validateWeightLossGoal = (currentWeight: number, targetWeight: number): {
  isValid: boolean;
  message: string;
} => {
  if (targetWeight >= currentWeight) {
    return {
      isValid: false,
      message: 'Target weight must be less than current weight for weight loss'
    };
  }

  const difference = currentWeight - targetWeight;
  const percentageLoss = (difference / currentWeight) * 100;

  if (percentageLoss > 20) {
    return {
      isValid: false,
      message: 'Target weight loss exceeds 20% of body weight. Please set a more gradual goal.'
    };
  }

  return {
    isValid: true,
    message: 'Goal is achievable and safe'
  };
};
