import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import ProductCard from './ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Explore Products</h1>
      <div style={styles.productGrid}>
        {products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#feffdf',
    color: '#333',
    padding: 32,
    minHeight: '100vh',
  },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#3b82f6',
  },
  productGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
  },
};

export default Home;
