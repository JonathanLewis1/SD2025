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
      // Store cart data in localStorage with a specific key for checkout
      localStorage.setItem('checkoutCart', JSON.stringify(cart));
      console.log('Cart data stored for checkout:', cart);
      window.open('/checkout', '_blank', 'width=600,height=700');
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
              <p>R{item.price.toFixed(2)}</p>
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