import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

/**
 * Strict role detection based on email domain:
 * - @gmail.com -> Dining Customer
 * - @staff.com -> Kitchen Staff (or Cashier POS if cashier@staff.com)
 * - @admin.com -> Manager & Administrator
 */
export const detectRoleFromEmail = (email = '') => {
  const lower = email.trim().toLowerCase();

  // 1. Manager & Admin domain (@admin.com)
  if (lower.endsWith('@admin.com')) {
    return {
      role: 'system',
      label: 'Manager & Admin',
      defaultView: 'system',
      domain: '@admin.com',
      badgeColor: 'badge-purple',
      accentColor: 'violet',
      allowedDomain: '@admin.com'
    };
  }

  // 2. Staff domain (@staff.com)
  if (lower.endsWith('@staff.com')) {
    if (lower.startsWith('cashier') || lower.startsWith('pos') || lower.startsWith('billing')) {
      return {
        role: 'cashier',
        label: 'Cashier POS Desk',
        defaultView: 'cashier',
        domain: '@staff.com',
        badgeColor: 'badge-blue',
        accentColor: 'blue',
        allowedDomain: '@staff.com'
      };
    }
    return {
      role: 'kitchen',
      label: 'Kitchen Staff',
      defaultView: 'kitchen',
      domain: '@staff.com',
      badgeColor: 'badge-rose',
      accentColor: 'rose',
      allowedDomain: '@staff.com'
    };
  }

  // 3. Dining Customer domain (@gmail.com)
  return {
    role: 'customer',
    label: 'Dining Customer',
    defaultView: 'customer',
    domain: '@gmail.com',
    badgeColor: 'badge-emerald',
    accentColor: 'emerald',
    allowedDomain: '@gmail.com'
  };
};

/**
 * Validate that an email meets domain rules:
 * - Customers: must use @gmail.com
 * - Kitchen & Cashier Staff: must use @staff.com
 * - Manager & Admin: must use @admin.com
 */
export const validateRoleDomain = (email = '', intendedRole = 'customer') => {
  const lower = email.trim().toLowerCase();
  if (!lower) return 'Please enter a valid email address.';

  if (intendedRole === 'customer') {
    if (!lower.endsWith('@gmail.com')) {
      return 'Customers must register and log in with a valid @gmail.com email address.';
    }
  } else if (intendedRole === 'kitchen') {
    if (!lower.endsWith('@staff.com')) {
      return 'Kitchen staff accounts must use an official @staff.com email address.';
    }
  } else if (intendedRole === 'cashier') {
    if (!lower.endsWith('@staff.com')) {
      return 'Cashier staff accounts must use an official @staff.com email address.';
    }
  } else if (intendedRole === 'system' || intendedRole === 'admin') {
    if (!lower.endsWith('@admin.com')) {
      return 'Manager & Admin accounts must use an official @admin.com email address.';
    }
  }

  return null;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rm_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Listen to real Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const roleInfo = detectRoleFromEmail(firebaseUser.email);
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL || null,
          role: roleInfo.role,
          roleLabel: roleInfo.label,
          defaultView: roleInfo.defaultView,
          isFirebaseAuthenticated: true
        };
        setCurrentUser(userData);
        localStorage.setItem('rm_auth_user', JSON.stringify(userData));
      } else {
        // When not authenticated in Firebase, clear user session completely
        setCurrentUser(null);
        localStorage.removeItem('rm_auth_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Real Firebase Login using Email & Password
   * Strict: NEVER silently registers or bypasses! Requires a registered account.
   */
  const loginWithEmail = async (email, password, intendedRole = null) => {
    setAuthError(null);
    const trimmedEmail = email.trim().toLowerCase();

    // Validate domain if intendedRole specified
    if (intendedRole) {
      const domainError = validateRoleDomain(trimmedEmail, intendedRole);
      if (domainError) {
        return { success: false, error: domainError };
      }
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const roleInfo = detectRoleFromEmail(cred.user.email);
      const userData = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || trimmedEmail.split('@')[0],
        role: roleInfo.role,
        roleLabel: roleInfo.label,
        defaultView: roleInfo.defaultView,
        isFirebaseAuthenticated: true
      };
      setCurrentUser(userData);
      localStorage.setItem('rm_auth_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      console.warn('Firebase login attempt failed:', err.code, err.message);

      let errorDisplay = 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorDisplay = 'No registered account found with this email or invalid password. Please register an account first!';
      } else if (err.code === 'auth/wrong-password') {
        errorDisplay = 'Incorrect password. Please verify your credentials.';
      } else if (err.code === 'auth/invalid-email') {
        errorDisplay = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        errorDisplay = 'Too many failed login attempts. Please wait a moment and try again.';
      }

      return { success: false, error: errorDisplay };
    }
  };

  /**
   * Real Firebase Sign Up / Registration
   * Creates genuine registered user in Firebase Auth.
   */
  const signupWithEmail = async (email, password, name, intendedRole = 'customer') => {
    setAuthError(null);
    const trimmedEmail = email.trim().toLowerCase();

    // Domain validation enforcement
    const domainError = validateRoleDomain(trimmedEmail, intendedRole);
    if (domainError) {
      return { success: false, error: domainError };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      if (name) {
        try {
          await updateProfile(cred.user, { displayName: name });
        } catch {
          // ignore profile update warning
        }
      }
      const roleInfo = detectRoleFromEmail(cred.user.email);
      const userData = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name || trimmedEmail.split('@')[0],
        role: roleInfo.role,
        roleLabel: roleInfo.label,
        defaultView: roleInfo.defaultView,
        isFirebaseAuthenticated: true
      };
      setCurrentUser(userData);
      localStorage.setItem('rm_auth_user', JSON.stringify(userData));
      return { success: true, user: userData, registered: true };
    } catch (err) {
      console.error('Firebase registration error:', err.code, err.message);
      let errorDisplay = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errorDisplay = 'An account with this email already exists. Please switch to "Sign In" to log in.';
      } else if (err.code === 'auth/weak-password') {
        errorDisplay = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorDisplay = 'Invalid email address format.';
      }
      return { success: false, error: errorDisplay };
    }
  };

  /**
   * Real Firebase Google Sign-In (strictly for Customers with @gmail.com)
   */
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);

      if (!cred.user.email.toLowerCase().endsWith('@gmail.com')) {
        await signOut(auth);
        return { 
          success: false, 
          error: 'Only @gmail.com accounts are permitted for Customer portal access.' 
        };
      }

      const roleInfo = detectRoleFromEmail(cred.user.email);
      const userData = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
        role: roleInfo.role,
        roleLabel: roleInfo.label,
        defaultView: roleInfo.defaultView,
        isFirebaseAuthenticated: true
      };
      setCurrentUser(userData);
      localStorage.setItem('rm_auth_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      console.warn('Google Popup error:', err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Real Firebase Sign-Out
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('rm_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        authError,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
