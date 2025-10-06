# 🔧 Gemini API Setup & Troubleshooting Guide

## ✅ Step 1: Add API Key to .env file

Open or create `ReddyfitWebsiteready/.env` and add:

```bash
VITE_GEMINI_API_KEY=AIzaSyDKyxXoi7TpBGoLVR8eAOGEEO1DKtbpi4o
```

## ✅ Step 2: Enable Gemini API in Google Cloud

1. Go to: https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=123730832729
2. Click "Enable API" button
3. Wait 2-5 minutes for the API to propagate

## ✅ Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
cd ReddyfitWebsiteready
npm run dev
```

## 📊 API Usage Limits (Free Tier)

- **Rate Limit**: 15 requests per minute
- **Daily Limit**: 1,500 requests per day
- **Cost**: FREE

## 🔍 Where Gemini API is Used

| Feature | File | Function |
|---------|------|----------|
| Body Fat % Analysis | `RapidAIPage.tsx` | `analyzeProgressPhotoWithGemini()` |
| Food Photo Analysis | `PhotoFoodInput.tsx` | `analyzeMealPhotoWithGemini()` |
| Voice Meal Analysis | `VoiceNoteInput.tsx` | `analyzeMealFromText()` |
| Workout Photo Analysis | `PhotoWorkoutInput.tsx` | `analyzeWorkoutFromPhoto()` |

## ⚠️ Common Errors & Solutions

### Error: "API has not been used in project"
**Solution**: Enable the API in Google Cloud Console (Step 2 above)

### Error: "API key not configured"
**Solution**: Add VITE_GEMINI_API_KEY to .env file (Step 1 above)

### Error: "RESOURCE_EXHAUSTED"
**Solution**: You've hit the rate limit. Wait a few minutes.

### Error: "Invalid API key"
**Solution**: Double-check your API key in .env file

## 🎤 Voice Recording (FREE - No API needed!)

Voice recording uses **browser's built-in Web Speech API** - completely free!

- Works in Chrome, Safari, Edge
- No API key needed
- No cost or rate limits

## ✅ Improved Error Handling (Just Added!)

All AI features now have:
- ✅ API key validation before requests
- ✅ Automatic retry with exponential backoff
- ✅ User-friendly error messages
- ✅ Graceful fallbacks

## 🚀 Next Steps After Setup

1. Enable the API in Google Cloud
2. Add API key to .env
3. Restart server
4. Test features:
   - Go to dashboard → "Body Fat % Checker"
   - Try "Take Photo" or "Upload Photo"
   - Try "Add Meal" → "Voice Note" or "Photo"
   - All should work now!
