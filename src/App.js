import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import NotFoundPage from './pages/NotFoundPage.js';
import Login from './pages/Login/Login.js';
import SignUp from './pages/SignUp/SignUp.js';
import Home from './pages/Home/Home.js';
import SellerPage from './pages/SellerPage/SellerPage.js';
import Layout from './components/Layout.js';
import ProtectedRoute from './components/ProtectedRoute'; // update path as needed



const App = () => {
  return (
    <Router>
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Buyer & Seller Access (Admin too, if needed) */}
      <Route
        path="/buyer-dashboard"
        element={
          <ProtectedRoute allowedRoles={['buyer', 'seller, admin']}>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Seller only (Admin gets access by default in ProtectedRoute) */}
      <Route
        path="/sellerpage"
        element={
          <ProtectedRoute allowedRoles={['seller, admin']}>
            <SellerPage />
          </ProtectedRoute>
        }
      />

      {/* Seller Dashboard Placeholder */}
      <Route
        path="/seller-dashboard"
        element={
          <ProtectedRoute allowedRoles={['seller, admin']}>
            <h1>Seller Dashboard (Coming Soon)</h1>
          </ProtectedRoute>
        }
      />

      {/* Home - Make this a general route if needed */}
      <Route path="/home" element={<Home />} />

      {/* Not found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Layout>
</Router>

  );
};

export default App;

