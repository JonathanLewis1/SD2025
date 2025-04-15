import React from 'react';
import '../../App.css';

const Home = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to Craft Nest 🪵</h1>
      <p style={styles.subheading}>
        Discover hand-made treasures, one piece at a time.
      </p>

      <div style={styles.sectionsWrapper}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🧶 Explore Unique Products</h2>
          <p style={styles.sectionText}>
            Browse a curated collection of artisan-made goods, from handmade pottery to custom woodwork.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>👩‍🎨 Meet the Makers</h2>
          <p style={styles.sectionText}>
            Learn about the creators behind the craft — their stories, process, and inspiration.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🛒 Shop Ethically</h2>
          <p style={styles.sectionText}>
            Support independent makers and small businesses with every purchase you make.
          </p>
        </div>
      </div>
    </div>
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
