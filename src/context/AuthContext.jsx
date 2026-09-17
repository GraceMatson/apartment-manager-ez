import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithGoogle, auth, onAuthStateChanged, signOut } from '../firebase/config';
import { INITIAL_DATA } from '../data/seedData';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'sreeja_fantasy_auth_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved auth user:', e);
    }
    // Default to Sarah Vance (Manager) for instant first-load preview
    return INITIAL_DATA.authorizedUsers[0];
  });

  const [isAuthGatewayOpen, setIsAuthGatewayOpen] = useState(false);
  const [selectedRoleGate, setSelectedRoleGate] = useState('resident'); // 'manager' | 'resident'
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync auth state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  // Check if an email is authorized
  const verifyAllowlist = (email, authorizedUsersList = INITIAL_DATA.authorizedUsers) => {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    return authorizedUsersList.find(u => u.email.toLowerCase() === normalized) || null;
  };

  // Sign in using Google OAuth with Allowlist verification
  const handleGoogleSignIn = async (authorizedUsersList) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await loginWithGoogle();
      const email = user.email;
      const matched = verifyAllowlist(email, authorizedUsersList);

      if (!matched) {
        setAuthError(
          `Access Denied: The Google account (${email}) is not pre-approved in the Sreeja Fantasy Apartments directory. Please contact management.`
        );
        setIsLoading(false);
        return false;
      }

      // Check role gateway match if manager was selected
      if (selectedRoleGate === 'manager' && matched.role !== 'manager') {
        setAuthError(
          `Role Mismatch: ${matched.displayName} is registered as a ${matched.role.toUpperCase()}, not a Property Manager.`
        );
        setIsLoading(false);
        return false;
      }

      const enrichedUser = {
        ...matched,
        photoURL: user.photoURL || null,
        uid: user.uid
      };

      setCurrentUser(enrichedUser);
      setIsAuthGatewayOpen(false);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Google Sign In Error:', err);
      // If popup was closed by user
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled by user.');
      } else {
        setAuthError(`Sign-in failed: ${err.message || 'Unknown error'}`);
      }
      setIsLoading(false);
      return false;
    }
  };

  // Direct login for demo / allowlisted test accounts
  const loginAsUser = (userData) => {
    setCurrentUser(userData);
    setIsAuthGatewayOpen(false);
    setAuthError(null);
  };

  const logout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      console.warn('Signout note:', e);
    }
    setCurrentUser(null);
    setIsAuthGatewayOpen(true);
  };

  const openAuthGateway = (role = 'resident') => {
    setSelectedRoleGate(role);
    setAuthError(null);
    setIsAuthGatewayOpen(true);
  };

  const closeAuthGateway = () => {
    if (currentUser) {
      setIsAuthGatewayOpen(false);
      setAuthError(null);
    }
  };

  const isManager = currentUser?.role === 'manager';
  const isOwner = currentUser?.role === 'owner';
  const isTenant = currentUser?.role === 'tenant';

  const value = {
    currentUser,
    isManager,
    isOwner,
    isTenant,
    isAuthGatewayOpen,
    selectedRoleGate,
    authError,
    isLoading,
    setSelectedRoleGate,
    openAuthGateway,
    closeAuthGateway,
    handleGoogleSignIn,
    loginAsUser,
    logout,
    verifyAllowlist
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
