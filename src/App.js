import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login/Login.js';
import SignUp from './pages/SignUp/SignUp.js';
import Home from './pages/Home/Home.js';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path = "/home" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;

