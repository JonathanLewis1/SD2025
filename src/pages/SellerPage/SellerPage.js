import React, { useState, useEffect, useRef } from 'react';
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

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import Section from '../../components/common/Section';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';

import SellerReport from './SellerReport';
import OrderReport from './OrderReport';

export default function SellerPage() {
  const [products, setProducts] = useState([]);
  const [stockEdits, setStockEdits] = useState({});
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: ''
  });
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user?.email) {
        setUserEmail(user.email);
        fetchProducts(user.email);
      }
    });
    return () => unsub();
  }, []);

  const fetchProducts = async email => {
    const snap = await getDocs(
      query(collection(db, 'products'), where('email', '==', email))
    );
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleUpload = async e => {
    e.preventDefault();
    setError('');
    const { name, price, description, imageUrl, category } = form;
    if (!name || !price || !description || !imageUrl || !category) {
      return setError('All fields are required.');
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return setError('Price must be a number greater than zero.');
    }
    if (!userEmail) {
      return setError('Please log in first.');
    }
    try {
      await addDoc(collection(db, 'products'), {
        name,
        price: priceNum,
        description,
        image: imageUrl,
        category,
        email: userEmail,
        dateAdded: new Date().toISOString(),
        stock: 1
      });
      setForm({ name: '', price: '', description: '', imageUrl: '', category: '' });
      fetchProducts(userEmail);
      alert('Product added successfully!');
    } catch (err) {
      setError('Failed to add product: ' + err.message);
    }
  };

  const updateStock = async (id, newStockValue) => {
    const qtyNum = parseInt(newStockValue, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      alert('Quantity must be an integer greater than zero.');
      return;
    }
    try {
      await updateDoc(doc(db, 'products', id), { stock: qtyNum });
      fetchProducts(userEmail);
      alert('Stock updated successfully!');
    } catch (err) {
      setError('Failed to update stock: ' + err.message);
    }
  };

  const deleteProduct = async id => {
    try {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts(userEmail);
      alert('Product deleted successfully!');
    } catch (err) {
      setError('Failed to delete product: ' + err.message);
    }
  };

  const scrollToReports = () => {
    reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Container>
      <Button
        onClick={scrollToReports}
        styleProps={{
          backgroundColor: '#10b981',
          padding: '16px 20px',
          fontSize: 18,
          marginBottom: 24
        }}
      >
        Go to Dashboard Reports
      </Button>

      <Header level={1}>Add Product</Header>
      <Section>
        <form
          onSubmit={handleUpload}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <TextInput
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <TextInput
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            required
          />
          <TextInput
            as="textarea"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
          />
          <TextInput
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={e => setForm({ ...form, imageUrl: e.target.value })}
            required
          />
          <TextInput
            as="select"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            <option>Jewelry</option>
            <option>Clothing</option>
            <option>Home Decor</option>
            <option>Bath & Body</option>
            <option>Stationery & Paper Goods</option>
            <option>Art & Prints</option>
            <option>Ceramics</option>
            <option>Textiles</option>
            <option>Woodwork</option>
            <option>Leather Goods</option>
            <option>Other</option>
          </TextInput>
          <Button type="submit" styleProps={{ alignSelf: 'flex-start' }}>
            Add Product
          </Button>
        </form>
        {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
      </Section>

      <Header level={1} styleProps={{ marginTop: 48 }}>
        My Products
      </Header>
      <Section
        styleProps={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16
        }}
      >
        {products.map(prod => (
          <Card key={prod.id}>
            <img src={prod.image} alt={prod.name} width={150} />
            <h3>{prod.name}</h3>
            <p>R{prod.price}</p>
            <p>{prod.description}</p>
            <p>Category: {prod.category}</p>
            <p>
              Stock:{' '}
              <TextInput
                type="number"
                value={stockEdits[prod.id] ?? prod.stock}
                onChange={e =>
                  setStockEdits({ ...stockEdits, [prod.id]: e.target.value })
                }
                styleProps={{ width: 60, borderRadius: 4, padding: '4px' }}
              />
              <Button
                onClick={() =>
                  updateStock(prod.id, stockEdits[prod.id] ?? prod.stock)
                }
                styleProps={{ marginLeft: 8 }}
              >
                Save
              </Button>
            </p>
            <Button onClick={() => deleteProduct(prod.id)} styleProps={{ marginTop: 8 }}>
              Delete
            </Button>
          </Card>
        ))}
      </Section>

      <Section ref={reportRef} styleProps={{ marginTop: 48 }}>
        <Header level={1}>Dashboard Reports</Header>
      </Section>
      <Section styleProps={{ maxWidth: 1000, margin: '0 auto' }}>
        <SellerReport userEmail={userEmail} />
        <OrderReport userEmail={userEmail} />
      </Section>
    </Container>
  );
}
