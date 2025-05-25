import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { useCart } from '../context/CartContext';

export default function Header() {
  const navigate = useNavigate();
  const { cart } = useCart();
  
  // undefined = still loading, null = no user, 'buyer' or 'seller'
  const [role, setRole] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) {
        setRole(null);
      } else {
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

  // While we're loading the role, just render Home/About/Contact/Cart/Logout
  // Once loaded, show My Products / My Orders as appropriate
  return (
    <section style={styles.container}>
      <section style={styles.topRow}>
        <img src="/craftnest_icon_192x192.png" alt="Logo" style={styles.logoImage} />

        <nav style={styles.navButtons}>
          <Link to="/home" style={styles.navButton}>Home</Link>

          {/* only render once role !== undefined */}
          {role !== undefined && role === 'seller' && (
            <>
              <Link to="/sellerpage"    style={styles.navButton}>My Products</Link>
              <Link to="/seller-orders" style={styles.navButton}>My Orders</Link>
            </>
          )}

          {role !== undefined && role === 'buyer' && (
            <Link to="/buyer-orders" style={styles.navButton}>My Orders</Link>
          )}

          <Link to="/about"         style={styles.navButton}>About Us</Link>
          <Link to="/contact-admin" style={styles.navButton}>Contact</Link>
        </nav>

        <section style={styles.actions}>
          <Link to="/cart" style={styles.actionButton}>
            Cart 🛒 {cart.length > 0 && <span style={styles.cartCount}>({cart.length})</span>}
          </Link>
          <button onClick={handleLogout} style={styles.actionButton}>Logout 🚪</button>
        </section>
      </section>

      <section style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input type="text" placeholder="Search..." style={styles.searchInput} />
      </section>
    </section>
  );
}

const styles = {
  container:  { width: '100%', padding: 16, backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  topRow:     { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' },
  logoImage:  { height: 40, objectFit: 'contain' },
  navButtons: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  navButton:  { padding: '6px 12px', backgroundColor: '#dbeafe', borderRadius: 6, textDecoration: 'none', color: '#000', fontSize: 14, border: 'none', cursor: 'pointer' },
  actions:    { display: 'flex', gap: 10, alignItems: 'center' },
  actionButton:{ padding: '6px 12px', backgroundColor: '#e5e7eb', borderRadius: 6, border: 'none', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
  cartCount:  { backgroundColor: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: 10, fontSize: 12 },
  searchBar:  { display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, marginTop: 12, padding: '8px 12px' },
  searchIcon: { marginRight: 8 },
  searchInput:{ flex: 1, fontSize: 14, border: 'none', outline: 'none' }
};
