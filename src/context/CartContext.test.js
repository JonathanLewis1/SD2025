// import React, { createContext, useContext, useState, useEffect } from 'react';

// const CartContext = createContext();

// export function CartProvider({ children }) {
//   const [cart, setCart] = useState(() => {
//     try {
//       const saved = localStorage.getItem('cart');
//       return saved ? JSON.parse(saved) : [];
//     } catch {
//       return [];
//     }
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem('cart', JSON.stringify(cart));
//     } catch {}
//   }, [cart]);

//   const addToCart = ({ id, price }) => {
//     setCart(prev => {
//       const existing = prev.find(item => item.id === id);
//       if (existing) {
//         return prev.map(item =>
//           item.id === id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...prev, { id, price, quantity: 1 }];
//     });
//   };

//   const updateQuantity = (id, quantity) => {
//     setCart(prev =>
//       prev.map(item =>
//         item.id === id
//           ? { ...item, quantity: Number(quantity) }
//           : item
//       )
//     );
//   };

//   const removeFromCart = id => {
//     setCart(prev => prev.filter(item => item.id !== id));
//   };

//   const clearCart = () => {
//     setCart([]);
//   };

//   const getTotal = () => {
//     return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   };

//   return (
//     <CartContext.Provider
//       value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// }
test.todo('CartContext');
