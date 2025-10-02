// Security Utilities for ReddyFit
// Prevents XSS, injection attacks, and implements rate limiting

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [], // No HTML tags allowed in user input
    ALLOWED_ATTR: []
  });
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321
}

/**
 * Validate username/name
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(name);

  if (sanitized.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (sanitized.length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' };
  }

  // Only letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(sanitized)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { valid: true };
}

/**
 * Validate numeric input
 */
export function validateNumber(value: string | number, min?: number, max?: number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;

  return true;
}

/**
 * Rate Limiter class
 * Prevents abuse by limiting requests per time window
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {
    // Cleanup old entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
   * Check if request is allowed for given identifier (e.g., userId, IP)
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove requests outside the time window
    const recentRequests = requests.filter(time => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  /**
   * Get time until next allowed request (ms)
   */
  getTimeUntilReset(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    if (requests.length === 0) return 0;

    const oldestRequest = requests[0];
    const timeElapsed = Date.now() - oldestRequest;
    const timeRemaining = this.windowMs - timeElapsed;

    return Math.max(0, timeRemaining);
  }

  private cleanup() {
    const now = Date.now();
    for (const [identifier, requests] of this.requests.entries()) {
      const recent = requests.filter(time => now - time < this.windowMs);
      if (recent.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recent);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Global rate limiters
export const authRateLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes
export const apiRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute
export const messageRateLimiter = new RateLimiter(10, 60000); // 10 messages per minute

/**
 * Sanitize HTML content for display
 * Allows safe HTML tags for rich text
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOWED_URI_REGEXP: /^https?:\/\//
  });
}

/**
 * Validate URL
 */
export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }

  // Check file name
  const sanitizedName = sanitizeInput(file.name);
  if (sanitizedName.length === 0) {
    return { valid: false, error: 'Invalid file name' };
  }

  return { valid: true };
}

/**
 * Content Security Policy headers (for server-side)
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://*.googleusercontent.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.cloudfunctions.net https://generativelanguage.googleapis.com",
    "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
};

/**
 * Detect suspicious patterns in user input
 */
export function detectSuspiciousInput(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /<iframe/i,
    /eval\(/i,
    /document\.cookie/i,
    /\.innerHTML/i,
    /<embed/i,
    /<object/i,
    /vbscript:/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Secure localStorage wrapper
 */
export const SecureStorage = {
  set(key: string, value: any): void {
    try {
      const sanitizedKey = sanitizeInput(key);
      const serialized = JSON.stringify(value);
      localStorage.setItem(sanitizedKey, serialized);
    } catch (error) {
      console.error('SecureStorage.set error:', error);
    }
  },

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const sanitizedKey = sanitizeInput(key);
      const item = localStorage.getItem(sanitizedKey);
      if (item === null) return defaultValue || null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('SecureStorage.get error:', error);
      return defaultValue || null;
    }
  },

  remove(key: string): void {
    try {
      const sanitizedKey = sanitizeInput(key);
      localStorage.removeItem(sanitizedKey);
    } catch (error) {
      console.error('SecureStorage.remove error:', error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('SecureStorage.clear error:', error);
    }
  }
};

/**
 * Log security events (for monitoring)
 */
export function logSecurityEvent(event: {
  type: 'xss_attempt' | 'rate_limit' | 'invalid_input' | 'suspicious_activity';
  details: string;
  userId?: string;
}) {
  console.warn('[SECURITY]', {
    timestamp: new Date().toISOString(),
    ...event
  });

  // In production, send to security monitoring service
  // sendToSecurityMonitoring(event);
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  // Common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeated characters');
  }

  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 4) strength = 'medium';
  else strength = 'strong';

  return { strength, score, feedback };
}
