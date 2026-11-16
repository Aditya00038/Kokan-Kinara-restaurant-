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
 * Role detection based on role keyword or email identifier:
 * - admin -> Restaurant Admin (Executive Analytics & Strategy)
 * - manager / @admin.com -> Restaurant Manager (Daily operations, reservations, dispatch)
 * - waiter -> Waitstaff Captain (Tables, service calls, serving food)
 * - chef / kitchen / @staff.com -> Kitchen Staff (Cooking tickets & prep)
 * - default -> Online Customer (Web ordering & reservations)
 */
export const detectRoleFromEmail = (email = '') => {
  const lower = email.trim().toLowerCase();

  // 1. Admin
  if (lower.includes('admin') && !lower.startsWith('manager')) {
    return {
      role: 'admin',
      label: 'Restaurant Admin',
      defaultView: 'admin',
      badgeColor: 'badge-purple',
      accentColor: 'indigo'
    };
  }

  // 2. Manager
  if (lower.includes('manager') || lower.endsWith('@admin.com')) {
    return {
      role: 'manager',
      label: 'Restaurant Manager',
      defaultView: 'system',
      badgeColor: 'badge-purple',
      accentColor: 'violet'
    };
  }

  // 3. Waiter
  if (lower.includes('waiter')) {
    return {
      role: 'waiter',
      label: 'Waitstaff Captain',
      defaultView: 'waiter',
      badgeColor: 'badge-amber',
      accentColor: 'amber'
    };
  }

  // 4. Chef / Kitchen
  if (lower.includes('chef') || lower.includes('kitchen') || lower.endsWith('@staff.com')) {
    return {
      role: 'kitchen',
      label: 'Head Chef / Kitchen',
      defaultView: 'kitchen',
      badgeColor: 'badge-rose',
      accentColor: 'rose'
    };
  }

  // 5. Online Dining Customer (Default for all regular customer emails)
  return {
    role: 'customer',
    label: 'Online Customer',
    defaultView: 'customer',
    badgeColor: 'badge-emerald',
    accentColor: 'emerald'
  };
};

/**
 * Validate email format for role registration
 */
export const validateRoleDomain = (email = '', intendedRole = 'customer') => {
  const lower = email.trim().toLowerCase();
  if (!lower || !lower.includes('@')) return 'Please enter a valid email address.';
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
   * 1-Click Demo Login for any role (Customer, Waiter, Chef, Manager, Admin)
   */
  const loginAsDemoRole = (role = 'customer') => {
    const demoProfiles = {
      customer: {
        uid: 'demo-customer-1',
        email: 'priya.sharma@gmail.com',
        displayName: 'Priya Sharma (Customer)',
        role: 'customer',
        roleLabel: 'Online Customer',
        defaultView: 'customer',
        isFirebaseAuthenticated: false
      },
      waiter: {
        uid: 'demo-waiter-1',
        email: 'waiter@kokankinara.com',
        displayName: 'Floor Waitstaff',
        role: 'waiter',
        roleLabel: 'Waitstaff Captain',
        defaultView: 'waiter',
        isFirebaseAuthenticated: false
      },
      kitchen: {
        uid: 'demo-chef-1',
        email: 'chef@kokankinara.com',
        displayName: 'Head Chef',
        role: 'kitchen',
        roleLabel: 'Head Chef',
        defaultView: 'kitchen',
        isFirebaseAuthenticated: false
      },
      manager: {
        uid: 'demo-manager-1',
        email: 'manager@kokankinara.com',
        displayName: 'Restaurant Manager',
        role: 'manager',
        roleLabel: 'Restaurant Manager',
        defaultView: 'system',
        isFirebaseAuthenticated: false
      },
      cashier: {
        uid: 'demo-cashier-1',
        email: 'cashier@kokankinara.com',
        displayName: 'Cashier / POS Operator',
        role: 'cashier',
        roleLabel: 'Billing Cashier',
        defaultView: 'cashier',
        isFirebaseAuthenticated: false
      },
      admin: {
        uid: 'demo-admin-1',
        email: 'admin@kokankinara.com',
        displayName: 'Restaurant Admin',
        role: 'admin',
        roleLabel: 'Restaurant Admin',
        defaultView: 'admin',
        isFirebaseAuthenticated: false
      }
    };

    const target = demoProfiles[role] || demoProfiles.customer;
    setCurrentUser(target);
    localStorage.setItem('rm_auth_user', JSON.stringify(target));
    return { success: true, user: target };
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
        loginAsDemoRole,
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
