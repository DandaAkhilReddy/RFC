/**
 * Load environment variables BEFORE any other imports
 * This must be imported first in worker.ts
 */
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const result = dotenvConfig({ path: envPath });

console.log('🔍 Loading Environment Variables:');
console.log('Path:', envPath);

if (result.error) {
  console.error('❌ Error loading .env.local:', result.error.message);
} else {
  console.log('✅ .env.local loaded successfully');
}

// Check critical variables
const checks = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'TEMPORAL_API_KEY',
  'GEMINI_API_KEY',
];

checks.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`  ✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${key}: MISSING`);
  }
});

console.log('');

export {}; // Make this a module
