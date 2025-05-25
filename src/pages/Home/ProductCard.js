import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Section from '../../components/common/Section';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/product/${product.id}`)}
      styleProps={{
        cursor: 'pointer',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        width: 200,
        backgroundColor: '#f9f9f9'
      }}
    >
      <Section
        as="figure"
        styleProps={{
          width: '100%',
          aspectRatio: '4 / 3',       
          overflow: 'hidden',
          margin: 0
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'        
          }}
        />
      </Section>

      <Section as="h3" styleProps={{ margin: 0, fontSize: 18, textAlign: 'center', color: '#000' }}>
        {product.name}
      </Section>
      <Section as="p" styleProps={{ margin: 0, fontWeight: 600, color: '#000' }}>
        R{product.price}
      </Section>
    </Card>
  );
}
