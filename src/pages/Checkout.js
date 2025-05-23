import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../firebase';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [card, setCard] = useState("");
  const [cvc, setCvc] = useState("");
  const [exp, setExp] = useState("");
  const [address, setAddress] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Your cart is empty</h1>
        <button 
          onClick={() => navigate('/home')}
          style={styles.continueButton}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const validateAndSubmit = async () => {
    if (!/^[0-9]{16}$/.test(card)) return setError("Card number must be 16 digits.");
    if (!/^[0-9]{3}$/.test(cvc)) return setError("CVC must be 3 digits.");
    const today = new Date();
    const [mm, yy] = exp.split("/").map(x => parseInt(x));
    if (!mm || !yy || mm < 1 || mm > 12 || yy < today.getFullYear() % 100 || (yy === today.getFullYear() % 100 && mm < today.getMonth() + 1)) {
      return setError("Invalid or expired date.");
    }
    if (!address.trim()) return setError("Shipping address is required.");

    try {
      const submitMockOrder = httpsCallable(functions, 'submitMockOrder');
      const user = auth.currentUser;
      if (!user) return setError("You must be logged in.");

      await submitMockOrder({
        cartItems: cart,
        buyerEmail: user.email,
        shippingAddress: address
      });

      clearCart();
      navigate('/home');
      alert("Payment successful! Thank you for your purchase.");
    } catch (err) {
      console.error("Payment failed:", err);
      setError(`Payment failed: ${err.message || 'Please try again.'}`);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Checkout</h1>
      
      <div style={styles.summary}>
        <h2 style={styles.subtitle}>Order Summary</h2>
        {cart.map((item) => (
          <div key={item.id} style={styles.item}>
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={styles.total}>
          <strong>Total:</strong>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </div>

      <div style={styles.payment}>
        <h2 style={styles.subtitle}>Payment</h2>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.form}>
          <input 
            placeholder="Card Number" 
            value={card} 
            onChange={e => setCard(e.target.value)}
            style={styles.input}
          />
          <input 
            placeholder="CVC" 
            value={cvc} 
            onChange={e => setCvc(e.target.value)}
            style={styles.input}
          />
          <input 
            placeholder="Exp MM/YY" 
            value={exp} 
            onChange={e => setExp(e.target.value)}
            style={styles.input}
          />
          <input 
            placeholder="Shipping Address" 
            value={address} 
            onChange={e => setAddress(e.target.value)}
            style={styles.input}
          />
          <button 
            onClick={validateAndSubmit}
            style={styles.submitButton}
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  subtitle: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#444',
  },
  summary: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px solid #ddd',
    fontSize: '18px',
  },
  payment: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px',
  },
};

export default Checkout; 