import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    try {
      // Encode cart data to pass through URL
      const cartData = encodeURIComponent(JSON.stringify(cart));
      const checkoutUrl = `/checkout?cart=${cartData}`;
      console.log('Opening checkout window with URL:', checkoutUrl);
      console.log('Cart data being passed:', cart);
      window.open(checkoutUrl, '_blank', 'width=600,height=700');
    } catch (err) {
      console.error('Error opening checkout window:', err);
      alert('There was an error opening the checkout window. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate("/home")}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
              <div className="quantity-controls">
              <button
  onClick={() => {
    if (item.quantity < item.stock) {
      handleQuantityChange(item.id, item.quantity + 1);
    } else {
      alert("Cannot exceed available stock.");
    }
  }}
>+</button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  -
                </button>
              </div>
            </div>
            <button
              className="remove-button"
              onClick={() => removeFromCart(item.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total: ${getTotal().toFixed(2)}</h3>
        <button className="checkout-button" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart; 