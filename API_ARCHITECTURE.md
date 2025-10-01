# 🚀 ReddyFit API Architecture

## Overview
ReddyFit uses **Azure Functions** (TypeScript) for serverless backend + **Firebase Firestore** for database.

### Why This Stack?
1. **Azure Functions** = No server management, auto-scaling, pay per use
2. **TypeScript** = Fewer errors, better code quality, autocomplete
3. **Firebase Firestore** = Easy to view/edit data in browser console

---

## 🗄️ Database Structure (Firestore Collections)

All data is stored in Firebase Firestore. You can view it easily at:
**https://console.firebase.google.com/project/reddyfit-e5b50/firestore**

### Collection: `users`
**Description**: User profiles with fitness data and matching preferences

**Example Document** (`users/abc123`):
```json
{
  "userId": "abc123",
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
  "photoUrl": "https://...",
  "bio": "Looking for accountability partner!",
  "interests": ["gym", "running", "yoga"],
  "location": "New York",
  "lookingFor": "any",
  "ageRange": { "min": 25, "max": 35 },
  "hasCompletedProfile": true,
  "createdAt": "2025-10-01T00:00:00Z",
  "updatedAt": "2025-10-01T12:30:00Z"
}
```

### Collection: `meals`
**Description**: Daily meal logs with calories and macros

**Example Document** (`meals/xyz789`):
```json
{
  "userId": "abc123",
  "date": "2025-10-01",
  "mealType": "breakfast",
  "items": ["Oatmeal", "Banana", "Protein shake"],
  "calories": 450,
  "protein": 30,
  "carbs": 60,
  "fats": 10,
  "timestamp": "2025-10-01T08:00:00Z"
}
```

### Collection: `weight_logs`
**Description**: Daily weight tracking

**Example Document** (`weight_logs/def456`):
```json
{
  "userId": "abc123",
  "weight": 79.5,
  "date": "2025-10-01",
  "timestamp": "2025-10-01T07:00:00Z"
}
```

### Collection: `swipes`
**Description**: Swipe history (like/pass on potential matches)

**Example Document** (`swipes/ghi789`):
```json
{
  "userId": "abc123",
  "targetUserId": "xyz999",
  "liked": true,
  "timestamp": "2025-10-01T15:30:00Z"
}
```

### Collection: `matches`
**Description**: Mutual matches (accountability partners)

**Example Document** (`matches/match001`):
```json
{
  "user1Id": "abc123",
  "user2Id": "xyz999",
  "matchedAt": "2025-10-01T15:32:00Z",
  "lastMessageAt": "2025-10-01T16:00:00Z",
  "isActive": true
}
```

### Collection: `chat_messages`
**Description**: Messages between matched users

**Example Document** (`chat_messages/msg001`):
```json
{
  "matchId": "match001",
  "senderId": "abc123",
  "message": "Hey! Ready for today's workout?",
  "timestamp": "2025-10-01T16:00:00Z",
  "read": false
}
```

---

## 📡 API Endpoints (Azure Functions)

### Base URL
- **Local Development**: `http://localhost:7071/api`
- **Production**: `https://reddyfit-api.azurewebsites.net/api`

### Authentication
All API calls require Firebase Auth token in header:
```
Authorization: Bearer <firebase_id_token>
```

### Endpoints

#### 1. Get User Profile
```
GET /profile/{userId}
```
**Response**:
```json
{
  "hasProfile": true,
  "profile": { /* user profile object */ }
}
```

#### 2. Save/Update User Profile
```
POST /profile/{userId}
```
**Body**:
```json
{
  "name": "John Doe",
  "age": 28,
  "gender": "male",
  "height": 175,
  "weight": 80,
  "targetWeight": 75,
  "activityLevel": "moderate",
  "fitnessGoal": "Weight Loss",
  "bio": "Looking for gym buddy",
  "interests": ["gym", "running"]
}
```

#### 3. Get Potential Matches
```
GET /matches/{userId}/potential
```
**Response**:
```json
{
  "success": true,
  "matches": [
    {
      "userId": "xyz999",
      "name": "Jane Smith",
      "age": 26,
      "photoUrl": "https://...",
      "bio": "Fitness enthusiast",
      "fitnessGoal": "Weight Loss",
      "matchScore": 85
    }
  ]
}
```

#### 4. Swipe on Match (Like/Pass)
```
POST /matches/{userId}/swipe
```
**Body**:
```json
{
  "targetUserId": "xyz999",
  "liked": true
}
```
**Response**:
```json
{
  "success": true,
  "liked": true,
  "isMatch": true,
  "matchId": "match001",
  "message": "🎉 It's a match! You can now start chatting!"
}
```

---

## 🎯 Matching Algorithm

The smart matching algorithm scores potential partners (0-100) based on:

1. **Same Fitness Goal** (+30 points)
   - Weight Loss matches with Weight Loss
   - Muscle Gain matches with Muscle Gain

2. **Similar Activity Level** (+25 points)
   - Exact match: +25
   - 1 level difference: +15

3. **Similar Age** (+20 points)
   - Within 3 years: +20
   - Within 7 years: +10

4. **Shared Interests** (+25 points)
   - +5 points per shared interest (max 25)

**Example**:
- User A: 28yo, Male, Weight Loss, Moderate Activity, [gym, running]
- User B: 26yo, Female, Weight Loss, Moderate Activity, [gym, yoga]
- **Match Score**: 30 (same goal) + 25 (same activity) + 20 (age diff 2) + 5 (1 shared interest) = **80/100** ⭐

---

## 🔍 How to View Data (For Non-Coders)

### Method 1: Firebase Console (Easiest)
1. Go to: https://console.firebase.google.com
2. Select project: **reddyfit-e5b50**
3. Click "Firestore Database" in left menu
4. You'll see all collections in a nice table view
5. Click any document to see/edit data

### Method 2: Azure Portal
1. Go to: https://portal.azure.com
2. Search for "reddyfit-api"
3. Click "Functions" to see all API functions
4. Click "Monitor" to see logs and usage

### What You Can See:
- ✅ Total users registered
- ✅ User profiles with all details
- ✅ Daily meals logged
- ✅ Weight history charts
- ✅ Swipe history (who liked whom)
- ✅ Matched pairs
- ✅ Chat messages

---

## 💡 Key Features

### 1. Smart Onboarding Flow
- **New User**: Shows onboarding form → Saves to Firestore → Redirects to dashboard
- **Existing User**: Checks Firestore → If profile exists → Goes straight to dashboard

### 2. Dating App Style Matching
- Swipe right = Like
- Swipe left = Pass
- Both like each other = Match! 🎉
- Can chat with matches

### 3. Data Science Analytics
- Weight trends (gaining/losing/stable)
- Calorie adherence rate
- Progress predictions
- AI recommendations

### 4. Easy Data Management
- All data in one place (Firestore)
- Can export to Excel/CSV
- Can view graphs in Firebase console
- Can manually edit/delete data if needed

---

## 🚀 Deployment Commands

### Install Dependencies
```bash
cd api
npm install
```

### Run Locally
```bash
npm start
```

### Deploy to Azure
```bash
func azure functionapp publish reddyfit-api
```

---

## 🔐 Environment Variables Needed

Create `api/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "FIREBASE_PROJECT_ID": "reddyfit-e5b50",
    "FIREBASE_CLIENT_EMAIL": "firebase-adminsdk@...",
    "FIREBASE_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\n..."
  }
}
```

---

## 📊 Database Indexes (Performance)

Firestore needs these indexes for fast queries:

1. **Collection**: `swipes`
   - Fields: `userId` (Ascending), `targetUserId` (Ascending), `liked` (Ascending)

2. **Collection**: `meals`
   - Fields: `userId` (Ascending), `date` (Descending)

3. **Collection**: `matches`
   - Fields: `user1Id` (Ascending), `isActive` (Ascending)

Firebase will auto-suggest creating these when you run queries.

---

## 🎨 Frontend Integration

The React app will call these functions using the `api.ts` service:

```typescript
import { getUserProfile, saveUserProfile, getPotentialMatches, swipeMatch } from './lib/api';

// Check if user has completed profile
const { hasProfile, profile } = await getUserProfile(userId);

// Save profile after onboarding
await saveUserProfile(userId, profileData);

// Get matches to swipe on
const matches = await getPotentialMatches(userId);

// Swipe right
await swipeMatch(userId, targetUserId, true);
```

---

## ✅ Summary

**For You (Non-Coder)**:
- All data is in Firebase Console (easy to view like Excel)
- Can see users, meals, weights, matches in nice tables
- Can export data anytime
- Can manually add/edit/delete if needed

**For Developers**:
- Azure Functions = Serverless, scalable, cost-effective
- TypeScript = Type-safe, fewer bugs
- Firebase = Real-time updates, easy queries
- Clear separation of concerns
- RESTful API design

🎉 **The system is production-ready and easy to maintain!**
