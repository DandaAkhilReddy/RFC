const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src', 'components', 'EnhancedDashboard.tsx');

// Read the current file
let content = fs.readFileSync(dashboardPath, 'utf8');

// 1. Add OnboardingTour import
if (!content.includes('import OnboardingTour')) {
  content = content.replace(
    `import OnboardingWelcome, { hasSeenOnboarding } from './OnboardingWelcome';`,
    `import OnboardingWelcome, { hasSeenOnboarding } from './OnboardingWelcome';\nimport OnboardingTour from './OnboardingTour';`
  );
}

// 2. Add showTour state
if (!content.includes('const [showTour')) {
  content = content.replace(
    `const [showOnboarding, setShowOnboarding] = useState(false);`,
    `const [showOnboarding, setShowOnboarding] = useState(false);\n  const [showTour, setShowTour] = useState(false);`
  );
}

// 3. Update initializeNewUser to include sample data
const oldInitFunction = `  // Initialize new user with fresh data
  const initializeNewUser = async (userId: string) => {
    try {
      const initialData = {
        calorieGoal: 2000,
        weeklyWorkoutGoal: 5,
        weight: 0,
        height: 0,
        targetWeight: 0,
        startWeight: 0,
        currentCalories: 0,
        currentWorkouts: 0,
        lastCalorieEdit: '',
        lastWorkoutEdit: '',
        createdAt: new Date().toISOString(),
        // Discipline tracking
        currentStreak: 0,
        bestStreak: 0,
        totalDays: 0,
        workoutStreak: 0,
        calorieStreak: 0,
        weightStreak: 0,
        aiChatStreak: 0,
        lastWorkoutDate: '',
        lastCalorieLog: '',
        lastWeightLog: '',
        lastAIChatDate: '',
        workoutHistory: [],
        calorieHistory: [],
        weightHistory: [],
        aiChatHistory: []
      };

      await setDoc(doc(db, Collections.USERS, userId), initialData);
      console.log('✅ New user initialized with clean data');
      return initialData;
    } catch (error) {
      console.error('Error initializing new user:', error);
      return null;
    }
  };`;

const newInitFunction = `  // Initialize new user with sample data
  const initializeNewUser = async (userId: string) => {
    try {
      const initialData = {
        // Goals with sample data
        calorieGoal: 2000,
        weeklyWorkoutGoal: 5,
        weight: 75,
        height: 170,
        targetWeight: 70,
        startWeight: 80,
        // Current progress with sample data
        currentCalories: 1450,
        currentWorkouts: 3,
        lastCalorieEdit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        lastWorkoutEdit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        createdAt: new Date().toISOString(),
        isFirstTime: true,
        // Discipline tracking with sample streaks
        currentStreak: 3,
        bestStreak: 5,
        totalDays: 8,
        workoutStreak: 3,
        calorieStreak: 3,
        weightStreak: 2,
        aiChatStreak: 1,
        lastWorkoutDate: new Date().toISOString(),
        lastCalorieLog: new Date().toISOString(),
        lastWeightLog: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        lastAIChatDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        workoutHistory: [true, true, false, true, true, false, true],
        calorieHistory: [true, true, false, true, true, false, true],
        weightHistory: [true, false, false, true, true, false, false],
        aiChatHistory: [false, true, false, false, false, false, true]
      };

      await setDoc(doc(db, Collections.USERS, userId), initialData, { merge: true });
      console.log('✅ New user initialized with sample data to get started!');
      return initialData;
    } catch (error) {
      console.error('❌ Error initializing new user:', error);
      return null;
    }
  };`;

content = content.replace(oldInitFunction, newInitFunction);

// 4. Update the useEffect to show tour for first-time users
const oldUseEffect = `  // Check if user needs to see onboarding
  useEffect(() => {
    if (user && !hasSeenOnboarding()) {
      setShowOnboarding(true);
    }
  }, [user]);`;

const newUseEffect = `  // Check if user needs to see onboarding or tour
  useEffect(() => {
    if (user && !hasSeenOnboarding()) {
      setShowOnboarding(true);
    } else if (isFirstTimeUser) {
      // Show tour for first-time users after brief delay
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isFirstTimeUser]);`;

content = content.replace(oldUseEffect, newUseEffect);

// 5. Add OnboardingTour component before closing div (find the return statement and add before last closing div)
if (!content.includes('<OnboardingTour')) {
  // Find the last </div> before the last closing brace of the component
  const returnMatch = content.match(/(return \([\s\S]*)<\/div>\s*\);?\s*}/);
  if (returnMatch) {
    const beforeLastDiv = returnMatch[1];
    const afterLastDiv = content.substring(returnMatch.index + returnMatch[1].length);

    const tourComponent = `

      {/* Onboarding Tour for first-time users */}
      {showTour && (
        <OnboardingTour
          onComplete={() => {
            setShowTour(false);
            // Mark user as not first-time anymore
            if (user) {
              setDoc(doc(db, Collections.USERS, user.uid), {
                isFirstTime: false
              }, { merge: true }).catch(console.error);
            }
          }}
          onSkip={() => {
            setShowTour(false);
            if (user) {
              setDoc(doc(db, Collections.USERS, user.uid), {
                isFirstTime: false
              }, { merge: true }).catch(console.error);
            }
          }}
        />
      )}
    `;

    content = beforeLastDiv + tourComponent + afterLastDiv;
  }
}

// Write the updated content
fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('✅ Dashboard updated successfully with onboarding tour and sample data!');
