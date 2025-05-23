import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { functions, auth, db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import './MockCheckout.css';

const MockCheckout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart && parsedCart.length > 0) {
          // Cart data is already loaded by CartContext, this is just a backup
          console.log('Cart loaded from localStorage:', parsedCart);
        }
      } catch (err) {
        console.error('Error loading cart from localStorage:', err);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Force token refresh when component mounts
          const token = await user.getIdToken(true);
          console.log('Auth state changed - User authenticated:', {
            uid: user.uid,
            email: user.email,
            tokenPreview: token.substring(0, 20) + '...'
          });
          setUser(user);
        } catch (error) {
          console.error('Error refreshing token:', error);
          setError('Authentication error. Please try logging in again.');
        }
      } else {
        console.log('Auth state changed - No user');
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const validateCard = (cardNumber) => {
    // Check if card number is all zeros (mock successful payment)
    if (cardNumber === '0000000000000000') return true;
    
    // Basic Luhn algorithm validation for other card numbers
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const validateExpiryDate = (expiryDate) => {
    // Check if the date is in the correct format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      return false;
    }

    const [month, year] = expiryDate.split('/').map(num => parseInt(num));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    // Validate month is between 1 and 12
    if (month < 1 || month > 12) {
      return false;
    }

    // Validate year is not in the past
    if (year < currentYear) {
      return false;
    }

    // If year is current year, validate month is not in the past
    if (year === currentYear && month < currentMonth) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to complete this purchase');
      }

      // Check if cart is empty
      if (!cart || cart.length === 0) {
        throw new Error('Your cart is empty. Please add items before checkout.');
      }

      // Create the callable function
      const submitOrder = httpsCallable(functions, 'submitMockOrder');
      
      // Force token refresh before proceeding
      const token = await user.getIdToken(true);
      console.log('Pre-submit auth check:', {
        user: user.uid,
        email: user.email,
        tokenPreview: token.substring(0, 20) + '...',
        tokenLength: token.length
      });

      if (!token) {
        throw new Error('Authentication failed. Please try logging in again.');
      }

      console.log('User authenticated:', user.uid);
      console.log('Token obtained:', token.substring(0, 10) + '...');
      console.log('Cart contents:', cart);

      // Validate card number
      if (!validateCard(cardNumber)) {
        throw new Error('Invalid card number. Please enter a valid 16-digit card number.');
      }

      // Validate expiry date
      if (!validateExpiryDate(expiryDate)) {
        throw new Error('Invalid expiry date. Please enter a valid future date in MM/YY format.');
      }

      // Validate CVV
      if (!/^\d{3,4}$/.test(cvv)) {
        throw new Error('Invalid CVV. Please enter a 3 or 4 digit security code.');
      }

      // Prepare the order data
      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        email: user.email,
        userId: user.uid,
        timestamp: new Date().toISOString()
      };

      console.log('Submitting order with data:', {
        ...orderData,
        items: orderData.items.length,
        total: orderData.total
      });

      // Submit the order
      const result = await submitOrder(orderData);

      console.log('Order submission result:', result.data);

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      // Clear cart and show success message
      clearCart();
      alert('Payment successful! Thank you for your purchase.');
      navigate('/');
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="mock-checkout">
        <h2>Loading...</h2>
        <p>Please wait while we verify your authentication.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mock-checkout">
        <h2>Authentication Required</h2>
        <p>Please log in to complete your purchase.</p>
        <button onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mock-checkout">
      <h2>Mock Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
            placeholder="Enter card number"
            required
          />
          <small>Use 0000000000000000 for successful mock payment</small>
        </div>

        <div className="form-group">
          <label>Expiry Date</label>
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 2) {
                setExpiryDate(value);
              } else {
                setExpiryDate(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
              }
            }}
            placeholder="MM/YY"
            required
          />
          <small>Enter a future date in MM/YY format (e.g., 12/25)</small>
        </div>

        <div className="form-group">
          <label>CVV</label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="CVV"
            required
          />
          <small>Enter the 3 or 4 digit security code</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={processing}>
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

export default MockCheckout; 