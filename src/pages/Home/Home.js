import React, { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

import Container   from '../../components/common/Container';
import Header      from '../../components/common/Header';
import Section     from '../../components/common/Section';
import TextInput   from '../../components/common/TextInput';
import Button      from '../../components/common/Button';

import ProductCard from './ProductCard';

const CATEGORIES = [
  'All',
  'Jewelry',
  'Clothing',
  'Home Decor',
  'Bath & Body',
  'Stationery',
  'Art & Prints',
  'Ceramics',
  'Textiles',
  'Woodwork',
  'Leather Goods',
  'Other'
];

export default function Home() {
  const [products, setProducts]         = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice]         = useState('');
  const [maxPrice, setMaxPrice]         = useState('');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const getAllProducts = httpsCallable(functions, 'getAllProducts');
        const result = await getAllProducts();
        setProducts(result.data.products);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch  = selectedCategory === 'All' || p.category === selectedCategory;
    const minMatch  = minPrice === '' || p.price >= parseFloat(minPrice);
    const maxMatch  = maxPrice === '' || p.price <= parseFloat(maxPrice);
    return nameMatch && catMatch && minMatch && maxMatch;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <Container styleProps={{ padding: 32, minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header
        level={1}
        styleProps={{ fontSize: 36, marginBottom: 24, textAlign: 'center', color: '#000' }}
      >
        Explore Products
      </Header>

      {error && (
        <Section
          as="div"
          styleProps={{
            padding: 16,
            marginBottom: 24,
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 8,
            textAlign: 'center'
          }}
        >
          {error}
        </Section>
      )}

      {loading ? (
        <Section
          as="div"
          styleProps={{
            textAlign: 'center',
            padding: 32,
            color: '#666'
          }}
        >
          Loading products...
        </Section>
      ) : (
        <>
          <Section
            as="section"
            styleProps={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',    
              paddingBottom: 12,
              marginBottom: 24
            }}
          >
            <Button
              onClick={resetFilters}
              styleProps={{
                flex: '0 0 auto',
                padding: '8px 12px',
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                borderRadius: 8
              }}
            >
              Reset Filters
            </Button>

            <TextInput
              as="select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              styleProps={{
                flex: '0 0 auto',
                width: 'max-content',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #ccc',
                fontSize: 14
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat === 'All' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </TextInput>

            <TextInput
              placeholder="Search…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              styleProps={{
                flex: '1 0 200px',
                padding: '8px',
                borderRadius: 8,
                border: '1px solid #ccc'
              }}
            />

            <TextInput
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              styleProps={{
                flex: '0 0 100px',
                padding: '8px',
                borderRadius: 8,
                border: '1px solid #ccc'
              }}
            />

            <TextInput
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              styleProps={{
                flex: '0 0 100px',
                padding: '8px',
                borderRadius: 8,
                border: '1px solid #ccc'
              }}
            />
          </Section>

          <Section
            as="section"
            styleProps={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              width: '100%',
              maxWidth: 1000,
              margin: '0 auto'
            }}
          >
            {filtered.length > 0 ? (
              filtered.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <Header level={2} styleProps={{ textAlign: 'center', width: '100%', color: '#000' }}>
                No products found.
              </Header>
            )}
          </Section>
        </>
      )}
    </Container>
  );
}
