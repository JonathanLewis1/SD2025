import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)} 
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      <div style={styles.imageContainer}>
        <img src={product.image} alt={product.name} style={styles.image} />
      </div>
      <div style={styles.content}>
        <h3 style={styles.name}>{product.name}</h3>
        <p style={styles.price}>R{product.price}</p>
        {product.stock <= 5 && (
          <p style={styles.stock}>
            {product.stock === 0 ? "Out of stock" : "Low stock"}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  imageContainer: {
    position: 'relative',
    paddingTop: '75%', // 4:3 aspect ratio
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  content: {
    padding: '16px',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  name: {
    margin: '0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
  },
  price: {
    margin: '0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#3b82f6',
  },
  stock: {
    margin: '0',
    fontSize: '14px',
    color: '#dc2626',
    fontWeight: '500',
  },
};

export default ProductCard;
