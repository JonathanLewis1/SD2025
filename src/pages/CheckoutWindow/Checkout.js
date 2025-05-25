// src/pages/Checkout.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const Checkout = () => {
  const { clearCart } = useCart();
  const [cart, setCart] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [card, setCard] = useState('');
  const [cvv, setCvv] = useState('');
  const [exp, setExp] = useState('');
  const [address, setAddress] = useState({ street: '', suburb: '', city: '', postalCode: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get cart data from URL parameters
    const params = new URLSearchParams(window.location.search);
    const cartData = params.get('cart');
    console.log('URL search params:', window.location.search);
    console.log('Cart data from URL:', cartData);
    
    if (cartData) {
      try {
        const decodedCart = JSON.parse(decodeURIComponent(cartData));
        console.log('Decoded cart data:', decodedCart);
        setCart(decodedCart);
      } catch (err) {
        console.error('Error parsing cart data:', err);
        setError('Invalid cart data: ' + err.message);
      }
    } else {
      console.log('No cart data found in URL');
      setError('No cart data found');
    }
  }, []);

  useEffect(() => {
    if (submitted) {
      window.opener?.location?.assign('/home'); // Redirect main tab
      clearCart();
      window.close(); // Close the checkout window
    }
  }, [submitted, clearCart]);

  const validate = () => {
    if (!/^\d{16}$/.test(card)) return 'Card number must be 16 digits.';
    if (!/^\d{3}$/.test(cvv)) return 'CVV must be 3 digits.';
    const [mm, yy] = exp.split('/').map(Number);
    const today = new Date();
    const expDate = new Date(2000 + yy, mm - 1);
    if (isNaN(mm) || isNaN(yy) || expDate < today) return 'Card is expired or invalid date.';
    if (!address.street || !address.suburb || !address.city || !address.postalCode) return 'All address fields are required.';
    return null;
  };

  const handleSubmit = async () => {
    const errorMsg = validate();
    if (errorMsg) return setError(errorMsg);

    const buyer = auth.currentUser;
    if (!buyer) return setError("User not logged in.");

    const products = cart.map(item => item.name);
    const quantity = cart.map(item => item.quantity);
    const sellersEmails = cart.map(item => item.email);
    const Price = cart.map(item => item.price);
    const Total = Price.reduce((acc, val, i) => acc + val * quantity[i], 0);

    try {
      // Add order to Firestore
      await addDoc(collection(db, 'orders'), {
        buyerEmail: buyer.email,
        products,
        quantity,
        Price,
        sellersEmails,
        DeliveryType: 'Standard',
        DeliveryStatus: 'Delivered',
        timestamp: new Date(),
        Total,
        StreetName: address.street,
        suburb: address.suburb,
        city: address.city,
        postalCode: address.postalCode,
      });

      // Update stock quantities
      for (const item of cart) {
        const q = query(collection(db, 'products'), where('name', '==', item.name), where('email', '==', item.email));
        const snap = await getDocs(q);
        snap.forEach(async (docSnap) => {
          const ref = doc(db, 'products', docSnap.id);
          const current = docSnap.data().stock || 0;
          await updateDoc(ref, { stock: Math.max(current - item.quantity, 0) });
        });
      }

      setSubmitted(true);
    } catch (err) {
      setError("Order processing failed: " + err.message);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={styles.container}>
        <h2>Your cart is empty</h2>
        <button onClick={() => window.close()} style={styles.button}>Close Window</button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={styles.container}>
        <h2>Thanks for your purchase, you may now close this window.</h2>
        <button onClick={() => window.close()} style={styles.button}>Close Window</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Secure Checkout</h2>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.cartSummary}>
        <h3>Order Summary</h3>
        {cart.map((item, index) => (
          <div key={index} style={styles.cartItem}>
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={styles.total}>
          <strong>Total:</strong>
          <strong>${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</strong>
        </div>
      </div>
      <input placeholder="Card Number" value={card} onChange={e => setCard(e.target.value)} style={styles.input} />
      <input placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value)} style={styles.input} />
      <input placeholder="MM/YY" value={exp} onChange={e => setExp(e.target.value)} style={styles.input} />
      <input placeholder="Street" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} style={styles.input} />
      <input placeholder="Suburb" value={address.suburb} onChange={e => setAddress({ ...address, suburb: e.target.value })} style={styles.input} />
      <input placeholder="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} style={styles.input} />
      <input placeholder="Postal Code" value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} style={styles.input} />
      <button onClick={handleSubmit} style={styles.button}>Submit Payment</button>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#feffdf',
    padding: 32,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    maxWidth: 400,
    margin: '0 auto'
  },
  input: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '12px 16px',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    cursor: 'pointer'
  },
  error: {
    color: 'red'
  },
  cartSummary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee'
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTop: '2px solid #eee'
  }
};

export default Checkout;
