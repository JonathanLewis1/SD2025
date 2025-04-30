import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const SellerPage = () => {
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
        dateAdded: new Date().toISOString()
      });

      setForm({ name: '', price: '', description: '', imageUrl: '', category: '' });
      setError('');
      fetchProducts(userEmail);
    } catch (error) {
      console.error("Error adding product:", error.message);
      alert("Failed to add product: " + error.message);
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
    <div>
      <h1>Your Products</h1>
      <form onSubmit={handleUpload} noValidate>
        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={e => setForm({ ...form, imageUrl: e.target.value })}
          required
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        >
          <option value="">Select a Category</option>
          <option value="Jewelry">Jewelry</option>
          <option value="Clothing">Clothing</option>
          <option value="Home Decor">Home Decor</option>
          <option value="Woodwork">Woodwork</option>
        </select>
        <button type="submit">Add Product</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        {products.map(prod => (
          <div key={prod.id} style={{ marginTop: 20 }}>
            <img src={prod.image} alt={prod.name} width={150} />
            <h3>{prod.name}</h3>
            <p>Price: R{prod.price}</p>
            <p>{prod.description}</p>
            <p>Category: {prod.category}</p>
            <button onClick={() => deleteProduct(prod.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerPage;
