# ReddyFit Temporal.io Integration

This directory contains Temporal workflows and activities for reliable, scalable background processing.

## 📁 Directory Structure

```
temporal/
├── README.md                           # This file
├── config.ts                           # Temporal Cloud connection config
├── client.ts                           # Client singleton for triggering workflows
├── worker.ts                           # Worker that processes workflows
├── workflows/
│   └── bodyFatAnalysisWorkflow.ts     # Body fat analysis orchestration
└── activities/
    ├── index.ts                        # Activity exports
    ├── geminiActivities.ts             # Gemini AI integration
    └── firebaseActivities.ts           # Firebase Storage & Firestore

```

## 🚀 Quick Start

### 1. Start the Worker (Required!)

The worker processes workflows. It must be running for workflows to execute.

```bash
# Terminal 1: Start worker
npm run worker

# Terminal 2: Start web app
npm run dev
```

### 2. Trigger a Workflow

From your React components:

```typescript
import { getTemporalClient } from '../temporal/client';
import TEMPORAL_CONFIG from '../temporal/config';
import type { BodyFatAnalysisInput, BodyFatAnalysisResult } from '../temporal/workflows/bodyFatAnalysisWorkflow';

// Trigger workflow
const client = await getTemporalClient();
const handle = await client.workflow.start('bodyFatAnalysisWorkflow', {
  taskQueue: TEMPORAL_CONFIG.taskQueues.bodyFatAnalysis,
  workflowId: TEMPORAL_CONFIG.workflowIds.bodyFatAnalysis(userId),
  args: [workflowInput],
});

// Get result
const result = await handle.result();
```

## 📋 Available Workflows

### 1. Body Fat Analysis Workflow

**Purpose:** Analyze user's body composition photo with AI

**Steps:**
1. Upload photo to Firebase Storage
2. Get previous analysis for comparison
3. Analyze using Gemini Vision API (with retries)
4. Validate results
5. Save to Firestore

**Usage:**
```typescript
const input: BodyFatAnalysisInput = {
  userId: user.uid,
  email: user.email,
  name: user.displayName,
  imageBase64: photoBase64,
  userContext: {
    name: user.displayName,
    email: user.email,
    startWeight: 85,
    currentWeight: 80,
    targetWeight: 75,
    fitnessGoal: 'weight loss',
    currentLevel: 'beginner',
    dailyCalories: 2000,
    dailyProtein: 150,
  },
};

const client = await getTemporalClient();
const handle = await client.workflow.start('bodyFatAnalysisWorkflow', {
  taskQueue: TEMPORAL_CONFIG.taskQueues.bodyFatAnalysis,
  workflowId: TEMPORAL_CONFIG.workflowIds.bodyFatAnalysis(userId),
  args: [input],
});

const result: BodyFatAnalysisResult = await handle.result();
```

## 🔧 Configuration

**File:** `config.ts`

- **Endpoint:** `ap-northeast-1.aws.api.temporal.io:7233`
- **Namespace:** `quickstart-areddyhh-70f499a0.tjhly`
- **API Key:** Stored in config (rotate regularly!)

## 📊 Monitoring

### Temporal Cloud Dashboard

View workflow execution in real-time:
1. Go to https://cloud.temporal.io
2. Select your namespace: `quickstart-areddyhh-70f499a0.tjhly`
3. View running/completed workflows
4. Debug failures and retry manually

### Local Monitoring

Check worker logs:
```bash
npm run worker
```

You'll see:
- Workflow starts
- Activity executions
- Errors and retries
- Completions

## 🛠️ Development

### Adding a New Workflow

1. **Create workflow file:**
```typescript
// workflows/myNewWorkflow.ts
import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { myActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: { maximumAttempts: 3 },
});

export async function myNewWorkflow(input: MyInput): Promise<MyResult> {
  const result = await myActivity(input);
  return result;
}
```

2. **Create activity:**
```typescript
// activities/myActivities.ts
export async function myActivity(input: MyInput): Promise<MyResult> {
  // Your logic here
  return result;
}
```

3. **Export activity:**
```typescript
// activities/index.ts
export * from './myActivities';
```

4. **Add task queue to config:**
```typescript
// config.ts
taskQueues: {
  myNewQueue: 'my-new-queue',
}
```

5. **Update worker** (if using different queue):
```typescript
// worker.ts - add another worker or update taskQueue
```

## 🔄 Retry Policies

Activities auto-retry with exponential backoff:

```typescript
{
  initialInterval: '1 second',
  backoffCoefficient: 2,
  maximumInterval: '1 minute',
  maximumAttempts: 5,
}
```

**Example retry timeline:**
- Attempt 1: Immediate
- Attempt 2: After 1s
- Attempt 3: After 2s
- Attempt 4: After 4s
- Attempt 5: After 8s

## 🚨 Error Handling

### Workflow Errors

Workflows return error info instead of throwing:

```typescript
const result = await handle.result();
if (!result.success) {
  console.error('Workflow failed:', result.error);
}
```

### Activity Errors

Activities throw errors, Temporal auto-retries:

```typescript
export async function myActivity(input: MyInput) {
  try {
    return await externalAPI.call(input);
  } catch (error) {
    // Re-throw to trigger Temporal retry
    throw new Error(`API failed: ${error.message}`);
  }
}
```

## 📦 Deployment

### Development
```bash
# Terminal 1
npm run worker

# Terminal 2
npm run dev
```

### Production

**Option 1: Azure Container Instance**
```bash
# Build worker Docker image
docker build -t reddyfit-worker -f Dockerfile.worker .

# Push to Azure Container Registry
az acr build --registry reddyfitacr --image worker:latest .

# Deploy to Azure Container Instance
az container create \
  --resource-group reddyfit-rg \
  --name reddyfit-worker \
  --image reddyfitacr.azurecr.io/worker:latest \
  --cpu 1 --memory 1
```

**Option 2: Separate VM**
- Deploy worker as systemd service
- Run `npm run worker` with PM2 or similar

## 🔐 Security

- ✅ API key stored in config (move to env vars for production)
- ✅ TLS encryption enabled
- ✅ Namespace isolation
- ⚠️ Rotate API key quarterly

## 📈 Future Workflows

### Daily Streak Calculation
```typescript
// Scheduled workflow running at midnight
export async function dailyStreakCalculationWorkflow()
```

### AgentCupid Matchmaking
```typescript
// Complex ML workflow for finding workout buddies
export async function matchmakingWorkflow(userId: string)
```

### Meal Plan Generation
```typescript
// LLama 3.3 70B integration for meal planning
export async function generateMealPlanWorkflow(userId: string)
```

## 💡 Tips

1. **Always run worker** - Workflows won't execute without it
2. **Check Temporal dashboard** - Best way to debug failures
3. **Use workflow IDs wisely** - Include userId and timestamp for uniqueness
4. **Test activities independently** - Unit test before adding to workflows
5. **Monitor costs** - Temporal Cloud charges per execution

## 🆘 Troubleshooting

### "Worker not connected"
→ Make sure `npm run worker` is running

### "Workflow execution timed out"
→ Check activity timeout settings in workflow

### "Activity failed after retries"
→ Check Temporal dashboard for error details

### "Cannot find module"
→ Run `npm install` to ensure all Temporal packages are installed

---

**Questions?** Check Temporal docs: https://docs.temporal.io/
