import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { auth } from '../../firebase';
import ProductCard from './ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken();

      const response = await fetch(
        "https://us-central1-sd2025law.cloudfunctions.net/getAllProducts",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
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

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.filtersContainer}>
          <TextInput
            style={styles.filterInput}
            placeholder="Min Price"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.filterInput}
            placeholder="Max Price"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setSelectedCategory(selectedCategory === 'All' ? 'Jewelry' : 'All')}
          >
            <Text style={styles.filterButtonText}>
              {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.productsContainer}>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchBar: {
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterInput: {
    flex: 1,
    minWidth: 100,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    minWidth: 120,
  },
  filterButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  resetButton: {
    padding: 8,
    backgroundColor: '#f97316',
    borderRadius: 8,
    minWidth: 120,
  },
  resetButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  productsContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});

export default Home;
