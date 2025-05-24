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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        try {
          setUserEmail(user.email);
          await fetchProducts(user.email);
        } catch (err) {
          console.error('Error getting auth token:', err);
          setError('Authentication error. Please try logging in again.');
        }
      } else {
        setUserEmail(null);
        setProducts([]);
        setError('Please log in to access the seller page');
      }
      setIsAuthReady(true);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async (email) => {
    if (!email || !isAuthReady) return;
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      const getSellerProducts = httpsCallable(functions, 'getSellerProducts');
      const response = await getSellerProducts({ email });
      
      if (response.data && response.data.products) {
        setProducts(response.data.products);
        setError('');
      } else {
        setProducts([]);
        setError('No products found');
      }
    } catch (err) {
      console.error('Error fetching products:', err.message);
      setError('Failed to fetch products. Please try again.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    console.log('Auth State:', {
      userEmail,
      isAuthReady,
      currentUser: auth.currentUser,
      isAuthenticated: !!auth.currentUser,
      uid: auth.currentUser?.uid
    });

    if (!userEmail || !isAuthReady) {
      console.log('Auth not ready:', { userEmail, isAuthReady });
      setError('You must be logged in to add a product.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      console.log('No current user found');
      setError('You must be logged in to add a product.');
      return;
    }

    try {
      if (!form.name || !form.price || !form.description || !form.imageUrl || !form.category) {
        setError('All fields are required.');
        return;
      }
      if (isNaN(form.price) || parseFloat(form.price) <= 0) {
        setError('Price must be a positive number.');
        return;
      }

      // Force token refresh and verify it
      const idToken = await user.getIdToken(true);
      console.log('Token refreshed:', idToken ? 'Token received' : 'No token');

      // Create the function with explicit region
      const addProduct = httpsCallable(functions, 'addProduct');
      
      // Log the function configuration
      console.log('Function configuration:', {
        name: 'addProduct',
        region: functions.region,
        customDomain: functions.customDomain,
        auth: {
          currentUser: !!auth.currentUser,
          uid: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          token: idToken ? 'Token present' : 'No token'
        }
      });

      // Make the call
      const response = await addProduct({
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        image: form.imageUrl,
        category: form.category,
        email: userEmail,
        stock: 1
      });

      console.log('Product added successfully:', response);
      setForm({ name: '', price: '', description: '', imageUrl: '', category: '' });
      setError('');
      await fetchProducts(userEmail);
    } catch (error) {
      console.error("Error adding product:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        auth: {
          currentUser: !!auth.currentUser,
          uid: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          token: await auth.currentUser?.getIdToken().catch(() => 'Failed to get token')
        }
      });
      setError("Failed to add product: " + error.message);
    }
  };

  const updateStock = async (productId, newStock) => {
    if (!userEmail || !isAuthReady) {
      setError('You must be logged in to update stock.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to update stock.');
      return;
    }

    if (isNaN(newStock) || parseInt(newStock) < 0) {
      setError('Stock must be a non-negative integer.');
      return;
    }
    try {
      const updateProductStock = httpsCallable(functions, 'updateProductStock');
      await updateProductStock({ productId, stock: parseInt(newStock) });
      if (userEmail) await fetchProducts(userEmail);
    } catch (error) {
      console.error('Error updating stock:', error.message);
      setError('Failed to update stock');
    }
  };

  const deleteProduct = async (productId) => {
    if (!userEmail || !isAuthReady) {
      setError('You must be logged in to delete products.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to delete products.');
      return;
    }

    try {
      const deleteProductFn = httpsCallable(functions, 'deleteProduct');
      await deleteProductFn({ productId });
      if (userEmail) await fetchProducts(userEmail);
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!userEmail) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Add New Product</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
        {products.length > 0 ? (
          products.map((product) => (
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
          ))
        ) : (
          <Text style={styles.noProducts}>No products found</Text>
        )}
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
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  noProducts: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default SellerPage;
