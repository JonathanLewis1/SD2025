import React from 'react';
import '../../App.css';

const Home = () => {
  return (
    <section style={styles.container}>
      <h1 style={styles.heading}>You are a seller</h1>
      
    </section>
  );
};

const styles = {
    container: {
        backgroundColor: '#feffdf',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',  
        alignItems: 'center',     
        flexDirection: 'column',  
        padding: 32,
      },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3b82f6',
  },
  subheading: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 32,
  },
  sectionsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  section: {
    backgroundColor: '#668ba4',
    padding: 24,
    borderRadius: 16,
    border: '1px solid #2a2a2a',
    maxWidth: 700,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#ffffff',
  },
  sectionText: {
    color: '#cccccc',
    fontSize: 16,
    lineHeight: 1.6,
  },
};

export default Home;
