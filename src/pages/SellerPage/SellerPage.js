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
    const q = query(collection(db, 'products'), where('email', '==', email));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(items);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      setError('You must be logged in to add a product.');
      return;
    }
    if (!form.name) {
      setError('Name is required');
      return;
    }
    if (!form.price) {
      setError('Price is required');
      return;
    }
    if (!form.description) {
      setError('Description is required');
      return;
    }
    if (!form.imageUrl) {
      setError('Image URL is required');
      return;
    }
    if (!form.category) {
      setError('Category is required');
      return;
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
      await updateDoc(productRef, {
        stock: parseInt(newStock),
      });
      if (userEmail) fetchProducts(userEmail);
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };
  

  const deleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      if (userEmail) fetchProducts(userEmail);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Add Product</h1>
      <form onSubmit={handleUpload} noValidate style={styles.form}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={e => setForm({ ...form, imageUrl: e.target.value })}
          required
          style={styles.input}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
          style={styles.input}
        >
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
              onChange={(e) =>
                setStockEdits({ ...stockEdits, [prod.id]: e.target.value })
              }
              style={{ width: 60 }}
            />
            <button
              onClick={() => updateStock(prod.id, stockEdits[prod.id] ?? prod.stock)}
              style={styles.button2}
            >
              Save
            </button>
          </p>
          <button onClick={() => deleteProduct(prod.id)} style={styles.button}>
            Delete
          </button>
        </div>
        
        ))}
      </div>
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
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#3b82f6',
  },
  filterPanel: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: 24,
    width: '100%',
    maxWidth: 500,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 600,
    color: '#555',
    marginBottom: 4,
  },
  dropdown: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  searchInput: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  priceFilter: {
    display: 'flex',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  resetButton: {
    padding: '10px 16px',
    border: '1px solid #ccc',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 500,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    width: '100%',
    maxWidth: 1000,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    //color: '#111111',
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
};

export default SellerPage;
