import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

import NotFoundPage from './pages/NotFoundPage.js';
import Login from './pages/Login/Login.js';
import SignUp from './pages/SignUp/SignUp.js';
import Home from './pages/Home/Home.js';
import SellerPage from './pages/SellerPage/SellerPage.js';
import Admin from './pages/Admin/Admin.js';
import Layout from './components/Layout.js';
import About from './pages/About/About.js';
import ProductDetail from './pages/Home/ProductDetail.js';
import Cart from './pages/Cart.js';
import Checkout from './pages/Checkout.js';
import MockCheckout from './pages/MockCheckout.js';
import ProtectedRoute from './components/ProtectedRoute';
import PrivacyPolicy from './pages/About/PrivacyPolicy';
import ContactAdmin from './pages/About/ContactAdmin';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/contact-admin" element={<ContactAdmin />} />

              {/* Protected routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mock-checkout"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                    <MockCheckout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product/:productId"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                    <ProductDetail />
                  </ProtectedRoute>
                }
              />
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

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
