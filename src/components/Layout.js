import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer'; 

export default function Layout({ children }) {
  const location = useLocation();

  // Add any routes where you want a minimal layout
  const hideLayoutPaths = ['/login', '/signup', '/checkout'];

  const hideLayout = hideLayoutPaths.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Header />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
