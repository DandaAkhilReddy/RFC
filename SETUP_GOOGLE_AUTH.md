# Google Authentication Setup for ReddyFit Club

## Important: Enable Google Sign-In in Supabase

Before users can sign in with Google, you need to configure Google OAuth in your Supabase project:

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. For Application type, select **Web application**
7. Add these authorized redirect URIs:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   (Replace `YOUR_SUPABASE_PROJECT_REF` with your actual Supabase project reference)

8. Click **Create** and copy your:
   - Client ID
   - Client Secret

### Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication > Providers**
4. Find **Google** in the list
5. Toggle it **ON**
6. Paste your Google Client ID and Client Secret
7. Click **Save**

### Step 3: Add Redirect URL (Optional)

If you want to customize where users go after signing in:

1. In Supabase Dashboard, go to **Authentication > URL Configuration**
2. Add your site URL (e.g., `http://localhost:5173` for local dev, or your production URL)
3. Add redirect URLs if needed

## Testing Locally

1. Make sure your `.env` file has the correct Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Click "Sign In with Google & Save Your Spot" button
4. Complete the Google sign-in flow
5. Fill out the onboarding questionnaire
6. You'll be taken to your dashboard!

## How It Works

1. **Landing Page**: Users see the landing page with "Sign In with Google" button
2. **Google OAuth**: Users authenticate via Google
3. **Onboarding**: First-time users fill out a comprehensive questionnaire with:
   - Personal info (name, gender)
   - Fitness goals & current level
   - Workout frequency & diet preferences
   - Motivation & challenges
   - Feature interests & pricing feedback
   - How they found the app
4. **Dashboard**: Users see their personalized dashboard with:
   - Welcome message
   - "Coming Soon" feature previews
   - Early access status

## Database Tables Created

- `user_profiles`: Stores user basic info and onboarding status
- `onboarding_responses`: Stores all questionnaire responses for growth insights

## Important Growth Questions Included

The questionnaire captures critical data for app growth:

1. **Fitness Goals**: What users want to achieve
2. **Current Level**: Where they're starting from
3. **Workout Frequency**: Time commitment capability
4. **Diet Preferences**: Meal plan customization needs
5. **Motivation**: Deep understanding of user drivers
6. **Biggest Challenges**: Pain points to solve
7. **Feature Interest**: What to prioritize building
8. **How Found Us**: Marketing channel effectiveness
9. **Willing to Pay**: Monetization validation
10. **Price Range**: Revenue modeling data

All responses are saved to Supabase with Row Level Security enabled!
