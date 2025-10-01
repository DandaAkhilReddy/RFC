# Firebase Setup Instructions

## 🔥 Firestore Security Rules

The feedback form and other features require proper Firestore security rules to work.

### Quick Setup (Firebase Console)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `reddyfit-website`
3. **Navigate to**: Firestore Database → Rules
4. **Copy and paste** the rules from `firestore.rules` file
5. **Click "Publish"**

### Alternative: Deploy via Firebase CLI

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## 🔐 Security Rules Summary

### Authenticated Users Can:
✅ **Create** their own user document on sign-up
✅ **Read** their own user data
✅ **Update** their own profile, settings, feedback
✅ **Create** meals, workouts, weight logs
✅ **Read/Write** their own match preferences
✅ **Create** swipes and matches

### Protected Actions:
❌ Users **cannot delete** any documents
❌ Users **cannot read** other users' private data
❌ Users **cannot modify** other users' data
✅ Users **can read** basic info for matching (gender, interests)

## 📊 Collections Structure

| Collection | Access | Description |
|------------|--------|-------------|
| `users/{email}` | Read: Self, Write: Self | Basic user data + flags |
| `user_feedback/{email}` | Read: Self, Write: Self | Feedback responses |
| `user_settings/{email}` | Read: Self, Write: Self | Profile & fitness data |
| `meals/{id}` | Read: Self, Write: Self | Meal logs |
| `workouts/{id}` | Read: Self, Write: Self | Workout logs |
| `weight_logs/{id}` | Read: Self, Write: Self | Weight tracking |
| `matches/{id}` | Read: Both users | Daily matches |
| `swipes/{id}` | Read: Self, Write: Self | Like/pass history |
| `chat_messages/{id}` | Read: Self, Write: Self | AI chat history |
| `match_preferences/{email}` | Read: Self, Write: Self | Cupid AI preferences |

## 🚨 Current Issue

If the feedback form shows "Permission denied", it means:
- **Firestore security rules are not deployed**
- Default rules block all writes

### Fix:
Deploy the security rules from `firestore.rules` to Firebase Console.

## ✅ Test After Deployment

1. Sign in with Google
2. Fill out feedback form (all 5 steps)
3. Click "Complete & Start Your Journey"
4. Should see success message and redirect to onboarding

## 📝 Firebase Project Info

- **Project ID**: reddyfit-website
- **Auth Domain**: reddyfit-website.firebaseapp.com
- **Firestore Database**: Default (production mode)

## 🔧 Troubleshooting

### Error: "Permission denied"
- Deploy firestore.rules to Firebase Console

### Error: "Network error"
- Check internet connection
- Verify Firebase config in `src/lib/firebase.ts`

### Error: "User not authenticated"
- Sign out and sign in again
- Clear browser cache and cookies
