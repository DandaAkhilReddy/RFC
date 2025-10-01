# ReddyFit Club - AI-Powered Fitness Platform

A modern, full-stack fitness transformation platform with AI-powered features, real-time chat, and personalized fitness plans. Built with React, TypeScript, Azure Functions, and Firebase.

🌐 **Live Demo**: https://white-meadow-001c09f0f.2.azurestaticapps.net/

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [Database Setup](#database-setup)
- [Contributing](#contributing)

## ✨ Features

### Current Features
- **Google Authentication** - Secure sign-in with Firebase Google OAuth
- **Smart Onboarding** - Comprehensive user profiling questionnaire
- **User Dashboard** - Personalized dashboard with progress tracking
- **Enhanced Chat** - Real-time AI chat with voice input support
- **Modern UI** - Beautiful, responsive design with Tailwind CSS
- **Progress Tracking** - Visual charts and statistics
- **Admin Dashboard** - Manage users and monitor platform activity

### Coming Soon
- AI Workout Plans
- AI Meal Plans
- Daily Accountability Matching
- Video Workouts Library
- Macro Calculator
- Community Challenges

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library

### Backend
- **API**: Azure Functions (Node.js + TypeScript)
- **Authentication**: Firebase Auth
- **Database**: Azure SQL / Firebase Firestore
- **Storage**: Azure Blob Storage
- **AI**: Azure Cognitive Services (Speech SDK)

### DevOps
- **Hosting**: Azure Static Web Apps
- **CI/CD**: GitHub Actions (automated via Azure)
- **Monitoring**: Azure Application Insights

## 📁 Project Structure

```
ReddyfitWebsiteready/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   │   ├── AuthProvider.tsx    # Authentication context
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── ModernDashboard.tsx # Enhanced dashboard UI
│   │   ├── EnhancedChat.tsx    # AI chat with voice
│   │   ├── OnboardingQuestionnaire.tsx
│   │   └── Logo.tsx
│   ├── lib/
│   │   ├── firebase.ts         # Firebase configuration
│   │   └── supabase.ts         # Legacy database client
│   ├── test/                    # Test files
│   ├── App.tsx                  # Landing page
│   ├── AppRouter.tsx            # Route management
│   └── main.tsx                 # Entry point
│
├── api/                          # Azure Functions Backend
│   ├── src/                     # API function handlers
│   ├── host.json               # Azure Functions config
│   ├── package.json            # Backend dependencies
│   └── tsconfig.json           # TypeScript config
│
├── database/                     # Database schema & scripts
│   ├── schema.sql              # Azure SQL schema
│   ├── apply-schema.js         # Schema deployment script
│   └── package.json            # Database tools
│
├── dist/                         # Production build output
├── staticwebapp.config.json     # Azure Static Web Apps config
├── package.json                 # Frontend dependencies
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Azure Account** (for deployment)
- **Firebase Project** (for authentication)
- **Git** for version control

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/dandaakhilreddy/rfc.git
   cd rfc
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd api
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create `.env` in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Configure Firebase Authentication**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Enable Google Sign-In in Authentication > Sign-in method
   - Add authorized domains (localhost, your Azure domain)

6. **Run development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

7. **Run backend functions locally** (optional)
   ```bash
   cd api
   npm start
   ```

8. **Run tests**
   ```bash
   npm test              # Run tests once
   npm run test:ui       # Open test UI
   npm run test:coverage # Generate coverage report
   ```

## 🌐 Deployment

### Deploy to Azure Static Web Apps

This project is configured for Azure Static Web Apps with automatic CI/CD.

#### Option 1: Azure Portal (Recommended)

1. **Create Azure Static Web App**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create new Static Web App
   - Connect to your GitHub repository
   - Configure build settings:
     - **App location**: `/`
     - **API location**: `api`
     - **Output location**: `dist`

2. **Set Environment Variables**
   In Azure Portal > Configuration, add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. **Deploy**
   - Push to GitHub `main` branch
   - Azure automatically builds and deploys
   - Access via: `https://your-app.azurestaticapps.net`

#### Option 2: Azure CLI

```bash
# Login to Azure
az login

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

### Deploy to Other Platforms

#### Vercel
1. Import project from GitHub
2. Add environment variables
3. Deploy automatically

#### Netlify
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

## 💾 Database Setup

### Azure SQL Database

1. **Create Azure SQL Database**
   ```bash
   az sql server create --name reddyfit-sql --resource-group reddyfit-rg --location centralus --admin-user sqladmin --admin-password YourPassword123!

   az sql db create --resource-group reddyfit-rg --server reddyfit-sql --name reddyfitdb --service-objective S0
   ```

2. **Apply Schema**
   ```bash
   cd database
   npm install
   node apply-schema.js
   ```

3. **Configure Firewall**
   - Add your IP in Azure Portal
   - Allow Azure services to access server

### Firebase Firestore (Alternative)

The app also supports Firebase Firestore as a database option. The schema automatically handles user profiles and onboarding data.

## 📊 Database Schema

### Tables

#### `user_profiles`
- `id` - Unique identifier (GUID)
- `email` - User email (unique)
- `firebase_uid` - Firebase authentication ID
- `full_name` - User's full name
- `gender` - User's gender (for accountability matching)
- `avatar_url` - Profile picture URL
- `onboarding_completed` - Boolean flag
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

#### `onboarding_responses`
- `id` - Unique identifier
- `user_id` - Foreign key to user_profiles
- `fitness_goal` - User's primary fitness goal
- `current_fitness_level` - Beginner/Intermediate/Advanced
- `workout_frequency` - Preferred workout frequency
- `diet_preference` - Dietary preferences
- `motivation` - What drives the user
- `biggest_challenge` - Main obstacles to overcome
- `how_found_us` - Marketing attribution
- `feature_interest` - Interested features (JSON)
- `willing_to_pay` - Monetization validation
- `price_range` - Expected price point
- `created_at` - Response timestamp

#### `waitlist` (Legacy)
- `id` - Unique identifier
- `email` - Email address
- `full_name` - Name
- `created_at` - Signup date

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Test files are located in `src/test/` directory.

## 🔒 Security Features

- **Row Level Security** - Users can only access their own data
- **Firebase Authentication** - Secure, production-ready auth
- **HTTPS Enforced** - All traffic encrypted
- **Environment Variables** - Sensitive data secured
- **CORS Configuration** - Controlled API access
- **Input Validation** - All user inputs sanitized

## 🤝 Contributing

This is a private project. For collaboration inquiries, contact the repository owner.

## 📄 License

Private - All rights reserved

## 📞 Support

For questions or support:
- **GitHub Issues**: [Create an issue](https://github.com/dandaakhilreddy/rfc/issues)
- **Email**: Contact through GitHub profile

## 🎯 Roadmap

- [ ] AI Workout Plan Generator
- [ ] AI Meal Plan Generator
- [ ] Daily Accountability Matching System
- [ ] Video Workout Library
- [ ] Progress Photo Tracking
- [ ] Social Community Features
- [ ] Mobile App (React Native)
- [ ] Wearable Device Integration

---

**Built with ❤️ for fitness enthusiasts who want real transformation**

Last Updated: October 2025
