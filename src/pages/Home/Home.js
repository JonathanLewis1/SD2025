import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import ProductCard from './ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  //new
  const [searchTerm, setSearchTerm] = useState('');

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

  products.forEach((product) => {
    console.log("Product name:", product.name);
  });


  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().trim().includes(searchTerm.toLowerCase().trim())
  );
  
  

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Explore Products</h1>
      
      <input
        type="text"
        placeholder="Search for a product..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />

      <div style={styles.productGrid}>
      {filteredProducts.length > 0 ? (
        filteredProducts.map(product => (
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
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',  
        flexDirection: 'column',  
        padding: 32,
      },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#3b82f6',
  },
  //new
  searchInput: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #ccc',
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
    fontSize: 16,
  },
  productGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
  },
};

export default Home;