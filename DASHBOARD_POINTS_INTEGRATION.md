# Dashboard Points Integration Guide

This guide shows exactly how to integrate the points tracking system into ImprovedDashboard.tsx

## Step 1: Add Imports

**Location:** Top of `src/components/ImprovedDashboard.tsx` (after line 40)

**Add these imports:**
```typescript
import { awardMealPoints, awardWorkoutPoints, getUserPoints, UserPoints } from '../lib/pointsService';
import FriendsPage from './FriendsPage';
```

---

## Step 2: Add Points State

**Location:** After other useState declarations (around line 90)

**Add:**
```typescript
const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
```

---

## Step 3: Load User Points on Component Mount

**Location:** Inside the useEffect that loads data (or create new useEffect)

**Add:**
```typescript
useEffect(() => {
  const loadUserPoints = async () => {
    if (user?.uid) {
      const points = await getUserPoints(user.uid);
      setUserPoints(points);
    }
  };

  loadUserPoints();
}, [user?.uid]);
```

---

## Step 4: Award Points for Photo Food Entry

**Location:** Line ~1589 (after setDailyData for photo food)

**Find this code:**
```typescript
setDailyData(prev => ({
  ...prev,
  foods: [...prev.foods, foodEntry]
}));

setShowAddFood(false);
setFoodInputMode('photo'); // Reset for next time
setToast({ message: `✅ Added ${foodEntry.name}!`, type: 'success' });
```

**Replace with:**
```typescript
setDailyData(prev => ({
  ...prev,
  foods: [...prev.foods, foodEntry]
}));

// Award points for meal with photo
if (user?.uid) {
  awardMealPoints(user.uid, true).then(() => {
    getUserPoints(user.uid).then(setUserPoints);
  });
}

setShowAddFood(false);
setFoodInputMode('photo'); // Reset for next time
setToast({ message: `✅ Added ${foodEntry.name}! +50 points`, type: 'success' });
```

---

## Step 5: Award Points for Voice Food Entry

**Location:** Line ~1630 (after setDailyData for voice food)

**Find this code:**
```typescript
setDailyData(prev => ({
  ...prev,
  foods: [...prev.foods, foodEntry]
}));

setShowAddFood(false);
setFoodInputMode('voice'); // Reset for next time
setToast({ message: `✅ Added ${foodEntry.name}!`, type: 'success' });
```

**Replace with:**
```typescript
setDailyData(prev => ({
  ...prev,
  foods: [...prev.foods, foodEntry]
}));

// Award points for meal (no photo)
if (user?.uid) {
  awardMealPoints(user.uid, false).then(() => {
    getUserPoints(user.uid).then(setUserPoints);
  });
}

setShowAddFood(false);
setFoodInputMode('voice'); // Reset for next time
setToast({ message: `✅ Added ${foodEntry.name}! +30 points`, type: 'success' });
```

---

## Step 6: Award Points for Manual Food Entry

**Location:** Find the manual food entry code (search for "Manual Mode" in food section)

**After the setDailyData call, add:**
```typescript
// Award points for meal (manual)
if (user?.uid) {
  awardMealPoints(user.uid, false).then(() => {
    getUserPoints(user.uid).then(setUserPoints);
  });
}
```

**Update toast message to:**
```typescript
setToast({ message: `✅ Added ${foodEntry.name}! +30 points`, type: 'success' });
```

---

## Step 7: Award Points for Photo Workout Entry

**Location:** Line ~1929 (after setDailyData for photo workout)

**Find this code:**
```typescript
setDailyData(prev => ({
  ...prev,
  workouts: [...prev.workouts, workoutEntry]
}));

setShowAddWorkout(false);
setWorkoutInputMode('photo'); // Reset for next time
setToast({ message: `✅ Added ${workoutEntry.name}!`, type: 'success' });
```

**Replace with:**
```typescript
setDailyData(prev => ({
  ...prev,
  workouts: [...prev.workouts, workoutEntry]
}));

// Award points for workout
if (user?.uid) {
  const calories = parseInt(workoutEntry.caloriesBurned) || 0;
  awardWorkoutPoints(user.uid, calories).then(() => {
    getUserPoints(user.uid).then(setUserPoints);
  });
}

setShowAddWorkout(false);
setWorkoutInputMode('photo'); // Reset for next time
setToast({ message: `✅ Added ${workoutEntry.name}! +50 points`, type: 'success' });
```

---

## Step 8: Award Points for Manual Workout Entry

**Location:** Find the manual workout entry code

**After the setDailyData call for manual workout, add:**
```typescript
// Award points for workout
if (user?.uid) {
  const calories = parseInt(workoutEntry.caloriesBurned) || 0;
  awardWorkoutPoints(user.uid, calories).then(() => {
    getUserPoints(user.uid).then(setUserPoints);
  });
}
```

**Update toast message to:**
```typescript
setToast({ message: `✅ Added ${workoutEntry.name}! +50 points`, type: 'success' });
```

---

## Step 9: Display Points in Header

**Location:** Find the header section (where user info is displayed)

**Add a points badge:**
```typescript
{userPoints && (
  <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-full">
    <Trophy className="w-5 h-5 text-orange-600" />
    <div className="text-sm">
      <p className="font-bold text-orange-700">{userPoints.totalPoints.toLocaleString()}</p>
      <p className="text-xs text-orange-600">points</p>
    </div>
  </div>
)}
```

---

## Step 10: Update Friends Page Rendering

**Location:** Find where CommunityPage is rendered (line ~2183)

**Find:**
```typescript
{currentPage === 'friends' && <CommunityPage />}
```

**Replace with:**
```typescript
{currentPage === 'friends' && <FriendsPage />}
```

---

## Step 11: Update Leaderboard Component Call

**Location:** Find where Leaderboard is rendered (around line 1105)

**Find:**
```typescript
<Leaderboard
  period={leaderboardPeriod}
  currentUserPoints={currentUserPoints}
  currentUserRank={currentUserRank}
/>
```

**Replace with:**
```typescript
{user?.uid && (
  <Leaderboard
    userId={user.uid}
    period={leaderboardPeriod}
    scope="friends"
    showScopeSelector={true}
  />
)}
```

---

## Step 12: Remove Old Leaderboard State Variables

**Location:** Find and remove these old state variables (if they exist):

```typescript
const [currentUserPoints, setCurrentUserPoints] = useState(0);
const [currentUserRank, setCurrentUserRank] = useState(4);
```

These are no longer needed as the Leaderboard component fetches this data itself.

---

## Testing

After making these changes:

1. **Test Meal Logging:**
   - Log a meal with photo → Should show "+50 points"
   - Log a meal with voice → Should show "+30 points"
   - Log a meal manually → Should show "+30 points"
   - Check header to see points increase

2. **Test Workout Logging:**
   - Log a workout with photo → Should show "+50 points" (or more if calories > 500)
   - Log a workout manually → Should show "+50 points"
   - Check header to see points increase

3. **Test Friends Page:**
   - Navigate to Friends tab
   - Should see FriendsPage with search, requests, groups
   - Try adding a friend

4. **Test Leaderboard:**
   - Check leaderboard in dashboard
   - Should see scope selector (Friends/City/Country/Global)
   - Should show real data from Firestore

---

## Expected Behavior

**Points Awarded:**
- Meal with photo: 50 pts (30 base + 20 photo bonus)
- Meal without photo: 30 pts
- Workout: 50 pts + bonuses (25 if >500 cal, 75 if >1000 cal)
- Progress photo: 40 pts
- Daily streak: 20 pts
- Goal hit: 100 pts

**Points Display:**
- Header shows total points
- Leaderboard shows weekly/monthly/all-time
- Toast messages show points earned

---

## Common Issues

**Issue:** Points not showing in header
- **Fix:** Check if `userPoints` state is being set
- **Fix:** Make sure `getUserPoints` is being called after award

**Issue:** Leaderboard not loading
- **Fix:** Ensure `userId` is being passed to Leaderboard component
- **Fix:** Check Firebase user_points collection has data

**Issue:** Friends page not showing
- **Fix:** Verify FriendsPage import is correct
- **Fix:** Check currentPage === 'friends' condition

---

Generated: 2025-10-06
