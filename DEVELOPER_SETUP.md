# 🛠️ ReddyFit Developer Setup Guide

## Prerequisites

### Required Software

- **Node.js**: v18+ (v20 recommended)
- **npm**: v9+
- **Git**: Latest version
- **Firebase CLI**: v12+
- **Azure CLI**: Latest version (for deployment)
- **Temporal CLI**: v1.0+ (for local workflow testing)

### Optional Tools

- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Firebase Explorer
  - GitLens
- **Docker Desktop**: For local Temporal server
- **Postman**: For API testing

## Project Structure

```
ReddyfitWebsiteready/
├── src/
│   ├── components/          # React components
│   │   ├── AuthProvider.tsx # Auth context
│   │   ├── Dashboard/       # Dashboard components
│   │   ├── DailyScan/       # Daily Scan UI
│   │   └── __tests__/       # Component tests
│   ├── pages/               # Route pages
│   │   ├── DailyScanPage.tsx
│   │   ├── DailyScanDashboard.tsx
│   │   └── ProfilePage.tsx
│   ├── lib/                 # Business logic
│   │   ├── firestore/       # Firestore helpers
│   │   │   ├── scans.ts
│   │   │   ├── users.ts
│   │   │   ├── dayLogs.ts
│   │   │   └── __tests__/
│   │   ├── ai/              # AI prompts (future)
│   │   └── utils/           # Utilities
│   ├── types/               # TypeScript types
│   │   ├── scan.ts
│   │   └── index.ts
│   ├── config/              # Configuration
│   │   └── firebase.ts
│   ├── AppRouter.tsx        # Routing (lazy-loaded)
│   └── main.tsx            # Entry point
├── e2e/                     # Playwright E2E tests
│   └── landing.spec.ts
├── public/                  # Static assets
├── firestore.rules          # Firestore security rules
├── vite.config.ts           # Vite configuration
├── playwright.config.ts     # Playwright config
├── vitest.config.ts         # Vitest config
├── tailwind.config.js       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/reddyfit.git
cd reddyfit/ReddyfitWebsiteready
```

### 2. Install Dependencies

```bash
npm install
```

**Key dependencies installed**:
- `react@19.0.0` - UI framework
- `firebase@11.1.0` - Backend services
- `@temporalio/client` - Workflow orchestration
- `vite` - Build tool
- `vitest` - Testing framework
- `@playwright/test` - E2E testing
- `tailwindcss` - Styling
- `recharts` - Charts
- `framer-motion` - Animations

### 3. Environment Configuration

Create `.env.local` file in project root:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBFhGoxAAR4vLYLXNn8nDlKabiqhCPnWJk
VITE_FIREBASE_AUTH_DOMAIN=reddyfit-dcf41.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=reddyfit-dcf41
VITE_FIREBASE_STORAGE_BUCKET=reddyfit-dcf41.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123730832729
VITE_FIREBASE_APP_ID=1:123730832729:web:16ce63a0f2d5401f60b048
VITE_FIREBASE_MEASUREMENT_ID=G-ECC4W6B3JN

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123730832729-mpvrnj8roholmg6098i7r33vugb09o1o.apps.googleusercontent.com

# Google AI (Gemini)
VITE_GEMINI_API_KEY=AIzaSyDKyxXoi7TpBGoLVR8eAOGEEO1DKtbpi4o

# Azure Storage
VITE_AZURE_STORAGE_ACCOUNT=reddyfitphotos
VITE_AZURE_STORAGE_CONTAINER=scans

# Backend API
VITE_API_BASE_URL=http://localhost:3000

# Temporal (local development)
VITE_TEMPORAL_ENDPOINT=localhost:7233
VITE_TEMPORAL_NAMESPACE=default
```

**⚠️ Security Note**: Never commit `.env.local` to Git. These are production keys for example only.

### 4. Firebase Setup

#### Login to Firebase

```bash
firebase login
```

#### Initialize Firebase (if not done)

```bash
firebase init

# Select:
# ✓ Firestore
# ✓ Storage
# ✓ Hosting
# ✓ Functions (optional)
```

#### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

#### Test Firebase Connection

```bash
npm run dev
# Try signing in with Google
```

### 5. Azure Setup (Optional - for deployment)

#### Login to Azure

```bash
az login
```

#### Install Static Web Apps CLI

```bash
npm install -g @azure/static-web-apps-cli
```

#### Test Local Deployment

```bash
npm run build
swa start dist --api-location=../reddyfit-express-api
```

### 6. Temporal Setup (Optional - for workflow testing)

#### Install Temporal CLI

```bash
# macOS
brew install temporal

# Windows
scoop install temporal

# Linux
wget https://temporal.download/cli/archive/latest?platform=linux -O temporal.tar.gz
tar -xf temporal.tar.gz
sudo mv temporal /usr/local/bin/
```

#### Start Local Temporal Server

```bash
temporal server start-dev
```

Access Temporal UI: http://localhost:8233

## Development Workflow

### Running the App

#### Development Server

```bash
npm run dev
```

App runs at: http://localhost:5173

**Features**:
- Hot module replacement (HMR)
- Fast refresh
- Source maps

#### Production Build

```bash
npm run build
```

Output: `dist/` directory

#### Preview Production Build

```bash
npm run preview
```

### Testing

#### Run All Tests

```bash
npm test
```

#### Run with Coverage

```bash
npm run test:coverage
```

**Coverage targets**:
- Daily Scan helpers: 90%+
- Service layer: 85%+
- Components: 70%+
- Overall: 80%+

#### Run E2E Tests

```bash
npx playwright test
```

**Opens Playwright UI**:
```bash
npx playwright test --ui
```

#### Run Specific Test File

```bash
npm test src/lib/firestore/__tests__/scans.test.ts
```

#### Watch Mode

```bash
npm test -- --watch
```

### Code Quality

#### Linting

```bash
npm run lint
```

#### Type Checking

```bash
npx tsc --noEmit
```

#### Format Code

```bash
npm run format
```

(Add to package.json):
```json
"scripts": {
  "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\""
}
```

## Working with Daily Scan

### Testing Locally

1. **Start dev server**:
```bash
npm run dev
```

2. **Sign in with Google**

3. **Navigate to Daily Scan**: http://localhost:5173/scan

4. **Upload test images**:
   - Use sample images from `public/test-images/` (create this folder)
   - Take your own photos following guidelines

5. **Monitor Firestore**:
   - Open Firebase Console
   - Go to Firestore Database
   - Watch `scans` collection for new documents

### Testing Workflow (without Temporal)

For local testing without full Temporal setup:

1. **Mock workflow responses**:

```typescript
// In src/lib/firestore/scans.ts
export async function triggerScanWorkflow(scanId: string) {
  if (import.meta.env.DEV) {
    // Mock workflow for local dev
    console.log('DEV MODE: Mocking workflow response');

    // Simulate QC approval after 2s
    setTimeout(async () => {
      await updateScanWithQC(scanId, 'approved', 'Mock: Images look good!');
    }, 2000);

    // Simulate estimation after 5s
    setTimeout(async () => {
      await updateScanWithEstimation(scanId, 15.5, 153);
    }, 5000);

    return { success: true, workflowId: 'mock-workflow' };
  }

  // Production: Call actual backend API
  // ...
}
```

2. **Test scan flow**:
   - Upload images
   - Wait 5 seconds
   - Check Firestore for updated scan document
   - Verify Dashboard displays results

### Working with Firestore

#### Read Data

```typescript
import { getScan, getUserProfile } from '@/lib/firestore';

// Get scan
const scan = await getScan(scanId);

// Get user profile
const profile = await getUserProfile(userId);
```

#### Write Data

```typescript
import { createScan, updateScanWithEstimation } from '@/lib/firestore/scans';

// Create scan
const scanId = await createScan(userId, {
  date: '2025-10-07',
  angleUrls: { front, back, left, right },
  weightLb: 180
});

// Update with estimation
await updateScanWithEstimation(scanId, 15.5, 153);
```

#### Query Data

```typescript
import { getScansForDate, getTrendData } from '@/lib/firestore/scans';

// Get scans for specific date
const scans = await getScansForDate(userId, '2025-10-07');

// Get trend data
const trend = await getTrendData(userId, 30); // Last 30 days
```

### Security Rules Testing

Test Firestore rules locally:

```bash
firebase emulators:start --only firestore
```

Access Emulator UI: http://localhost:4000

## Debugging

### React DevTools

Install browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Firebase Debugging

```typescript
// Enable Firestore debug logging
import { enableIndexedDbPersistence } from 'firebase/firestore';
import { db } from './config/firebase';

enableIndexedDbPersistence(db, {
  forceOwnership: true
}).catch((err) => {
  console.error('Persistence error:', err);
});
```

### Network Debugging

Use browser DevTools:
- **Network tab**: Monitor API calls
- **Console**: Check for errors
- **Application tab**: Inspect Firebase cache

### Common Issues

#### Issue: "Module not found"

**Fix**: Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "Firebase auth error"

**Fix**: Check `.env.local` configuration
```bash
# Verify all VITE_FIREBASE_* variables are set
cat .env.local | grep VITE_FIREBASE
```

#### Issue: "CORS error when uploading images"

**Fix**: Configure CORS in Azure Storage
```bash
az storage cors add \
  --services b \
  --methods GET POST PUT \
  --origins "http://localhost:5173" "https://delightful-sky-0437f100f.2.azurestaticapps.net" \
  --allowed-headers "*" \
  --account-name reddyfitphotos
```

#### Issue: "Tests failing with Firebase mock errors"

**Fix**: Check test setup file
```bash
# Verify vitest.setup.ts is configured
cat vitest.config.ts
```

## Deployment

### Deploy to Azure Static Web Apps

#### Production Deployment

```bash
# Build
npm run build

# Deploy (automatic via GitHub Actions)
git push origin main
```

**GitHub Actions workflow**: `.github/workflows/azure-static-web-apps.yml`

#### Manual Deployment

```bash
# Using Azure CLI
swa deploy ./dist \
  --app-name delightful-sky-0437f100f \
  --resource-group rg-reddyfit-prod \
  --env production
```

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy Functions (if applicable)

```bash
firebase deploy --only functions
```

### Environment Variables in Azure

Set environment variables in Azure portal:
1. Go to Static Web App
2. **Settings** → **Configuration**
3. Add application settings (without `VITE_` prefix for backend)

## Performance Optimization

### Bundle Analysis

```bash
npm run build -- --analyze
```

Generates `dist/stats.html` for bundle visualization.

### Lazy Loading

Routes are already lazy-loaded in `AppRouter.tsx`:

```typescript
const DailyScanPage = lazy(() => import('./pages/DailyScanPage'));
```

### Image Optimization

Use optimized image formats:
- WebP for photos
- SVG for icons and logos
- Lazy load images below the fold

### Caching Strategy

Vite automatically configures:
- Vendor chunks cached separately
- Content-based hashing for cache busting

## Contributing

### Branch Strategy

- `main`: Production branch
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

### Commit Convention

Follow Conventional Commits:

```bash
# Format: <type>(<scope>): <subject>

feat(scan): Add QR code generation
fix(auth): Resolve Google login redirect issue
docs(readme): Update setup instructions
test(scans): Add unit tests for createScan
refactor(dashboard): Extract chart component
perf(bundle): Reduce main bundle size
```

### Pull Request Process

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Push branch: `git push origin feature/my-feature`
6. Create Pull Request on GitHub
7. Wait for CI checks to pass
8. Request code review
9. Merge after approval

### Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] Tests added for new features
- [ ] Tests passing (unit + E2E)
- [ ] No console errors or warnings
- [ ] Documentation updated
- [ ] Firestore rules updated (if needed)
- [ ] Performance impact minimal
- [ ] Mobile responsive
- [ ] Accessibility considered

## Resources

### Documentation

- **TESTING_GUIDE.md**: Testing best practices
- **API_DOCUMENTATION.md**: Backend API reference
- **DAILY_SCAN_USER_GUIDE.md**: User guide for Daily Scan
- **ARCHITECTURE.md**: System architecture (see next section)

### External Resources

- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Temporal Docs](https://docs.temporal.io/)
- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)

### Support

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Email**: dev@reddyfit.com

## License

MIT License - See LICENSE file for details

---

**Ready to start developing?** Run `npm run dev` and start building! 🚀
