import React, { useState, useEffect, useRef } from 'react';
import { auth, functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
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
  const [reportKey, setReportKey] = useState(0);
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
  const [loading, setLoading] = useState(true);
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
    try {
      setLoading(true);
      const getSellerProducts = httpsCallable(functions, "getSellerProducts");
      const result = await getSellerProducts({ email });
      setProducts(result.data.products);
      setError("");
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
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
      const addProduct = httpsCallable(functions, 'addProduct');
      await addProduct({
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
      const updateProductStock = httpsCallable(functions, 'updateProductStock');
      await updateProductStock({ productId: id, stock: qtyNum });
      fetchProducts(userEmail);
      setReportKey(k => k + 1);
      alert('Stock updated successfully!');
    } catch (err) {
      setError('Failed to update stock: ' + err.message);
    }
  };

  const deleteProduct = async id => {
    try {
      const deleteProduct = httpsCallable(functions, 'deleteProduct');
      await deleteProduct({ productId: id });
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
      {loading ? (
        <Section styleProps={{ textAlign: 'center', padding: 32, color: '#666' }}>
          Loading products...
        </Section>
      ) : (
        <Section
          styleProps={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}
        >
          {products.length > 0 ? (
            products.map(p => (
              <Card
                key={p.id}
                styleProps={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 3',
                    objectFit: 'cover',
                    borderRadius: 8
                  }}
                />
                <Section as="h3" styleProps={{ margin: 0, fontSize: 18 }}>
                  {p.name}
                </Section>
                <Section as="p" styleProps={{ margin: 0, fontWeight: 600 }}>
                  R{p.price}
                </Section>
                <Section as="p" styleProps={{ margin: 0, color: '#666' }}>
                  Stock: {p.stock}
                </Section>
                <TextInput
                  type="number"
                  placeholder="New stock"
                  value={stockEdits[p.id] || ''}
                  onChange={e => setStockEdits({ ...stockEdits, [p.id]: e.target.value })}
                  styleProps={{ width: '100%' }}
                />
                <Button
                  onClick={() => updateStock(p.id, stockEdits[p.id])}
                  styleProps={{ width: '100%' }}
                >
                  Update Stock
                </Button>
                <Button
                  onClick={() => deleteProduct(p.id)}
                  styleProps={{
                    width: '100%',
                    backgroundColor: '#ef4444',
                    color: '#fff'
                  }}
                >
                  Delete
                </Button>
              </Card>
            ))
          ) : (
            <Section styleProps={{ textAlign: 'center', padding: 32, color: '#666' }}>
              No products found. Add your first product above!
            </Section>
          )}
        </Section>
      )}

      <div ref={reportRef}>
        <SellerReport userEmail={userEmail} refreshKey={reportKey} />
        <OrderReport userEmail={userEmail} />
      </div>
    </Container>
  );
}
