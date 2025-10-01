# Firebase Domain Authorization Setup

## 🚨 IMPORTANT: Authorize Your Domain in Firebase

For Google Sign-In to work on your deployed website, you MUST add your Azure Static Web App domain to Firebase's authorized domains list.

---

## ✅ Required Domain to Authorize

**Domain:** `white-meadow-001c09f0f.2.azurestaticapps.net`

---

## 📝 Step-by-Step Instructions

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Select project: **reddyfit-website**

### Step 2: Navigate to Authentication Settings
1. Click **"Authentication"** in the left sidebar
2. Click **"Settings"** tab at the top
3. Scroll down to **"Authorized domains"** section

### Step 3: Add Your Domain
1. Click **"Add domain"** button
2. Enter: `white-meadow-001c09f0f.2.azurestaticapps.net`
3. Click **"Add"**

### Step 4: Verify
You should now see your domain in the list:
- ✅ localhost (already there by default)
- ✅ reddyfit-website.firebaseapp.com (already there by default)
- ✅ white-meadow-001c09f0f.2.azurestaticapps.net (YOU NEED TO ADD THIS)

---

## 🔧 Alternative: Using Firebase CLI

If you prefer using the command line:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Add authorized domain
firebase auth:import --authorized-domains white-meadow-001c09f0f.2.azurestaticapps.net
```

---

## 🎯 Why This is Needed

Firebase's security requires that you explicitly authorize which domains can use your Firebase Authentication. This prevents unauthorized websites from using your Firebase project.

**Without authorizing the domain:**
- Google Sign-In popup will show an error
- Error message: "This domain is not authorized to run this operation"
- Users cannot sign in

**After authorizing the domain:**
- ✅ Google Sign-In works perfectly
- ✅ Users can sign up and sign in
- ✅ All data saves to Azure SQL Database

---

## 🧪 Testing After Setup

### Test Sign-In Flow:
1. Visit: https://white-meadow-001c09f0f.2.azurestaticapps.net
2. Click "Sign in with Google"
3. Select your Google account
4. Grant permissions
5. ✅ You should be signed in successfully!

### If Still Not Working:
Check browser console (F12) for error messages and verify:
1. Domain is correctly added in Firebase Console
2. No typos in the domain name
3. Firebase API key is correct in `src/lib/firebase.ts`
4. Clear browser cache and cookies

---

## 🔄 What Happens When You Sign In

After authorizing the domain and signing in:

```
1. User clicks "Sign in with Google"
   ↓
2. Google OAuth popup appears
   ↓
3. User selects Google account
   ↓
4. Firebase validates the domain (checks authorized domains list)
   ↓
5. If authorized: Sign-in succeeds ✅
   If not authorized: Error shown ❌
   ↓
6. User data automatically saved to Azure SQL
   ↓
7. User sees onboarding questionnaire
   ↓
8. User appears in Admin Panel
```

---

## 🎨 Improved Sign-In Experience

The app now has **dual sign-in methods**:

### Method 1: Popup (Primary)
- Fast and seamless
- Opens Google sign-in in a popup window
- Best for desktop browsers

### Method 2: Redirect (Fallback)
- More reliable on mobile
- Redirects to Google sign-in page
- Returns to your app after sign-in
- Automatically used if popup is blocked

**Both methods work after domain authorization!**

---

## 📊 Error Handling

The app now shows clear error messages:

| Error | Message | Solution |
|-------|---------|----------|
| Domain not authorized | "This domain is not authorized..." | Add domain in Firebase Console |
| Popup blocked | Automatically uses redirect | No action needed |
| Network error | "Please check internet connection" | Check network |
| Other errors | Shows specific error message | Check console logs |

---

## 🔍 Debugging

### Check Browser Console
Press **F12** to open Developer Tools and check:

**Successful sign-in logs:**
```
Starting Google sign-in...
Sign-in successful (popup): user@gmail.com
User authenticated: user@gmail.com
Creating new user profile...
User profile created successfully
```

**Domain not authorized error:**
```
Error signing in: auth/unauthorized-domain
Domain not authorized in Firebase Console
```

### Verify API Connection
```bash
# Test if API is working
curl https://white-meadow-001c09f0f.2.azurestaticapps.net/api/users/all

# Should return: [] or list of users
```

---

## ✅ Quick Checklist

Before testing sign-in, verify:

- [ ] Domain added to Firebase authorized domains
- [ ] Firebase config correct in code
- [ ] API endpoints working
- [ ] Azure SQL database running
- [ ] Application deployed to Azure
- [ ] Browser allows popups (or redirect will be used)

---

## 🚀 Once Setup is Complete

After adding the domain to Firebase:

1. **No code changes needed** - Already implemented
2. **Auto-deploys** - GitHub Actions will deploy
3. **Users can sign in** - Google authentication works
4. **Data saves automatically** - To Azure SQL Database
5. **Admin panel works** - View all users at `/admin`

---

## 📞 Support

If sign-in still doesn't work after adding the domain:

1. **Check Firebase Console** - Verify domain is in the list
2. **Clear cache** - Hard refresh browser (Ctrl+Shift+R)
3. **Try incognito** - Test in private browsing mode
4. **Check console** - Look for error messages (F12)
5. **Test API** - Verify backend is working

---

## 🎉 Expected Result

After completing domain authorization:

✅ **Sign-In Works**
✅ **Users Can Register**
✅ **Data Saves to Database**
✅ **Admin Panel Shows Users**
✅ **Onboarding Works**
✅ **Excel Export Works**

**Your app will be fully functional!** 🚀

---

## 📸 Visual Guide

### Firebase Console Screenshot Guide:

1. **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Enter: `white-meadow-001c09f0f.2.azurestaticapps.net`
5. Click **Add**
6. ✅ Done!

---

**After adding the domain, Google Sign-In will work perfectly and all users will be saved to your database!**
