# ReddyFit - Unified Frontend & Backend Deployment

## 🎉 Complete Integration Achieved!

The ReddyFit application is now **fully integrated** with frontend and backend deployed as a single unified application on Azure Static Web Apps.

---

## 🌐 **Live Application**

### **Main Website:**
https://white-meadow-001c09f0f.2.azurestaticapps.net

### **Admin Panel:**
https://white-meadow-001c09f0f.2.azurestaticapps.net/admin

### **API Endpoints (Integrated):**
- GET https://white-meadow-001c09f0f.2.azurestaticapps.net/api/users/all
- GET https://white-meadow-001c09f0f.2.azurestaticapps.net/api/users/profile
- POST https://white-meadow-001c09f0f.2.azurestaticapps.net/api/users/profile
- PUT https://white-meadow-001c09f0f.2.azurestaticapps.net/api/users/onboarding-status
- POST https://white-meadow-001c09f0f.2.azurestaticapps.net/api/onboarding

### **GitHub Repository:**
https://github.com/DandaAkhilReddy/ReddyFitClub_Website

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│           Azure Static Web Apps (Free Tier)                 │
│  https://white-meadow-001c09f0f.2.azurestaticapps.net      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐      ┌───────────────────────┐   │
│  │   Frontend (React)  │      │  Backend (Functions)  │   │
│  │  - Vite + TypeScript│      │  - TypeScript Node.js │   │
│  │  - Firebase Auth    │◄────►│  - Azure Functions v4 │   │
│  │  - Admin Panel      │      │  - mssql client       │   │
│  └─────────────────────┘      └───────────┬───────────┘   │
│                                            │               │
└────────────────────────────────────────────┼───────────────┘
                                             │
                                             ▼
                        ┌────────────────────────────────────┐
                        │   Azure SQL Database (Basic)       │
                        │  reddyfit-sql-server.database...   │
                        │                                    │
                        │  Tables:                          │
                        │  - user_profiles                  │
                        │  - onboarding_responses           │
                        │  - waitlist                       │
                        └────────────────────────────────────┘
```

---

## ✅ **What's Unified**

### **Single Deployment Unit**
- ✅ Frontend and API deployed together
- ✅ No separate function app needed
- ✅ Relative API paths (`/api/...`)
- ✅ Automatic deployments via GitHub Actions
- ✅ Single domain for everything

### **Automated CI/CD**
- ✅ Push to `main` branch → Auto deploy
- ✅ Build, test, and deploy in one workflow
- ✅ Both frontend and API deployed simultaneously
- ✅ Zero manual deployment steps

### **Configuration**
- ✅ Database credentials configured in Static Web App
- ✅ Environment variables properly set
- ✅ CORS handled automatically
- ✅ Routing configured via `staticwebapp.config.json`

---

## 📂 **Project Structure**

```
ReddyfitWebsiteready/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml    # Auto-deployment workflow
├── api/                                 # Backend API (deployed with SWA)
│   ├── dbConfig.ts                      # Database connection
│   ├── host.json                        # Functions config
│   ├── users/
│   │   ├── function.json
│   │   └── index.ts                     # User endpoints
│   └── onboarding/
│       ├── function.json
│       └── index.ts                     # Onboarding endpoint
├── src/                                 # Frontend React app
│   ├── lib/
│   │   └── api.ts                       # API client (uses /api)
│   ├── components/
│   │   ├── AuthProvider.tsx             # Firebase Auth
│   │   ├── AdminPanel.tsx               # Admin dashboard
│   │   └── OnboardingQuestionnaire.tsx  # User onboarding
│   └── AppRouter.tsx                    # Routing logic
├── database/
│   └── schema.sql                       # Database schema
├── staticwebapp.config.json             # SWA configuration
└── package.json
```

---

## 🚀 **Deployment Process**

### **Automatic (Recommended)**
1. Make changes to code
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. GitHub Actions automatically:
   - Builds the frontend
   - Deploys frontend to Azure
   - Deploys API to Azure
   - Everything live in ~2 minutes

### **Manual (If Needed)**
```bash
cd ReddyfitWebsiteready
npm run build
swa deploy ./dist --app-name ReddyfitWebsiteready --env production --api-location ./api
```

---

## 🔧 **Environment Configuration**

All environment variables are configured in Azure Static Web Apps:

```bash
# Database Connection (API)
AZURE_SQL_SERVER=reddyfit-sql-server.database.windows.net
AZURE_SQL_DATABASE=reddyfitdb
AZURE_SQL_USER=reddyfitadmin
AZURE_SQL_PASSWORD=ReddyFit@2025SecurePass!

# Optional: Azure Blob Storage for Excel exports
VITE_AZURE_STORAGE_CONNECTION_STRING=<your_connection_string>
VITE_AZURE_STORAGE_CONTAINER_NAME=reddyfit-exports
```

To update settings:
```bash
az staticwebapp appsettings set --name ReddyfitWebsiteready --resource-group sixpack-rg --setting-names KEY=VALUE
```

---

## 🧪 **Testing the Application**

### **1. Test User Registration**
1. Visit: https://white-meadow-001c09f0f.2.azurestaticapps.net
2. Click "Sign in with Google"
3. Complete the onboarding questionnaire
4. Verify data saved in Azure SQL

### **2. Test Admin Panel**
1. Sign in with admin email: `akhilreddyd3@gmail.com`
2. Navigate to: https://white-meadow-001c09f0f.2.azurestaticapps.net/admin
3. View all registered users
4. Click "Export to Excel"

### **3. Test API Directly**
```bash
# Get all users (should return [])
curl https://white-meadow-001c09f0f.2.azurestaticapps.net/api/users/all

# Get user profile (should return null if not exists)
curl "https://white-meadow-001c09f0f.2.azurestaticapps.net/api/users/profile?email=test@example.com"
```

---

## 📊 **Database Connection**

The API connects to Azure SQL Database:

**Connection String:**
```
Server=reddyfit-sql-server.database.windows.net,1433;
Initial Catalog=reddyfitdb;
User ID=reddyfitadmin;
Password=ReddyFit@2025SecurePass!;
Encrypt=true;
TrustServerCertificate=false;
Connection Timeout=30;
```

**Tables:**
- `user_profiles` - User account information
- `onboarding_responses` - Questionnaire data
- `waitlist` - Legacy waitlist entries

---

## 💰 **Cost Structure**

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Azure Static Web Apps | Free | $0 |
| Azure SQL Database | Basic | ~$5 |
| Azure Storage | Standard | <$1 |
| **Total** | | **~$5-6/month** |

**Notes:**
- Static Web Apps Free tier includes:
  - 100 GB bandwidth/month
  - Unlimited Azure Functions API calls
  - Custom domains
  - Free SSL certificates
  - GitHub integration

---

## 🔐 **Security Features**

✅ **API Security:**
- SQL injection protection via parameterized queries
- HTTPS enforced
- CORS configured
- Connection pooling

✅ **Authentication:**
- Firebase Google OAuth
- Email-based admin access control
- Secure token handling

✅ **Database:**
- Firewall rules configured
- Encrypted connections
- Row-level data isolation

---

## 🛠️ **Maintenance**

### **View Deployment Logs**
```bash
cd ReddyfitWebsiteready
gh run list
gh run view <run-id>
```

### **Update Database Schema**
```bash
cd database
node apply-schema.js
```

### **Monitor Application**
- Azure Portal → Static Web Apps → ReddyfitWebsiteready
- View metrics, logs, and deployment history

---

## 📈 **Key Benefits of Unified Deployment**

1. **Simplicity**: Single deployment command
2. **Cost-Effective**: Free tier for hosting
3. **Auto-Scaling**: Managed by Azure
4. **CI/CD**: Automated via GitHub Actions
5. **Developer Experience**: Push to deploy
6. **No CORS Issues**: Same origin for frontend and API
7. **Easy Maintenance**: One place to manage everything

---

## 🎯 **Next Steps**

1. ✅ **Test the application** - Sign up, complete onboarding
2. ✅ **Test admin panel** - View users, export data
3. ⏳ **Set up Azure Blob Storage** - For cloud Excel exports
4. ⏳ **Configure custom domain** - Optional
5. ⏳ **Set up monitoring alerts** - Azure Monitor
6. ⏳ **Implement backup strategy** - SQL Database backups

---

## 🆘 **Troubleshooting**

### Issue: API returns 500 error
**Solution:** Check environment variables are set in Static Web App

### Issue: Database connection fails
**Solution:** Verify SQL Server firewall allows Azure services

### Issue: Deployment fails
**Solution:** Check GitHub Actions workflow logs

### Issue: API not responding
**Solution:** Redeploy: `git push origin main` to trigger workflow

---

## 📚 **Resources**

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Functions for Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-functions)
- [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**🎉 Frontend and Backend Successfully Unified!**

Everything is now deployed as a single, cohesive application with automatic deployments.
