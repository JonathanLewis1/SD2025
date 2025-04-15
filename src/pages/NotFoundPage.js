import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>404</h1>
        <p style={styles.subtitle}>Oops! The page you're looking for doesn’t exist.</p>
        <button onClick={handleGoHome} style={styles.button}>
          Go Back Home
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#111111',
    color: '#ffffff',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 40,
    borderRadius: 16,
    border: '1px solid #2a2a2a',
    boxShadow: '0 0 15px rgba(0,0,0,0.4)',
    textAlign: 'center',
    maxWidth: 480,
    width: '100%',
    animation: 'fadeIn 0.5s ease-in-out',
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#3b82f6',
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: 12,
    border: 'none',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default NotFoundPage;
