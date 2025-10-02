# 🔥 FIREBASE SETUP REQUIRED

## You MUST set up Firebase Security Rules!

Go to: https://console.firebase.google.com/project/reddyfit-dcf41/firestore/rules

Add these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
    
    match /user_settings/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
    
    match /user_feedback/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
    
    match /meals/{mealId} {
      allow read, write: if request.auth != null;
    }
    
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click "Publish" to save!

## Also Add Storage Rules:

Go to: https://console.firebase.google.com/project/reddyfit-dcf41/storage/rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

WITHOUT THESE RULES, NOTHING WILL SAVE!
