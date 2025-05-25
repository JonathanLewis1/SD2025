import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, functions } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

const AuthContext = createContext();

const VALID_ROLES = ['buyer', 'seller', 'admin'];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  const checkUserRole = async (user) => {
    if (!user || isCheckingRole) return null;
    
    setIsCheckingRole(true);
    try {
      console.log('Checking role for user:', user.email);
      
      // Wait for a short time to ensure Firebase Auth is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const getUserRole = httpsCallable(functions, 'getUserRole');
      console.log('Calling getUserRole function with:', { email: user.email });
      
      const result = await getUserRole({ email: user.email });
      console.log('Role check result:', result.data);
      
      if (!result.data) {
        console.error('No data received from getUserRole');
        setError('Failed to verify user role: No data received');
        return null;
      }

      if (!result.data.role) {
        console.error('Invalid role data received:', result.data);
        setError('Failed to verify user role: No role in response');
        return null;
      }

      const role = result.data.role;
      if (!VALID_ROLES.includes(role)) {
        console.error('Invalid role received:', role);
        setError(`Invalid user role: ${role}`);
        return null;
      }

      console.log('Successfully verified user role:', role);
      setError(null);
      return role;
    } catch (err) {
      console.error('Error fetching user role:', {
        message: err.message,
        code: err.code,
        details: err.details,
        email: user.email
      });
      
      let errorMessage = 'Error fetching user role';
      if (err.code === 'not-found') {
        errorMessage = 'User profile not found';
      } else if (err.code === 'invalid-argument') {
        errorMessage = err.message || 'Invalid user data';
      } else if (err.code === 'unauthenticated') {
        errorMessage = 'Please sign in again';
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsCheckingRole(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let roleCheckTimeout;

    const handleAuthChange = async (authUser) => {
      console.log('Auth state changed:', authUser?.email);
      
      if (!mounted) return;

      if (!authUser) {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        setError(null);
        return;
      }

      setUser(authUser);
      
      // Add a delay before checking role to ensure Firebase Auth is ready
      clearTimeout(roleCheckTimeout);
      roleCheckTimeout = setTimeout(async () => {
        if (!mounted) return;
        const role = await checkUserRole(authUser);
        if (mounted) {
          setUserRole(role);
          setLoading(false);
        }
      }, 1000);
    };

    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);

    return () => {
      mounted = false;
      clearTimeout(roleCheckTimeout);
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    userRole,
    loading,
    error,
    isCheckingRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 