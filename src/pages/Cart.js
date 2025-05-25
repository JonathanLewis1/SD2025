// import React from "react";
// import { useCart } from "../context/CartContext";
// import { useNavigate } from "react-router-dom";
// import "./Cart.css";

// const Cart = () => {
//   const { cart, removeFromCart, updateQuantity, getTotal } = useCart();
//   const navigate = useNavigate();

//   const handleQuantityChange = (itemId, newQuantity) => {
//     if (newQuantity < 1) return;
//     updateQuantity(itemId, newQuantity);
//   };

//   const handleCheckout = () => {
//     try {
//       // Store cart data in localStorage with a specific key for checkout
//       localStorage.setItem('checkoutCart', JSON.stringify(cart));
//       console.log('Cart data stored for checkout:', cart);
//       window.open('/checkout', '_blank', 'width=600,height=700');
//     } catch (err) {
//       console.error('Error opening checkout window:', err);
//       alert('There was an error opening the checkout window. Please try again.');
//     }
//   };

//   if (cart.length === 0) {
//     return (
//       <div className="cart-empty">
//         <h2>Your cart is empty</h2>
//         <button onClick={() => navigate("/home")}>Continue Shopping</button>
//       </div>
//     );
//   }

//   return (
//     <div className="cart-container">
//       <h2>Your Cart</h2>
//       <div className="cart-items">
//         {cart.map((item) => (
//           <div key={item.id} className="cart-item">
//             <img src={item.image} alt={item.name} className="cart-item-image" />
//             <div className="cart-item-details">
//               <h3>{item.name}</h3>
//               <p>R{item.price.toFixed(2)}</p>
//               <div className="quantity-controls">
//               <button
//   onClick={() => {
//     if (item.quantity < item.stock) {
//       handleQuantityChange(item.id, item.quantity + 1);
//     } else {
//       alert("Cannot exceed available stock.");
//     }
//   }}
// >+</button>
//                 <span>{item.quantity}</span>
//                 <button
//                   onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
//                 >
//                   -
//                 </button>
//               </div>
//             </div>
//             <button
//               className="remove-button"
//               onClick={() => removeFromCart(item.id)}
//             >
//               Remove
//             </button>
//           </div>
//         ))}
//       </div>
//       <div className="cart-summary">
//         <h3>Total: ${getTotal().toFixed(2)}</h3>
//         <button className="checkout-button" onClick={handleCheckout}>
//           Proceed to Checkout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Cart; 

import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

import Container from "../components/common/Container";
import Section from "../components/common/Section";
import Card from "../components/common/Card";
import Header from "../components/common/Header";
import Button from "../components/common/Button";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    try {
      localStorage.setItem("checkoutCart", JSON.stringify(cart));
      window.open("/checkout", "_blank", "width=600,height=700");
    } catch (err) {
      console.error("Error opening checkout window:", err);
      alert("There was an error opening the checkout window. Please try again.");
    }
  };

  if (cart.length === 0) {
    return (
      <Container>
        <Section styleProps={{ textAlign: "center" }}>
          <Header level={2}>Your cart is empty</Header>
          <Button onClick={() => navigate("/home")}>Continue Shopping</Button>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section styleProps={{ display: "flex", justifyContent: "center" }}>
        <Header level={1} styleProps={{ textAlign: "center" }}>
          Your Cart
        </Header>
      </Section>

      <Section styleProps={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {cart.map((item) => (
          <Card
            key={item.id}
            styleProps={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 16,
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
            />
            <div style={{ flex: 1 }}>
              <h3>{item.name}</h3>
              <p>R{item.price.toFixed(2)}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Button
                  onClick={() => {
                    if (item.quantity < item.stock) {
                      handleQuantityChange(item.id, item.quantity + 1);
                    } else {
                      alert("Cannot exceed available stock.");
                    }
                  }}
                  styleProps={{ padding: "6px 12px" }}
                >
                  +
                </Button>
                <span>{item.quantity}</span>
                <Button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  styleProps={{ padding: "6px 12px" }}
                >
                  -
                </Button>
              </div>
            </div>
            <Button
              onClick={() => removeFromCart(item.id)}
              styleProps={{
                backgroundColor: "#ef4444",
                padding: "8px 12px",
                color: "#fff",
              }}
            >
              Remove
            </Button>
          </Card>
        ))}
      </Section>

      <Section styleProps={{ maxWidth: 500, margin: "0 auto" }}>
        <Card styleProps={{ textAlign: "center", padding: 24 }}>
          <h3 style={{ fontSize: 20 }}>Total: R{getTotal().toFixed(2)}</h3>
          <Button
            onClick={handleCheckout}
            styleProps={{
              backgroundColor: "#10b981",
              padding: "16px 20px",
              marginTop: 16,
              fontSize: 16,
            }}
          >
            Proceed to Checkout
          </Button>
        </Card>
      </Section>
    </Container>
  );
}
