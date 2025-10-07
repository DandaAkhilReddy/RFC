# 🔌 ReddyFit API Documentation

## Base URLs

- **Production Backend**: `https://reddyfit-express-api.azurewebsites.net`
- **Production Frontend**: `https://delightful-sky-0437f100f.2.azurestaticapps.net`
- **Local Backend**: `http://localhost:3000`
- **Local Frontend**: `http://localhost:5173`

## Authentication

All endpoints requiring authentication use Firebase Authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### Health Check

#### `GET /health`

Check API health status.

**Response**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-07T10:30:00Z",
  "version": "1.0.0"
}
```

---

### Daily Scan System

#### `POST /api/scan/upload`

Upload body scan images to Azure Blob Storage.

**Authentication**: Required

**Request**
- Content-Type: `multipart/form-data`
- Fields:
  - `front`: Image file (front angle)
  - `back`: Image file (back angle)
  - `left`: Image file (left angle)
  - `right`: Image file (right angle)
  - `userId`: string
  - `date`: ISO 8601 date string

**Response**
```json
{
  "success": true,
  "urls": {
    "front": "https://reddyfitphotos.blob.core.windows.net/scans/...",
    "back": "https://reddyfitphotos.blob.core.windows.net/scans/...",
    "left": "https://reddyfitphotos.blob.core.windows.net/scans/...",
    "right": "https://reddyfitphotos.blob.core.windows.net/scans/..."
  }
}
```

**Error Response**
```json
{
  "error": "Missing required images",
  "success": false
}
```

#### `POST /api/scan/trigger-workflow`

Trigger Temporal.io 7-agent workflow for body composition analysis.

**Authentication**: Required

**Request Body**
```json
{
  "scanId": "scn_1234567890",
  "userId": "user123",
  "angleUrls": {
    "front": "https://...",
    "back": "https://...",
    "left": "https://...",
    "right": "https://..."
  },
  "weightLb": 180,
  "date": "2025-10-07"
}
```

**Response**
```json
{
  "success": true,
  "workflowId": "scan-workflow-scn_1234567890",
  "runId": "abc123...",
  "message": "Daily Scan workflow started successfully"
}
```

**Workflow Pipeline**:
1. **Agent 1 (QC)**: Image quality check
2. **Agent 2 (Estimation)**: Initial BF% estimation
3. **Agent 3 (Deltas)**: Calculate changes vs. previous scan
4. **Agent 4 (Insight)**: Generate personalized insights
5. **Agent 5 (Nutrition)**: Nutrition recommendations
6. **Agent 6 (Workout)**: Workout suggestions
7. **Agent 7 (Hydration)**: Hydration tracking

---

### User Profile

#### `GET /api/users/:userId/profile`

Get user profile with privacy settings.

**Authentication**: Required (own profile) or Public (if privacy allows)

**Response**
```json
{
  "uid": "user123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "qrSlug": "john-reddy-fit-2025",
  "privacy": {
    "showEmail": false,
    "showScans": true,
    "showStats": true
  },
  "stats": {
    "currentStreak": 7,
    "bestStreak": 15,
    "totalScans": 42,
    "totalPoints": 1250
  }
}
```

#### `PUT /api/users/:userId/profile`

Update user profile settings.

**Authentication**: Required (own profile only)

**Request Body**
```json
{
  "displayName": "John Doe",
  "privacy": {
    "showEmail": false,
    "showScans": true,
    "showStats": true
  }
}
```

#### `POST /api/users/:userId/rotate-qr-slug`

Generate new QR code slug for privacy.

**Authentication**: Required

**Response**
```json
{
  "newSlug": "john-fit-warrior-2025",
  "qrUrl": "https://delightful-sky-0437f100f.2.azurestaticapps.net/u/john-fit-warrior-2025"
}
```

---

### Social & Competition

#### `GET /api/leaderboard/global`

Get global leaderboard.

**Query Parameters**:
- `period`: `daily` | `weekly` | `monthly` | `all-time`
- `limit`: number (default: 50)

**Response**
```json
{
  "period": "weekly",
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user123",
      "displayName": "John Doe",
      "photoURL": "https://...",
      "points": 1250,
      "streak": 15
    }
  ]
}
```

#### `GET /api/friends/:userId`

Get user's friends list.

**Authentication**: Required

**Response**
```json
{
  "friends": [
    {
      "userId": "friend123",
      "displayName": "Jane Smith",
      "photoURL": "https://...",
      "currentStreak": 10,
      "totalPoints": 980,
      "status": "active"
    }
  ]
}
```

#### `POST /api/friends/:userId/request`

Send friend request.

**Authentication**: Required

**Request Body**
```json
{
  "targetUserId": "friend123"
}
```

**Response**
```json
{
  "success": true,
  "requestId": "req_1234567890",
  "status": "pending"
}
```

#### `POST /api/friends/:userId/accept`

Accept friend request.

**Authentication**: Required

**Request Body**
```json
{
  "requestId": "req_1234567890"
}
```

---

### Statistics & Analytics

#### `GET /api/stats/:userId/trend`

Get body composition trend data.

**Authentication**: Required (own stats) or Public (if privacy allows)

**Query Parameters**:
- `days`: number (14, 30, 60, 90)

**Response**
```json
{
  "period": 30,
  "data": {
    "dates": ["2025-10-07", "2025-10-06", ...],
    "bfPercents": [0.15, 0.155, 0.16, ...],
    "lbms": [150, 149, 148, ...],
    "weights": [176, 175, 174, ...]
  },
  "summary": {
    "currentBF": 15.0,
    "startBF": 16.0,
    "change": -1.0,
    "trend": "decreasing"
  }
}
```

#### `GET /api/stats/:userId/streak`

Calculate current streak.

**Authentication**: Required

**Response**
```json
{
  "currentStreak": 7,
  "bestStreak": 15,
  "lastScanDate": "2025-10-07",
  "nextMilestone": 10
}
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

## Rate Limits

- **Scan Upload**: 10 per hour per user
- **Workflow Trigger**: 10 per hour per user
- **Profile Updates**: 60 per hour per user
- **Friend Requests**: 20 per hour per user
- **Leaderboard**: 120 per hour per user

## Data Models

### Scan Document
```typescript
interface Scan {
  scanId: string;
  userId: string;
  date: string; // ISO 8601
  angleUrls: {
    front: string;
    back: string;
    left: string;
    right: string;
  };
  weightLb: number;
  bfPercent: number | null;
  lbmLb: number | null;
  qcStatus: 'pending' | 'approved' | 'rejected';
  qcFeedback: string | null;
  insights: string | null;
  deltas: {
    bfChange: number;
    lbmChange: number;
    weightChange: number;
  } | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### User Profile Document
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  qrSlug: string;
  privacy: {
    showEmail: boolean;
    showScans: boolean;
    showStats: boolean;
  };
  currentStreak: number;
  bestStreak: number;
  totalScans: number;
  totalPoints: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Day Log Document
```typescript
interface DayLog {
  userId: string;
  date: string; // YYYY-MM-DD
  scanId: string | null;
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
  };
  workout: {
    type: string;
    duration: number; // minutes
    intensity: 'light' | 'moderate' | 'vigorous';
    caloriesBurned: number;
  } | null;
  hydration: {
    cupsWater: number;
    targetCups: number;
  };
  notes: string;
  updatedAt: Timestamp;
}
```

## Temporal.io Workflow Integration

### Workflow Definition

**Workflow Name**: `dailyScanWorkflow`

**Activities**:
1. `qcActivity`: Image quality check
2. `estimationActivity`: BF% estimation
3. `deltasActivity`: Calculate changes
4. `insightActivity`: Generate insights
5. `nutritionActivity`: Nutrition recommendations
6. `workoutActivity`: Workout suggestions
7. `hydrationActivity`: Hydration tracking

**Execution Flow**:
```
Upload Images → Trigger Workflow
  → QC Check (30s)
  → Estimation (2m)
  → Deltas (30s)
  → Insight (1m)
  → Nutrition (1m)
  → Workout (1m)
  → Hydration (30s)
→ Complete (notify user)
```

**Total Duration**: ~6-7 minutes

### Monitoring Workflows

Query workflow status:
```bash
temporal workflow describe \
  --workflow-id scan-workflow-scn_1234567890 \
  --namespace reddyfit-production
```

## Development

### Local Setup

1. **Install dependencies**
```bash
cd ReddyfitWebsiteready
npm install
```

2. **Configure environment**
```bash
# .env.local
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_AZURE_STORAGE_CONNECTION_STRING=your_connection
VITE_TEMPORAL_ENDPOINT=localhost:7233
```

3. **Run development server**
```bash
npm run dev
```

### Testing Endpoints

```bash
# Health check
curl https://reddyfit-express-api.azurewebsites.net/health

# Upload scan (requires auth token)
curl -X POST https://reddyfit-express-api.azurewebsites.net/api/scan/upload \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -F "front=@front.jpg" \
  -F "back=@back.jpg" \
  -F "left=@left.jpg" \
  -F "right=@right.jpg" \
  -F "userId=user123" \
  -F "date=2025-10-07"
```

## Security

- All user data encrypted at rest (Azure Storage)
- Firebase Authentication for identity management
- Firestore security rules enforce user ownership
- API rate limiting prevents abuse
- CORS configured for production domain only
- No sensitive data in client-side code

## Support

- **Documentation**: See TESTING_GUIDE.md, DEVELOPER_SETUP.md
- **Issues**: GitHub Issues
- **Email**: support@reddyfit.com
