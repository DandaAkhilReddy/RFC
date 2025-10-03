const fs = require('fs');

const filePath = 'C:/Users/akhil/ReddyfitWebsiteready/src/components/EnhancedDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add showTour state after showOnboarding
content = content.replace(
  /const \[showOnboarding, setShowOnboarding\] = useState\(false\);/,
  `const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);`
);

// 2. Update initializeNewUser to include sample data
content = content.replace(
  /const initialData = \{[^}]*calorieGoal: 2000,[^}]*weeklyWorkoutGoal: 5,[^}]*weight: 0,[^}]*height: 0,[^}]*targetWeight: 0,[^}]*startWeight: 0,[^}]*currentCalories: 0,[^}]*currentWorkouts: 0,[^}]*lastCalorieEdit: '',[^}]*lastWorkoutEdit: '',[^}]*createdAt: new Date\(\)\.toISOString\(\),[^}]*\/\/ Discipline tracking[^}]*currentStreak: 0,[^}]*bestStreak: 0,[^}]*totalDays: 0,[^}]*workoutStreak: 0,[^}]*calorieStreak: 0,[^}]*weightStreak: 0,[^}]*aiChatStreak: 0,[^}]*lastWorkoutDate: '',[^}]*lastCalorieLog: '',[^}]*lastWeightLog: '',[^}]*lastAIChatDate: '',[^}]*workoutHistory: \[\],[^}]*calorieHistory: \[\],[^}]*weightHistory: \[\],[^}]*aiChatHistory: \[\][^}]*\};/s,
  `const initialData = {
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
        lastWeightLog: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastAIChatDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        workoutHistory: [true, true, false, true, true, false, true],
        calorieHistory: [true, true, false, true, true, false, true],
        weightHistory: [true, false, false, true, true, false, false],
        aiChatHistory: [false, true, false, false, false, false, true]
      };`
);

// 3. Update console.log message
content = content.replace(
  /console\.log\('✅ New user initialized with clean data'\);/,
  `console.log('✅ New user initialized with sample data to get started!');`
);

// 4. Add useEffect for showing tour to first-time users (after existing onboarding useEffect)
const onboardingUseEffect = content.match(/\/\/ Check if user needs to see onboarding\s+useEffect\(\(\) => \{[^}]*\}, \[user\]\);/s);
if (onboardingUseEffect) {
  content = content.replace(
    onboardingUseEffect[0],
    `// Check if user needs to see onboarding
  useEffect(() => {
    if (user && !hasSeenOnboarding()) {
      setShowOnboarding(true);
    } else if (user && isFirstTimeUser) {
      // Show tour for first-time users after brief delay
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isFirstTimeUser]);`
  );
}

// 5. Add OnboardingTour component before closing main div (before </div></main></div>)
const closingTags = '</div>\n      </main>\n    </div>\n  );\n}';
const onboardingTourJSX = `

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
    </div>
      </main>
    </div>
  );
}`;

content = content.replace(closingTags, onboardingTourJSX);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Dashboard updated successfully!');
