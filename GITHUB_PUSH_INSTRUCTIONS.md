# Push to GitHub: dandaakhilreddy/reddyfitwebsite

## Prerequisites

1. Make sure you have Git installed
2. Make sure you have a GitHub account and are logged in
3. Create the repository on GitHub first (if not already created)

## Steps to Push

### 1. Initialize Git (if not already initialized)

```bash
git init
```

### 2. Add all files to Git

```bash
git add .
```

### 3. Create your first commit

```bash
git commit -m "Initial commit - ReddyFit Club fitness transformation app with Google Auth"
```

### 4. Add the remote repository

```bash
git remote add origin https://github.com/dandaakhilreddy/reddyfitwebsite.git
```

### 5. Push to GitHub

If pushing to `main` branch:
```bash
git branch -M main
git push -u origin main
```

If pushing to `master` branch:
```bash
git push -u origin master
```

## If Repository Already Exists

If the repository already has content, you may need to pull first:

```bash
git pull origin main --allow-unrelated-histories
```

Then push:
```bash
git push -u origin main
```

## Common Issues

### Authentication Required

If prompted for credentials, you may need to:

1. **Use Personal Access Token** (recommended):
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a new token with `repo` permissions
   - Use the token as your password when prompted

2. **Use SSH** (alternative):
   ```bash
   git remote remove origin
   git remote add origin git@github.com:dandaakhilreddy/reddyfitwebsite.git
   git push -u origin main
   ```

### Permission Denied

Make sure you have write access to the `dandaakhilreddy/reddyfitwebsite` repository.

## What Gets Pushed

The following will be pushed to GitHub:

- ✅ All source code files
- ✅ Components (AuthProvider, Dashboard, OnboardingQuestionnaire, etc.)
- ✅ Database migrations
- ✅ Configuration files
- ✅ Package.json and dependencies list
- ❌ node_modules (excluded via .gitignore)
- ❌ .env file (excluded via .gitignore - keep your secrets safe!)
- ❌ dist folder (excluded via .gitignore)

## After Pushing

1. Go to https://github.com/dandaakhilreddy/reddyfitwebsite
2. Verify all files are there
3. Update the README if needed
4. Set up GitHub Pages or deploy to your hosting provider

## Deploy to Production

Consider deploying to:
- **Vercel** (recommended for Vite + React)
- **Netlify**
- **GitHub Pages**

All of these integrate directly with GitHub and auto-deploy on push!
