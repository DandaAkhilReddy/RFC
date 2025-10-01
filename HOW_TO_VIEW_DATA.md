# 📊 How to View Your ReddyFit Data

## ✅ DATA IS NOW SAVING TO FIREBASE!

Your app is now connected to Firebase Firestore. Every time someone saves their profile, it goes directly to your Firebase database!

---

## 🔍 **Step-by-Step: View Your Data (Super Easy!)**

### 1. Open Firebase Console
Go to: **https://console.firebase.google.com**

### 2. Select Your Project
Click on: **`reddyfit-website`**

### 3. Open Firestore Database
- Look at the left sidebar
- Click **"Firestore Database"**
- You'll see a nice table view (like Excel!)

### 4. View Collections
You'll see these folders (called "collections"):

- **`users`** ← Click this to see all user profiles
- **`meals`** ← Daily meal logs
- **`weight_logs`** ← Weight tracking
- **`matches`** ← Matched accountability partners
- **`swipes`** ← Like/pass history

### 5. View Specific User Data
- Click on `users` collection
- You'll see documents (rows) for each user
- Click any row to see all their data
- Each user is identified by their unique ID

---

## 📱 **What Data Gets Saved?**

### When User Fills Profile (Settings Tab):
```
✅ Name
✅ Age
✅ Gender
✅ Height
✅ Weight
✅ Target Weight
✅ Activity Level
✅ Fitness Goal
✅ BMR (calculated automatically)
✅ TDEE (calculated automatically)
✅ Daily Calories (calculated automatically)
✅ Protein Target (calculated automatically)
✅ Email
✅ User ID
✅ Timestamp (when saved)
```

### Example of What You'll See:
```json
{
  "userId": "abc123xyz",
  "email": "john@example.com",
  "name": "John Doe",
  "age": 28,
  "gender": "male",
  "height": 175,
  "weight": 80,
  "targetWeight": 75,
  "activityLevel": "moderate",
  "fitnessGoal": "Weight Loss",
  "bmr": 1745,
  "tdee": 2407,
  "dailyCalories": 1907,
  "dailyProtein": 160,
  "hasCompletedProfile": true,
  "updatedAt": "October 1, 2025 at 2:00:00 AM UTC"
}
```

---

## 🧪 **Test It Yourself Right Now!**

### Try This:
1. Open your app: **https://white-meadow-001c09f0f.2.azurestaticapps.net**
2. Sign in with Google
3. Go to **Settings** tab (⚙️ icon at top)
4. Fill in your profile:
   - Name: "Test User"
   - Age: 25
   - Weight: 70
   - Height: 170
   - etc.
5. Click **"📊 Recalculate Metrics"** button
6. You'll see: **"✅ Profile saved successfully!"** alert

### Now Check Firebase:
1. Go to Firebase Console (link above)
2. Click **Firestore Database**
3. Click **`users`** collection
4. You'll see your test user data! 🎉

---

## 🔧 **Actions You Can Do in Firebase Console**

### ✅ View Data
- Click any collection to see all records
- Click any document to see details
- All data is in nice table format

### ✅ Search
- Use the search bar at top
- Search by email, name, or any field

### ✅ Export Data
- Click "Export" button
- Download as JSON
- Can convert to Excel/CSV

### ✅ Edit Data
- Click any document
- Click the pencil icon to edit
- Change values manually
- Click "Update" to save

### ✅ Delete Data
- Click any document
- Click the trash icon
- Confirm deletion

### ✅ Add New Data
- Click "Add document" button
- Enter field names and values
- Click "Save"

---

## 📊 **Useful Queries You Can Run**

### Find All Users Who Want to Lose Weight:
1. Go to `users` collection
2. Click "Start collection"
3. Add filter: `fitnessGoal` == `Weight Loss`
4. Hit Enter

### Find All Users Over 30:
1. Go to `users` collection
2. Add filter: `age` > `30`

### Find Active Users Today:
1. Go to `users` collection
2. Add filter: `updatedAt` > `[today's date]`

---

## 🚨 **Troubleshooting**

### "I don't see any data!"
**Solution**:
1. Make sure you've signed in to the app
2. Make sure you filled out the profile form
3. Make sure you clicked "Calculate Metrics" button
4. Check browser console for errors (F12 key)

### "I see an error in Firebase Console"
**Solution**:
1. Make sure you're logged into the right Google account
2. Make sure you have access to `reddyfit-website` project
3. Check Firestore rules (should allow reads/writes)

### "Data saved but I can't see it"
**Solution**:
1. Refresh the Firebase Console page
2. Click on different collection then come back
3. Check the correct project is selected

---

## 🎯 **Firebase Firestore Rules**

Your database needs these security rules to work:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read/write their own meals
    match /meals/{mealId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Users can read/write their own weight logs
    match /weight_logs/{logId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Users can read all profiles for matching
    match /users/{userId} {
      allow read: if request.auth != null;
    }

    // Users can read/write their own swipes
    match /swipes/{swipeId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Users can read their matches
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

**To update rules:**
1. Go to Firebase Console
2. Click "Firestore Database"
3. Click "Rules" tab
4. Paste the rules above
5. Click "Publish"

---

## 🎉 **Summary**

### ✅ What's Working Now:
- Profile data saves to Firebase Firestore
- You can view it in Firebase Console (easy table view)
- Data loads automatically when user logs in
- Can export, edit, delete anytime

### 📍 Your Firebase Console:
**https://console.firebase.google.com/project/reddyfit-website/firestore**

### 📍 Your Live App:
**https://white-meadow-001c09f0f.2.azurestaticapps.net**

### 🎯 Next Time User Logs In:
- App checks Firebase for their profile
- If found: Loads their data automatically ✅
- If not found: Shows default values, waits for them to fill form

---

**No coding needed! Just open Firebase Console and see your data like Excel spreadsheets!** 🚀

**Questions?** Just ask - happy to help! 😊
