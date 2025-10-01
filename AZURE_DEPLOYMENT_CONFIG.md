# Azure Static Web Apps Deployment Configuration

## Deployed Application
- **App Name**: ReddyfitWebsiteready
- **URL**: https://white-meadow-001c09f0f.2.azurestaticapps.net
- **Resource Group**: sixpack-rg
- **Region**: East US 2

## Required Environment Variables

You need to configure the following environment variables in Azure Static Web Apps:

### 1. Supabase Configuration (REQUIRED)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get these values:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" for `VITE_SUPABASE_URL`
4. Copy the "anon public" key for `VITE_SUPABASE_ANON_KEY`

### 2. Azure Blob Storage Configuration (OPTIONAL - for Excel exports)
```
VITE_AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
VITE_AZURE_STORAGE_CONTAINER_NAME=reddyfit-exports
```

**How to set up Azure Blob Storage:**
1. Create a Storage Account in Azure Portal
2. Go to Storage Account → "Access keys"
3. Copy the "Connection string" for `VITE_AZURE_STORAGE_CONNECTION_STRING`
4. The container will be created automatically, or you can create it manually

## Setting Environment Variables in Azure Static Web Apps

### Method 1: Using Azure CLI (Recommended)

```bash
# Set Supabase variables
az staticwebapp appsettings set --name ReddyfitWebsiteready --resource-group sixpack-rg --setting-names VITE_SUPABASE_URL=your_url VITE_SUPABASE_ANON_KEY=your_key

# Set Azure Storage variables (optional)
az staticwebapp appsettings set --name ReddyfitWebsiteready --resource-group sixpack-rg --setting-names VITE_AZURE_STORAGE_CONNECTION_STRING=your_connection_string VITE_AZURE_STORAGE_CONTAINER_NAME=reddyfit-exports
```

### Method 2: Using Azure Portal

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your Static Web App: "ReddyfitWebsiteready"
3. In the left menu, click "Configuration"
4. Click "Add" to add new application settings
5. Add each environment variable one by one
6. Click "Save" after adding all variables

## Admin Panel Access

The admin panel is accessible at: https://white-meadow-001c09f0f.2.azurestaticapps.net/admin

**Admin Email**: akhilreddyd3@gmail.com (configured in AppRouter.tsx:10)

To add more admin emails, edit `src/AppRouter.tsx` and update the `ADMIN_EMAILS` array.

## Database Setup

The application uses Supabase with the following migrations:
1. `20250930212923_add_full_name_to_waitlist.sql`
2. `20250930213926_create_user_profiles_and_questionnaire.sql`
3. `20250930220000_add_admin_policies.sql` (NEW - for admin access)

**To apply migrations:**
1. Go to your Supabase project dashboard
2. Click "SQL Editor"
3. Run each migration file in order
4. Verify tables are created: `user_profiles`, `onboarding_responses`

## Features

### User Features
- ✅ Google Authentication
- ✅ User registration saved to database
- ✅ Onboarding questionnaire
- ✅ User profile management

### Admin Features
- ✅ Admin panel at `/admin` route
- ✅ View all registered users
- ✅ Export user data to Excel
- ✅ Upload Excel to Azure Blob Storage (optional)
- ✅ User statistics dashboard

## Redeployment

To redeploy after making changes:

```bash
cd ReddyfitWebsiteready
npm run build
swa deploy ./dist --app-name ReddyfitWebsiteready --env production
```

## Testing

1. **Test user registration:**
   - Go to https://white-meadow-001c09f0f.2.azurestaticapps.net
   - Click "Sign in with Google"
   - Complete the onboarding questionnaire
   - Verify data is saved in Supabase

2. **Test admin panel:**
   - Sign in with admin email (akhilreddyd3@gmail.com)
   - Go to https://white-meadow-001c09f0f.2.azurestaticapps.net/admin
   - Verify you can see all registered users
   - Click "Export to Excel" to test export functionality

## Troubleshooting

### Issue: "Missing Supabase environment variables" error
**Solution**: Make sure you've set the environment variables in Azure Static Web Apps and redeployed.

### Issue: Admin panel shows "No users yet"
**Solution**: Verify that:
1. Supabase credentials are correct
2. Database migrations have been run
3. Admin policies are set up correctly
4. Users have registered through the app

### Issue: Excel export fails
**Solution**:
- If Azure Blob Storage is not configured, the file will download locally instead
- Check browser console for errors
- Verify Azure Storage connection string is correct

## Next Steps

1. ✅ Set up Supabase environment variables
2. ✅ Run database migrations
3. ⏳ Configure Azure Blob Storage (optional)
4. ⏳ Test user registration flow
5. ⏳ Test admin panel access
6. ⏳ Test Excel export functionality
