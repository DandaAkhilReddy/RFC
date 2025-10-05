# 🚀 Azure Static Web Apps Deployment Guide

## Environment Variables Setup

### Gemini API Key Configuration

**New Gemini API Key:** `AIzaSyDKyxXoi7TpBGoLVR8eAOGEEO1DKtbpi4o`

### Set in Azure Portal:

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your Static Web App
3. Click "Configuration" in the left menu
4. Under "Application settings", add:

```
VITE_GEMINI_API_KEY=AIzaSyDKyxXoi7TpBGoLVR8eAOGEEO1DKtbpi4o
```

### Or via Azure CLI:

```bash
az staticwebapp appsettings set \
  --name <your-app-name> \
  --setting-names VITE_GEMINI_API_KEY=AIzaSyDKyxXoi7TpBGoLVR8eAOGEEO1DKtbpi4o
```

---

## All Environment Variables Needed:

```env
# Firebase Config
VITE_FIREBASE_API_KEY=AIzaSyBFhGoxAAR4vLYLXNn8nDlKabiqhCPnWJk
VITE_FIREBASE_AUTH_DOMAIN=reddyfit-dcf41.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=reddyfit-dcf41
VITE_FIREBASE_STORAGE_BUCKET=reddyfit-dcf41.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123730832729
VITE_FIREBASE_APP_ID=1:123730832729:web:16ce63a0f2d5401f60b048
VITE_FIREBASE_MEASUREMENT_ID=G-ECC4W6B3JN
VITE_GOOGLE_CLIENT_ID=123730832729-mpvrnj8roholmg6098i7r33vugb09o1o.apps.googleusercontent.com

# Gemini AI (UPDATED)
VITE_GEMINI_API_KEY=AIzaSyDKyxXoi7TpBGoLVR8eAOGEEO1DKtbpi4o

# Azure (if needed)
AZURE_SUBSCRIPTION_ID=5801224b-ab00-4482-ac95-4ad2ce6bc61e
AZURE_TENANT_ID=76596b76-3c41-40ee-a8a3-bf6930301838
```

---

## Deployment Steps

### Option 1: Automatic via GitHub Actions

1. Push to main branch (already done ✅)
2. GitHub Actions automatically triggers
3. Builds with environment variables from Azure
4. Deploys to Static Web App

### Option 2: Manual Deployment

```bash
# Build locally
npm run build

# Deploy with Azure CLI
az staticwebapp deploy \
  --app-name <your-app-name> \
  --source-path ./dist
```

---

## Verify Deployment

1. **Check Build Status:**
   - Go to GitHub Actions tab
   - Verify build succeeded

2. **Test Features:**
   - Photo food analysis (uses Gemini API)
   - Voice meal entry (uses Gemini API)
   - Workout photo tracking (uses Gemini API)
   - Data saving to Firestore

3. **Check Logs:**
   - Azure Portal → Your Static Web App → Log Stream
   - Look for API calls and errors

---

## Features Using Gemini API

✅ **Photo Food Analysis** - Nutrition from food photos
✅ **Voice Meal Entry** - AI text analysis
✅ **Workout Photo Tracking** - OCR from displays
✅ **AI Insights** - Personalized recommendations
✅ **Body Fat Analysis** - Coming soon (beta)

---

## Troubleshooting

### If Gemini API doesn't work:

1. **Check API Key:**
   ```bash
   # Verify in Azure
   az staticwebapp appsettings list --name <your-app-name>
   ```

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for Gemini API errors
   - Check network tab for failed requests

3. **Verify API Key Quota:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Check if key is active
   - Verify rate limits

### If Data doesn't save:

1. **Check Firestore Rules:**
   - Firebase Console → Firestore Database → Rules
   - Ensure authenticated users can write

2. **Check Browser Console:**
   - Look for Firestore errors
   - Verify user is authenticated

---

## Production URL

After deployment, your app will be at:
**https://<your-app-name>.azurestaticapps.net**

---

## What's Fixed in This Deployment:

✅ Firestore data saving (weight-only updates work)
✅ Steps tracking removed (cleaner UI)
✅ 3-card dashboard (professional look)
✅ Coming Soon features (roadmap visible)
✅ New Gemini API key active

---

## Support

**Gemini API Issues:**
- API Key: AIzaSyDKyxXoi7TpBGoLVR8eAOGEEO1DKtbpi4o
- Docs: https://ai.google.dev/docs

**Firebase Issues:**
- Project: reddyfit-dcf41
- Console: https://console.firebase.google.com

**Azure Issues:**
- Portal: https://portal.azure.com
- CLI Docs: https://learn.microsoft.com/azure/static-web-apps/

---

*Last Updated: 2025-10-04*
*Status: Ready for Production ✅*
