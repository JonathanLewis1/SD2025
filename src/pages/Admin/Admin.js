// import React, { useState, useEffect } from 'react';
// import { db, auth } from '../../firebase';
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   addDoc,
//   deleteDoc,
//   doc,
//   updateDoc
// } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';

const SellerPage = () => {
  

  return (
    <div style={styles.container}>
      <h1>Admin Page</h1>
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
  container: {
    backgroundColor: '#feffdf',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    padding: 32,
  },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#3b82f6',
  },
  filterPanel: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: 24,
    width: '100%',
    maxWidth: 500,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 600,
    color: '#555',
    marginBottom: 4,
  },
  dropdown: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  searchInput: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  priceFilter: {
    display: 'flex',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  resetButton: {
    padding: '10px 16px',
    border: '1px solid #ccc',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 500,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    width: '100%',
    maxWidth: 1000,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    //color: '#111111',
    padding: '12px 16px',
    borderRadius: 24,
    border: '1px solid #2a2a2a',
    fontSize: 14,
    outline: 'none',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '12px 16px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 500,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 8,
  },
  button2: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '8px 10px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 500,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 8,
    marginLeft: 8,
  },
};

export default SellerPage;
