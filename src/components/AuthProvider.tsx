import { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, db, Collections } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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

  console.log('AuthProvider state:', { user: user?.email, loading });

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // First check for redirect result (this happens after Google login redirect)
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Sign-in redirect successful:', result.user.email);
        }
      } catch (error: any) {
        console.error('Redirect sign-in error:', error);
      }

      // Then set up the auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted) return;

        console.log('Auth state changed:', firebaseUser?.email || 'no user');

        if (firebaseUser && firebaseUser.uid) {
          try {
            // Check if user exists in Firestore (using UID as document ID)
            const userDocRef = doc(db, Collections.USERS, firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            // Create or update user document
            if (!userDoc.exists()) {
              console.log('✅ Creating new user in Firestore with UID:', firebaseUser.uid);
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                createdAt: new Date().toISOString(),
                onboardingCompleted: false,
                feedbackCompleted: false
              });
              console.log('✅ User created successfully at users/' + firebaseUser.uid);
            } else {
              console.log('ℹ️ User already exists at users/' + firebaseUser.uid);
              // Update display name and photo if changed
              const userData = userDoc.data();
              if (userData.displayName !== firebaseUser.displayName ||
                  userData.photoURL !== firebaseUser.photoURL) {
                await setDoc(userDocRef, {
                  displayName: firebaseUser.displayName || '',
                  photoURL: firebaseUser.photoURL || '',
                  updatedAt: new Date().toISOString()
                }, { merge: true });
              }
            }
          } catch (error) {
            console.error('❌ Error managing user profile:', error);
          }
        }

        // Set user and stop loading AFTER Firestore operations complete
        if (mounted) {
          setUser(firebaseUser);
          setLoading(false);
        }
      });

      return unsubscribe;
    };

    const unsubscribePromise = initAuth();

    return () => {
      mounted = false;
      unsubscribePromise.then(unsubscribe => unsubscribe());
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
