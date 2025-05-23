import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // Get a fresh token
        const token = await user.getIdToken(true);
        
        // Call getUserRole function with the token
        const response = await fetch(
          "https://us-central1-sd2025law.cloudfunctions.net/getUserRole",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: user.email }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to get user role");
        }

        const userData = await response.json();
        console.log("Protected route - User data:", userData);
        setUserRole(userData.role);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError('Error fetching user role.');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>; // or a loading spinner

  if (error) {
    console.error('Protected route error:', error);
    return <Navigate to="/login" />;
  }

  // If no user or role mismatch, redirect to login
  if (!userRole || !allowedRoles.includes(userRole)) {
    console.log('Role mismatch or no role:', { userRole, allowedRoles });
    return <Navigate to="/login" />;
  }

  return children;
}
