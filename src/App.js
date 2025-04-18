import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import NotFoundPage from './pages/NotFoundPage.js';
import Login from './pages/Login/Login.js';
import SignUp from './pages/SignUp/SignUp.js';
import Home from './pages/Home/Home.js';
import SellerPage from './pages/SellerPage/SellerPage.js';
import Layout from './components/Layout.js';


const App = () => {
  return (
    <Router>
      <Layout>
      <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sellerpage" element={<h1>Seller Dashboard (Coming Soon)</h1>} />
        <Route path = "/home" element={<Home />} />
        <Route path = "/sellerpage" element = {<SellerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Layout>
    </Router>
  );
};

export default App;

