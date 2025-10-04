# Temporal Integration Example

## ✅ What's Been Completed

We've successfully integrated Temporal.io into your ReddyFit app! Here's what's ready:

### 📦 Installed Packages
- `@temporalio/client` - Trigger workflows from React
- `@temporalio/worker` - Process workflows in background
- `@temporalio/workflow` - Define workflow logic
- `@temporalio/activity` - Define retriable activities
- `tsx` - Run TypeScript worker

### 🏗️ Created Files

```
src/temporal/
├── README.md                           # Full documentation
├── config.ts                           # Your Temporal Cloud connection
├── client.ts                           # Reusable client singleton
├── worker.ts                           # Background worker
├── workflowService.ts                  # Easy React integration
├── workflows/
│   └── bodyFatAnalysisWorkflow.ts     # Complete workflow
└── activities/
    ├── index.ts
    ├── geminiActivities.ts             # AI analysis with retries
    └── firebaseActivities.ts           # Storage & Firestore
```

### ✨ New Collection Added
- `BODY_ANALYSIS` collection in Firebase

---

## 🚀 How to Use

### Step 1: Start the Worker

**In a new terminal:**

```bash
cd /c/Users/akhil/ReddyfitWebsiteready
npm run worker
```

You should see:
```
============================================================
🚀 ReddyFit Temporal Worker Starting...
============================================================

📡 Connecting to Temporal Cloud: ap-northeast-1.aws.api.temporal.io:7233
✅ Connected to Temporal Cloud

⚙️  Creating worker...
   Namespace: quickstart-areddyhh-70f499a0.tjhly
   Task Queue: body-fat-analysis-queue
✅ Worker created successfully

🎯 Worker is now polling for tasks...

Press Ctrl+C to stop
```

### Step 2: Use in Your React Component

**Example: RapidAIPage.tsx** (simplified integration)

```typescript
import { useState } from 'react';
import { triggerBodyFatAnalysis } from '../temporal/workflowService';
import type { BodyFatAnalysisInput } from '../temporal/workflows/bodyFatAnalysisWorkflow';

export default function RapidAIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (photoBase64: string) => {
    setLoading(true);

    try {
      // Prepare workflow input
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

      // Trigger Temporal workflow
      const analysisResult = await triggerBodyFatAnalysis(input);

      if (analysisResult.success) {
        console.log('Body Fat:', analysisResult.bodyFat + '%');
        console.log('Recommendations:', analysisResult.recommendations);
        setResult(analysisResult);
      } else {
        console.error('Analysis failed:', analysisResult.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleAnalyze(photoBase64)}>
        Analyze Body Fat
      </button>
      {loading && <p>Analyzing with AI... This may take 30-60 seconds</p>}
      {result && (
        <div>
          <h3>Results</h3>
          <p>Body Fat: {result.bodyFat}%</p>
          <p>Muscle Mass: {result.muscleMass}</p>
          <ul>
            {result.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 What Happens When You Trigger?

### Before (Direct Gemini Call):
```
User uploads photo → Call Gemini API → Hope it works → Save to Firestore
❌ If Gemini fails → User loses photo
❌ If Firebase fails → Data lost
❌ If browser closes → Process dies
```

### After (Temporal Workflow):
```
User uploads photo → Trigger Temporal workflow → Return immediately

Background Worker:
1. ✅ Upload photo to Storage (retry if fails)
2. ✅ Get previous analysis (optional)
3. ✅ Call Gemini API (retry up to 5x with backoff)
4. ✅ Validate results
5. ✅ Save to Firestore (retry if fails)
6. ✅ Return results

✅ If any step fails → Automatic retry
✅ If worker crashes → Workflow resumes
✅ If browser closes → Workflow continues
✅ Full audit trail in Temporal dashboard
```

---

## 📊 Monitoring Your Workflows

### Temporal Cloud Dashboard

1. Go to: https://cloud.temporal.io
2. Login and select namespace: `quickstart-areddyhh-70f499a0.tjhly`
3. You'll see:
   - **Running workflows** - Currently executing
   - **Completed workflows** - Successful executions
   - **Failed workflows** - With full error details
   - **Activity retries** - See retry attempts

### Local Monitoring

Check worker terminal logs:
```
[Workflow] Starting body fat analysis for user: abc123
[Activity] Uploading photo for user: abc123
[Activity] Photo uploaded successfully: https://...
[Activity] Analyzing body fat for user: abc123
[Activity] Analysis complete - Body Fat: 18.5%
[Workflow] Analysis complete!
```

---

## 🧪 Testing Without Modifying UI

Want to test before integrating? Create a test file:

```typescript
// src/temporal/test.ts
import { triggerBodyFatAnalysis } from './workflowService';

async function testWorkflow() {
  const result = await triggerBodyFatAnalysis({
    userId: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    imageBase64: 'YOUR_BASE64_IMAGE_HERE',
    userContext: {
      name: 'Test User',
      email: 'test@example.com',
      startWeight: 85,
      currentWeight: 80,
      targetWeight: 75,
      fitnessGoal: 'weight loss',
      currentLevel: 'beginner',
      dailyCalories: 2000,
      dailyProtein: 150,
    },
  });

  console.log('Result:', result);
}

testWorkflow();
```

Run it:
```bash
npx tsx src/temporal/test.ts
```

---

## 🔧 Next Steps

### 1. **Test the Worker** (Do this now!)
```bash
npm run worker
```

### 2. **Choose Integration Method**

**Option A: Quick Test (Recommended)**
- Create test file above
- Run `npx tsx src/temporal/test.ts`
- See it work in Temporal dashboard

**Option B: Full Integration**
- Update `RapidAIPage.tsx` to use `triggerBodyFatAnalysis()`
- Replace direct Gemini calls with workflow trigger
- Add loading UI while workflow executes

### 3. **Deploy to Production**
- Worker must run 24/7 in production
- Deploy to Azure Container Instance
- See `temporal/README.md` for deployment instructions

---

## 💡 Benefits You're Getting

### ✅ Reliability
- **Auto-retries**: Gemini API fails? Retry up to 5 times
- **Durable state**: Worker crashes? Workflow resumes
- **Guaranteed completion**: Photo uploaded? It WILL be analyzed

### ✅ Observable
- **See every step**: Temporal dashboard shows full execution
- **Debug easily**: Failed? See exact error and retry attempts
- **Audit trail**: Every workflow execution logged

### ✅ Scalable
- **Background processing**: User doesn't wait for slow AI
- **Multiple workers**: Run 10 workers for 10x throughput
- **Queue management**: Handle 1000s of requests smoothly

### ✅ Future-Ready
- **Daily streaks**: Cron workflows at midnight
- **AgentCupid matching**: Complex ML workflows
- **Meal planning**: Long-running LLama API calls

---

## 🆘 Troubleshooting

### Worker won't start?
```bash
# Make sure packages are installed
npm install

# Try running directly
npx tsx src/temporal/worker.ts
```

### "Cannot connect to Temporal"?
- Check your API key in `src/temporal/config.ts`
- Verify network connection
- Check Temporal Cloud status

### Workflow not executing?
1. Is worker running? Check terminal
2. Check Temporal dashboard for errors
3. Look at worker logs for activity failures

---

## 📚 Learn More

- **Temporal Docs**: https://docs.temporal.io/typescript/introduction
- **ReddyFit Temporal README**: `src/temporal/README.md`
- **Workflow Code**: `src/temporal/workflows/bodyFatAnalysisWorkflow.ts`

---

**Ready to test?** Run `npm run worker` and watch the magic happen! 🚀
