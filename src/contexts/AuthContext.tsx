import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { UserProfile, OperationType } from '../types';
import { handleFirestoreError } from '../utils/firestoreErrorHandler';
import { logActivity, createNotification } from '../utils/activityLogger';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    // 🔥 FORCE GOOGLE ACCOUNT CHOOSER
    provider.setCustomParameters({
      prompt: "select_account"
    });

    try {
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        await logActivity(
          result.user.uid,
          result.user.displayName || 'User',
          'Logged in via Google',
          'login'
        );

        await createNotification(
          result.user.uid,
          'New Login',
          'You have successfully logged in via Google.',
          'success'
        );
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (user) {
      await logActivity(user.uid, profile?.displayName || 'User', 'Logged out', 'logout');
      await createNotification(user.uid, 'Logged Out', 'You have been successfully logged out.', 'info');
    }
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      await logActivity(user.uid, profile?.displayName || 'User', 'Updated profile settings', 'update');
      await createNotification(user.uid, 'Profile Updated', 'Your profile information has been successfully updated.', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      if (user) {
        await logActivity(user.uid, profile?.displayName || 'User', 'Requested password reset', 'security');
        await createNotification(user.uid, 'Password Reset Sent', `A password reset link has been sent to ${email}.`, 'info');
      }
    } catch (error) {
      console.error('Password Reset Error:', error);
      throw error;
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Initial profile setup/fetch
        const userDocRef = doc(db, 'users', user.uid);

        // Setup real-time listener for profile
        unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });

        // Ensure user exists in Firestore
        const userDoc = await getDoc(userDocRef);
        const isAdminEmail = user.email === 'sahilpanchal1818@gmail.com';
        const role = isAdminEmail ? 'admin' : 'user';

        if (!userDoc.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'User',
            role: role,
            status: 'active',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          };
          await setDoc(userDocRef, newProfile);
          await createNotification(user.uid, 'Welcome!', 'Welcome to AuthSystem. We are glad to have you here!', 'success');
        } else {
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        }
      } else {
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }

      setLoading(false);
      setIsAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Remove theme application to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAuthReady,
      signInWithGoogle,
      logout,
      updateProfile,
      resetPassword,
      isAdmin
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
