

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db, auth } from '../../firebase';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import Section from '../../components/common/Section';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';

export default function Checkout() {
  const { clearCart } = useCart();
  const [cart, setCart] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [card, setCard] = useState('');
  const [cvv, setCvv] = useState('');
  const [exp, setExp] = useState('');
  const [DeliveryType, setDeliveryType] = useState('standard');
  const [address, setAddress] = useState({
    street: '',
    suburb: '',
    city: '',
    postalCode: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const cartData = localStorage.getItem('checkoutCart');
      if (cartData) {
        setCart(JSON.parse(cartData));
      } else {
        setError('No cart data found');
      }
    } catch (err) {
      console.error('Error reading cart data:', err);
      setError('Error reading cart data: ' + err.message);
    }
  }, []);

  useEffect(() => {
    if (submitted) {
      if (window.opener) {
        window.opener.localStorage.removeItem('cart');
        window.opener.location.assign('/home');
      }
      window.close();
    }
  }, [submitted]);

  const validate = () => {
    if (!/^\d{16}$/.test(card)) return 'Card number must be 16 digits.';
    if (!/^\d{3}$/.test(cvv)) return 'CVV must be 3 digits.';
    const [mm, yy] = exp.split('/').map(Number);
    const today = new Date();
    const expDate = new Date(2000 + yy, mm - 1);
    if (isNaN(mm) || isNaN(yy) || expDate < today) return 'Card is expired or invalid.';
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
    const image = cart.map(item => item.image);
    const Total = Price.reduce((acc, val, i) => acc + val * quantity[i], 0);

    try {
      await addDoc(collection(db, 'orders'), {
        buyerEmail: buyer.email,
        products,
        quantity,
        Price,
        image,
        sellersEmails,
        DeliveryType,
        DeliveryStatus: 'In Progress',
        timestamp: new Date(),
        Total,
        StreetName: address.street,
        suburb: address.suburb,
        city: address.city,
        postalCode: address.postalCode,
      });

      for (const item of cart) {
        const q = query(
          collection(db, 'products'),
          where('name', '==', item.name),
          where('email', '==', item.email)
        );
        const snap = await getDocs(q);
        snap.forEach(async (docSnap) => {
          const ref = doc(db, 'products', docSnap.id);
          const current = docSnap.data().stock || 0;
          await updateDoc(ref, { stock: Math.max(current - item.quantity, 0) });
        });
      }

      localStorage.removeItem('checkoutCart');
      setSubmitted(true);
    } catch (err) {
      setError("Order processing failed: " + err.message);
    }
  };

  if (cart.length === 0) {
    return (
      <Container>
        <Section styleProps={{ textAlign: 'center' }}>
          <Header level={2}>Your cart is empty</Header>
          <Button onClick={() => window.close()}>Close Window</Button>
        </Section>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container>
        <Section styleProps={{ textAlign: 'center' }}>
          <Header level={2}>Thanks for your purchase</Header>
          <p>You may now close this window.</p>
          <Button onClick={() => window.close()}>Close Window</Button>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section styleProps={{ display: 'flex', justifyContent: 'center' }}>
        <Header level={1} styleProps={{ textAlign: 'center' }}>
          Secure Checkout
        </Header>
      </Section>

      {error && (
        <Section>
          <Card styleProps={{ backgroundColor: '#fee2e2', color: '#dc2626', textAlign: 'center' }}>
            {error}
          </Card>
        </Section>
      )}

      <Section>
        <Card styleProps={{ maxWidth: 500, margin: '0 auto' }}>
          <Header level={2}>Order Summary</Header>
          {cart.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{item.name} x {item.quantity}</span>
              <span>R{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>R{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
          </div>
        </Card>
      </Section>

      <Section>
        <Card styleProps={{ maxWidth: 500, margin: '0 auto' }}>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <TextInput
              placeholder="Card Number"
              value={card}
              onChange={e => setCard(e.target.value)}
            />
            <TextInput
              placeholder="CVV"
              value={cvv}
              onChange={e => setCvv(e.target.value)}
            />
            <TextInput
              placeholder="MM/YY"
              value={exp}
              onChange={e => setExp(e.target.value)}
            />
            <TextInput
              placeholder="Street"
              value={address.street}
              onChange={e => setAddress({ ...address, street: e.target.value })}
            />
            <TextInput
              placeholder="Suburb"
              value={address.suburb}
              onChange={e => setAddress({ ...address, suburb: e.target.value })}
            />
            <TextInput
              placeholder="City"
              value={address.city}
              onChange={e => setAddress({ ...address, city: e.target.value })}
            />
            <TextInput
              placeholder="Postal Code"
              value={address.postalCode}
              onChange={e => setAddress({ ...address, postalCode: e.target.value })}
            />
                <TextInput
                          as="select"
                          value={DeliveryType}
                          onChange={e => setDeliveryType(e.target.value)}
                        >
                          <option value="priority">Priority Delivery</option>
                          <option value="standard">Standard Delivery</option>
                        </TextInput>
            
            <Button type="submit">Submit Payment</Button>
          </form>
        </Card>
      </Section>
    </Container>
  );
}
