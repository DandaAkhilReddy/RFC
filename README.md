# ReddyFit Club - AI-Powered Fitness Transformation Platform

A modern fitness transformation platform that uses AI to create personalized workout plans, meal plans, and daily accountability matching. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Current Features (Live)

- **Google Authentication** - Secure sign-in with Google OAuth
- **Smart Onboarding Questionnaire** - Comprehensive user profiling with 10+ growth-focused questions
- **User Profiles** - Secure user data management with Row Level Security
- **Dashboard** - Personalized dashboard showing upcoming features
- **Landing Page** - Beautiful, responsive landing page showcasing the platform

### Coming Soon Features

- AI Workout Plans
- AI Meal Plans
- Daily Accountability Partner Matching (opposite gender for diverse perspectives)
- Progress Tracking
- Smart Scheduling
- Video Workouts
- Macro Calculator
- Community Challenges

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Hosting**: Ready for Vercel, Netlify, or any modern hosting

## Project Structure

```
reddyfitwebsite/
├── src/
│   ├── components/
│   │   ├── AuthProvider.tsx          # Authentication context & hooks
│   │   ├── Dashboard.tsx              # Protected dashboard after sign-in
│   │   ├── OnboardingQuestionnaire.tsx # New user questionnaire
│   │   └── Logo.tsx                   # ReddyFit logo component
│   ├── lib/
│   │   └── supabase.ts                # Supabase client configuration
│   ├── App.tsx                        # Landing page
│   ├── AppRouter.tsx                  # Route management (landing/onboarding/dashboard)
│   ├── main.tsx                       # App entry point
│   └── index.css                      # Global styles
├── supabase/
│   └── migrations/                    # Database migrations
├── public/                            # Static assets
└── package.json                       # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud Console account (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dandaakhilreddy/reddyfitwebsite.git
   cd reddyfitwebsite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configure Google OAuth**

   See `SETUP_GOOGLE_AUTH.md` for detailed instructions.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Database Schema

### Tables

#### `user_profiles`
- Stores user basic information
- Links to Supabase Auth users
- Tracks onboarding completion status

#### `onboarding_responses`
- Stores comprehensive user questionnaire responses
- Critical data for product growth and personalization
- Includes fitness goals, preferences, motivations, and monetization insights

#### `waitlist` (Legacy - for pre-auth signups)
- Original waitlist from landing page
- Contains email signups before authentication was added

### Security

All tables use Row Level Security (RLS):
- Users can only access their own data
- Authenticated access required
- Secure by default

## Growth & Analytics Questions

The onboarding questionnaire captures:

1. **Fitness Goals** - What users want to achieve
2. **Current Level** - Starting point assessment
3. **Workout Frequency** - Time commitment capability
4. **Diet Preferences** - Meal planning needs
5. **Motivation** - Deep driver understanding
6. **Biggest Challenges** - Pain points to solve
7. **Feature Interest** - Product prioritization data
8. **Discovery Source** - Marketing channel effectiveness
9. **Willingness to Pay** - Monetization validation
10. **Price Range** - Revenue modeling insights

## User Flow

1. **Landing Page** → User sees features and benefits
2. **Google Sign-In** → Secure authentication via Google
3. **Onboarding** → First-time users complete questionnaire
4. **Dashboard** → Users see their personalized space with coming-soon features
5. **Early Access** → Users will get notified as features launch

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Connect repository in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy!

## Contributing

This is a private project. For questions or collaboration, contact the repository owner.

## License

Private - All rights reserved

## Contact

For any questions or support, reach out to the ReddyFit Club team.

---

Built with ❤️ for fitness enthusiasts who want to transform their lives
