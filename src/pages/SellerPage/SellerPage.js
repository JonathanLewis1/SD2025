import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import SellerReport from './SellerReport';
import OrderReport from './OrderReport';
import { useRef } from 'react';

const SellerPage = () => {
  const [stockEdits, setStockEdits] = useState({});
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: ''
  });
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setUserEmail(user.email);
        fetchProducts(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async (email) => {
    try {
      const getSellerProducts = httpsCallable(functions, 'getSellerProducts');
      const response = await getSellerProducts({ email });
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err.message);
      setError('Failed to fetch products');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      setError('You must be logged in to add a product.');
      return;
    }
    if (!form.name || !form.price || !form.description || !form.imageUrl || !form.category) {
      setError('All fields are required.');
      return;
    }
    if (isNaN(form.price) || parseFloat(form.price) <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    try {
      const addProduct = httpsCallable(functions, 'addProduct');
      await addProduct({
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        image: form.imageUrl,
        category: form.category,
        email: userEmail,
        stock: 1
      });

      setForm({ name: '', price: '', description: '', imageUrl: '', category: '' });
      setError('');
      fetchProducts(userEmail);
    } catch (error) {
      console.error("Error adding product:", error.message);
      setError("Failed to add product: " + error.message);
    }
  };

  const updateStock = async (productId, newStock) => {
    if (isNaN(newStock) || parseInt(newStock) < 0) {
      setError('Stock must be a non-negative integer.');
      return;
    }
    try {
      const updateProductStock = httpsCallable(functions, 'updateProductStock');
      await updateProductStock({ productId, stock: parseInt(newStock) });
      if (userEmail) fetchProducts(userEmail);
    } catch (error) {
      console.error('Error updating stock:', error.message);
      setError('Failed to update stock');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const deleteProductFn = httpsCallable(functions, 'deleteProduct');
      await deleteProductFn({ productId });
      if (userEmail) fetchProducts(userEmail);
    } catch (error) {
      console.error("Error deleting product:", error.message);
      setError('Failed to delete product');
    }
  };

  const reportRef = useRef(null);
  const ordersRef = useRef(null);

  const scrollTo = (ref) => {
    if (ref.current) ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Add New Product</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={form.price}
            onChangeText={(text) => setForm({ ...form, price: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Image URL"
            value={form.imageUrl}
            onChangeText={(text) => setForm({ ...form, imageUrl: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={form.category}
            onChangeText={(text) => setForm({ ...form, category: text })}
          />
          <TouchableOpacity style={styles.button} onPress={handleUpload}>
            <Text style={styles.buttonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Your Products</Text>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>${product.price}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            <View style={styles.stockContainer}>
              <TextInput
                style={styles.stockInput}
                value={stockEdits[product.id]?.toString() || product.stock.toString()}
                onChangeText={(text) => setStockEdits({ ...stockEdits, [product.id]: text })}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.stockButton}
                onPress={() => updateStock(product.id, stockEdits[product.id])}
              >
                <Text style={styles.buttonText}>Update Stock</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteProduct(product.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section} ref={reportRef}>
        <SellerReport userEmail={userEmail} />
      </View>

      <View style={styles.section} ref={ordersRef}>
        <OrderReport userEmail={userEmail} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#dc3545',
    marginBottom: 12,
  },
  productCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    color: '#28a745',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stockInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
  },
  stockButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default SellerPage;
