# How to Clear Your Session and See the Landing Page

If you're already signed in and want to see the main landing page again:

## Option 1: Sign Out (Recommended)
1. Open browser console (F12)
2. Run this command:
```javascript
firebase.auth().signOut().then(() => window.location.reload())
```

## Option 2: Clear Browser Storage
1. Open browser DevTools (F12)
2. Go to "Application" tab
3. Under "Storage" → Clear site data
4. Refresh the page

## Option 3: Use Incognito/Private Window
1. Open an incognito/private browsing window
2. Visit: https://white-meadow-001c09f0f.2.azurestaticapps.net
3. You'll see the landing page

## Current Flow:
- **Not Signed In** → Landing Page
- **Signed In + No Onboarding** → Onboarding Form
- **Signed In + Onboarding Complete** → Dashboard
- **Admin Email + /admin route** → Admin Panel

## Quick Sign Out URL
Visit this URL to force sign out:
https://white-meadow-001c09f0f.2.azurestaticapps.net?signout=true

(Will implement this feature next)
