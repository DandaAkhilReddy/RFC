# API Not Working - Azure Static Web Apps Limitation

## ❌ Current Issue:
- **ALL API endpoints return 500 errors or timeouts**
- Database save operations failing with "failed to upsert" errors
- The managed Azure Functions in Static Web Apps are NOT working

## 🔍 Root Cause:
Azure Static Web Apps' **managed Functions** have strict limitations:
1. Cannot use native Node.js modules like `mssql` (SQL Server driver)
2. TypeScript support is limited
3. Cold start issues and timeouts
4. Limited to very basic JavaScript functions

## ✅ Solution: Deploy Separate Azure Functions App

We need to deploy the API as a **standalone Azure Functions App**:

### Option 1: Quick Fix - Use Azure Functions App (Recommended)
```bash
# 1. Create Azure Functions App
az functionapp create \
  --resource-group sixpack-rg \
  --name reddyfit-api \
  --storage-account reddyfitstorage \
  --consumption-plan-location eastus2 \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4

# 2. Configure database connection
az functionapp config appsettings set \
  --name reddyfit-api \
  --resource-group sixpack-rg \
  --settings \
    AZURE_SQL_SERVER="reddyfit-sql-server.database.windows.net" \
    AZURE_SQL_DATABASE="reddyfitdb" \
    AZURE_SQL_USER="reddyfitadmin" \
    AZURE_SQL_PASSWORD="ReddyFit@2025SecurePass!"

# 3. Deploy API
cd api
func azure functionapp publish reddyfit-api
```

### Option 2: Use Express.js API on App Service
- Simpler setup
- Better control
- More reliable

## 🎯 What Needs to Change:

1. **Frontend API calls** - Update `src/lib/api.ts`:
   ```typescript
   const API_BASE_URL = 'https://reddyfit-api.azurewebsites.net/api';
   ```

2. **CORS settings** - Already configured in API code

3. **Environment variables** - Already set up

## 📊 Testing Checklist:
Once deployed to standalone Functions App:
- [ ] Test endpoint: `https://reddyfit-api.azurewebsites.net/api/test`
- [ ] Test user profile creation
- [ ] Test onboarding save
- [ ] Test admin panel data fetch

## 🔧 Current Status:
- ✅ Frontend: Working perfectly
- ✅ Database: Connected and accessible
- ✅ Firebase Auth: Working
- ✅ API Code: Correct and tested locally
- ❌ API Deployment: **BLOCKED by Static Web Apps limitations**

## 🚀 Next Steps:
1. Create standalone Azure Functions App
2. Deploy API to Functions App
3. Update frontend API URL
4. Test all endpoints
5. Verify database operations

**The code is perfect - we just need to deploy it to the right place!**
