# 🚀 PROFESSIONAL DEPLOYMENT WORKFLOW

## Development Environments:

### 1. **DEVELOPMENT Environment** (Testing)
- **URL:** https://delightful-sky-0437f100f-preview.eastus2.2.azurestaticapps.net
- **Branch:** `development`
- **Purpose:** Test new features before going live
- **Auto-deploys:** When you push to `development` branch

### 2. **PRODUCTION Environment** (Live Site)
- **URL:** https://reddyfit.club
- **Azure URL:** https://delightful-sky-0437f100f.2.azurestaticapps.net
- **Branch:** `production`
- **Purpose:** Live user-facing site
- **Auto-deploys:** When you push to `production` branch

---

## 🔄 Professional Workflow (AUTOMATED):

### Step 1: Work on Development Branch
```bash
cd C:\Users\akhil\ReddyfitWebsiteready
git checkout development
# Make your changes to code
git add .
git commit -m "Your feature description"
git push origin development
```
→ **Automatically deploys to DEVELOPMENT** ✨

### Step 2: Test Development Environment
- Open: https://delightful-sky-0437f100f-preview.eastus2.2.azurestaticapps.net
- Test all features thoroughly
- If issues found, fix and push to `development` again

### Step 3: Deploy to Production
```bash
git checkout production
git merge development
git push origin production
```
→ **Automatically deploys to PRODUCTION** 🚀

---

## 🛠️ Manual Deployment (Alternative):

### Deploy to Preview/Dev:
```bash
cd C:\Users\akhil\ReddyfitWebsiteready && npm run build && swa deploy ./dist --app-name ReddyfitWebsiteready --resource-group sixpack-rg --env preview
```

### Deploy to Production:
```bash
cd C:\Users\akhil\ReddyfitWebsiteready && npm run build && swa deploy ./dist --app-name ReddyfitWebsiteready --resource-group sixpack-rg --env production
```

---

## 🔐 GitHub Secrets Setup (Required for Auto-Deploy):

Add these secrets in GitHub repo settings (Settings → Secrets and variables → Actions):

1. **AZURE_STATIC_WEB_APPS_API_TOKEN** - Get from Azure portal
2. **VITE_FIREBASE_API_KEY** - AIzaSyBFhGoxAAR4vLYLXNn8nDlKabiqhCPnWJk
3. **VITE_FIREBASE_AUTH_DOMAIN** - reddyfit-dcf41.firebaseapp.com
4. **VITE_FIREBASE_PROJECT_ID** - reddyfit-dcf41
5. **VITE_FIREBASE_STORAGE_BUCKET** - reddyfit-dcf41.firebasestorage.app
6. **VITE_FIREBASE_MESSAGING_SENDER_ID** - 123730832729
7. **VITE_FIREBASE_APP_ID** - 1:123730832729:web:16ce63a0f2d5401f60b048
8. **VITE_FIREBASE_MEASUREMENT_ID** - G-ECC4W6B3JN
9. **VITE_GOOGLE_CLIENT_ID** - 1069272134679-sslde9rl9h95t60q38crhidiug6n6emt.apps.googleusercontent.com
10. **VITE_GOOGLE_CLIENT_SECRET** - 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

---

## ✅ Benefits:
- ✅ **Automated deployments** - No manual commands needed
- ✅ **Preview URL** - Test features without affecting live site
- ✅ **Git-based workflow** - Track all changes
- ✅ **Professional setup** - Just like big tech companies
- ✅ **Safe deployments** - Test first on dev, deploy to main

---

## 🎯 Your Daily Workflow:
1. `git checkout development` - Switch to development branch
2. Make changes to code
3. `git add . && git commit -m "feature" && git push origin development` - Auto-deploys to development
4. Test at development URL
5. If good → `git checkout production && git merge development && git push origin production` - Auto-deploys to production
6. If bad → Fix and push to development again

**This is how professional developers work!** 🚀
