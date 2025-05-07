import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase Auth
import { auth } from './firebase'; // Assuming you have firebase.js exporting auth

import NotFoundPage from './pages/NotFoundPage.js';
import Login from './pages/Login/Login.js';
import SignUp from './pages/SignUp/SignUp.js';
import Home from './pages/Home/Home.js';
import SellerPage from './pages/SellerPage/SellerPage.js';
import Admin from './pages/Admin/Admin.js';
import Layout from './components/Layout.js';
import About from './pages/About/About.js';
import ProductDetail from './pages/Home/ProductDetail.js';
import ProtectedRoute from './components/ProtectedRoute'; // if you're using role-based routing
import PrivacyPolicy from './pages/About/PrivacyPolicy';
import ContactAdmin from './pages/About/ContactAdmin';

const App = () => {
  const [user, setUser] = useState(null); // State to store the logged-in user
  const [loading, setLoading] = useState(true); // State to check loading during auth status check

  useEffect(() => {
    // Listen for user authentication status changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false once the user is fetched
    });

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while the user status is being checked
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to={user ? '/home' : '/login'} />} /> {/* Redirect based on auth status */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/home" />} />
          
          {/* Public pages */}
          <Route path="/about" element={<About />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact-admin" element={<ContactAdmin />} />
          
          {/* Role-based routes */}
          <Route
            path="/home"
            element={
              user ? (
                <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                  <Home />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/sellerpage"
            element={
              user ? (
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <SellerPage />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user ? (
                <ProtectedRoute allowedRoles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
