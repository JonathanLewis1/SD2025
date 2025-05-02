import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/product/${product.id}`)} style={styles.card}>
      <img src={product.image} alt={product.name} style={styles.image} />
      <h3>{product.name}</h3>
      <p>R{product.price}</p>
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
  image: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
    borderRadius: 8,
  },
  stock: {
    color: '#ff0000',
  },
};

export default ProductCard;
