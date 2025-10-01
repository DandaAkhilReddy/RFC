# Deployment Guide - ReddyFit Club

Complete guide for deploying the ReddyFit Club platform to Azure Static Web Apps and other platforms.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with repository access
- ✅ Azure account (for Azure deployment)
- ✅ Firebase project with Google Auth configured
- ✅ Environment variables ready

## 🌐 Azure Static Web Apps Deployment

### Step 1: Create Azure Static Web App

#### Option A: Using Azure Portal (Recommended for first-time)

1. **Login to Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with your Azure account

2. **Create Static Web App Resource**
   - Click "Create a resource"
   - Search for "Static Web App"
   - Click "Create"

3. **Configure Basic Settings**
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Create new or use existing (e.g., `reddyfit-rg`)
   - **Name**: `reddyfit-club` (or your preferred name)
   - **Plan type**: Free (for development) or Standard (for production)
   - **Region**: Choose closest to your users (e.g., Central US, East US)
   - **Deployment source**: GitHub

4. **GitHub Integration**
   - Click "Sign in with GitHub"
   - Authorize Azure Static Web Apps
   - **Organization**: Select your GitHub account
   - **Repository**: Select `rfc`
   - **Branch**: `main`

5. **Build Configuration**
   ```
   App location: /
   Api location: api
   Output location: dist
   ```

6. **Review and Create**
   - Review all settings
   - Click "Create"
   - Wait for deployment (2-3 minutes)

#### Option B: Using Azure CLI (Faster for experienced users)

```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create --name reddyfit-rg --location centralus

# Create Static Web App
az staticwebapp create \
  --name reddyfit-club \
  --resource-group reddyfit-rg \
  --source https://github.com/dandaakhilreddy/rfc \
  --location "Central US" \
  --branch main \
  --app-location "/" \
  --api-location "api" \
  --output-location "dist" \
  --login-with-github
```

### Step 2: Configure Environment Variables

1. **Navigate to Configuration**
   - Open your Static Web App in Azure Portal
   - Go to "Configuration" in the left menu
   - Click "Application settings"

2. **Add Environment Variables**
   Click "+ Add" for each variable:

   ```
   VITE_FIREBASE_API_KEY = your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = your_project_id
   VITE_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
   VITE_FIREBASE_APP_ID = your_app_id
   ```

   **Where to find these values:**
   - Go to Firebase Console: https://console.firebase.google.com
   - Select your project
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Copy the config values

3. **Save Configuration**
   - Click "Save" at the top
   - Wait for app to redeploy (automatic)

### Step 3: Configure Firebase for Azure Domain

1. **Add Authorized Domain in Firebase**
   - Firebase Console > Authentication > Settings
   - Scroll to "Authorized domains"
   - Click "Add domain"
   - Add your Azure domain: `your-app-name.azurestaticapps.net`
   - Click "Add"

2. **Test Authentication**
   - Visit your Azure URL
   - Try signing in with Google
   - Should work without errors

### Step 4: Verify Deployment

1. **Check GitHub Actions**
   - Go to your GitHub repository
   - Click "Actions" tab
   - You should see Azure Static Web Apps CI/CD workflow
   - Wait for green checkmark

2. **Access Your Site**
   - URL format: `https://[app-name]-[random-string].azurestaticapps.net`
   - Or your custom domain (if configured)
   - Example: https://white-meadow-001c09f0f.2.azurestaticapps.net/

3. **Test Core Features**
   - [ ] Landing page loads
   - [ ] Google sign-in works
   - [ ] Onboarding questionnaire works
   - [ ] Dashboard loads after sign-in
   - [ ] No console errors

## 🔄 Continuous Deployment

### How it works

Azure automatically created a GitHub Actions workflow in your repository:
- Location: `.github/workflows/azure-static-web-apps-[random].yml`
- Triggers: Push to `main` branch
- Actions: Build and deploy automatically

### Deployment Process

Every time you push to `main`:
1. GitHub Actions triggers
2. Installs dependencies
3. Runs build: `npm run build`
4. Builds API: `cd api && npm install && npm run build`
5. Deploys to Azure
6. Takes 2-5 minutes

### Manual Deployment

If you need to trigger manually:
```bash
cd C:\Users\akhil\ReddyfitWebsiteready
git add .
git commit -m "Your changes"
git push origin main
```

## 🗄️ Database Setup

### Option 1: Azure SQL Database

1. **Create Azure SQL Server**
   ```bash
   az sql server create \
     --name reddyfit-sql-server \
     --resource-group reddyfit-rg \
     --location centralus \
     --admin-user sqladmin \
     --admin-password "YourSecurePassword123!"
   ```

2. **Create Database**
   ```bash
   az sql db create \
     --resource-group reddyfit-rg \
     --server reddyfit-sql-server \
     --name reddyfitdb \
     --service-objective S0
   ```

3. **Configure Firewall**
   ```bash
   # Allow Azure services
   az sql server firewall-rule create \
     --resource-group reddyfit-rg \
     --server reddyfit-sql-server \
     --name AllowAzureServices \
     --start-ip-address 0.0.0.0 \
     --end-ip-address 0.0.0.0

   # Allow your IP
   az sql server firewall-rule create \
     --resource-group reddyfit-rg \
     --server reddyfit-sql-server \
     --name AllowMyIP \
     --start-ip-address YOUR_IP \
     --end-ip-address YOUR_IP
   ```

4. **Apply Schema**
   ```bash
   cd database
   npm install
   # Edit apply-schema.js with your connection string
   node apply-schema.js
   ```

### Option 2: Firebase Firestore (Simpler)

Firebase Firestore is already configured and working. The app automatically:
- Creates `user_profiles` collection
- Creates `onboarding_responses` collection
- Handles data with security rules

**No additional setup needed!**

## 🎨 Custom Domain (Optional)

### Add Custom Domain to Azure

1. **Purchase Domain**
   - From any domain registrar (GoDaddy, Namecheap, etc.)

2. **Add to Azure Static Web App**
   - Azure Portal > Your Static Web App
   - Go to "Custom domains"
   - Click "+ Add"
   - Choose "Custom domain on other DNS"
   - Enter your domain: `www.yourdomain.com`

3. **Configure DNS**
   - Go to your domain registrar
   - Add CNAME record:
     ```
     Type: CNAME
     Name: www
     Value: your-app.azurestaticapps.net
     TTL: 3600
     ```

4. **Verify Domain**
   - Back in Azure, click "Validate"
   - Wait for validation (can take up to 48 hours)
   - SSL certificate auto-generated by Azure

5. **Update Firebase**
   - Add custom domain to Firebase authorized domains
   - Authentication will work on custom domain

## 📊 Monitoring and Logs

### View Application Logs

1. **Azure Portal**
   - Your Static Web App > Monitoring > Log stream
   - View real-time logs

2. **Application Insights** (Optional but Recommended)
   ```bash
   az monitor app-insights component create \
     --app reddyfit-insights \
     --location centralus \
     --resource-group reddyfit-rg \
     --application-type web
   ```

### GitHub Actions Logs

- GitHub Repository > Actions
- Click on any workflow run
- View detailed build logs

## 🚨 Troubleshooting

### Build Failures

**Problem**: Build fails with "Module not found"
**Solution**:
```bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

**Problem**: API functions not working
**Solution**:
- Check `api/package.json` is present
- Ensure API location is set to `api` in Azure config
- Verify functions have proper exports

### Authentication Issues

**Problem**: Google Sign-In fails with "Unauthorized domain"
**Solution**:
- Add your Azure domain to Firebase authorized domains
- Clear browser cache
- Try incognito mode

**Problem**: User stays logged out after sign-in
**Solution**:
- Check browser console for errors
- Verify Firebase config in environment variables
- Ensure CORS headers are set in `staticwebapp.config.json`

### Deployment Issues

**Problem**: Changes not reflecting after push
**Solution**:
1. Check GitHub Actions for errors
2. Hard refresh browser (Ctrl+Shift+R)
3. Check if workflow completed successfully
4. Verify correct branch is set in Azure

**Problem**: Azure deployment stuck
**Solution**:
1. Cancel current deployment in GitHub Actions
2. Make a small change (add comment to file)
3. Push again to trigger new deployment

## 📱 Alternative Deployment Options

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd C:\Users\akhil\ReddyfitWebsiteready
   vercel
   ```

3. **Configure**
   - Follow prompts
   - Add environment variables in Vercel dashboard
   - Set build command: `npm run build`
   - Set output directory: `dist`

### Deploy to Netlify

1. **Create netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm i -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Or via Web UI**
   - Go to https://app.netlify.com
   - Click "Add new site"
   - Connect GitHub repository
   - Configure build settings
   - Deploy

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Site loads at Azure URL
- [ ] Google authentication works
- [ ] Onboarding questionnaire saves data
- [ ] Dashboard displays correctly
- [ ] No console errors
- [ ] Mobile responsive design works
- [ ] API endpoints responding (if applicable)
- [ ] Database connections working
- [ ] SSL certificate active (https)
- [ ] Custom domain works (if configured)

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use Azure configuration for secrets
   - Rotate keys periodically

2. **Firebase Security Rules**
   - Configure Firestore security rules
   - Limit read/write access
   - Validate user authentication

3. **API Security**
   - Use CORS headers properly
   - Validate all inputs
   - Rate limit API calls

4. **Database Security**
   - Use Row Level Security (RLS)
   - Encrypt sensitive data
   - Regular backups

## 📞 Support

If you encounter issues:

1. Check Azure Portal logs
2. Review GitHub Actions workflow
3. Check Firebase Console for auth errors
4. Open issue on GitHub: https://github.com/dandaakhilreddy/rfc/issues

---

**Deployment URL**: https://white-meadow-001c09f0f.2.azurestaticapps.net/

**Last Updated**: October 2025
