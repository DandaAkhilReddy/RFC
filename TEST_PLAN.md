# ReddyFit Comprehensive Test Plan
## Production Deployment Checklist

**Target:** Go-live in 2 hours
**Date:** 2025-10-01
**Tester:** Automated + Manual Testing

---

## 🔐 1. AUTHENTICATION TESTS

### Test Case 1.1: Sign In with Google
- [ ] **Action:** Click "Sign in with Google" button
- [ ] **Expected:** Google OAuth popup appears
- [ ] **Expected:** After authentication, user is redirected to feedback form (new user) OR dashboard (returning user)
- [ ] **Edge Case:** Popup blocked → Should fall back to redirect method
- [ ] **Edge Case:** Network error → Should show error message
- [ ] **Verify:** Check Firebase Auth console for new user entry
- [ ] **Verify:** Check Firestore `users` collection for user document creation

### Test Case 1.2: Sign Out
- [ ] **Action:** Click sign out button in dashboard header
- [ ] **Expected:** User is signed out and redirected to landing page
- [ ] **Expected:** Can sign in again successfully
- [ ] **Edge Case:** Network error during sign out → Should still clear local session

### Test Case 1.3: Session Persistence
- [ ] **Action:** Sign in, close browser, reopen
- [ ] **Expected:** User remains signed in
- [ ] **Expected:** Redirected to dashboard (not feedback form)

---

## 📝 2. FEEDBACK FORM TESTS

### Test Case 2.1: New User - First Time Form
- [ ] **Action:** Sign in as new user
- [ ] **Expected:** Feedback form displays immediately
- [ ] **Expected:** Beautiful slide-up animations work
- [ ] **Expected:** All 7 feature cards visible and clickable

### Test Case 2.2: Select Features
- [ ] **Action:** Click on each feature card
- [ ] **Expected:** Card scales up, shows orange border, checkmark appears
- [ ] **Expected:** Click again deselects (border/checkmark disappears)
- [ ] **Expected:** Selected count updates in real-time
- [ ] **Verify:** Can select 0, 1, or all 7 features

### Test Case 2.3: Optional Comments
- [ ] **Action:** Type in comments textarea
- [ ] **Expected:** Text saves and displays correctly
- [ ] **Expected:** Can leave blank (optional)

### Test Case 2.4: Submit Feedback - Success Path
- [ ] **Action:** Click "Start Your Fitness Journey" button
- [ ] **Expected:** Button shows loading spinner "Submitting..."
- [ ] **Expected:** After ~2 seconds, success alert appears
- [ ] **Expected:** Alert says "🎉 CONGRATULATIONS! 🎉" (no waitlist number)
- [ ] **Expected:** After clicking OK, dashboard appears
- [ ] **Verify:** Check Firestore `user_feedback` collection for entry
- [ ] **Verify:** Check Firestore `users` collection - `feedbackCompleted: true`
- [ ] **Verify:** Check Firestore `users` collection - `onboardingCompleted: true`
- [ ] **Verify:** `waitlistNumber` is 4x the count of feedback entries

### Test Case 2.5: Submit Feedback - Error Scenarios
- [ ] **Edge Case:** No internet connection → Should show network error
- [ ] **Edge Case:** Firebase rules not deployed → Should show permission denied
- [ ] **Edge Case:** User signs out during submission → Should handle gracefully
- [ ] **Verify:** Console logs show [UserFeedbackForm] prefixed messages
- [ ] **Verify:** Step 1-4 logs appear in correct order

### Test Case 2.6: Returning User - No Form
- [ ] **Action:** Sign out, sign in again
- [ ] **Expected:** NO feedback form shown
- [ ] **Expected:** Goes directly to dashboard
- [ ] **Verify:** Firestore flags prevent form reappearance

---

## 🏠 3. DASHBOARD TESTS

### Test Case 3.1: Dashboard Display
- [ ] **Expected:** Welcome message shows user's first name
- [ ] **Expected:** 3 stat cards visible (Today's Goal, Workouts, AI Chats)
- [ ] **Expected:** 3 main feature cards visible
- [ ] **Expected:** 5 "Coming Soon" feature cards visible
- [ ] **Expected:** Quick Start Guide section visible
- [ ] **Expected:** Sign out button visible in top-right

### Test Case 3.2: Agent Cards
- [ ] **Verify:** Agent Reddy - Orange gradient, Bot icon
- [ ] **Verify:** Agent FitBuddy - Green gradient, Camera icon
- [ ] **Verify:** Agent Cupid - Pink gradient, Heart icon
- [ ] **Verify:** All cards show "Open →" arrow
- [ ] **Verify:** Hover effects work (shadow increases, arrow moves)

---

## 🤖 4. AGENT REDDY TESTS

### Test Case 4.1: Access Agent Reddy
- [ ] **Action:** Click "Agent Reddy" card from dashboard
- [ ] **Expected:** Agent Reddy page loads
- [ ] **Expected:** Orange gradient header with Bot icon
- [ ] **Expected:** Back button visible and functional

### Test Case 4.2: Functionality
- [ ] **Expected:** Chat interface visible
- [ ] **Expected:** Can type messages
- [ ] **Expected:** Can send messages
- [ ] **Action:** Click back button
- [ ] **Expected:** Returns to main dashboard

---

## 💚 5. AGENT FITBUDDY TESTS

### Test Case 5.1: Access Agent FitBuddy
- [ ] **Action:** Click "Agent FitBuddy" card from dashboard
- [ ] **Expected:** Agent FitBuddy page loads
- [ ] **Expected:** Green gradient header with Camera icon
- [ ] **Expected:** "Coming Soon" banner visible

### Test Case 5.2: Feature Information
- [ ] **Expected:** Blue info box shows:
  - "Available once per week"
  - "Processing takes approximately 10 minutes"
  - "You'll receive a notification when results ready"
- [ ] **Expected:** 3 feature preview cards visible
- [ ] **Expected:** 4-step analysis process documented
- [ ] **Expected:** Weekly analysis frequency box at bottom

### Test Case 5.3: Navigation
- [ ] **Action:** Click back button
- [ ] **Expected:** Returns to main dashboard

---

## 💗 6. AGENT CUPID TESTS

### Test Case 6.1: Access Agent Cupid
- [ ] **Action:** Click "Agent Cupid" card from dashboard
- [ ] **Expected:** Agent Cupid page loads
- [ ] **Expected:** Pink gradient header with Heart icon
- [ ] **Expected:** "Coming Soon" banner visible

### Test Case 6.2: Feature Information
- [ ] **Expected:** 3 feature preview cards visible
- [ ] **Expected:** 4-step "How It Works" process documented

### Test Case 6.3: Navigation
- [ ] **Action:** Click back button
- [ ] **Expected:** Returns to main dashboard

---

## ⚙️ 7. SETTINGS PAGE TESTS

### Test Case 7.1: Access Settings
- [ ] **Action:** Click settings icon in dashboard header
- [ ] **Expected:** Settings page loads
- [ ] **Expected:** Back button visible

### Test Case 7.2: Cover Photo Upload
- [ ] **Action:** Click "Change Cover" button
- [ ] **Action:** Select image file (JPEG/PNG)
- [ ] **Expected:** Button shows "Uploading..." during upload
- [ ] **Expected:** Cover photo appears after upload
- [ ] **Verify:** Check Azure Blob Storage or Firebase Storage
- [ ] **Verify:** URL saved in Firestore user_settings
- [ ] **Edge Case:** File too large (>10MB) → Should show error
- [ ] **Edge Case:** Invalid file type → Should reject
- [ ] **Edge Case:** Network error → Should show error

### Test Case 7.3: Profile Photo Upload
- [ ] **Action:** Click profile picture
- [ ] **Action:** Select image file
- [ ] **Expected:** Uploads and displays correctly

### Test Case 7.4: Personal Information
- [ ] **Action:** Update name, age, gender, weight, height
- [ ] **Action:** Click "Save Settings"
- [ ] **Expected:** Success message appears
- [ ] **Expected:** BMI and BMR recalculate automatically
- [ ] **Verify:** Check Firestore user_settings collection

### Test Case 7.5: Fitness Questionnaire
- [ ] **Action:** Fill fitness goal, current level, workout frequency
- [ ] **Action:** Save settings
- [ ] **Expected:** Data persists on reload
- [ ] **Verify:** Firestore data matches UI

---

## 🎨 8. UI/UX TESTS

### Test Case 8.1: Logo Display
- [ ] **Expected:** RFC text in center
- [ ] **Expected:** Pink heart (love) in top-right
- [ ] **Expected:** Green dumbbell (fitness) in top-left
- [ ] **Expected:** Gradient: Orange → Red → Pink
- [ ] **Expected:** "CLUB RFC" subtitle visible

### Test Case 8.2: Responsive Design - Mobile
- [ ] **Action:** Test on mobile device or DevTools mobile view
- [ ] **Expected:** Sidebar hidden by default
- [ ] **Expected:** Menu button visible
- [ ] **Expected:** Cards stack vertically
- [ ] **Expected:** All text readable
- [ ] **Expected:** Touch targets large enough

### Test Case 8.3: Responsive Design - Tablet
- [ ] **Expected:** 2-column grid layouts work
- [ ] **Expected:** No horizontal scrolling

### Test Case 8.4: Responsive Design - Desktop
- [ ] **Expected:** 3-column grid layouts work
- [ ] **Expected:** Full sidebar visible
- [ ] **Expected:** Optimal layout at 1920x1080

---

## 🚨 9. ERROR HANDLING TESTS

### Test Case 9.1: Network Errors
- [ ] **Action:** Disconnect internet, try to submit form
- [ ] **Expected:** Clear error message
- [ ] **Expected:** "Try Again" button works

### Test Case 9.2: Permission Errors
- [ ] **Scenario:** Simulate Firestore permission denied
- [ ] **Expected:** Specific error message about Firebase rules
- [ ] **Expected:** Error screen with retry button

### Test Case 9.3: Authentication Errors
- [ ] **Scenario:** User token expires
- [ ] **Expected:** Prompt to re-authenticate
- [ ] **Expected:** No data loss

---

## 📊 10. PERFORMANCE TESTS

### Test Case 10.1: Load Time
- [ ] **Metric:** Landing page loads < 3 seconds
- [ ] **Metric:** Dashboard loads < 2 seconds
- [ ] **Metric:** Agent pages load < 1 second

### Test Case 10.2: Bundle Size
- [ ] **Verify:** JavaScript bundle < 1.2MB
- [ ] **Verify:** CSS bundle < 60KB
- [ ] **Verify:** Lighthouse score > 90

---

## 🔒 11. SECURITY TESTS

### Test Case 11.1: Firestore Rules
- [ ] **Verify:** Users can only read/write their own data
- [ ] **Verify:** Cannot delete any documents
- [ ] **Verify:** Unauthenticated users have no access
- [ ] **Test:** Try to access other user's data → Should be denied

### Test Case 11.2: Admin Access
- [ ] **Verify:** Only `akhilreddyd3@gmail.com` can access /admin
- [ ] **Test:** Other users try /admin → Should show 404 or redirect

---

## 📱 12. BROWSER COMPATIBILITY

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)
- [ ] **Mobile Safari** (iOS)
- [ ] **Mobile Chrome** (Android)

---

## ✅ 13. PRODUCTION DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All test cases passed
- [ ] No console errors
- [ ] Firebase rules deployed
- [ ] Environment variables set
- [ ] Build succeeds without warnings

### Deployment
- [ ] `npm run build` succeeds
- [ ] Git commit with all changes
- [ ] Push to GitHub main branch
- [ ] Azure Static Web Apps deployment triggered
- [ ] Wait for deployment to complete (~2-3 min)

### Post-Deployment
- [ ] Visit https://white-meadow-001c09f0f.2.azurestaticapps.net
- [ ] Test authentication on production
- [ ] Test feedback form on production
- [ ] Test all agent pages on production
- [ ] Verify Firestore writes work on production
- [ ] Check Azure/Firebase logs for errors

---

## 🐛 KNOWN ISSUES TO FIX

1. ❌ Cover photo upload - NEEDS TESTING
2. ❓ Image upload error handling
3. ❓ Large file size handling

---

## 📝 TEST EXECUTION LOG

| Test # | Status | Notes | Time |
|--------|--------|-------|------|
| 1.1 | ⏳ Pending | Sign in flow | |
| 1.2 | ⏳ Pending | Sign out | |
| 2.4 | ⏳ Pending | Form submission | |
| 7.2 | ⚠️ CRITICAL | Cover photo | |

---

**Next Steps:**
1. Run manual tests on localhost:5173
2. Fix any critical issues found
3. Deploy to production
4. Run smoke tests on production URL
5. Monitor for 30 minutes post-launch
