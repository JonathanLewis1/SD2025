import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../../firebase';

const CheckoutWindow = () => {
  const { cart, clearCart } = useCart();
  const [card, setCard] = useState("");
  const [cvc, setCvc] = useState("");
  const [exp, setExp] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validateAndSubmit = async () => {
    if (!/^[0-9]{16}$/.test(card)) return setError("Card number must be 16 digits.");
    if (!/^[0-9]{3}$/.test(cvc)) return setError("CVC must be 3 digits.");
    const today = new Date();
    const [mm, yy] = exp.split("/").map(x => parseInt(x));
    if (!mm || !yy || mm < 1 || mm > 12 || yy < today.getFullYear() % 100 || (yy === today.getFullYear() % 100 && mm < today.getMonth() + 1)) {
      return setError("Invalid or expired date.");
    }
    if (!address.trim()) return setError("Shipping address is required.");

    const submitMockOrder = httpsCallable(functions, 'submitMockOrder');
    const user = auth.currentUser;
    if (!user) return setError("You must be logged in.");

    await submitMockOrder({
      cartItems: cart,
      buyerEmail: user.email,
      shippingAddress: address
    });

    clearCart();
    setSubmitted(true);
  };

  if (submitted) return <h2>Order submitted! You may now close this window.</h2>;

  return (
    <div style={{ padding: 32 }}>
      <h2>Mock Payment</h2>
      <input placeholder="Card Number" value={card} onChange={e => setCard(e.target.value)} />
      <input placeholder="CVC" value={cvc} onChange={e => setCvc(e.target.value)} />
      <input placeholder="Exp MM/YY" value={exp} onChange={e => setExp(e.target.value)} />
      <input placeholder="Shipping Address" value={address} onChange={e => setAddress(e.target.value)} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={validateAndSubmit}>Submit Order</button>
    </div>
  );
};

export default CheckoutWindow;