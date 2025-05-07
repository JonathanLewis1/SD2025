import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.emailVerified) {
        setUserRole(null); // Set role to null if not authenticated or email not verified
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserRole(docSnap.data().role); // Set the user's role from Firestore
        } else {
          setError('User role not found.');
        }
      } catch (err) {
        setError('Error fetching user role.');
      }

      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the subscription on component unmount
  }, []);

  // Show a loading spinner or message while fetching user data
  if (loading) return <div>Loading...</div>;

  // Handle errors by redirecting to an error page or showing a message
  if (error) {
    return <Navigate to="/error" />;
  }

  // If no user is found or the role doesn't match, redirect to login page
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }

  // If everything is okay, render the children (protected content)
  return children;
}
