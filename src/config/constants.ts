/**
 * Application Constants
 * Central configuration file following DRY principle
 * @module config/constants
 */

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

export const AGENTS = {
  REDDY: {
    id: 'reddy',
    name: 'Agent Reddy',
    description: 'Personal AI fitness coach with chat & voice help',
    color: 'from-orange-500 to-red-500',
    available: true
  },
  FITBUDDY: {
    id: 'fitbuddy',
    name: 'Agent FitBuddy',
    description: 'Image analysis & body fat calculator',
    color: 'from-green-500 to-emerald-500',
    available: true,
    features: {
      frequencyLimit: 'once-per-week',
      processingTime: 10, // minutes
      notificationsEnabled: true
    }
  },
  CUPID: {
    id: 'cupid',
    name: 'Agent Cupid',
    description: 'Smart fitness partner matching',
    color: 'from-pink-500 to-purple-500',
    available: true
  }
} as const;

// ============================================================================
// ADMIN CONFIGURATION
// ============================================================================

export const ADMIN_EMAILS = ['akhilreddyd3@gmail.com'] as const;

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================

export const TIMING = {
  FITBUDDY_PROCESSING_TIME: 10 * 60 * 1000, // 10 minutes in milliseconds
  FEEDBACK_DEBOUNCE: 500, // milliseconds
  NOTIFICATION_DELAY: 2000 // milliseconds
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  FEEDBACK_FORM_ENABLED: true,
  ONBOARDING_ENABLED: false, // Disabled - skip to dashboard
  ADMIN_DASHBOARD_ENABLED: true,
  WAITLIST_ENABLED: true
} as const;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI = {
  MAX_UPLOAD_SIZE_MB: 10,
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  TOAST_DURATION: 3000, // milliseconds
  LOADING_DEBOUNCE: 300 // milliseconds
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  AUTH: {
    NO_USER: 'User not authenticated. Please sign in again.',
    PERMISSION_DENIED: 'Permission denied. Please check Firebase security rules.',
    UNAUTHENTICATED: 'Authentication error. Please sign out and sign in again.',
    NETWORK_ERROR: 'Network error. Please check your internet connection.'
  },
  FEEDBACK: {
    SUBMISSION_FAILED: 'Failed to submit feedback. Please try again.',
    VALIDATION_FAILED: 'Please fill in all required fields.'
  },
  FITBUDDY: {
    WEEKLY_LIMIT_REACHED: 'You have already submitted a photo this week. Please try again next week.',
    PROCESSING_ERROR: 'Failed to process your photo. Please try again.',
    INVALID_IMAGE: 'Please upload a valid image file (JPEG, PNG, or WebP).',
    FILE_TOO_LARGE: `File size must be under ${UI.MAX_UPLOAD_SIZE_MB}MB.`
  }
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  FEEDBACK_SUBMITTED: '🎉 CONGRATULATIONS! 🎉\n\n✅ Your feedback has been submitted!\n\nGet ready to transform your fitness journey! 💪',
  PHOTO_UPLOADED: 'Photo uploaded successfully! Processing will take approximately 10 minutes.',
  PROFILE_UPDATED: 'Profile updated successfully!'
} as const;

// ============================================================================
// LOGGING PREFIXES
// ============================================================================

export const LOG_PREFIX = {
  APP_ROUTER: '[AppRouter]',
  AUTH_PROVIDER: '[AuthProvider]',
  FEEDBACK_FORM: '[UserFeedbackForm]',
  ADMIN_DASHBOARD: '[AdminDashboard]',
  FITBUDDY: '[FitBuddyAgent]',
  CUPID: '[CupidAgent]',
  REDDY: '[ReddyAgent]'
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AgentId = typeof AGENTS[keyof typeof AGENTS]['id'];
export type AdminEmail = typeof ADMIN_EMAILS[number];
