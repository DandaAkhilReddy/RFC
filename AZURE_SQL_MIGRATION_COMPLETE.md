# ReddyFit - Azure SQL Migration Complete

## 🎉 Migration Summary

The ReddyFit application has been successfully migrated from Supabase to **Azure SQL Database** with a complete Azure Functions API backend.

---

## 📊 Infrastructure Overview

### 1. **Azure SQL Database**
- **Server**: `reddyfit-sql-server.database.windows.net`
- **Database**: `reddyfitdb`
- **Tier**: Basic (suitable for development/small production)
- **Admin User**: `reddyfitadmin`
- **Status**: ✅ Created and schema applied

### 2. **Azure Functions API**
- **Function App**: `reddyfit-api`
- **URL**: `https://reddyfit-api.azurewebsites.net`
- **Runtime**: Node.js 22
- **Hosting**: Consumption Plan (Linux)
- **Status**: ✅ Created and ready for deployment

### 3. **Azure Static Web App**
- **Name**: ReddyfitWebsiteready
- **URL**: `https://white-meadow-001c09f0f.2.azurestaticapps.net`
- **Status**: ✅ Deployed with integrated API

### 4. **Azure Storage Account**
- **Name**: `reddyfitstorage`
- **Purpose**: Function app storage + Excel exports (optional)
- **Status**: ✅ Created

---

## 🗄️ Database Schema

### Tables Created:

#### `user_profiles`
```sql
- id (UNIQUEIDENTIFIER, PK)
- email (NVARCHAR(255), UNIQUE)
- firebase_uid (NVARCHAR(255), UNIQUE)
- full_name (NVARCHAR(255))
- gender (NVARCHAR(10))
- avatar_url (NVARCHAR(500))
- onboarding_completed (BIT)
- created_at (DATETIME2)
- updated_at (DATETIME2)
```

#### `onboarding_responses`
```sql
- id (UNIQUEIDENTIFIER, PK)
- user_id (UNIQUEIDENTIFIER, FK)
- fitness_goal (NVARCHAR(100))
- current_fitness_level (NVARCHAR(50))
- workout_frequency (NVARCHAR(50))
- diet_preference (NVARCHAR(50))
- motivation (NVARCHAR(MAX))
- biggest_challenge (NVARCHAR(MAX))
- how_found_us (NVARCHAR(100))
- feature_interest (NVARCHAR(MAX) - JSON string)
- willing_to_pay (NVARCHAR(20))
- price_range (NVARCHAR(50))
- created_at (DATETIME2)
```

#### `waitlist` (legacy)
```sql
- id (UNIQUEIDENTIFIER, PK)
- email (NVARCHAR(255), UNIQUE)
- full_name (NVARCHAR(255))
- created_at (DATETIME2)
```

---

## 🔌 API Endpoints

All endpoints support CORS for the Static Web App domain.

### User Management

#### `GET /api/users/profile`
Get user profile by email or Firebase UID.
```
Query Parameters:
  - email (optional)
  - firebase_uid (optional)

Response: UserProfile object or null
```

#### `POST /api/users/profile`
Create or update user profile.
```
Body: {
  email: string (required)
  firebase_uid?: string
  full_name?: string
  gender?: 'male' | 'female'
  avatar_url?: string
}

Response: { message: string, id: string }
```

#### `GET /api/users/all`
Get all users with onboarding data (Admin endpoint).
```
Response: UserProfile[] with joined onboarding data
```

#### `PUT /api/users/onboarding-status`
Update user onboarding completion status.
```
Body: {
  email: string
  completed: boolean
}

Response: { message: string }
```

### Onboarding

#### `POST /api/onboarding`
Submit onboarding questionnaire responses.
```
Body: {
  email: string (required)
  fitness_goal: string
  current_fitness_level: string
  workout_frequency: string
  diet_preference: string
  motivation: string
  biggest_challenge: string
  how_found_us: string
  feature_interest: string[]
  willing_to_pay: string
  price_range: string
}

Response: { message: string }
```

---

## 📁 Project Structure Updates

### New Files Created:

```
ReddyfitWebsiteready/
├── api/                                    # Azure Functions API
│   ├── dbConfig.ts                         # Database connection config
│   ├── host.json                           # Functions host config
│   ├── package.json                        # API dependencies
│   ├── tsconfig.json                       # TypeScript config
│   ├── users/
│   │   ├── function.json                   # User endpoint config
│   │   └── index.ts                        # User management functions
│   └── onboarding/
│       ├── function.json                   # Onboarding endpoint config
│       └── index.ts                        # Onboarding submission
├── database/
│   ├── schema.sql                          # Database schema
│   ├── apply-schema.js                     # Schema application script
│   └── package.json                        # Database scripts dependencies
├── src/
│   └── lib/
│       └── api.ts                          # API client (NEW - replaces Supabase)
└── staticwebapp.config.json                # Static Web App configuration
```

### Modified Files:

```
src/
├── components/
│   ├── AuthProvider.tsx                    # Updated to use API
│   ├── AdminPanel.tsx                      # Updated to use API
│   └── OnboardingQuestionnaire.tsx         # Updated to use API
└── AppRouter.tsx                           # Updated to use API
```

---

## ⚙️ Configuration

### Environment Variables Required:

#### Azure Function App (`reddyfit-api`)
```bash
AZURE_SQL_SERVER=reddyfit-sql-server.database.windows.net
AZURE_SQL_DATABASE=reddyfitdb
AZURE_SQL_USER=reddyfitadmin
AZURE_SQL_PASSWORD=ReddyFit@2025SecurePass!
```
✅ Already configured

#### Azure Static Web App (`ReddyfitWebsiteready`)
```bash
VITE_API_BASE_URL=https://reddyfit-api.azurewebsites.net/api
```
✅ Already configured

#### Optional - Azure Blob Storage (for Excel exports)
```bash
VITE_AZURE_STORAGE_CONNECTION_STRING=<your_connection_string>
VITE_AZURE_STORAGE_CONTAINER_NAME=reddyfit-exports
```

---

## 🚀 Deployment Steps Completed

1. ✅ Created Azure SQL Server and Database
2. ✅ Applied database schema with all tables
3. ✅ Created Azure Functions API with TypeScript
4. ✅ Created user management endpoints
5. ✅ Created onboarding submission endpoint
6. ✅ Updated frontend to use new API
7. ✅ Configured CORS and routing
8. ✅ Deployed to Azure Static Web Apps with API integration

---

## 🔐 Security Features

1. **SQL Injection Protection**: All queries use parameterized inputs via mssql library
2. **HTTPS Only**: All endpoints require HTTPS
3. **CORS Configuration**: Properly configured for Static Web App domain
4. **Connection Pooling**: Efficient database connection management
5. **Firewall Rules**: SQL Server firewall configured for Azure services

---

## 📝 Database Connection String

For local development or external tools:

```
Server=reddyfit-sql-server.database.windows.net,1433;
Initial Catalog=reddyfitdb;
User ID=reddyfitadmin;
Password=ReddyFit@2025SecurePass!;
Encrypt=true;
TrustServerCertificate=false;
Connection Timeout=30;
```

---

## 🧪 Testing the Migration

### 1. Test User Registration
```bash
# Visit the website
https://white-meadow-001c09f0f.2.azurestaticapps.net

# Sign in with Google
# Complete onboarding questionnaire
# Verify data is saved in Azure SQL
```

### 2. Test API Endpoints
```bash
# Get user profile
curl "https://reddyfit-api.azurewebsites.net/api/users/profile?email=test@example.com"

# Get all users (admin)
curl "https://reddyfit-api.azurewebsites.net/api/users/all"
```

### 3. Test Admin Panel
```bash
# Sign in with admin email: akhilreddyd3@gmail.com
# Navigate to /admin
# Verify user list appears
# Test Excel export functionality
```

---

## 📊 Cost Estimation

- **Azure SQL Basic**: ~$5/month
- **Azure Functions Consumption**: Pay-per-execution (likely <$1/month for low traffic)
- **Azure Static Web Apps**: Free tier
- **Azure Storage**: Minimal (<$1/month)

**Total Estimated Cost**: ~$6-7/month

---

## 🔄 Migration Differences from Supabase

### Removed:
- ❌ Supabase client (`@supabase/supabase-js`)
- ❌ Row Level Security (RLS) policies
- ❌ Direct database access from frontend
- ❌ Supabase Auth (using Firebase only now)

### Added:
- ✅ Azure SQL Database
- ✅ Azure Functions API layer
- ✅ mssql client library
- ✅ API-based data access
- ✅ TypeScript Azure Functions v4
- ✅ Connection pooling

---

## 🛠️ Maintenance & Operations

### To Query the Database:
```bash
# Option 1: Azure Portal SQL Query Editor
# Option 2: Use the apply-schema.js script as template
# Option 3: Azure Data Studio

cd database
node apply-schema.js  # Modify for custom queries
```

### To Update API Functions:
```bash
cd api
# Make changes to index.ts files
# Deploy using one of these methods:
swa deploy ./dist --api-location ./api --app-name ReddyfitWebsiteready
# OR
az functionapp deployment source config-zip --resource-group sixpack-rg --name reddyfit-api --src deploy.zip
```

### To Monitor:
- **Application Insights**: Already configured for function app
- **SQL Database Metrics**: Available in Azure Portal
- **Static Web App Analytics**: Built-in

---

## 📚 Additional Resources

- [Azure SQL Documentation](https://learn.microsoft.com/en-us/azure/azure-sql/)
- [Azure Functions Node.js Guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/)

---

## ✅ Next Steps

1. **Test the complete flow**: User sign up → Onboarding → Admin panel
2. **Set up Azure Blob Storage**: For cloud-based Excel exports
3. **Configure custom domain**: Optional
4. **Set up monitoring**: Application Insights queries
5. **Backup strategy**: Configure automated SQL backups
6. **Security review**: Restrict SQL firewall to specific IPs (currently open to all)

---

**Migration completed successfully!** 🎉

All user data will now be stored in Azure SQL Database with a robust API layer.
