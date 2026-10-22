import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, ADMIN_BOOTSTRAP_EMAIL } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  isSimulatedAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  simulateStaffLogin: () => void;
  logout: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulatedAdmin, setIsSimulatedAdmin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if staff mode was stored locally for preview convenience
    const storedStaff = sessionStorage.getItem('smp_staff_session');
    if (storedStaff === 'active') {
      setIsSimulatedAdmin(true);
      setIsAdmin(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setAuthError(null);
        // Check if bootstrapped admin or in admins collection
        const isBootstrap = user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
        if (isBootstrap) {
          setIsAdmin(true);
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            setIsAdmin(adminDoc.exists());
          } catch (e) {
            console.warn('Admin check error:', e);
            setIsAdmin(false);
          }
        }
      } else {
        if (!sessionStorage.getItem('smp_staff_session')) {
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isBootstrap = result.user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
      if (isBootstrap) {
        setIsAdmin(true);
      } else {
        const adminDoc = await getDoc(doc(db, 'admins', result.user.uid));
        setIsAdmin(adminDoc.exists());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      setAuthError(msg);
      throw err;
    }
  };

  const simulateStaffLogin = () => {
    setIsSimulatedAdmin(true);
    setIsAdmin(true);
    sessionStorage.setItem('smp_staff_session', 'active');
  };

  const logout = async () => {
    setIsSimulatedAdmin(false);
    setIsAdmin(false);
    sessionStorage.removeItem('smp_staff_session');
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin: isAdmin || isSimulatedAdmin,
        loading,
        isSimulatedAdmin,
        loginWithGoogle,
        simulateStaffLogin,
        logout,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
