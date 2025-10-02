# GitHub Setup for Automated Deployments

## Step 1: Get Azure Static Web App API Token

### Option A: Via Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Static Web Apps**
3. Click on **ReddyfitWebsiteready**
4. In left menu, click **Settings** → **Configuration**
5. Click **Manage deployment token**
6. Copy the token (it's very long)

### Option B: Via Azure CLI
```bash
az staticwebapp secrets list --name ReddyfitWebsiteready --resource-group sixpack-rg --query "properties.apiKey" -o tsv
```

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each:

### Add These Secrets:

| Secret Name | Value |
|------------|-------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | (Token from Step 1) |
| `VITE_FIREBASE_API_KEY` | `AIzaSyBFhGoxAAR4vLYLXNn8nDlKabiqhCPnWJk` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `reddyfit-dcf41.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `reddyfit-dcf41` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `reddyfit-dcf41.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123730832729` |
| `VITE_FIREBASE_APP_ID` | `1:123730832729:web:16ce63a0f2d5401f60b048` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-ECC4W6B3JN` |
| `VITE_GOOGLE_CLIENT_ID` | `1069272134679-sslde9rl9h95t60q38crhidiug6n6emt.apps.googleusercontent.com` |
| `VITE_GOOGLE_CLIENT_SECRET` | `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` |

## Step 3: Verify Setup

1. Push to `development` branch:
```bash
git checkout development
git add .
git commit -m "test auto-deploy"
git push origin development
```

2. Go to GitHub → **Actions** tab
3. You should see workflow running
4. Check development URL after it completes: https://delightful-sky-0437f100f-preview.eastus2.2.azurestaticapps.net

## Step 4: Push Branches to GitHub

```bash
git push origin development
git push origin production
```

## Troubleshooting

### If workflow fails:
1. Check GitHub Actions logs for errors
2. Verify all secrets are added correctly
3. Make sure Azure token is valid (not expired)

### If deployment works but site shows errors:
1. Check browser console for errors
2. Verify Firebase credentials are correct
3. Check that authorized domains are added in Firebase Console
