// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { useCart } from '../context/CartContext';

export default function Header() {
  const navigate = useNavigate();
  const { cart } = useCart();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const viewProducts = async () => {
    const user = auth.currentUser;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.data().role;

    if (role === 'seller') {
      navigate('/sellerpage');
    } else {
      alert("Only registered sellers may add products");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        <img src="/craftnest_icon_192x192.png" alt="Logo" style={styles.logoImage} />

        <div style={styles.navButtons}>
          <Link to="/home" style={styles.navButton}>Home</Link>
          <button onClick={viewProducts} style={styles.navButton}>My Products</button>
          <Link to="/about" style={styles.navButton}>About Us</Link>
          <Link to="/contact-admin" style={styles.navButton}>Contact</Link>
        </div>

        <div style={styles.actions}>
          <Link to="/cart" style={styles.actionButton}>
            Cart 🛒 {cart.length > 0 && <span style={styles.cartCount}>({cart.length})</span>}
          </Link>
          <button onClick={handleLogout} style={styles.actionButton}>Logout 🚪</button>
        </div>
      </div>

      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input type="text" placeholder="Search..." style={styles.searchInput} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  topRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoImage: {
    height: 40,
    objectFit: 'contain',
  },
  navButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  navButton: {
    padding: '6px 12px',
    backgroundColor: '#dbeafe',
    borderRadius: '6px',
    textDecoration: 'none',
    color: '#000',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  actionButton: {
    padding: '6px 12px',
    backgroundColor: '#e5e7eb',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'none',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  cartCount: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '10px',
    fontSize: '12px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    marginTop: '12px',
    padding: '8px 12px',
  },
  searchIcon: {
    marginRight: '8px',
  },
  searchInput: {
    flex: 1,
    fontSize: '14px',
    border: 'none',
    outline: 'none',
  },
};


