import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import SellerReport from './SellerReport';

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
      const q = query(collection(db, 'products'), where('email', '==', email));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    } catch (err) {
      console.error('Error fetching products:', err.message);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!userEmail) return setError('You must be logged in to add a product.');
    if (!form.name || !form.price || !form.description || !form.imageUrl || !form.category) {
      return setError('All fields are required.');
    }

    try {
      await addDoc(collection(db, 'products'), {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        image: form.imageUrl,
        category: form.category,
        email: userEmail,
        dateAdded: new Date().toISOString(),
        stock: 1
      });

      setForm({ name: '', price: '', description: '', imageUrl: '', category: '' });
      setError('');
      fetchProducts(userEmail);
    } catch (error) {
      console.error("Error adding product:", error.message);
      alert("Failed to add product: " + error.message);
    }
  };

  const updateStock = async (productId, newStock) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { stock: parseInt(newStock) });
      if (userEmail) fetchProducts(userEmail);
    } catch (error) {
      console.error('Error updating stock:', error.message);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      if (userEmail) fetchProducts(userEmail);
    } catch (error) {
      console.error("Error deleting product:", error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Add Product</h1>
      <form onSubmit={handleUpload} noValidate style={styles.form}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={styles.input} required />
        <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={styles.input} required />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={styles.input} required />
        <input type="text" placeholder="Image URL" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} style={styles.input} required />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={styles.input} required>
          <option value="">Select a Category</option>
          <option value="Jewelry">Jewelry</option>
          <option value="Clothing">Clothing</option>
          <option value="Home Decor">Home Decor</option>
          <option value="Woodwork">Woodwork</option>
        </select>
        <button type="submit" style={styles.button}>Add Product</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h1>My Products</h1>
      <div style={styles.productGrid}>
        {products.map(prod => (
          <div key={prod.id} style={styles.card}>
            <img src={prod.image} alt={prod.name} width={150} />
            <h3>{prod.name}</h3>
            <p>Price: R{prod.price}</p>
            <p>{prod.description}</p>
            <p>Category: {prod.category}</p>
            <p>
              Stock:{' '}
              <input
                type="number"
                min="0"
                value={stockEdits[prod.id] ?? prod.stock}
                onChange={(e) => setStockEdits({ ...stockEdits, [prod.id]: e.target.value })}
                style={{ width: 60 }}
              />
              <button onClick={() => updateStock(prod.id, stockEdits[prod.id] ?? prod.stock)} style={styles.button2}>Save</button>
            </p>
            <button onClick={() => deleteProduct(prod.id)} style={styles.button}>Delete</button>
          </div>
        ))}
      </div>

      {userEmail && <SellerReport userEmail={userEmail} />}
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ccc',
    borderRadius: 10,
    padding: 16,
    cursor: 'pointer',
    width: 200,
    backgroundColor: '#f9f9f9',
  },
  container: {
    backgroundColor: '#feffdf',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    padding: 32,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: '12px 16px',
    borderRadius: 24,
    border: '1px solid #2a2a2a',
    fontSize: 14,
    outline: 'none',
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
  button2: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '8px 10px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 500,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 8,
    marginLeft: 8,
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    width: '100%',
    maxWidth: 1000,
  },
};

export default SellerPage;
