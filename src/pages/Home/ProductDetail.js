import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../../context/CartContext';

import Container from '../../components/common/Container';
import Section   from '../../components/common/Section';
import Card      from '../../components/common/Card';
import Button    from '../../components/common/Button';

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const { cart, addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      const snap = await getDoc(doc(db, 'products', productId));
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
    }
    fetchProduct();
  }, [productId]);

  if (!product) {
    return (
      <Container styleProps={{ padding: 40, textAlign: 'center' }}>
        <Section as="p" styleProps={{ fontSize: 18, color: '#555' }}>
          Loading product details...
        </Section>
      </Container>
    );
  }

  const handleAddToCart = () => {
    const existingQty = cart.find(i => i.id === product.id)?.quantity || 0;
    if (existingQty >= product.stock) {
      alert('You cannot add more of this item. Stock limit reached.');
      return;
    }
    addToCart({ ...product, stock: product.stock });
    alert('Product added to cart!');
  };

  return (
    <Container styleProps={{ padding: '40px 16px', backgroundColor: '#ffffff' }}>
      <Card
        styleProps={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          maxWidth: 900,
          margin: '0 auto',
          padding: 24,
          borderRadius: 16,
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            flex: '1 1 300px',
            width: '100%',       
            height: 'auto',       
            objectFit: 'cover',
            borderRadius: 12,
            minHeight: 0          
          }}
        />

        <Section
          as="section"
          styleProps={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <Section as="h1" styleProps={{ margin: 0, fontSize: 32, color: '#000' }}>
            {product.name}
          </Section>

          <Section as="p" styleProps={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
            R{product.price}
          </Section>

          <Section as="p" styleProps={{ margin: 0, fontSize: 16, color: '#555', lineHeight: 1.6 }}>
            {product.description}
          </Section>

          <Section as="p" styleProps={{ color: '#ff0000', margin: 0 }}>
            {product.stock === 0
              ? 'This product is out of stock.'
              : product.stock <= 5
              ? 'Only a few left in stock!'
              : ''}
          </Section>

          {product.stock > 0 && (
            <Button
              onClick={handleAddToCart}
              styleProps={{
                padding: '12px 16px',
                borderRadius: 12,
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontSize: 16,
                alignSelf: 'start'
              }}
            >
              Add to Cart
            </Button>
          )}
        </Section>
      </Card>
    </Container>
  );
}
