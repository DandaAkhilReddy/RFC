# 🧪 ReddyFit Manual Test Guide

**App URL:** http://localhost:5173
**Test Date:** 2025-10-04

---

## ⚡ Quick Smoke Test (5 minutes)

### 1. Login & Dashboard Load
- [ ] Open http://localhost:5173
- [ ] Login with Google (Firebase Auth)
- [ ] Dashboard loads without errors
- [ ] Check browser console (F12) - no errors

### 2. Photo Food Analysis (Phase 1)
- [ ] Click "Add Meal" button
- [ ] Verify 3 tabs: **Photo** | Voice | Manual
- [ ] Click "Upload Photo" or "Take Photo"
- [ ] Select a food image
- [ ] Wait for analysis (~3-5 seconds)
- [ ] **Expected:** Calories, protein, carbs, fats displayed
- [ ] Edit values if needed
- [ ] Click "Confirm & Add"
- [ ] **Expected:** Meal appears in "Today's Meals" section

### 3. Voice Note Entry (Phase 2)
- [ ] Click "Add Meal" → "Voice" tab
- [ ] Grant microphone permission
- [ ] Click "Start Recording"
- [ ] Say: *"I ate chicken rice and broccoli"*
- [ ] Click "Stop Recording"
- [ ] Click "Analyze Meal"
- [ ] **Expected:** Foods detected, nutrition shown
- [ ] Click "Confirm & Add"

### 4. Workout Photo (Phase 3)
- [ ] Click "Add Workout" button
- [ ] Click "Photo" tab
- [ ] Upload treadmill/equipment photo (or any workout image)
- [ ] Wait for analysis
- [ ] **Expected:** Exercise type, calories, duration extracted
- [ ] Click "Confirm & Add"

### 5. Insights Display (Phase 4)
- [ ] Scroll to "Progress Visualizations"
- [ ] **Expected:**
  - Calorie progress bar (orange gradient)
  - Protein progress bar (blue gradient)
  - Percentage displayed
- [ ] Scroll to "Today's Insights"
- [ ] **Expected:** 3-6 insight cards with emojis
- [ ] Verify messages are relevant to your data

### 6. Celebrations (Phase 5)
- [ ] Add meals to hit calorie goal (e.g., 2000 cal)
- [ ] **Expected:** 🎉 Confetti animation!
- [ ] Toast: "🎉 Daily calorie goal achieved!"
- [ ] Add more protein to hit goal
- [ ] **Expected:** 💪 Trophy confetti animation!
- [ ] Complete workout goal
- [ ] **Expected:** 🔥 Flame confetti!

---

## ✅ Test Result

**Status:** ⬜ Pass | ⬜ Fail
**Issues Found:** ___________________________
**Notes:** ___________________________

---

## 📸 Detailed Testing (Optional - 15 min)

### Phase 1: Photo Food Analysis

#### Test Case 1: Upload Food Photo
1. Click "Add Meal" → "Photo" tab
2. Click "Upload Photo"
3. Select image: **burger.jpg**
4. Wait for analysis

**Expected Results:**
- ✅ Photo preview shows
- ✅ "Analyzing..." loading state
- ✅ Food items: Burger, Fries (detected)
- ✅ Calories: ~650
- ✅ Protein: ~35g
- ✅ Carbs: ~45g
- ✅ Fats: ~28g
- ✅ Quality score: 1-5 stars
- ✅ Recommendations shown

**Actual Results:** _______________________

#### Test Case 2: Camera Capture
1. Click "Take Photo"
2. Grant camera permission
3. Point at food
4. Capture photo

**Expected:** Same analysis flow

#### Test Case 3: Non-Food Image
1. Upload car/building photo
2. **Expected:** Error: "❌ No food detected"
3. Gemini API NOT called (cost saving!)

---

### Phase 2: Voice Note Entry

#### Test Case 1: Clear Speech
1. Add Meal → Voice tab
2. Start Recording
3. Say: *"scrambled eggs with toast and orange juice"*
4. Stop Recording
5. Click "Analyze Meal"

**Expected:**
- ✅ Transcript shows correctly
- ✅ Foods: Scrambled Eggs, Toast, Orange Juice
- ✅ Nutrition estimated accurately
- ✅ Editable before confirming

**Actual:** _______________________

#### Test Case 2: Browser Support
- Chrome: ✅ Should work
- Safari: ✅ Should work
- Edge: ✅ Should work
- Firefox: ❌ "Voice not supported" message

---

### Phase 3: Workout Photo Tracking

#### Test Case 1: Treadmill Display
1. Add Workout → Photo tab
2. Upload treadmill photo with display showing:
   - Time: 30:00
   - Calories: 450
   - Distance: 5.2 km
3. Wait for AI analysis

**Expected:**
- ✅ Exercise: "Treadmill Running"
- ✅ Duration: 30 min
- ✅ Calories: 450
- ✅ Distance: 5.2 km
- ✅ Intensity: Medium/High

**Actual:** _______________________

#### Test Case 2: Gym Equipment
1. Upload gym equipment photo
2. **Expected:** AI identifies exercise type
3. Estimates calories/duration if display not visible

---

### Phase 4: Insights & Progress

#### Test Case 1: Progress Cards
1. Add meal: 500 cal, 30g protein
2. Check "Progress Visualizations"

**Expected:**
- ✅ Calorie bar: 25% (500/2000)
- ✅ Protein bar: 20% (30/150)
- ✅ Gradient animations
- ✅ "Current", "Goal", "Left" values correct

#### Test Case 2: Insight Generation
**After adding meals:**
- If < 500 cal left: "🔥 Calories Looking Good!"
- If protein low: "🥩 Boost Your Protein"
- If streak: "🎯 X Day Streak!"

**Verify:**
- [ ] Insights update in real-time
- [ ] Top 6 shown (priority sorted)
- [ ] Relevant to your data

---

### Phase 5: Celebration Animations

#### Test Case 1: Calorie Goal
1. Set goal: 2000 cal
2. Add meals totaling 2000+
3. **Expected:**
   - 🎉 Orange confetti burst
   - Toast: "🎉 Daily calorie goal achieved!"
   - Celebration only once per day

#### Test Case 2: Protein Goal
1. Reach protein goal (e.g., 150g)
2. **Expected:**
   - 💪 Dual-side gold confetti
   - Trophy animation
   - Toast message

#### Test Case 3: Perfect Day
1. Hit ALL goals (calories + protein + workout)
2. Wait 1 second
3. **Expected:**
   - 🏆 MEGA CELEBRATION
   - 5-second rainbow confetti
   - Toast: "🏆 PERFECT DAY!"

#### Test Case 4: Celebration Reset
1. Trigger celebration (e.g., calorie goal)
2. Go below goal, then exceed again
3. **Verify:** NO second celebration (same day)
4. Change date (next day)
5. Exceed goal again
6. **Verify:** NEW celebration triggers

---

## 🐛 Error Testing

### Test Invalid Inputs

#### Food Entry
- [ ] Empty meal name → Error shown
- [ ] Negative calories → Validation error
- [ ] Calories > 10000 → Error
- [ ] Photo > 10MB → Error
- [ ] Non-image file → Error

#### Workout Entry
- [ ] Empty workout name → Error
- [ ] Duration > 600 min → Error
- [ ] Negative calories → Error

**Expected:** All validation errors display clearly

---

## 📱 Mobile Testing (if available)

### Responsive Design
- [ ] Open on mobile browser
- [ ] Dashboard layout responsive
- [ ] Insights stack vertically
- [ ] Progress cards stack
- [ ] Modals fill screen
- [ ] Camera button works
- [ ] Touch targets > 44px

---

## 🎯 Final Checklist

### Core Functionality
- [ ] ✅ Photo food analysis works
- [ ] ✅ Voice meal entry works
- [ ] ✅ Workout photo tracking works
- [ ] ✅ Insights display correctly
- [ ] ✅ Celebrations trigger properly

### User Experience
- [ ] ✅ Loading states clear
- [ ] ✅ Error messages helpful
- [ ] ✅ All values editable
- [ ] ✅ Animations smooth (60fps)
- [ ] ✅ No console errors

### Data Integrity
- [ ] ✅ Meals save to Firestore
- [ ] ✅ Workouts save correctly
- [ ] ✅ Progress persists on reload
- [ ] ✅ Celebrations don't duplicate

---

## 📊 Test Summary

**Test Date:** ___________
**Tester:** ___________
**Browser:** Chrome | Safari | Edge | Firefox
**Device:** Desktop | Mobile

**Results:**
- Tests Passed: ___ / ___
- Tests Failed: ___ / ___
- Critical Issues: ___
- Minor Issues: ___

**Production Ready:** ⬜ Yes | ⬜ No | ⬜ With Fixes

---

## 🚀 Quick Commands

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type check
npm run typecheck
```

---

**Happy Testing! 🎉**

*All features built and ready for testing at http://localhost:5173*
