/**
 * Temporal Workflow Test Script
 *
 * This script tests the body fat analysis workflow end-to-end
 * Run with: npx tsx test-temporal.ts
 */

// Load environment variables first
import './src/temporal/loadEnv';

import { triggerBodyFatAnalysis } from './src/temporal/workflowService';
import type { BodyFatAnalysisInput } from './src/temporal/workflows/bodyFatAnalysisWorkflow';

// Simple 1x1 transparent PNG image (base64)
const TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testTemporalWorkflow() {
  console.log('='.repeat(60));
  console.log('🧪 Testing ReddyFit Temporal Workflow');
  console.log('='.repeat(60));
  console.log('');

  // Prepare test input
  const input: BodyFatAnalysisInput = {
    userId: 'test-user-' + Date.now(),
    email: 'test@reddyfit.club',
    name: 'Test User',
    imageBase64: TEST_IMAGE,
    userContext: {
      name: 'Test User',
      email: 'test@reddyfit.club',
      startWeight: 85,
      currentWeight: 80,
      targetWeight: 75,
      fitnessGoal: 'weight loss',
      currentLevel: 'beginner',
      dailyCalories: 2000,
      dailyProtein: 150,
    },
  };

  console.log('📋 Test Configuration:');
  console.log(`   User ID: ${input.userId}`);
  console.log(`   Name: ${input.name}`);
  console.log(`   Current Weight: ${input.userContext.currentWeight}kg`);
  console.log(`   Target Weight: ${input.userContext.targetWeight}kg`);
  console.log(`   Goal: ${input.userContext.fitnessGoal}`);
  console.log('');

  console.log('🚀 Triggering workflow...');
  console.log('   (This may take 30-60 seconds)');
  console.log('');

  const startTime = Date.now();

  try {
    // Trigger the workflow
    const result = await triggerBodyFatAnalysis(input);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ WORKFLOW COMPLETED!');
    console.log('='.repeat(60));
    console.log('');

    if (result.success) {
      console.log('📊 Analysis Results:');
      console.log(`   ✅ Body Fat: ${result.bodyFat}%`);
      console.log(`   ✅ Muscle Mass: ${result.muscleMass.substring(0, 100)}...`);
      console.log(`   ✅ Posture: ${result.posture.substring(0, 100)}...`);
      console.log(`   ✅ Photo URL: ${result.photoUrl.substring(0, 60)}...`);
      console.log('');
      console.log('💡 Recommendations:');
      result.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
      console.log('');
      console.log(`⏱️  Duration: ${duration} seconds`);
      console.log('');
      console.log('🎉 Test PASSED!');
    } else {
      console.log('❌ Workflow failed:');
      console.log(`   Error: ${result.error}`);
      console.log('');
      console.log('💡 Check worker logs for details');
    }

    console.log('');
    console.log('📍 Next Steps:');
    console.log('   1. Check worker terminal for activity logs');
    console.log('   2. View workflow in Temporal dashboard:');
    console.log('      https://cloud.temporal.io');
    console.log('   3. Verify photo in Firebase Storage');
    console.log('   4. Check Firestore body_analysis collection');
    console.log('');

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('❌ TEST FAILED');
    console.log('='.repeat(60));
    console.log('');
    console.log('Error:', error instanceof Error ? error.message : error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Is the worker running? (npm run worker)');
    console.log('   2. Check .env.local has TEMPORAL_API_KEY');
    console.log('   3. Verify internet connection');
    console.log('   4. Check worker terminal for errors');
    console.log('');

    process.exit(1);
  }
}

// Run the test
testTemporalWorkflow();
