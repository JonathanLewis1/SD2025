import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PAYPAL_CLIENT_ID, PAYPAL_CONFIG } from './config/paypal';

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
import ProtectedRoute from './components/ProtectedRoute'; // if you're using role-based routing
import PrivacyPolicy from './pages/About/PrivacyPolicy';
import ContactAdmin from './pages/About/ContactAdmin';

const initialOptions = {
  "client-id": PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
  components: "buttons"
};

const App = () => {
  return (
    <PayPalScriptProvider options={initialOptions}>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/about" element={<About />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />

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

              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/contact-admin" element={<ContactAdmin />} />

            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </PayPalScriptProvider>
  );
};

export default App;
