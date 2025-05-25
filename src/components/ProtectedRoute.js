import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VALID_ROLES = ['buyer', 'seller', 'admin'];

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, loading, error, isCheckingRole } = useAuth();
  const location = useLocation();

  if (loading || isCheckingRole) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (error || !userRole) {
    console.error('Protected route error:', error || 'No user role');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!VALID_ROLES.includes(userRole)) {
    console.error('Invalid role:', userRole);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.log('Access denied:', {
      currentRole: userRole,
      requiredRoles: allowedRoles
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
