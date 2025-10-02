# ReddyFit Database Structure

## Firebase Firestore Collections

### 1. **users** Collection
Main user profile and settings data.

```javascript
{
  userId: "user123",

  // Personal Info
  fullName: "John Doe",
  email: "john@example.com",
  age: 28,
  gender: "male",
  profilePicture: "https://...",
  coverPicture: "https://...",

  // Body Metrics
  weight: 75, // kg
  height: 175, // cm
  bmi: 24.5,
  bmr: 1750,
  bodyFat: 18, // percentage
  muscleMass: 35, // kg

  // Current Weight Journey
  startWeight: 80,
  targetWeight: 70,
  currentWeight: 75,

  // Goals & Tracking
  calorieGoal: 2000,
  currentCalories: 1200, // Today's consumed calories
  lastCalorieEdit: "2025-01-15T10:00:00Z",
  lastCalorieUpdate: "2025-01-15T18:00:00Z",

  weeklyWorkoutGoal: 5,
  currentWorkouts: 3, // This week's workouts
  lastWorkoutEdit: "2025-01-15T10:00:00Z",
  lastWorkoutUpdate: "2025-01-15T17:00:00Z",

  // Fitness Profile
  fitnessGoal: "Weight Loss", // "Weight Loss" | "Muscle Gain" | "Maintenance" | "Endurance"
  currentFitnessLevel: "Intermediate", // "Beginner" | "Intermediate" | "Advanced"
  workoutFrequency: "4-5 times/week",
  preferredWorkoutTime: "Morning",
  workoutLocation: "Gym",

  // Diet & Nutrition
  dietaryPreference: "Vegetarian", // "Vegetarian" | "Vegan" | "Keto" | "Paleo" | "None"
  allergies: "Peanuts, Shellfish",
  mealsPerDay: 3,
  waterIntake: 2.5, // liters
  nutritionGoal: "High Protein",

  // Health & Lifestyle
  sleepHours: 7,
  stressLevel: "Moderate", // "Low" | "Moderate" | "High"
  medicalConditions: "None",
  injuries: "Previous knee injury",
  activityLevel: "Active",

  // Motivation
  primaryMotivation: "Health improvement",
  biggestChallenge: "Consistency",
  commitmentLevel: "High",
  previousExperience: "2 years",

  // Streak & Engagement
  dayStreak: 15, // Consecutive days logged in
  lastLoginDate: "2025-01-15",
  totalWorkouts: 245,
  totalDaysActive: 150,

  // Location (for matching)
  location: {
    city: "New York",
    state: "NY",
    country: "USA",
    latitude: 40.7128,
    longitude: -74.0060
  },

  // Timestamps
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-15T18:00:00Z"
}
```

---

### 2. **meals** Collection
User's meal tracking and nutrition logs.

```javascript
{
  mealId: "meal123",
  userId: "user123",

  // Meal Info
  mealType: "Breakfast", // "Breakfast" | "Lunch" | "Dinner" | "Snack"
  mealName: "Oatmeal with Berries",
  description: "Rolled oats with mixed berries and honey",

  // Nutrition
  calories: 350,
  protein: 12, // grams
  carbs: 58,
  fats: 8,
  fiber: 9,
  sugar: 15,

  // Photo & Video
  photoUrl: "https://...",
  videoUrl: null, // Coming soon - cooking videos

  // Metadata
  date: "2025-01-15",
  timestamp: "2025-01-15T08:30:00Z",
  createdAt: "2025-01-15T08:30:00Z"
}
```

---

### 3. **workouts** Collection
User's workout logs and progress.

```javascript
{
  workoutId: "workout123",
  userId: "user123",

  // Workout Info
  workoutType: "Strength Training", // "Cardio" | "Strength" | "Yoga" | "HIIT" | "Sports"
  workoutName: "Upper Body Blast",
  duration: 45, // minutes

  // Performance
  caloriesBurned: 350,
  exercises: [
    {
      name: "Bench Press",
      sets: 4,
      reps: 10,
      weight: 60 // kg
    },
    {
      name: "Pull-ups",
      sets: 3,
      reps: 12
    }
  ],

  // Tracking
  difficulty: "Moderate", // "Easy" | "Moderate" | "Hard"
  notes: "Felt strong today",

  // Metadata
  date: "2025-01-15",
  timestamp: "2025-01-15T18:00:00Z",
  createdAt: "2025-01-15T18:30:00Z"
}
```

---

### 4. **weight_logs** Collection
Daily weight tracking for progress monitoring.

```javascript
{
  logId: "log123",
  userId: "user123",

  weight: 74.5, // kg
  bodyFat: 17.5, // percentage (optional)
  muscleMass: 35.2, // kg (optional)

  notes: "Feeling lighter!",

  date: "2025-01-15",
  timestamp: "2025-01-15T07:00:00Z"
}
```

---

### 5. **workout_buddies** Collection
Workout buddy connections and matches.

```javascript
{
  connectionId: "conn123",

  // Users
  userId1: "user123",
  userId2: "user456",

  // Connection Info
  status: "connected", // "pending" | "connected" | "rejected"
  connectionType: "workout_buddy",

  // Matching Info
  matchScore: 85, // percentage
  commonWorkouts: ["Strength Training", "Cardio"],
  distance: 2.5, // km

  // Interaction
  lastWorkoutTogether: "2025-01-14",
  totalWorkoutsTogether: 12,

  // Timestamps
  connectedAt: "2025-01-10T10:00:00Z",
  createdAt: "2025-01-10T10:00:00Z"
}
```

---

### 6. **cupid_matches** Collection
Dating matches (1 per day system).

```javascript
{
  matchId: "match123",

  // Users
  userId1: "user123",
  userId2: "user789",

  // Match Info
  status: "pending", // "pending" | "accepted" | "rejected" | "expired"
  compatibilityScore: 92, // percentage

  // Match Criteria
  matchedOn: ["Fitness Goal", "Workout Preference", "Location"],
  sharedInterests: ["Yoga", "Healthy Cooking", "Hiking"],

  // Dating Specific
  distance: 5.2, // km
  ageCompatibility: true,
  fitnessLevelMatch: true,

  // Daily Limit
  matchDate: "2025-01-15", // Only 1 match per day
  expiresAt: "2025-01-16T00:00:00Z", // 24 hour expiry

  // Timestamps
  createdAt: "2025-01-15T09:00:00Z",
  respondedAt: null
}
```

---

### 7. **chat_messages** Collection
Chat messages between users.

```javascript
{
  messageId: "msg123",

  // Users
  senderId: "user123",
  receiverId: "user456",
  conversationId: "conv123",

  // Message
  content: "Hey! Want to hit the gym tomorrow?",
  messageType: "text", // "text" | "image" | "video" | "workout_plan"

  // Status
  read: false,
  readAt: null,

  // Timestamp
  timestamp: "2025-01-15T14:30:00Z"
}
```

---

### 8. **videos** Collection
User-uploaded cooking/workout videos (Coming Soon).

```javascript
{
  videoId: "video123",
  userId: "user123",

  // Video Info
  title: "Healthy Protein Pancakes",
  description: "Easy high-protein breakfast recipe",
  videoUrl: "https://...",
  thumbnailUrl: "https://...",

  // Category
  category: "Cooking", // "Cooking" | "Workout" | "Transformation" | "Tips"
  tags: ["breakfast", "protein", "quick"],

  // Stats
  views: 245,
  likes: 38,

  // Recipe (for cooking videos)
  recipe: {
    ingredients: ["2 eggs", "1 banana", "1 scoop protein powder"],
    instructions: ["Mix all ingredients...", "Cook on medium heat..."],
    nutrition: {
      calories: 300,
      protein: 25,
      carbs: 35,
      fats: 8
    }
  },

  // Timestamps
  uploadedAt: "2025-01-15T12:00:00Z",
  createdAt: "2025-01-15T12:00:00Z"
}
```

---

### 9. **daily_streaks** Collection
Track daily login streaks and rewards.

```javascript
{
  streakId: "streak123",
  userId: "user123",

  // Streak Info
  currentStreak: 15, // consecutive days
  longestStreak: 45,
  totalDays: 150,

  // Daily Check-ins
  lastCheckIn: "2025-01-15",
  checkInDates: [
    "2025-01-01",
    "2025-01-02",
    "2025-01-03",
    // ...
    "2025-01-15"
  ],

  // Milestones
  milestones: [
    {
      days: 7,
      achieved: true,
      achievedAt: "2025-01-08",
      reward: "7-Day Streak Badge"
    },
    {
      days: 30,
      achieved: false
    }
  ],

  // Timestamps
  updatedAt: "2025-01-15T00:00:00Z"
}
```

---

### 10. **community_posts** Collection
Social feed posts from users.

```javascript
{
  postId: "post123",
  userId: "user123",

  // Post Content
  content: "Just completed my 100th workout! Feeling amazing! 💪",
  mediaUrls: ["https://..."], // photos/videos

  // Engagement
  likes: 42,
  likedBy: ["user456", "user789"],
  comments: 8,
  shares: 3,

  // Tags
  tags: ["milestone", "transformation", "motivation"],

  // Timestamps
  timestamp: "2025-01-15T16:00:00Z",
  createdAt: "2025-01-15T16:00:00Z"
}
```

---

### 11. **user_feedback** Collection
Likes, comments, and interactions.

```javascript
{
  feedbackId: "feedback123",

  // Target
  targetType: "post", // "post" | "video" | "comment"
  targetId: "post123",

  // User
  userId: "user456",

  // Feedback
  type: "like", // "like" | "comment" | "share"
  comment: "Amazing progress! Keep it up!",

  // Timestamp
  timestamp: "2025-01-15T16:30:00Z"
}
```

---

## Database Rules & Logic

### Auto-Update Rules:
1. **Settings → Dashboard**: When user updates settings, automatically sync to dashboard
2. **Daily Reset**: Reset `currentCalories` at midnight (00:00)
3. **Weekly Reset**: Reset `currentWorkouts` every Monday
4. **Streak Update**: Increment `dayStreak` on daily login
5. **Match Limit**: Only 1 Cupid match per user per day

### Calculations:
- **BMI**: weight / (height/100)²
- **BMR**: Mifflin-St Jeor equation
- **Weight Progress**: ((startWeight - currentWeight) / (startWeight - targetWeight)) × 100
- **Match Score**: Based on common interests, location, fitness goals

### Security:
- Users can only read/write their own data
- Matches visible to both users
- Public posts visible to all
- Private messages only between sender/receiver

---

## Implementation Notes

### Firebase Indexes Needed:
1. `meals`: userId + date
2. `workouts`: userId + date
3. `workout_buddies`: userId1, userId2, status
4. `cupid_matches`: userId1, userId2, matchDate
5. `chat_messages`: conversationId + timestamp

### Cloud Functions (Future):
1. Daily calorie reset (scheduled)
2. Weekly workout reset (scheduled)
3. Streak calculation (on login)
4. Match generation (daily at 9 AM)
5. Notification triggers

---

## UI Dashboard Mapping

### Main Dashboard:
- `currentCalories` / `calorieGoal` → Calorie Progress Card
- `currentWorkouts` / `weeklyWorkoutGoal` → Workout Progress Card
- `weight`, `startWeight`, `targetWeight` → Weight Progress Card
- `dayStreak` → Streak Display

### Diet & Nutrition Page:
- Query `meals` collection filtered by userId + date
- Show daily nutrition totals
- Upload meal photos/videos

### Workout Buddies Page:
- Query `workout_buddies` collection
- Filter by location (within 50km radius)
- Show connection status

### Dating & Matches Page:
- Query `cupid_matches` collection
- Show today's match only
- Display compatibility score

### Community Page:
- Query `community_posts` collection
- Order by timestamp
- Show likes/comments from `user_feedback`

---

This structure ensures:
✅ All UI data is backed by database
✅ Real-time updates when settings change
✅ Proper tracking and analytics
✅ Scalable for future features
