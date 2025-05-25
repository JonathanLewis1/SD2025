import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, functions } from '../../firebase';
import { useCart } from '../../context/CartContext';
import { httpsCallable } from 'firebase/functions';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const getProduct = httpsCallable(functions, 'getProduct');
      const result = await getProduct({ productId });
      console.log('Product fetched:', result.data);
      
      if (!result.data) {
        throw new Error('Product not found');
      }
      
      setProduct(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert("Product added to cart!");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Product not found</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.imageContainer}>
          <img src={product.image} alt={product.name} style={styles.image} />
        </div>
        <div style={styles.info}>
          <h1 style={styles.title}>{product.name}</h1>
          <p style={styles.price}>R{product.price}</p>
          <p style={styles.description}>{product.description}</p>
          <p style={styles.stock}>
            {product.stock === 0 
              ? "This product is out of stock."
              : product.stock <= 5 
                ? "There are less than 5 of this product in stock."
                : ""}
          </p>
          {product.stock > 0 && (
            <button
              style={styles.button}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'row',
    gap: '32px',
    padding: '32px',
  },
  imageContainer: {
    flex: '1',
    maxWidth: '600px',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  info: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0',
  },
  price: {
    fontSize: '24px',
    color: '#3b82f6',
    fontWeight: '600',
    margin: '0',
  },
  description: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: '0',
  },
  stock: {
    fontSize: '14px',
    color: '#dc2626',
    margin: '0',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    alignSelf: 'flex-start',
  },
  loading: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#6b7280',
    padding: '40px',
  },
  error: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#dc2626',
    padding: '40px',
  },
};

export default ProductDetail;
