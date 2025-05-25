// import React, { useEffect, useState } from 'react';
// import { Navigate } from 'react-router-dom';
// import { auth } from '../firebase';
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../firebase';

// export default function ProtectedRoute({ children, allowedRoles }) {
//   const [userRole, setUserRole] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user || !user.emailVerified) {
//         setUserRole(null);
//         setLoading(false);
//         return;
//       }

//       try {
//         const docRef = doc(db, 'users', user.uid);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           setUserRole(docSnap.data().role);
//         } else {
//           setError('User role not found.');
//         }
//       } catch (err) {
//         setError('Error fetching user role.');
//       }

//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (loading) return <div>Loading...</div>; // or a loading spinner

//   if (error) {
//     return <Navigate to="/error" />; // You can create an error page or handle it differently
//   }

//   // If no user or role mismatch, redirect to login or unauthorized page
//   if (!userRole || !allowedRoles.includes(userRole)) {
//     return <Navigate to="/login" />;
//   }

//   return children;
// }
// src/components/common/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Section from './common/Section';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.emailVerified) {
        setUserRole(null);
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserRole(docSnap.data().role);
        else setError('User role not found.');
      } catch {
        setError('Error fetching user role.');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <Section styleProps={{ width: '100%', padding: 24 }}>Loading...</Section>;
  if (error)   return <Navigate to="/error" replace />;
  if (!userRole || !allowedRoles.includes(userRole)) return <Navigate to="/login" replace />;

  return children;
}
