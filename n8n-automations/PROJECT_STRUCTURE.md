# 📂 ReddyFit Complete Project Structure

## Main Project

```
ReddyfitWebsiteready/
│
├── 📱 Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── CleanDashboard.tsx        # Main dashboard (v2.0 Clean)
│   │   │   ├── AuthProvider.tsx          # Firebase authentication
│   │   │   ├── SettingsPage.tsx          # User settings with debug logging
│   │   │   ├── ReddyAIAgent.tsx          # AI chatbot interface
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── firebase.ts               # Firebase configuration
│   │   │   └── storage.ts                # Azure storage
│   │   ├── App.tsx                       # Landing page
│   │   ├── AppRouter.tsx                 # Route management
│   │   └── main.tsx                      # Entry point
│   │
│   ├── public/                           # Static assets
│   ├── dist/                             # Production build
│   ├── index.html                        # HTML template
│   ├── package.json                      # Dependencies
│   ├── vite.config.ts                    # Build configuration
│   └── tsconfig.json                     # TypeScript config
│
├── 🤖 n8n Automations (NEW!)
│   ├── workflows/
│   │   └── welcome-email.json            # Welcome email workflow
│   ├── templates/
│   │   └── welcome-email.html            # Beautiful HTML email template
│   ├── scripts/
│   │   ├── test-welcome-email.js         # Test automation
│   │   ├── create-welcome-email.js       # Workflow creator
│   │   └── deploy-workflow.js            # Deployment script
│   ├── docs/
│   │   ├── SETUP.md                      # Setup instructions
│   │   ├── INTEGRATION.md                # App integration guide
│   │   └── CUSTOMIZATION.md              # Email customization
│   ├── README.md                         # Main documentation
│   ├── PROJECT_STRUCTURE.md              # This file
│   └── .env.example                      # Environment template
│
├── 📚 Documentation
│   ├── README.md                         # Project overview
│   ├── DATABASE_TEST.md                  # Database testing report
│   ├── TESTING_CHECKLIST.md              # Testing procedures
│   ├── COMPLETE_TEST_FLOW.md             # End-to-end testing
│   └── MANUAL_DELETE_USERS.md            # Firebase management
│
├── 🔧 Configuration
│   ├── .github/
│   │   └── workflows/
│   │       └── azure-deploy.yml          # CI/CD pipeline
│   ├── .gitignore                        # Git ignore rules
│   ├── .env                              # Environment variables (not in git)
│   └── .env.example                      # Environment template
│
└── 📦 Other
    ├── scripts/
    │   └── delete-all-users.js           # Firebase user cleanup
    ├── node_modules/                     # Dependencies
    └── package-lock.json                 # Lock file
```

## 🎯 Key Features by Directory

### Frontend (`src/`)
✅ **CleanDashboard** - No mock data, professional UI
✅ **Real-time database** - Firebase Firestore integration
✅ **First-time user onboarding** - Welcome banner with 3 steps
✅ **Settings management** - Complete profile system
✅ **AI chatbot** - Reddy AI integration
✅ **Discipline tracking** - Streak and habit monitoring

### n8n Automations (`n8n-automations/`)
✅ **Welcome email** - Automatic on user registration
✅ **Beautiful design** - Professional HTML template
✅ **Gmail integration** - SMTP email sending
✅ **Webhook ready** - Easy app integration
✅ **Testing scripts** - Automated testing
✅ **Documentation** - Complete setup guides

### Documentation (`docs/`)
✅ **Testing guides** - Step-by-step testing flows
✅ **Database docs** - Firestore structure and operations
✅ **Deployment** - Azure Static Web Apps setup

## 🌐 Live URLs

- **Production**: https://delightful-sky-0437f100f.2.azurestaticapps.net
- **n8n Dashboard**: http://localhost:5678
- **Firebase Console**: https://console.firebase.google.com/project/reddyfit-dcf41

## 📊 Database Structure

```
Firestore Database (reddyfit-dcf41)
│
├── users/
│   └── {uid}/                            # User-specific document
│       ├── uid: string
│       ├── email: string
│       ├── displayName: string
│       ├── photoURL: string
│       ├── createdAt: timestamp
│       │
│       ├── Settings
│       ├── fullName: string
│       ├── age: number
│       ├── gender: string
│       ├── weight: number
│       ├── height: number
│       ├── bmi: number
│       ├── bmr: number
│       ├── targetWeight: number
│       ├── fitnessGoal: string
│       ├── currentFitnessLevel: string
│       │
│       └── Discipline Tracking
│           ├── currentStreak: number
│           ├── bestStreak: number
│           ├── totalDays: number
│           ├── workoutHistory: boolean[]
│           ├── calorieHistory: boolean[]
│           └── ...
│
└── (Future collections)
    ├── workouts/
    ├── meals/
    └── progress/
```

## 🔄 User Flow

### Registration Flow
```
1. User signs in with Google
   ↓
2. AuthProvider creates user in Firestore (users/{uid})
   ↓
3. n8n webhook triggered (if integrated)
   ↓
4. Welcome email sent via Gmail
   ↓
5. User sees CleanDashboard with onboarding
   ↓
6. User completes profile in Settings
   ↓
7. Data saves to Firestore
   ↓
8. Dashboard shows real user data
```

### Email Automation Flow
```
1. User registers on ReddyFit
   ↓
2. Frontend calls webhook:
   POST /webhook/reddyfit-new-user
   {email, displayName, uid}
   ↓
3. n8n workflow receives webhook
   ↓
4. Email template populated with user data
   ↓
5. Gmail SMTP sends email
   ↓
6. User receives beautiful welcome email
   ↓
7. Execution logged in n8n dashboard
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Animations**: @ssgoi/react
- **Icons**: Lucide React

### Backend & Database
- **Auth**: Firebase Authentication (Google OAuth)
- **Database**: Cloud Firestore
- **Storage**: Azure Blob Storage
- **Hosting**: Azure Static Web Apps

### Automation
- **Workflow Engine**: n8n
- **Email**: Gmail SMTP
- **Testing**: Node.js scripts

### Development
- **Version Control**: Git + GitHub
- **CI/CD**: Azure Static Web Apps (automatic)
- **Package Manager**: npm

## 📝 Environment Variables

### Frontend (`.env`)
```env
VITE_FIREBASE_API_KEY=AIzaSyBFhGoxAAR4vLYLXNn8nDlKabiqhCPnWJk
VITE_FIREBASE_AUTH_DOMAIN=reddyfit-dcf41.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=reddyfit-dcf41
VITE_FIREBASE_STORAGE_BUCKET=reddyfit-dcf41.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123730832729
VITE_FIREBASE_APP_ID=1:123730832729:web:16ce63a0f2d5401f60b048
```

### n8n Automations (`.env`)
```env
N8N_URL=http://localhost:5678
N8N_API_KEY=your-api-key
FIREBASE_PROJECT_ID=reddyfit-dcf41
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
```

## 🚀 Quick Start Commands

### Development
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Test email automation
cd n8n-automations/scripts
node test-welcome-email.js test@example.com "Test User"
```

### Deployment
```bash
# Commit changes
git add -A
git commit -m "feat: update"
git push origin production

# Azure deploys automatically via GitHub Actions
```

## ✅ Current Status

### Completed ✅
- [x] Clean dashboard (no mock data)
- [x] Firebase authentication & database
- [x] Settings save/load with UID-based documents
- [x] First-time user onboarding
- [x] Discipline tracking system
- [x] AI chatbot integration
- [x] Welcome email automation
- [x] Beautiful email template
- [x] n8n workflow configured
- [x] Testing scripts
- [x] Comprehensive documentation

### In Progress 🔄
- [ ] Email automation integration with app
- [ ] Additional n8n workflows (progress reports, reminders)
- [ ] Advanced discipline tracking features

### Planned 📋
- [ ] Workout logging system
- [ ] Meal planning features
- [ ] Progress analytics
- [ ] Social features (workout buddies, community)
- [ ] Push notifications
- [ ] Mobile app

## 📖 Documentation Index

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `n8n-automations/README.md` | Email automation overview |
| `PROJECT_STRUCTURE.md` | Complete file structure (this file) |
| `DATABASE_TEST.md` | Database testing report |
| `TESTING_CHECKLIST.md` | Testing procedures |
| `COMPLETE_TEST_FLOW.md` | End-to-end testing guide |

---

**Last Updated**: 2025-01-02
**Version**: 2.0 Clean
**Status**: ✅ Production Ready with Email Automation
