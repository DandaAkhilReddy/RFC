# 🧪 ReddyFit Manual Testing Checklist
## Complete Step-by-Step Testing Guide

**Tester:** _____________
**Date:** 2025-10-01
**Environment:**
- [ ] Local (http://localhost:5173)
- [ ] Production (https://white-meadow-001c09f0f.2.azurestaticapps.net)

**Browser:** _____________

---

## ✅ TEST 1: AUTHENTICATION FLOW

### 1.1 Fresh Sign In (New User)
**Time Started:** ______

1. [ ] Open the application
2. [ ] Verify landing page displays with ReddyFit logo
3. [ ] Logo shows: RFC text, pink heart, green dumbbell ✓
4. [ ] Click "Sign in with Google" button
5. [ ] Google OAuth popup appears ✓
6. [ ] Select Google account and authenticate
7. [ ] **EXPECTED:** Redirected to feedback form (new user)
8. [ ] **VERIFY:** Browser console shows `[AppRouter] Showing UserFeedbackForm`
9. [ ] **VERIFY:** No console errors

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 1.2 Sign Out
**Time Started:** ______

1. [ ] From dashboard, locate sign out button (top-right)
2. [ ] Sign out button is visible ✓
3. [ ] Click "Sign Out" button
4. [ ] **EXPECTED:** Redirected to landing page
5. [ ] **EXPECTED:** Google account signed out
6. [ ] **VERIFY:** Console shows `[AppRouter] Showing LandingPage`

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 1.3 Returning User (No Form)
**Time Started:** ______

1. [ ] Sign in again with same Google account
2. [ ] **EXPECTED:** NO feedback form shown
3. [ ] **EXPECTED:** Go directly to dashboard
4. [ ] **VERIFY:** Console shows `[AppRouter] Showing MainDashboard`
5. [ ] **VERIFY:** Console shows `feedbackCompleted: true`

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

---

## ✅ TEST 2: FEEDBACK FORM

### 2.1 Form Display
**Time Started:** ______

1. [ ] Sign in as NEW user (use incognito/different account)
2. [ ] Feedback form appears immediately ✓
3. [ ] Header shows "Welcome to ReddyFit! 🎉"
4. [ ] All 7 feature cards visible:
   - [ ] Agent Reddy (Orange, Bot icon)
   - [ ] Agent FitBuddy (Green, Camera icon)
   - [ ] Agent Cupid (Pink, Heart icon)
   - [ ] Photo Analysis (Blue, Camera icon)
   - [ ] Body Fat Calculator (Cyan, Activity icon)
   - [ ] Progress Tracking (Yellow, TrendingUp icon)
   - [ ] Community & Groups (Violet, Users icon)
5. [ ] Cards have smooth slide-up animation ✓
6. [ ] Optional comments textarea visible

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 2.2 Select Features
**Time Started:** ______

1. [ ] Click "Agent Reddy" card
2. [ ] **EXPECTED:** Card scales up, orange border appears, checkmark shows ✓
3. [ ] Click again
4. [ ] **EXPECTED:** Deselects (border/checkmark disappear) ✓
5. [ ] Select 3 different features
6. [ ] **EXPECTED:** Count shows "You've selected 3 features" ✓
7. [ ] Type in comments box: "Test feedback comment"
8. [ ] **EXPECTED:** Text appears correctly ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 2.3 Submit Feedback
**Time Started:** ______

1. [ ] Click "Start Your Fitness Journey" button
2. [ ] **EXPECTED:** Button shows spinner and "Submitting..." ✓
3. [ ] **VERIFY:** Console shows:
   ```
   [UserFeedbackForm] Starting feedback submission
   [UserFeedbackForm] Step 1: Calculating waitlist number...
   [UserFeedbackForm] Step 2: Saving feedback to Firestore...
   [UserFeedbackForm] Step 3: Updating user document...
   [UserFeedbackForm] Step 4: Verifying user document update...
   [UserFeedbackForm] ✅ All steps completed successfully
   ```
4. [ ] **EXPECTED:** Success alert appears with "🎉 CONGRATULATIONS! 🎉"
5. [ ] Alert does NOT show waitlist number ✓
6. [ ] Click OK on alert
7. [ ] **EXPECTED:** Redirected to dashboard immediately ✓

**Firestore Verification:**
8. [ ] Open Firebase Console → Firestore
9. [ ] Check `user_feedback` collection
10. [ ] **VERIFY:** Your email has a document with selected features ✓
11. [ ] Check `users` collection
12. [ ] **VERIFY:** Your document has:
    - `feedbackCompleted: true` ✓
    - `onboardingCompleted: true` ✓
    - `waitlistNumber: [number]` ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

---

## ✅ TEST 3: DASHBOARD

### 3.1 Dashboard Display
**Time Started:** ______

1. [ ] Dashboard loads after feedback submission
2. [ ] Welcome message shows your first name ✓
3. [ ] 3 stat cards visible:
   - [ ] Today's Goal (2,000 cal, Utensils icon)
   - [ ] Workouts This Week (4/5, Dumbbell icon)
   - [ ] AI Chats (Active, Bot icon)
4. [ ] "Main Features" section visible
5. [ ] 3 main feature cards:
   - [ ] Agent Reddy (Orange, available, "Open →")
   - [ ] Agent FitBuddy (Green, available, "Open →")
   - [ ] Agent Cupid (Pink, available, "Open →")
6. [ ] "Coming Soon Features" section visible
7. [ ] 5 additional feature cards with lock icons
8. [ ] Quick Start Guide section at bottom
9. [ ] Settings icon visible (top-right)
10. [ ] Sign out button visible (top-right)

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 3.2 Hover Effects
**Time Started:** ______

1. [ ] Hover over "Agent Reddy" card
2. [ ] **EXPECTED:** Shadow increases, arrow moves right ✓
3. [ ] Hover over "Agent FitBuddy" card
4. [ ] **EXPECTED:** Same hover effect ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

---

## ✅ TEST 4: AGENT REDDY

### 4.1 Access Agent Reddy
**Time Started:** ______

1. [ ] From dashboard, click "Agent Reddy" card
2. [ ] **EXPECTED:** Agent Reddy page loads ✓
3. [ ] Header shows "Agent Reddy" with Bot icon
4. [ ] Orange gradient header visible
5. [ ] Back button visible (top-left)
6. [ ] Chat interface visible
7. [ ] Message input box visible
8. [ ] Send button visible

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 4.2 Navigation Back
**Time Started:** ______

1. [ ] Click back button (arrow left)
2. [ ] **EXPECTED:** Returns to main dashboard ✓
3. [ ] Dashboard shows all cards again

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

---

## ✅ TEST 5: AGENT FITBUDDY

### 5.1 Access Agent FitBuddy
**Time Started:** ______

1. [ ] From dashboard, click "Agent FitBuddy" card
2. [ ] **EXPECTED:** Agent FitBuddy page loads ✓
3. [ ] Header shows "Agent FitBuddy" with Camera icon
4. [ ] Green gradient header visible
5. [ ] "Coming Soon!" banner visible with sparkles
6. [ ] Blue info box shows:
   - [ ] "Available once per week" ✓
   - [ ] "Processing takes approximately 10 minutes" ✓
   - [ ] "You'll receive a notification when results ready" ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 5.2 Feature Information
**Time Started:** ______

1. [ ] 3 feature preview cards visible:
   - [ ] Photo Analysis (Camera icon)
   - [ ] Body Fat % (TrendingUp icon)
   - [ ] Smart Notifications (Bell icon)
2. [ ] "Analysis Process" section shows 4 steps
3. [ ] "Weekly Analysis" box at bottom visible
4. [ ] Back button works → Returns to dashboard ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

---

## ✅ TEST 6: AGENT CUPID

### 6.1 Access Agent Cupid
**Time Started:** ______

1. [ ] From dashboard, click "Agent Cupid" card
2. [ ] **EXPECTED:** Agent Cupid page loads ✓
3. [ ] Header shows "Agent Cupid" with Heart icon
4. [ ] Pink gradient header visible
5. [ ] "Coming Soon!" banner visible
6. [ ] 3 feature preview cards:
   - [ ] Smart Matching (Target icon)
   - [ ] Daily Accountability (Users icon)
   - [ ] Built-in Chat (MessageCircle icon)
7. [ ] "How It Works" section shows 4 steps
8. [ ] Back button works → Returns to dashboard ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

---

## ✅ TEST 7: SETTINGS PAGE

### 7.1 Access Settings
**Time Started:** ______

1. [ ] From dashboard, click settings icon (gear, top-right)
2. [ ] **EXPECTED:** Settings page loads ✓
3. [ ] Back button visible
4. [ ] Cover photo section visible (top)
5. [ ] Profile photo section visible
6. [ ] Personal Information section visible

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 7.2 Cover Photo Upload - VALID FILE
**Time Started:** ______

**Preparation:**
- Have a JPEG/PNG image ready (under 10MB)

**Steps:**
1. [ ] Click "Change Cover" button
2. [ ] File picker opens ✓
3. [ ] Select valid image file (JPEG, 500KB)
4. [ ] **EXPECTED:** Button shows "Uploading..." ✓
5. [ ] **VERIFY:** Console shows:
   ```
   [SettingsPage] Starting cover image upload
   [SettingsPage] Step 1: Determining container
   [SettingsPage] Step 2: Uploading to container
   [SettingsPage] Step 3: Upload successful, URL: [...]
   [SettingsPage] ✅ cover photo updated successfully
   ```
6. [ ] **EXPECTED:** Success alert "✅ Cover photo uploaded successfully!" ✓
7. [ ] **EXPECTED:** Cover photo displays in header ✓
8. [ ] Photo loads correctly (not broken image) ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 7.3 Cover Photo Upload - INVALID FILE TYPE
**Time Started:** ______

**Preparation:**
- Have a PDF or TXT file ready

**Steps:**
1. [ ] Click "Change Cover" button
2. [ ] Select invalid file (PDF)
3. [ ] **EXPECTED:** Alert shows "❌ Invalid file type. Please upload a JPEG, PNG, or WebP image." ✓
4. [ ] **EXPECTED:** Upload does NOT proceed ✓
5. [ ] Console shows: `[SettingsPage] Invalid file type: application/pdf`

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 7.4 Cover Photo Upload - FILE TOO LARGE
**Time Started:** ______

**Preparation:**
- Have an image over 10MB (or can skip if not available)

**Steps:**
1. [ ] Click "Change Cover" button
2. [ ] Select large file (>10MB)
3. [ ] **EXPECTED:** Alert shows "❌ File size must be under 10MB. Your file is XX.XXMB." ✓
4. [ ] **EXPECTED:** Upload does NOT proceed ✓
5. [ ] Console shows: `[SettingsPage] File too large: [bytes]`

**Result:** ✅ PASS / ❌ FAIL / ⏭️ SKIPPED (no large file)
**Notes:** _________________________________

### 7.5 Profile Photo Upload
**Time Started:** ______

1. [ ] Click profile picture (circular avatar)
2. [ ] Select valid image
3. [ ] **EXPECTED:** Uploads successfully ✓
4. [ ] **EXPECTED:** Profile picture updates ✓
5. [ ] Success alert appears ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 7.6 Update Personal Information
**Time Started:** ______

1. [ ] Update Name: "Test User"
2. [ ] Set Age: 30
3. [ ] Set Gender: Male
4. [ ] Set Weight: 75 kg
5. [ ] Set Height: 180 cm
6. [ ] **EXPECTED:** BMI calculates automatically ✓
7. [ ] **EXPECTED:** BMR calculates automatically ✓
8. [ ] Click "Save Settings" button
9. [ ] **EXPECTED:** Loading state shows ✓
10. [ ] **EXPECTED:** Success message appears ✓
11. [ ] Reload page
12. [ ] **EXPECTED:** Settings persist ✓

**Firestore Verification:**
13. [ ] Check `user_settings` collection
14. [ ] **VERIFY:** Your document has updated values ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

---

## ✅ TEST 8: ERROR SCENARIOS

### 8.1 Network Error Simulation
**Time Started:** ______

**Steps:**
1. [ ] Open DevTools (F12)
2. [ ] Go to Network tab
3. [ ] Set to "Offline" mode
4. [ ] Try to submit feedback form
5. [ ] **EXPECTED:** Error alert shows network error message ✓
6. [ ] Console shows appropriate error ✓
7. [ ] Set back to "Online"
8. [ ] Retry submission
9. [ ] **EXPECTED:** Works correctly ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

### 8.2 Console Error Check
**Time Started:** ______

1. [ ] Open DevTools Console (F12)
2. [ ] Navigate through entire app:
   - Landing → Sign In → Feedback → Dashboard
   - Agent Reddy → Back
   - Agent FitBuddy → Back
   - Agent Cupid → Back
   - Settings → Back
3. [ ] **VERIFY:** No red console errors ✓
4. [ ] **VERIFY:** Only informational logs with [ComponentName] prefixes ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

---

## ✅ TEST 9: MOBILE RESPONSIVE

### 9.1 Mobile View (DevTools)
**Time Started:** ______

1. [ ] Open DevTools (F12)
2. [ ] Click device toolbar icon (Ctrl+Shift+M)
3. [ ] Set to iPhone 12 Pro (or similar)
4. [ ] Test landing page:
   - [ ] Logo visible and sized correctly ✓
   - [ ] Sign in button accessible ✓
   - [ ] Text readable ✓
5. [ ] Test feedback form:
   - [ ] Cards stack vertically ✓
   - [ ] Can tap cards easily ✓
   - [ ] Submit button accessible ✓
6. [ ] Test dashboard:
   - [ ] Menu button visible (hamburger icon) ✓
   - [ ] Cards stack properly ✓
   - [ ] No horizontal scrolling ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

---

## ✅ TEST 10: PRODUCTION VERIFICATION

### 10.1 Production URL Test
**Time Started:** ______

**URL:** https://white-meadow-001c09f0f.2.azurestaticapps.net

1. [ ] Open production URL in new incognito window
2. [ ] **EXPECTED:** Landing page loads ✓
3. [ ] **EXPECTED:** No console errors ✓
4. [ ] Sign in with Google
5. [ ] Complete feedback form
6. [ ] **EXPECTED:** Submission works on production ✓
7. [ ] **VERIFY:** Firestore writes work ✓
8. [ ] Navigate to all agent pages
9. [ ] **EXPECTED:** All pages load correctly ✓
10. [ ] Test settings page
11. [ ] **EXPECTED:** Image uploads work ✓

**Result:** ✅ PASS / ❌ FAIL
**Notes:** _________________________________

---

## 📊 FINAL SUMMARY

### Test Results
- **Total Tests:** 10 categories
- **Passed:** _____ / 10
- **Failed:** _____ / 10
- **Skipped:** _____ / 10

### Critical Issues Found
1. _________________________________
2. _________________________________
3. _________________________________

### Non-Critical Issues
1. _________________________________
2. _________________________________

### Overall Assessment
- [ ] ✅ **READY FOR PRODUCTION** - All critical tests pass
- [ ] ⚠️ **READY WITH NOTES** - Minor issues noted
- [ ] ❌ **NOT READY** - Critical issues must be fixed

### Sign-off
**Tester Signature:** _____________
**Date/Time:** _____________
**Production Go-Live Approved:** YES / NO

---

## 🚀 POST-LAUNCH MONITORING (First 30 Minutes)

**Time:** ______

1. [ ] Monitor Firebase Console for user activity
2. [ ] Check for Firestore write errors
3. [ ] Monitor Azure Static Web Apps logs
4. [ ] Verify 5+ test users can sign in
5. [ ] Verify no 500 errors in browser
6. [ ] Check performance (Lighthouse score)

**Issues Found:** _________________________________
