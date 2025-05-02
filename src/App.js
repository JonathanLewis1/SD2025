

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin" element={<Admin />} />
          <Route path = '/about' element={<About />} />

          {/* Public product detail page */}
          <Route path="/product/:productId" element={<ProductDetail />} />

          {/* Role-protected routes (edit roles as needed) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sellerpage"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <SellerPage />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <h1>Seller Dashboard (Coming Soon)</h1>
              </ProtectedRoute>
            }
          /> */}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
