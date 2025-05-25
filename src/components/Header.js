import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import Section from './common/Section';

export default function Header() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [role, setRole] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) setRole(null);
      else {
        const snap = await getDoc(doc(db, 'users', user.uid));
        setRole(snap.data()?.role ?? null);
      }
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <Section
      as="header"
      styleProps={{
        width: '100%',
        boxSizing: 'border-box',
        marginTop: 0,
        padding: '8px 16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {/* Top row */}
      <Section
        styleProps={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginTop: 0,
          padding: 0,
        }}
      >
        <Link to="/home">
          <img
            src="/craftnest_icon_192x192.png"
            alt="Logo"
            style={{ height: 32, objectFit: 'contain' }}
          />
        </Link>

        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Link to="/home" style={styles.navButton}>Home</Link>
          {role === 'seller' && (
            <>
              <Link to="/sellerpage" style={styles.navButton}>My Products</Link>
              <Link to="/seller-orders" style={styles.navButton}>My Orders</Link>
            </>
          )}
          {role === 'buyer' && (
            <Link to="/buyer-orders" style={styles.navButton}>My Orders</Link>
          )}
          {role === 'admin' && (
            <Link to="/admin" style={styles.navButton}>Admin Dashboard</Link>
          )}
          <Link to="/about" style={styles.navButton}>About Us</Link>
          <Link to="/contact-admin" style={styles.navButton}>Contact</Link>
        </nav>

        <Section styleProps={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 0, padding: 0 }}>
          <Link to="/cart" style={styles.actionButton}>
            Cart 🛒 {cart.length > 0 && <span style={styles.cartCount}>({cart.length})</span>}
          </Link>
          <button onClick={handleLogout} style={styles.actionButton}>Logout 🚪</button>
        </Section>
      </Section>
    </Section>
  );
}

const styles = {
  navButton: {
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    textDecoration: 'none',
    color: '#000',
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
  },
  actionButton: {
    padding: '4px 8px',
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    border: 'none',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    textDecoration: 'none',    // remove underline
    color: '#000',              // match logout text color
  },
  cartCount: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: 10,
    fontSize: 12,
  },
};