import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

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

  const createOrder = (data, actions) => {
    // Format total to 2 decimal places
    const formattedTotal = total.toFixed(2);
    
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: formattedTotal,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: formattedTotal
              }
            }
          },
          description: "Purchase from SD2025",
          custom_id: `ORDER-${Date.now()}`,
          soft_descriptor: "SD2025 Store"
        },
      ],
      application_context: {
        brand_name: "SD2025",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: window.location.origin + "/payment-success",
        cancel_url: window.location.origin + "/checkout",
        shipping_preference: "NO_SHIPPING"
      }
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const order = await actions.order.capture();
      console.log("Payment successful!", order);
      clearCart();
      navigate('/home');
      alert("Payment successful! Thank you for your purchase.");
    } catch (err) {
      console.error("Payment capture failed:", err);
      setError(`Payment capture failed: ${err.message || 'Please try again.'}`);
    }
  };

  const onError = (err) => {
    console.error("Payment failed:", err);
    setError(`Payment failed: ${err.message || 'Please try again.'}`);
  };

  const onCancel = () => {
    console.log("Payment cancelled");
    setError("Payment was cancelled. Please try again if you wish to complete your purchase.");
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
        <div style={styles.paypalButton}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            onCancel={onCancel}
            style={{
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "pay",
              height: 55
            }}
            forceReRender={[total]}
          />
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
  paypalButton: {
    maxWidth: '500px',
    margin: '0 auto',
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