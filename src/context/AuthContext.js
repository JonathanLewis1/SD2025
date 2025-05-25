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
      const getUserRole = httpsCallable(functions, 'getUserRole');
      const result = await getUserRole({ email: user.email });
      console.log('Role check result:', result.data);
      
      if (!result.data || !result.data.role) {
        console.error('Invalid role data received:', result.data);
        setError('Failed to verify user role');
        return null;
      }

      const role = result.data.role;
      if (!VALID_ROLES.includes(role)) {
        console.error('Invalid role received:', role);
        setError('Invalid user role');
        return null;
      }

      setError(null);
      return role;
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError(err.message || 'Error fetching user role');
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
      
      // Add a small delay before checking role to prevent rapid rechecks
      clearTimeout(roleCheckTimeout);
      roleCheckTimeout = setTimeout(async () => {
        if (!mounted) return;
        const role = await checkUserRole(authUser);
        if (mounted) {
          setUserRole(role);
          setLoading(false);
        }
      }, 500);
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