import { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check for redirect result with timeout
    const checkRedirectResult = async () => {
      try {
        const result = await Promise.race([
          getRedirectResult(auth),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Redirect check timeout')), 3000))
        ]);
        if (mounted && result?.user) {
          console.log('Sign-in redirect successful:', result.user.email);
        }
      } catch (error: any) {
        if (mounted && error.message !== 'Redirect check timeout') {
          console.error('Redirect sign-in error:', error);
        }
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser && firebaseUser.email) {
        try {
          console.log('User authenticated:', firebaseUser.email);

          // Check if user profile exists
          const profile = await api.getUserProfile({ email: firebaseUser.email });

          // Create profile if it doesn't exist
          if (!profile) {
            console.log('Creating new user profile...');
            await api.upsertUserProfile({
              email: firebaseUser.email,
              firebase_uid: firebaseUser.uid,
              full_name: firebaseUser.displayName || '',
              avatar_url: firebaseUser.photoURL || '',
            });
            console.log('User profile created successfully');
          } else {
            console.log('User profile already exists');
          }
        } catch (error) {
          console.error('Error managing user profile:', error);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in...');

      // Configure provider for better compatibility
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      // Try popup first
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Sign-in successful (popup):', result.user.email);
      } catch (popupError: any) {
        console.log('Popup failed, trying redirect method...', popupError.code);

        // If popup fails, use redirect method (more reliable)
        if (popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Error signing in:', error);

      // Show user-friendly error message
      if (error.code === 'auth/unauthorized-domain') {
        alert('Authentication error: This domain is not authorized in Firebase Console. Please add white-meadow-001c09f0f.2.azurestaticapps.net to authorized domains.');
        console.error('Domain not authorized in Firebase Console');
      } else if (error.code === 'auth/network-request-failed') {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        alert(`Sign-in failed: ${error.message}\n\nPlease try again or contact support.`);
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
