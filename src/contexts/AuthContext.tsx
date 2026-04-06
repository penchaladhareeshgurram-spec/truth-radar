import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Check if user profile exists, if not create it
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef).catch(e => {
            handleFirestoreError(e, OperationType.GET, `users/${currentUser.uid}`);
            return null;
          });
          
          if (userSnap && !userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              createdAt: serverTimestamp()
            }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${currentUser.uid}`));
          }
        } catch (error) {
          console.error("Error setting up user profile:", error);
        }
      }
      setUser(currentUser);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const [signingIn, setSigningIn] = useState(false);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Handle cancellation and popup blocked errors gracefully
      const errorCode = error.code || '';
      const errorMessage = error.message || '';
      
      if (
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/user-cancelled' ||
        errorCode === 'auth/cancelled-popup-request' ||
        errorCode === 'auth/popup-blocked' ||
        errorMessage.includes('auth/popup-closed-by-user') ||
        errorMessage.includes('auth/cancelled-popup-request') ||
        errorMessage.includes('auth/popup-blocked')
      ) {
        // Silent fail for user-initiated cancellations or blocked popups
        console.log("Sign-in was cancelled or blocked:", errorCode || errorMessage);
        if (errorCode === 'auth/popup-blocked' || errorMessage.includes('auth/popup-blocked')) {
          throw new Error("The sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
        }
        return;
      }
      
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing in with email", error);
      throw error;
    } finally {
      setSigningIn(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Force profile update in Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: email,
        displayName: name,
        photoURL: null,
        createdAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${userCredential.user.uid}`));
      
    } catch (error) {
      console.error("Error signing up with email", error);
      throw error;
    } finally {
      setSigningIn(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting password", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthReady, 
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      logout 
    }}>
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
