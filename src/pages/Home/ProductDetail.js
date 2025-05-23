import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../../firebase';
import { useCart } from '../../context/CartContext';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
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
      const token = await user.getIdToken();

      const response = await fetch(
        "https://us-central1-sd2025law.cloudfunctions.net/getProduct",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      setProduct(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to fetch product details');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert("Product added to cart!");
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading product details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>R{product.price}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.stock}>
            {product.stock === 0 
              ? "This product is out of stock."
              : product.stock <= 5 
                ? "There are less than 5 of this product in stock."
                : ""}
          </Text>
          {product.stock > 0 && (
            <TouchableOpacity
              style={styles.button}
              onPress={handleAddToCart}
            >
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  info: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  price: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  stock: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  error: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default ProductDetail;
