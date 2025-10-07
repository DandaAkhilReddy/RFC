# 🏗️ ReddyFit System Architecture

## Overview

ReddyFit is a modern fitness tracking platform built with React 19, Firebase, and Temporal.io. The system enables users to track body composition through AI-powered image analysis and compete with friends in a gamified social fitness environment.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React 19 + TypeScript + Vite + Tailwind CSS               │
│  (Azure Static Web Apps)                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTPS / REST API
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Backend Services                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Express    │  │   Firebase   │  │  Temporal.io │     │
│  │     API      │  │   Firestore  │  │   Workflows  │     │
│  │  (Node.js)   │  │     Auth     │  │  (7 Agents)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Azure App Service  Firebase Cloud   Temporal Cloud         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Storage
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   Data Storage Layer                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Azure Blob   │  │  Firestore   │  │  Firebase    │     │
│  │   Storage    │  │   Database   │  │   Storage    │     │
│  │ (Images/QR)  │  │  (NoSQL)     │  │  (Assets)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (React 19)

```
src/
├── main.tsx                    # Entry point
├── AppRouter.tsx               # Routing + Lazy loading
├── App.tsx                     # Landing page
│
├── components/
│   ├── AuthProvider.tsx        # Authentication context
│   ├── ProtectedRoute.tsx      # Auth guard
│   │
│   ├── Dashboard/              # Dashboard components
│   │   ├── ImprovedDashboard.tsx
│   │   ├── BFTrendChart.tsx    # Body fat trend chart
│   │   ├── StreakBar.tsx       # Streak display
│   │   ├── LBMTrendChart.tsx   # Lean body mass chart
│   │   └── StatCard.tsx        # Stat display card
│   │
│   ├── DailyScan/              # Daily Scan components
│   │   ├── ScanUpload.tsx      # Image upload form
│   │   ├── ScanResults.tsx     # Results display
│   │   └── ScanHistory.tsx     # Historical scans
│   │
│   └── Profile/                # Profile components
│       ├── ProfileSettings.tsx
│       ├── PrivacySettings.tsx
│       └── QRCard.tsx          # Public QR card
│
├── pages/                      # Route pages
│   ├── DailyScanPage.tsx       # /scan
│   ├── DailyScanDashboard.tsx  # /scan/dashboard
│   ├── ProfilePage.tsx         # /profile
│   └── PublicQRCardPage.tsx    # /u/:slug
│
├── lib/                        # Business logic
│   ├── firestore/              # Firestore helpers
│   │   ├── scans.ts           # Scan CRUD + queries
│   │   ├── users.ts           # User profile CRUD
│   │   ├── dayLogs.ts         # Daily log CRUD
│   │   ├── friends.ts         # Friend system
│   │   ├── leaderboard.ts     # Leaderboard queries
│   │   └── index.ts           # Barrel export
│   │
│   └── utils/                  # Utilities
│       ├── dateUtils.ts        # Date formatting
│       └── validation.ts       # Input validation
│
├── types/                      # TypeScript types
│   ├── scan.ts                # Scan interfaces
│   ├── user.ts                # User interfaces
│   └── index.ts               # Barrel export
│
└── config/
    └── firebase.ts            # Firebase config
```

### Data Flow: Daily Scan

```
User Action (Upload Photos)
       │
       ▼
┌──────────────────┐
│  ScanUpload.tsx  │  # Capture 4 images + weight
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ createScan()     │  # Save to Firestore
│ (scans.ts)       │  # Upload to Azure Blob
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ Backend API      │  # Trigger Temporal workflow
│ /trigger-workflow│
└─────────┬────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│      Temporal.io Daily Scan Workflow         │
│                                              │
│  Agent 1: QC Check (30s)                    │
│  Agent 2: BF% Estimation (2m)               │
│  Agent 3: Calculate Deltas (30s)            │
│  Agent 4: Generate Insights (1m)            │
│  Agent 5: Nutrition Recommendations (1m)     │
│  Agent 6: Workout Suggestions (1m)          │
│  Agent 7: Hydration Tracking (30s)          │
│                                              │
│  Total: 6-7 minutes                         │
└─────────┬────────────────────────────────────┘
          │
          ▼
┌──────────────────┐
│ Update Firestore │  # Update scan document
│  - bfPercent     │  # with all results
│  - lbmLb         │
│  - insights      │
│  - deltas        │
│  - qcStatus      │
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ Frontend Listens │  # Real-time listener
│  (useEffect)     │  # Updates UI automatically
└─────────┬────────┘
          │
          ▼
    Results Displayed
```

## Database Schema (Firestore)

### Collections

#### `scans` Collection

```typescript
{
  scanId: string;            // "scn_1234567890"
  userId: string;            // User ID
  date: string;              // "2025-10-07"

  // Images
  angleUrls: {
    front: string;           // Azure Blob URL
    back: string;
    left: string;
    right: string;
  };

  // Measurements
  weightLb: number;          // 180
  bfPercent: number | null;  // 15.5 (estimated by Agent 2)
  lbmLb: number | null;      // 153 (calculated by Agent 2)

  // QC Results (Agent 1)
  qcStatus: 'pending' | 'approved' | 'rejected';
  qcFeedback: string | null; // "Images look good"

  // Deltas (Agent 3)
  deltas: {
    bfChange: number;        // -0.5%
    lbmChange: number;       // +1 lb
    weightChange: number;    // +0.5 lb
  } | null;

  // Insights (Agent 4)
  insights: string | null;   // "Great progress! Keep it up..."

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes**:
- `userId + date` (composite) - Get scans for user by date
- `userId + createdAt` (composite) - Get recent scans

#### `userProfiles` Collection

```typescript
{
  uid: string;               // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL: string;

  // QR Code
  qrSlug: string;            // "john-reddy-fit-2025"

  // Privacy
  privacy: {
    showEmail: boolean;
    showScans: boolean;
    showStats: boolean;
  };

  // Stats
  currentStreak: number;     // 7 days
  bestStreak: number;        // 15 days
  totalScans: number;        // 42
  totalPoints: number;       // 1250

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes**:
- `qrSlug` (single) - Get user by QR slug
- `totalPoints` (descending) - Leaderboard

#### `dayLogs` Collection

```typescript
{
  dayLogId: string;          // "log_2025-10-07_user123"
  userId: string;
  date: string;              // "2025-10-07"
  scanId: string | null;     // Associated scan

  // Nutrition (Agent 5)
  nutrition: {
    items: Array<{
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      time: string;
    }>;
    totalCalories: number;
    totalProtein: number;
    targetCalories: number;   // AI-recommended
    targetProtein: number;    // AI-recommended
  };

  // Workout (Agent 6)
  workout: {
    type: string;             // "Strength training"
    duration: number;         // 60 minutes
    intensity: 'light' | 'moderate' | 'vigorous';
    caloriesBurned: number;
    notes: string;
  } | null;

  // Hydration (Agent 7)
  hydration: {
    cupsWater: number;        // 8 cups
    targetCups: number;       // 10 cups
  };

  // Notes
  notes: string;              // User notes

  updatedAt: Timestamp;
}
```

**Indexes**:
- `userId + date` (composite) - Get log for user by date

#### `friends` Collection

```typescript
{
  friendshipId: string;      // "friend_user1_user2"
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted';
  createdAt: Timestamp;
}
```

**Indexes**:
- `user1Id + status` (composite)
- `user2Id + status` (composite)

#### `user_points` Collection

```typescript
{
  userId: string;
  totalPoints: number;
  dailyPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastUpdated: Timestamp;
  pointsBreakdown: {
    scans: number;
    streaks: number;
    nutrition: number;
    workouts: number;
    hydration: number;
  };
}
```

#### `leaderboards` Collection

```typescript
{
  leaderboardId: string;     // "daily_2025-10-07"
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  date: string;              // "2025-10-07"
  rankings: Array<{
    rank: number;
    userId: string;
    displayName: string;
    photoURL: string;
    points: number;
    streak: number;
  }>;
  updatedAt: Timestamp;
}
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Scans - User can only read/write their own
    match /scans/{scanId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow delete: if false; // Never allow delete
    }

    // User Profiles - Public read if privacy allows
    match /userProfiles/{profileId} {
      allow read: if true; // Public for QR cards
      allow create, update: if isOwner(resource.data.uid);
      allow delete: if false;
    }

    // Day Logs - Private
    match /dayLogs/{logId} {
      allow read, write: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow delete: if false;
    }

    // Friends - Participants only
    match /friends/{friendshipId} {
      allow read: if isSignedIn() && (
        resource.data.user1Id == request.auth.uid ||
        resource.data.user2Id == request.auth.uid
      );
      allow create: if isSignedIn();
      allow update: if isSignedIn() && (
        resource.data.user1Id == request.auth.uid ||
        resource.data.user2Id == request.auth.uid
      );
      allow delete: if isSignedIn() && (
        resource.data.user1Id == request.auth.uid ||
        resource.data.user2Id == request.auth.uid
      );
    }

    // Leaderboards - Public read
    match /leaderboards/{leaderboardId} {
      allow read: if true;
      allow write: if false; // Only backend can write
    }

    // User Points - Public read, own write
    match /user_points/{userId} {
      allow read: if true;
      allow write: if isOwner(userId);
    }
  }
}
```

## Backend Architecture

### Express API (Node.js)

**File**: `reddyfit-express-api/index.js`

```javascript
// Key endpoints
app.post('/api/scan/upload', uploadImages);        // Upload to Azure Blob
app.post('/api/scan/trigger-workflow', triggerWorkflow); // Start Temporal workflow
app.get('/api/users/:userId/profile', getUserProfile);
app.put('/api/users/:userId/profile', updateProfile);
app.get('/api/leaderboard/:period', getLeaderboard);
app.get('/api/stats/:userId/trend', getTrendData);
```

### Temporal.io Workflows

**Workflow**: `dailyScanWorkflow`

```typescript
import { proxyActivities } from '@temporalio/workflow';

const {
  qcActivity,
  estimationActivity,
  deltasActivity,
  insightActivity,
  nutritionActivity,
  workoutActivity,
  hydrationActivity
} = proxyActivities({ startToCloseTimeout: '5m' });

export async function dailyScanWorkflow(scanData: ScanData) {
  // Agent 1: QC Check
  const qcResult = await qcActivity(scanData);
  if (qcResult.status === 'rejected') {
    return { error: 'Image quality rejected', feedback: qcResult.feedback };
  }

  // Agent 2: Estimation
  const estimation = await estimationActivity(scanData);

  // Agent 3: Deltas
  const deltas = await deltasActivity(scanData, estimation);

  // Agent 4: Insights
  const insights = await insightActivity(scanData, estimation, deltas);

  // Agent 5: Nutrition
  const nutrition = await nutritionActivity(scanData, estimation);

  // Agent 6: Workout
  const workout = await workoutActivity(scanData, estimation);

  // Agent 7: Hydration
  const hydration = await hydrationActivity(scanData);

  return {
    estimation,
    deltas,
    insights,
    nutrition,
    workout,
    hydration
  };
}
```

**Activities**: Each agent implemented as separate activity

```typescript
// activities/qcActivity.ts
export async function qcActivity(scanData: ScanData): Promise<QCResult> {
  // Use Gemini Vision API to analyze image quality
  const prompt = "Analyze these 4 body scan images for quality...";
  const result = await geminiVision(prompt, scanData.angleUrls);

  return {
    status: result.approved ? 'approved' : 'rejected',
    feedback: result.feedback
  };
}

// activities/estimationActivity.ts
export async function estimationActivity(scanData: ScanData): Promise<Estimation> {
  // Use Gemini Vision + custom model for BF% estimation
  const prompt = "Estimate body fat percentage from these images...";
  const result = await geminiVision(prompt, scanData.angleUrls);

  const bfPercent = parseFloat(result.bfPercent);
  const lbmLb = scanData.weightLb * (1 - bfPercent);

  return { bfPercent, lbmLb };
}

// Similar patterns for other agents...
```

## Authentication Flow

```
User clicks "Sign in with Google"
       │
       ▼
┌──────────────────┐
│ Firebase Auth    │  # Redirect to Google OAuth
│ signInWithPopup()│
└─────────┬────────┘
          │
          ▼
    Google OAuth Consent
       │
       ▼
┌──────────────────┐
│ Get ID Token     │  # Firebase returns user + token
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ Create/Update    │  # Check if user profile exists
│ User Profile     │  # Create if first time
│ (Firestore)      │
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ AuthContext      │  # Store user in React context
│ (AuthProvider)   │  # Make available to all components
└─────────┬────────┘
          │
          ▼
   User authenticated
   Redirect to /dashboard
```

## Deployment Architecture

### Production Environment

```
GitHub Repository (main branch)
       │
       │ git push
       ▼
┌──────────────────┐
│ GitHub Actions   │  # CI/CD Pipeline
│ (.github/        │  # Run tests
│  workflows/)     │  # Build app
└─────────┬────────┘
          │
          ▼
┌──────────────────────────────────────┐
│  Deploy to Azure Static Web Apps     │
│                                      │
│  Frontend: delightful-sky-...        │
│  CDN: Global edge network            │
│  SSL: Automatic HTTPS                │
└──────────────────────────────────────┘

Separate deployment:
┌──────────────────────────────────────┐
│  Azure App Service                   │
│  Backend API: reddyfit-express-api   │
│  Runtime: Node.js 18                 │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Temporal Cloud                      │
│  Namespace: reddyfit-production      │
│  Workers: Auto-scaled                │
└──────────────────────────────────────┘
```

### CI/CD Pipeline

**GitHub Actions**: `.github/workflows/azure-static-web-apps.yml`

```yaml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... other env vars

      - name: Deploy to Azure
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"
```

## Performance Optimizations

### Bundle Size Optimization

**Before**: 1.5 MB main bundle
**After**: 326 KB main bundle (78% reduction)

**Techniques**:
1. **Code Splitting**: Lazy load routes
2. **Manual Chunks**: Separate vendor libraries
3. **Tree Shaking**: Remove unused code
4. **Minification**: Terser + CSS minification

**Vite Configuration**:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-charts': ['recharts', 'framer-motion'],
          'vendor-ai': ['@temporalio/client'],
          'vendor-ui': ['lucide-react', 'clsx'],
          'vendor-azure': ['@azure/storage-blob'],
          'vendor-utils': ['xlsx', 'ajv'],
        },
      },
    },
  },
});
```

### Lazy Loading Routes

```typescript
// AppRouter.tsx
const DailyScanPage = lazy(() => import('./pages/DailyScanPage'));
const DailyScanDashboard = lazy(() => import('./pages/DailyScanDashboard'));

<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/scan" element={<DailyScanPage />} />
    <Route path="/scan/dashboard" element={<DailyScanDashboard />} />
  </Routes>
</Suspense>
```

### Caching Strategy

- **Vendor chunks**: Cached indefinitely (content hash in filename)
- **App code**: Cached with content hash (invalidated on change)
- **Firestore**: Client-side cache with offline persistence
- **Images**: CDN caching on Azure Blob Storage

## Security Considerations

### Authentication

- Firebase Authentication (Google OAuth)
- ID tokens validated on backend
- Secure HTTP-only cookies for session management

### Data Security

- All data encrypted at rest (Azure, Firebase)
- TLS/HTTPS for all communication
- Firestore security rules enforce user ownership
- No sensitive data in client-side code
- Environment variables for secrets

### API Security

- Rate limiting (10 scans/hour per user)
- CORS configured for production domain only
- Input validation and sanitization
- SQL injection not applicable (NoSQL Firestore)
- XSS protection via React auto-escaping

### Privacy

- User-controlled privacy settings
- QR slug rotation for anonymity
- GDPR-compliant data export
- Opt-out of public leaderboards

## Monitoring & Observability

### Logging

- **Frontend**: Console errors → Application Insights
- **Backend**: Winston logger → Azure Monitor
- **Temporal**: Workflow execution logs

### Metrics

- **Frontend**: Core Web Vitals (LCP, FID, CLS)
- **Backend**: Response times, error rates
- **Temporal**: Workflow success/failure rates

### Alerting

- Backend API errors (threshold: 5% error rate)
- Workflow failures (threshold: 10% failure rate)
- High latency (threshold: >5s response time)

## Scalability

### Current Capacity

- **Users**: 10,000+ concurrent
- **Scans**: 10,000+ per day
- **Workflows**: 10,000+ concurrent executions

### Scaling Strategy

**Frontend**:
- Azure Static Web Apps auto-scales via CDN
- No server-side rendering (SSR) needed

**Backend API**:
- Azure App Service can scale horizontally
- Auto-scaling rules based on CPU/memory

**Temporal**:
- Temporal Cloud auto-scales workers
- Activity retry policies for reliability

**Firestore**:
- Auto-scales reads/writes
- Composite indexes for efficient queries

## Future Enhancements

### Phase 7-8 (Upcoming)

1. **Mobile Apps**: React Native apps for iOS/Android
2. **Wearable Integration**: Apple Watch, Fitbit, Garmin
3. **Nutrition Tracking**: Photo-based meal logging
4. **AI Coaching**: Personalized workout plans
5. **Video Analysis**: Movement quality assessment
6. **Social Challenges**: Group competitions
7. **Marketplace**: Connect with trainers and nutritionists

### Technical Debt

- Add end-to-end encryption for images
- Implement GraphQL for more efficient queries
- Add real-time notifications (WebSockets)
- Improve test coverage to 95%+
- Add accessibility (a11y) features

---

**Questions?** See DEVELOPER_SETUP.md for setup instructions or API_DOCUMENTATION.md for API reference.
