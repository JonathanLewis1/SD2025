import React, { useEffect, useState } from 'react';
import { auth, functions } from '../../firebase';
import ProductCard from './ProductCard';
import { httpsCallable } from 'firebase/functions';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const getAllProducts = httpsCallable(functions, 'getAllProducts');
      const result = await getAllProducts();
      console.log('Products fetched:', result.data);
      
      if (!result.data || !result.data.products) {
        throw new Error('Invalid response format');
      }
      
      setProducts(result.data.products);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().trim().includes(searchTerm.toLowerCase().trim());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesMin = minPrice === '' || product.price >= parseFloat(minPrice);
    const matchesMax = maxPrice === '' || product.price <= parseFloat(maxPrice);
    return matchesSearch && matchesCategory && matchesMin && matchesMax;
  });

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading products...</div>
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

  return (
    <div style={styles.container}>
      <div style={styles.searchContainer}>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filtersContainer}>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={styles.filterInput}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={styles.filterInput}
          />
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'All' ? 'Jewelry' : 'All')}
            style={styles.filterButton}
          >
            {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
          </button>
          <button
            onClick={handleReset}
            style={styles.resetButton}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div style={styles.productsContainer}>
        {filteredProducts.length === 0 ? (
          <div style={styles.noProducts}>No products found</div>
        ) : (
          filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
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
  searchContainer: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  searchBar: {
    marginBottom: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
  },
  filtersContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterInput: {
    flex: '1',
    minWidth: '120px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
  },
  filterButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  resetButton: {
    padding: '10px 20px',
    backgroundColor: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  productsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    padding: '20px 0',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    fontSize: '16px',
    padding: '20px',
  },
  loading: {
    textAlign: 'center',
    fontSize: '16px',
    padding: '20px',
    color: '#666',
  },
  noProducts: {
    textAlign: 'center',
    fontSize: '16px',
    padding: '20px',
    color: '#666',
    gridColumn: '1 / -1',
  },
};

export default Home;
