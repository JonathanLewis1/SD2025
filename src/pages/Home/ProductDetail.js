import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../../context/CartContext';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const { cart, addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct({ id: docSnap.id, ...data });

        setTimeout(() => {
          const stockEl = document.getElementById("stock");
          const btn = document.getElementById("cart");
          if (!stockEl) return;

          if (data.stock === 0) {
            stockEl.innerText = "This product is out of stock.";
            btn.hidden = true;
          } else if (data.stock <= 5) {
            stockEl.innerText = "There are less than 5 of this product in stock.";
          } else {
            stockEl.innerText = "";
          }
        }, 0);
      }
    };
    
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
  const existingItem = cart.find(item => item.id === product.id);
  const currentQuantity = existingItem ? existingItem.quantity : 0;

  if (currentQuantity >= product.stock) {
    alert("You cannot add more of this item. Stock limit reached.");
    return;
  }

  addToCart({ ...product, stock: product.stock });
  alert("Product added to cart!");
};

  if (!product) return <p style={styles.loading}>Loading product details...</p>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <img src={product.image} alt={product.name} style={styles.image} />
        <div style={styles.info}>
          <h1 style={styles.title}>{product.name}</h1>
          <p style={styles.price}>R{product.price}</p>
          <p style={styles.description}>{product.description}</p>
          <p id="stock" style={styles.stock}></p>
          <button id="cart" onClick={handleAddToCart} style={styles.button}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#feffdf',
    minHeight: '100vh',
    padding: '40px 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
    maxWidth: 900,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 24,
    padding: 24,
  },
  image: {
    width: '50%',
    objectFit: 'cover',
    borderRadius: '12px',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 16px',
    width: '50%',
  },
  title: {
    fontSize: 32,
    color: '#333',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 600,
    color: '#3b82f6',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#555',
  },
  loading: {
    textAlign: 'center',
    paddingTop: 100,
    fontSize: 18,
    color: '#555',
  },
  stock: {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#ff0000',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '12px 16px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 500,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 8,
  },
};

export default ProductDetail;
